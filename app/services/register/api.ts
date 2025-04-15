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
 */
export const registerPlayer = async (playerData: any): Promise<boolean> => {
  try {
    // This would be an actual API call to the backend in production
    // For now, we'll just simulate a successful registration
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return true;
  } catch (error) {
    console.error("Error registering player:", error);
    return false;
  }
};

/**
 * Registers a new partner in the system
 */
export const registerPartner = async (partnerData: any): Promise<boolean> => {
  try {
    // This would be an actual API call to the backend in production
    // For now, we'll just simulate a successful registration
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return true;
  } catch (error) {
    console.error("Error registering partner:", error);
    return false;
  }
};
