import { NextResponse } from 'next/server';
import { API_CONFIG } from '../../../../config/apiConfig';

// Use the centralized API configuration

/**
 * GET handler for /api/players/[id]/profile route
 * Acts as a proxy to the actual Transfermarkt API
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const targetUrl = `${API_CONFIG.BACKEND_URL}/players/${id}/profile`;
    
    console.log(`Proxying request to: ${targetUrl}`);
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    let response;
    try {
      response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Upstream API timeout' },
          { status: 504 }
        );
      }
      const fetchError = err instanceof Error ? err.message : 'Fetch error';
      return NextResponse.json(
        { error: fetchError },
        { status: 500 }
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error in player profile API route:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
