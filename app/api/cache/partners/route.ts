import { NextResponse } from "next/server";
import { API_CONFIG } from "../../../config/apiConfig";

// GET handler for /api/cache/partners route
export async function GET() {
  try {
    // Proxy the request to the backend API
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/cache/partners`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      // Add a timeout to avoid hanging requests
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch partners. Status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/cache/partners proxy:", error);
    return NextResponse.json(
      { error: "Failed to fetch partners" },
      { status: 500 }
    );
  }
}
