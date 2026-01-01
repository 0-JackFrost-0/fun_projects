import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerTag: string }> }
) {
  const { playerTag } = await params;

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

    // Make request to Clash Royale API for battle log
    const response = await fetch(
      `https://proxy.royaleapi.dev/v1/players/${encodedTag}/battlelog`,
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

    const battleLogData = await response.json();

    return NextResponse.json({
      success: true,
      data: battleLogData,
    });

  } catch (error) {
    console.error('Battle Log API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch battle log'
      },
      { status: 500 }
    );
  }
}
