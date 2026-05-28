// Vercel Serverless Function format for /api/mcp
export default function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const body = req.body;

    if (body?.method === "tools/list") {
      return res.status(200).json({
        jsonrpc: "2.0",
        id: body.id,
        result: {
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
          ]
        }
      });
    }

    if (body?.method === "prompts/list") {
      return res.status(200).json({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          prompts: [
            { name: "analyze_orbit", description: "Analyze orbital constraints" }
          ]
        }
      });
    }

    if (body?.method === "resources/list") {
      return res.status(200).json({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          resources: [
            { uri: "file:///config/warp_params.json", name: "Warp Parameters", description: "Static configuration for warp speeds" }
          ]
        }
      });
    }

    return res.status(200).json({
      status: "success",
      message: "MCP Post endpoint running",
      received: body
    });
  }

  // GET handler
  return res.status(200).json({
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
  });
}
