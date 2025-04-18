import { NextResponse } from "next/server";
import { apiCache } from "../../../players/services/cache";
import { API_CONFIG } from "../../../config/apiConfig";

// Rate limiting variables
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

export async function GET() {
  try {
    const cacheKey = "cache_players";
    const cachedData = apiCache.get(cacheKey);

    // Return cached data if available
    if (cachedData) {
      console.log("API route: Returning cached players data");
      return NextResponse.json(cachedData);
    }

    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`Rate limiting: Waiting ${waitTime}ms before making request`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    lastRequestTime = Date.now();

    console.log("API route: Fetching players from Transfermarkt API");
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/cache/players`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Cache the response
    apiCache.set(cacheKey, data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in API route /api/cache/players:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch players from Transfermarkt API",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
