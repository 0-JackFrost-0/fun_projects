import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const playerTag = searchParams.get('tag');

  if (!playerTag) {
    return NextResponse.json(
      { success: false, error: 'Player tag is required' },
      { status: 400 }
    );
  }

  try {
    // Get API token from environment
    const apiToken = process.env.CLASH_ROYALE_API_TOKEN;
    if (!apiToken) {
      throw new Error('API token not configured');
    }

    // Clean the player tag
    let cleanTag = playerTag.startsWith('#') ? playerTag.slice(1) : playerTag;
    const encodedTag = encodeURIComponent(`#${cleanTag}`);

    // Make request to Clash Royale API
    const response = await fetch(
      `https://proxy.royaleapi.dev/v1/players/${encodedTag}`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const playerData = await response.json();

    return NextResponse.json({
      success: true,
      data: playerData,
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
