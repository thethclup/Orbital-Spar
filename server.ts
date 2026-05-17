import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON
  app.use(express.json());

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
          name: "calculate_warp_trajectory",
          description: "Calculates the optimal warp trajectory for the current orbital resonance.",
          inputSchema: {
            type: "object",
            properties: {
              targetBody: { type: "string" },
              speed: { type: "number" }
            },
            required: ["targetBody", "speed"]
          }
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
    res.json({
      status: "success",
      message: "MCP Post endpoint running"
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
