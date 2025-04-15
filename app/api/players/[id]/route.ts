import { NextResponse } from 'next/server';
import { API_CONFIG } from '../../../config/apiConfig';

// Use the centralized API configuration

/**
 * GET handler for /api/players/[id] route
 * Acts as a proxy to the actual LB Sports API
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const targetUrl = `${API_CONFIG.BACKEND_URL}/api/players/${id}`;
    
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
    
    // Check if player was not found
    if (response.status === 404) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }
    
    // Get the response data
    const data = await response.json();
    
    // Return the response
    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText
    });
  } catch (error) {
    console.error('API proxy error:', error);
    
    // Return a 500 error
    return NextResponse.json(
      { error: 'Failed to fetch player' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for /api/players/[id] route
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const targetUrl = `${API_CONFIG.BACKEND_URL}/api/players/${id}`;
    
    console.log(`Proxying DELETE request to: ${targetUrl}`);
    
    // Make the request to the actual API
    const response = await fetch(targetUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // Add a timeout to avoid hanging requests
      signal: AbortSignal.timeout(5000)
    });
    
    // Check if player was not found
    if (response.status === 404) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }
    
    // Return the response
    return NextResponse.json(
      { success: true },
      { status: response.status }
    );
  } catch (error) {
    console.error('API proxy error:', error);
    
    // Return a 500 error
    return NextResponse.json(
      { error: 'Failed to delete player' },
      { status: 500 }
    );
  }
}
