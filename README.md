# MCP Client Kit
```mcp-client-kit``` A TypeScript/Node.js client library for connecting to multiple Model Context Protocol (MCP) servers and aggregating their capabilities through a unified interface.

## Features

- **Multi-Server Support**: Connect to multiple MCP servers simultaneously
- **Multiple Transport Protocols**: Support for SSE, HTTP Streaming, and stdio transports
- **JSON-RPC 2.0**: Full JSON-RPC 2.0 protocol implementation
- **Aggregated API**: Unified interface to interact with all connected servers
- **TypeScript**: Full TypeScript support with type definitions
- **Authentication**: Built-in support for Bearer token authentication

## Installation

```bash
npm install mcp-client-kit
```

## Quick Start

### 1. Create Configuration File

Create a `mcp_servers.json` file in your project root:

```json
{
  "mcpServers": {
     "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "d:/DevSpaces/MNTWS/CVAWS"
      ]
    },
    "canva-dev": {
      "command": "npx",
      "args": ["-y", "@canva/cli@latest", "mcp"]
    },
    "leo-sse-mcp": {
      "type": "sse",
      "url": "http://localhost:3000/sse",
      "headers": {
        "Authorization": "Bearer leo-dGluaHRkLmluZm9AZ21haWwuY29t"
      }
    }
  }
}
```

### 2. Use the Client

```typescript
import { McpClient } from 'mcp-client-kit';
import * as path from 'path';

async function main() {
  // Initialize the client
  const configPath = path.join(process.cwd(), 'mcp_servers.json');;
  const client = new McpClient(configPath);

  try {
    // Connect to all servers
    await client.connect();

    // List all available tools from all servers
    const tools = await client.listTools();
    console.log(`Found ${tools.length} tools`);

    tools.forEach((tool) => {
      console.log(`- [${tool.serverName}] ${tool.name}`);
    });

    // Call a specific tool
    const result = await client.callTool('leo-sse-mcp', 'my-tool', {
      param1: 'value1',
    });
    console.log('Result:', result);

  } finally {
    // Always disconnect when done
    await client.disconnect();
  }
}

main().catch(console.error);
```

## Transport Types

### SSE (Server-Sent Events)

```json
{
  "type": "sse",
  "url": "http://localhost:3000/sse",
  "headers": {
    "Authorization": "Bearer token"
  }
}
```

### HTTP Streaming

```json
{
  "type": "httpStream",
  "url": "http://localhost:3000/stream",
  "headers": {
    "Authorization": "Bearer token"
  }
}
```

### stdio (Local Process)

```json
{
  "type": "stdio",
  "command": "node",
  "args": ["./mcp-server.js"],
  "env": {
    "DEBUG": "mcp:*"
  }
}
```

## API Reference

### McpClient

#### `constructor(configPath: string)`

Create a new MCP client instance.

- `configPath`: Path to the `mcp_servers.json` configuration file

#### `connect(): Promise<void>`

Initialize and connect to all configured servers.

#### `disconnect(): Promise<void>`

Disconnect from all servers.

#### `listTools(): Promise<IAggregatedTool[]>`

List all tools from all connected servers. Each tool includes a `serverName` property indicating which server it belongs to.

#### `listResources(): Promise<IAggregatedResource[]>`

List all resources from all connected servers.

#### `listPrompts(): Promise<IAggregatedPrompt[]>`

List all prompts from all connected servers.

#### `callTool(serverName: string, toolName: string, params?: unknown): Promise<unknown>`

Execute a specific tool on a specific server.

- `serverName`: Name of the server (from config)
- `toolName`: Name of the tool to call
- `params`: Optional parameters for the tool

#### `readResource(serverName: string, uri: string): Promise<unknown>`

Read a resource from a specific server.

#### `getPrompt(serverName: string, promptName: string, args?: Record<string, unknown>): Promise<unknown>`

Get a prompt from a specific server.

#### `getConnectedServers(): string[]`

Get list of connected server names.

#### `isServerConnected(serverName: string): boolean`

Check if a specific server is connected.

## Examples

See the [examples](./examples) directory for more usage examples:

- `basic-usage.ts` - Basic client usage
- `advanced-usage.ts` - Advanced features and error handling
- `stdio-transport.ts` - Using stdio transport for local servers

## Testing

The library includes several test scripts in the [tests](./tests) directory:

### Quick Test (Single Server)
```bash
npm run test:quick
```

### Comprehensive Test (All Servers)
```bash
npm run test:all
```

### Local Server Test
```bash
npm run test:local
```

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run build:watch
```

### Run Unit Tests

```bash
npm test
```

### Lint

```bash
npm run lint
```

## Architecture
For more detailed architecture information, see [PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md).

## Documentation

Additional documentation is available in the [docs](./docs) directory:

- [PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) - Detailed project structure and architecture
## License

MIT
## Contributors
Init by me & Claude and I want to make contributing to this project as easy and transparent as possible. So, just simple do the change then create PR