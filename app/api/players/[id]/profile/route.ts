import { NextResponse } from 'next/server';

// The actual API URL
const API_BASE_URL = 'http://localhost:7771';

/**
 * GET handler for /api/players/[id]/profile route
 * Acts as a proxy to the actual Transfermarkt API
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const targetUrl = `${API_BASE_URL}/players/${id}/profile`;
    
    console.log(`Proxying request to: ${targetUrl}`);
    
    // Make the request to the actual API
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // Add a timeout to avoid hanging requests
      signal: AbortSignal.timeout(5000),
      cache: 'no-store'
    });
    
    // Check if the request was successful
    if (!response.ok) {
      console.error(`API request failed with status: ${response.status}`);
      return NextResponse.json(
        { error: `Failed to fetch player profile. Status: ${response.status}` },
        { status: response.status }
      );
    }
    
    // Parse the response data
    const data = await response.json();
    console.log('Successfully fetched player profile data');
    
    // Return the response
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in player profile API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player profile' },
      { status: 500 }
    );
  }
}
