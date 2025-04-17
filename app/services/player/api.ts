import { API_CONFIG } from "../../config/apiConfig";
import { Player, PlayerFilters } from "./types";
import { transformPlayerProfileFromCache } from "./transform";
import { mockPlayers } from "./mock";
import { applyFilters } from "./filters";

// Check if Transfermarkt API is available using the cache stats endpoint
export const checkApiAvailability = async (): Promise<boolean> => {
  console.log("Checking API availability at:", `${API_CONFIG.BASE_URL}/cache/stats`);
  
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
    console.log("API connection successful, received data:", data);
    
    // The API is available if we get a valid response with data
    // The response is an array of collection stats, not an object with a status field
    if (Array.isArray(data) && data.length > 0) {
      console.log("API is available - valid data structure detected");
      return true;
    }
    
    // Legacy check for status field
    if (data && data.status === "ok") {
      console.log("API is available - status field is 'ok'");
      return true;
    }
    
    console.log("API check failed - unexpected data format", data);
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
      console.log("API not available, using mock data");
      return applyFilters(mockPlayers, filters);
    }
    
    console.log("API is available, fetching real player data");

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
    console.log("=== API RESPONSE DATA STRUCTURE ===");
    console.log("Data type:", typeof data);
    console.log("Is array:", Array.isArray(data));
    console.log("Has 'players' property:", data.players !== undefined);
    console.log("Data keys:", Object.keys(data));
    console.log("Data length or players length:", Array.isArray(data) ? data.length : (data.players ? data.players.length : 'N/A'));
    
    // Dump a sample of the raw response for debugging
    if (Array.isArray(data) && data.length > 0) {
      console.log("First item sample:", JSON.stringify(data[0], null, 2));
    } else if (data.players && data.players.length > 0) {
      console.log("First player sample:", JSON.stringify(data.players[0], null, 2));
    } else {
      console.log("Raw data sample:", JSON.stringify(data, null, 2).substring(0, 500) + '...');
    }
    
    // Check if data is an array (direct player data)
    const playerData = Array.isArray(data) ? data : data.players || [];
    
    if (playerData.length === 0) {
      console.warn("No player data found in API response");
      console.log("Falling back to mock data");
      return applyFilters(mockPlayers, filters);
    }
    
    console.log(`API returned ${playerData.length} players - using real data`);
    console.log(`Transforming ${playerData.length} players from API`);
    
    const players = playerData.map((player: Player) => {
      try {
        return transformPlayerProfileFromCache(player);
      } catch (error) {
        console.error(`Error transforming player ${player.id || 'unknown'}:`, error);
        return null;
      }
    }).filter((player: Player | null): player is Player => player !== null);
    
    console.log(`Successfully transformed ${players.length} players`);
    
    // Log a sample of the transformed players
    if (players.length > 0) {
      console.log("Transformed player sample:", JSON.stringify(players[0], null, 2));
    }
    
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
