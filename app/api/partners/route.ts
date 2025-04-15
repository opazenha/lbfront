import { NextResponse } from 'next/server';

// The actual API URL
const API_BASE_URL = 'http://localhost:7771';

/**
 * POST handler for /api/partners route
 * Acts as a proxy to the actual Transfermarkt API
 */
export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    
    console.log('Partner registration request body:', body);
    
    // Make the request to the actual API
    const response = await fetch(`${API_BASE_URL}/partners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body),
      // Add a timeout to avoid hanging requests
      signal: AbortSignal.timeout(5000),
      cache: 'no-store'
    });
    
    // Check if the request was successful
    if (!response.ok) {
      console.error(`Partner API request failed with status: ${response.status}`);
      return NextResponse.json(
        { error: `Failed to register partner. Status: ${response.status}` },
        { status: response.status }
      );
    }
    
    // Parse the response data
    const data = await response.json();
    console.log('Successfully registered partner:', data);
    
    // Return the response with status 201 (Created)
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Partner API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to register partner' },
      { status: 500 }
    );
  }
}
