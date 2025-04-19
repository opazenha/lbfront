import { API_CONFIG } from "../../config/apiConfig";
import { Player, PlayerFilters } from "./types";
import { transformPlayerProfileFromCache } from "./transform";
import { mockPlayers } from "./mock";
import { applyFilters } from "./filters";

// Check if Transfermarkt API is available using the cache stats endpoint
export const checkApiAvailability = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/cache/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // The API is available if we get a valid response with data
    // The response is an array of collection stats, not an object with a status field
    if (Array.isArray(data) && data.length > 0) {
      return true;
    }
    
    // Legacy check for status field
    if (data && data.status === "ok") {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking API availability:", error instanceof Error ? error.message : error);
    return false;
  }
};

// Get all players with optional filtering
export const getPlayers = async (filters: PlayerFilters = {}): Promise<Player[]> => {
  try {
    // First try to get data from the API
    const isApiAvailable = await checkApiAvailability();

    if (!isApiAvailable) {
      return applyFilters(mockPlayers, filters);
    }
    
    // Fetch players from the cache endpoint
    const response = await fetch(`${API_CONFIG.BASE_URL}/cache/players`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`HTTP error when fetching players: status ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if data is an array (direct player data)
    const playerData = Array.isArray(data) ? data : data.players || [];
    
    if (playerData.length === 0) {
      console.warn("No player data found in API response");
      return applyFilters(mockPlayers, filters);
    }
    
    const players = playerData.map((player: Player) => {
      try {
        return transformPlayerProfileFromCache(player);
      } catch (error) {
        console.error(`Error transforming player ${player.id || 'unknown'}:`, error);
        return null;
      }
    }).filter((player: Player | null): player is Player => player !== null);
    
    if (players.length === 0) {
      console.warn("No players were successfully transformed, falling back to mock data");
      return applyFilters(mockPlayers, filters);
    }

    return applyFilters(players, filters);
  } catch (error) {
    console.error("Error fetching players:", error);
    return applyFilters(mockPlayers, filters);
  }
};

// Get player by ID
export const getPlayerById = async (id: string): Promise<Player | null> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/cache/player/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return transformPlayerProfileFromCache(data);
  } catch (error) {
    console.error("Error fetching player by ID:", error);
    const mockPlayer = mockPlayers.find((p) => p.id === id);
    return mockPlayer || null;
  }
};

// Delete player profile
export const deletePlayerProfile = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PLAYER_PROFILE}/${id}/profile`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      console.error(`Failed to delete player profile: status ${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error deleting player profile:", error);
    return false;
  }
};
