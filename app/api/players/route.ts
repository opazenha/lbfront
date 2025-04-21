import { NextResponse } from 'next/server';
import { API_CONFIG } from '../../config/apiConfig';

// Use the centralized API configuration

/**
 * GET handler for /api/players route
 * Acts as a proxy to the actual LB Sports API
 */
export async function GET(request: Request) {
  try {
    // Get search params from the request URL
    const { searchParams } = new URL(request.url);
    
    // Build the target URL with any query parameters
    let targetUrl = `${API_CONFIG.BACKEND_URL}/api/players`;
    
    // Handle position filtering specifically
    const position = searchParams.get('position');
    if (position) {
      // If we have a position parameter, use the position endpoint
      targetUrl = `${API_CONFIG.BACKEND_URL}/api/players/position?positionId=${position}`;
      console.log(`Proxying to position endpoint: ${targetUrl}`);
    } 
    // Handle other query parameters
    else if (searchParams.toString()) {
      targetUrl += `?${searchParams.toString()}`;
    }
    
    console.log(`Proxying request to: ${targetUrl}`);
    
    // Make the request to the actual API
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // Add a timeout to avoid hanging requests
      signal: AbortSignal.timeout(5000)
    });
    
    // Get the response data
    const data = await response.json();
    
    // Return the response
    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText
    });
  } catch (error) {
    console.error('API proxy error:', error);
    
    // Return a fallback response with mock data
    return NextResponse.json(
      [
        {
          "transfermarktId": "193925",
          "createdAt": Date.now(),
          "updatedAt": Date.now(),
          "name": "Romarinho",
          "dateOfBirth": "1990-12-12",
          "age": 34,
          "gender": "male",
          "nationalities": {
            "nationalityId": 26,
            "secondNationalityId": 0
          },
          "attributes": {
            "positionId": 8
          },
          "relativeUrl": "/romarinho/profil/spieler/193925",
          "marketValueDetails": {
            "current": {
              "value": 2000000,
              "currency": "EUR",
              "determined": "2024-12-13"
            }
          },
          "lbPlayer": true
        },
        {
          "transfermarktId": "193926",
          "createdAt": Date.now(),
          "updatedAt": Date.now(),
          "name": "Uilton",
          "dateOfBirth": "1993-02-04",
          "age": 32,
          "gender": "male",
          "nationalities": {
            "nationalityId": 26,
            "secondNationalityId": 0
          },
          "attributes": {
            "positionId": 8
          },
          "relativeUrl": "/uilton/profil/spieler/193926",
          "marketValueDetails": {
            "current": {
              "value": 8200000,
              "currency": "EUR",
              "determined": "2024-12-13"
            }
          }
        }
      ],
      { status: 200, statusText: 'OK (Mock Data)' }
    );
  }
}

/**
 * POST handler for /api/players route
 * Acts as a proxy to the actual Transfermarkt API for player registration
 * 
 * According to the API documentation:
 * This endpoint will:
 * 1. Scrape the player data from Transfermarkt using the provided ID
 * 2. Add the custom fields (youtubeUrl, notes, partnerId)
 * 3. Save to MongoDB with isLbPlayer flag set to true
 * 4. Return the enriched player profile
 */
export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    
    console.log('Player registration request body:', body);
    
    // Make the request to the actual API
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/players`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body),
      // Add a timeout to avoid hanging requests
      signal: AbortSignal.timeout(10000),
      cache: 'no-store'
    });
    
    // Check if the request was successful
    if (!response.ok) {
      console.error(`Player registration API request failed with status: ${response.status}`);
      
      // Handle specific error cases
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Player not found on Transfermarkt' },
          { status: 404 }
        );
      } else if (response.status === 422) {
        return NextResponse.json(
          { error: 'Validation error in request data' },
          { status: 422 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to register player. Status: ${response.status}` },
        { status: response.status }
      );
    }
    
    // Parse the response data
    const data = await response.json();
    console.log('Successfully registered player:', data);
    
    // Return the response with status 201 (Created)
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Player registration API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to register player' },
      { status: 500 }
    );
  }
}
