import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: "success",
    tools: [
      {
        name: "get_race_status",
        description: "Gets the current status of the warp race.",
        inputSchema: { type: "object", properties: { raceId: { type: "string" } }, required: ["raceId"] }
      },
      {
        name: "start_race",
        description: "Starts a new warp race session.",
        inputSchema: { type: "object", properties: { trackId: { type: "string" } }, required: ["trackId"] }
      },
      {
        name: "get_leaderboard",
        description: "Retrieves the leaderboard for a specific track.",
        inputSchema: { type: "object", properties: { trackId: { type: "string" } }, required: ["trackId"] }
      },
      {
        name: "optimize_speed",
        description: "Calculates optimal warp speed parameters.",
        inputSchema: { type: "object", properties: { currentSpeed: { type: "number" } }, required: ["currentSpeed"] }
      },
      {
        name: "get_track_info",
        description: "Fetches details and constraints for a given race track.",
        inputSchema: { type: "object", properties: { trackId: { type: "string" } }, required: ["trackId"] }
      }
    ],
    prompts: [
      { name: "analyze_orbit", description: "Analyze orbital constraints" }
    ],
    resources: [
      { uri: "file:///config/warp_params.json", name: "Warp Parameters", description: "Static configuration for warp speeds" }
    ],
    message: "MCP Server running"
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Simulate tools/call and other post behaviors
    return NextResponse.json({
      status: "success",
      message: "MCP Post endpoint running",
      received: body
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Invalid JSON" }, { status: 400 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
