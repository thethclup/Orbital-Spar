import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON
  app.use(express.json());

  // CORS Middleware for external validators (A2A, MCP, Agent Cards)
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Root wildcard for CORS for MCP testing explicitly
  app.options("*", (req, res) => {
    res.sendStatus(200);
  });

  // Specifically serve .well-known explicitly
  app.get("/.well-known/agent-card.json", (req, res) => {
    const publicPath = path.join(process.cwd(), "public", ".well-known", "agent-card.json");
    const distPath = path.join(process.cwd(), "dist", ".well-known", "agent-card.json");
    
    if (fs.existsSync(publicPath)) {
      res.sendFile(publicPath);
    } else if (fs.existsSync(distPath)) {
      res.sendFile(distPath);
    } else {
      res.status(404).json({ error: "agent-card.json not found" });
    }
  });

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // MCP Mock Endpoint
  app.get("/api/mcp", (req, res) => {
    res.json({
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
        {
          name: "analyze_orbit",
          description: "Analyze orbital constraints"
        }
      ],
      resources: [
        {
          uri: "file:///config/warp_params.json",
          name: "Warp Parameters",
          description: "Static configuration for warp speeds"
        }
      ],
      message: "MCP Server running"
    });
  });

  app.post("/api/mcp", (req, res) => {
    // Protocol compliance for standard MCP POST
    const body = req.body;
    
    if (body && body.method === "tools/list") {
      return res.json({
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

    if (body && body.method === "prompts/list") {
      return res.json({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          prompts: [
            { name: "analyze_orbit", description: "Analyze orbital constraints" }
          ]
        }
      });
    }

    if (body && body.method === "resources/list") {
      return res.json({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          resources: [
            { uri: "file:///config/warp_params.json", name: "Warp Parameters", description: "Static configuration for warp speeds" }
          ]
        }
      });
    }

    res.json({
      status: "success",
      message: "MCP Post endpoint running",
      received: body
    });
  });

  // Agent API Endpoint
  app.get("/api/agent", (req, res) => {
    res.json({
      status: "online",
      name: "Orbital Spark Agent",
      version: "1.0.0"
    });
  });

  app.post("/api/agent", (req, res) => {
    res.json({
      status: "success",
      message: "Agent action received"
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from both dist and public (just in case)
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
