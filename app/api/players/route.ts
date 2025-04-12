import { NextResponse } from 'next/server';

// The actual API URL
const API_URL = 'http://localhost:7771/api/players';

/**
 * GET handler for /api/players route
 * Acts as a proxy to the actual LB Sports API
 */
export async function GET(request: Request) {
  try {
    // Get search params from the request URL
    const { searchParams } = new URL(request.url);
    
    // Build the target URL with any query parameters
    let targetUrl = API_URL;
    
    // Handle position filtering specifically
    const position = searchParams.get('position');
    if (position) {
      // If we have a position parameter, use the position endpoint
      targetUrl = `${API_URL}/position?positionId=${position}`;
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
 * GET handler for specific player by ID
 */
export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    
    // Make the request to the actual API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body),
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
    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    );
  }
}
