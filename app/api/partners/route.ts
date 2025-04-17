import { NextResponse } from "next/server";
import { API_CONFIG } from "../../config/apiConfig";

// Use the centralized API configuration

/**
 * POST handler for /api/partners route
 * Acts as a proxy to the actual Transfermarkt API
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("Partner registration request body:", body);

    const response = await fetch(`${API_CONFIG.BACKEND_URL}/partners`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      // Add a timeout to avoid hanging requests
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `Partner API request failed with status: ${response.status}`
      );
      return NextResponse.json(
        { error: `Failed to register partner. Status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Successfully registered partner:", data);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Partner API proxy error:", error);
    return NextResponse.json(
      { error: "Failed to register partner" },
      { status: 500 }
    );
  }
}

// GET handler for fetching partners list
export async function GET(request: Request) {
  try {
    const response = await fetch(`${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.CACHE_PARTNERS}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error(`Partners API request failed with status: ${response.status}`);
      return NextResponse.json(
        { error: `Failed to fetch partners. Status: ${response.status}` },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Partners API proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch partners" },
      { status: 500 }
    );
  }
}
