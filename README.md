# Orbital Spark

Orbital Spark is a beautiful, satisfying, and addictive orbital energy chaining game built for Base. Connect planets, build chains, and become the Greatest Spark Weaver.

## Agent Overview
**Orbital Spark** is a High-performance AI Agent specialized in warp racing mechanics, real-time automation, multi-track management, competitive optimization and ecosystem coordination on Base.

### Capabilities
- `warp-racing`
- `real-time-automation`
- `multi-track-management`
- `speed-optimization`
- `competitive-orchestration`
- `ecosystem-coordination`

### Skills
- **Warp Racing:** Real-time warp racing mechanics, speed optimization and competitive track management.
- **Multi-Track Orchestration:** Manage and synchronize multiple racing instances and tracks simultaneously.
- **Performance Optimization:** Analyze and optimize racing performance, timing and strategy in real-time.

## Agent Connectivity
External tools and registries integrate with Orbital Spark via:
- **A2A Registry:** `/.well-known/agent-card.json`
- **MCP Endpoint:** `/api/mcp`
- **Agent API Endpoint:** `/api/agent`

## Tech Stack
- Frontend: React 19, TypeScript, Tailwind CSS, Framer Motion, HTML5 Canvas
- Web3: Wagmi, Viem (Base Mainnet support)
- API Support: Next.js 14 App Router API definitions included (`app/api/mcp/route.ts`, `app/api/agent/route.ts`)

## How to Run Locally 
Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
npm run start
```
