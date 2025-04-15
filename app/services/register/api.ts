"use client";

import { Partner, Player } from "../../components/Register/shared/types";

/**
 * Extracts player ID from a Transfermarkt URL
 */
export const extractPlayerIdFromUrl = (url: string): string | null => {
  try {
    console.log("Extracting player ID from URL:", url);

    // Handle multiple possible URL formats from Transfermarkt
    // Example: https://www.transfermarkt.us/malcom/profil/spieler/323704

    // Try the /spieler/{id} pattern first (most common format)
    let match = url.match(/\/spieler\/(\d+)/);

    // If that doesn't work, try /player/(\d+) pattern
    if (!match) {
      match = url.match(/\/player\/(\d+)/);
    }

    // If that doesn't work, try a more general pattern to find any numeric ID at the end
    if (!match) {
      match = url.match(/\/(\d+)(?:[?#]|$)/);
    }

    const playerId = match ? match[1] : null;
    console.log("Extracted player ID:", playerId);
    return playerId;
  } catch (error) {
    console.error("Error extracting player ID from URL:", error);
    return null;
  }
};

/**
 * Fetches player data from the Transfermarkt API using the players profile endpoint
 */
export const fetchPlayerDataFromTransfermarkt = async (
  transfermarktUrl: string
): Promise<Player | null> => {
  try {
    console.log("Fetching player data for URL:", transfermarktUrl);
    const playerId = extractPlayerIdFromUrl(transfermarktUrl);

    if (!playerId) {
      console.error("Could not extract player ID from URL:", transfermarktUrl);
      throw new Error(
        "Invalid Transfermarkt URL. Could not extract player ID."
      );
    }

    // Log the API endpoint we're trying to access
    const apiEndpoint = `/api/players/${playerId}/profile`;
    console.log("Requesting data from endpoint:", apiEndpoint);

    // Use the players profile endpoint to fetch player data
    // The correct endpoint according to the OpenAPI spec is /players/{player_id}/profile
    const response = await fetch(apiEndpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Add cache: 'no-store' to prevent caching issues
      cache: "no-store",
    });

    console.log("API response status:", response.status);

    if (!response.ok) {
      console.error("API request failed with status:", response.status);
      throw new Error(
        `Failed to fetch player data. Status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Received player data:", data);

    // Transform the data into our Player interface format
    const player: Player = {
      id: playerId,
      name: data.name || "Unknown",
      transfermarktUrl: transfermarktUrl,
      age: data.age || null,
      position: data.position?.main || "Unknown",
      height: data.height || null,
      weight: data.weight || null,
      nationality: data.citizenship?.[0] || data.nationality?.name || "Unknown",
      club: data.club?.name || null,
      contractExpires: data.club?.contractExpires || null,
      imageUrl: data.imageUrl || null,
    };

    console.log("Transformed player data:", player);
    return player;
  } catch (error) {
    console.error("Error fetching player data from Transfermarkt:", error);
    return null;
  }
};

/**
 * Registers a new player in the system
 * @param playerData Object containing player registration data
 * @returns Promise resolving to the registered player data or null if registration failed
 */
export const registerPlayer = async (playerData: {
  transfermarktUrl: string;
  notes?: string;
  youtubeUrl?: string;
  partnerId?: string;
}): Promise<Player | null> => {
  try {
    console.log("Registering player with data:", playerData);
    
    // Extract the Transfermarkt ID from the URL
    const transfermarktId = extractPlayerIdFromUrl(playerData.transfermarktUrl);
    
    if (!transfermarktId) {
      console.error("Could not extract player ID from URL:", playerData.transfermarktUrl);
      throw new Error("Invalid Transfermarkt URL. Could not extract player ID.");
    }
    
    // Prepare the request payload according to the API schema
    const requestPayload = {
      transfermarktId: transfermarktId,
      youtubeUrl: playerData.youtubeUrl || null,
      notes: playerData.notes || null,
      partnerId: playerData.partnerId || null
    };
    
    console.log("Sending player registration request with payload:", requestPayload);
    
    // Make the POST request to register the player
    const response = await fetch('/api/players', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });
    
    console.log("Player registration response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Player registration failed:", errorData);
      throw new Error(`Failed to register player. Status: ${response.status}`);
    }
    
    const registeredPlayer = await response.json();
    console.log("Player successfully registered:", registeredPlayer);
    
    // Transform the response data to our Player interface
    return {
      id: registeredPlayer.id || transfermarktId,
      name: registeredPlayer.name || "Unknown",
      transfermarktUrl: playerData.transfermarktUrl,
      notes: playerData.notes,
      youtubeUrl: playerData.youtubeUrl,
      partnerId: playerData.partnerId,
      age: registeredPlayer.age,
      position: registeredPlayer.position?.main,
      height: registeredPlayer.height,
      nationality: registeredPlayer.citizenship?.[0],
      club: registeredPlayer.club?.name,
      contractExpires: registeredPlayer.club?.contractExpires,
      imageUrl: registeredPlayer.imageUrl
    };
  } catch (error) {
    console.error("Error registering player:", error);
    return null;
  }
};

/**
 * Registers a new partner in the system
 * @param partnerData Object containing partner registration data
 * @returns Promise resolving to the registered partner data or null if registration failed
 */
export const registerPartner = async (partnerData: {
  name: string;
  transfermarktUrl?: string;
  notes?: string;
}): Promise<Partner | null> => {
  try {
    console.log("Registering partner with data:", partnerData);
    
    // Prepare the request payload according to the API schema
    const requestPayload = {
      name: partnerData.name,
      transfermarktUrl: partnerData.transfermarktUrl || null,
      notes: partnerData.notes || null
    };
    
    console.log("Sending partner registration request with payload:", requestPayload);
    
    // Make the POST request to register the partner
    const response = await fetch('/api/partners', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });
    
    console.log("Partner registration response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Partner registration failed:", errorData);
      throw new Error(`Failed to register partner. Status: ${response.status}`);
    }
    
    const registeredPartner = await response.json();
    console.log("Partner successfully registered:", registeredPartner);
    
    // Return the registered partner data
    return {
      id: registeredPartner.id,
      name: registeredPartner.name,
      transfermarktUrl: registeredPartner.transfermarktUrl,
      notes: registeredPartner.notes
    };
  } catch (error) {
    console.error("Error registering partner:", error);
    return null;
  }
};
