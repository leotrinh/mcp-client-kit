# Project Structure

## Overview

This document provides a comprehensive overview of the mcp-client-kit project structure.

## Directory Layout

```
mcp-client-kit/
├── src/                        # Source code
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts           # Core interfaces (ITransport, IMcpClient, etc.)
│   ├── transports/            # Transport layer implementations
│   │   ├── BaseTransport.ts   # Abstract base class for all transports
│   │   ├── SseTransport.ts    # Server-Sent Events transport
│   │   ├── HttpStreamTransport.ts  # HTTP Streaming transport
│   │   ├── StdioTransport.ts  # stdio transport for local processes
│   │   └── index.ts           # Transport exports
│   ├── client/                # Main client implementation
│   │   └── McpClient.ts       # Primary client class
│   ├── utils/                 # Utility functions
│   │   └── jsonrpc.ts         # JSON-RPC 2.0 utilities
│   └── index.ts               # Main entry point and public API
├── tests/                      # Test scripts and unit tests
│   ├── McpClient.test.ts      # Unit tests for McpClient
│   ├── test-quick.ts          # Quick single-server test
│   ├── test-all-servers.ts    # Comprehensive multi-server test
│   └── test-local.ts          # Local SSE server server test
├── docs/                       # Documentation
│   ├── PROJECT_STRUCTURE.md   # This file - project structure
├── examples/                   # Usage examples
│   ├── basic-usage.ts         # Basic client usage example
│   ├── advanced-usage.ts      # Advanced features example
│   └── stdio-transport.ts     # stdio transport example
├── build/                      # Compiled JavaScript output (generated)
├── coverage/                   # Test coverage reports (generated)
├── node_modules/              # Dependencies (generated)
├── mcp_servers.json           # Example server configuration
├── mcp_servers_test.json      # Test server configuration
├── package.json               # Project metadata and dependencies
├── package-lock.json          # Dependency lock file
├── tsconfig.json              # TypeScript compiler configuration
├── jest.config.js             # Jest testing configuration
├── .eslintrc.js               # ESLint configuration
├── .prettierrc                # Prettier code formatting configuration
├── .gitignore                 # Git ignore rules
├── .npmignore                 # npm package exclusions
├── LICENSE                    # MIT License
└── README.md                  # Main project documentation
```

## Key Files Description

### Source Code (`src/`)

#### `src/types/index.ts`
- Defines all TypeScript interfaces and types
- Core interfaces: `ITransport`, `IMcpClient`, `IMcpServerConfig`
- JSON-RPC types: `JsonRpcRequest`, `JsonRpcResponse`, `JsonRpcError`
- MCP entity types: `IMcpTool`, `IMcpResource`, `IMcpPrompt`
- Aggregated types with server context

#### `src/transports/`
**BaseTransport.ts**
- Abstract base class implementing common transport functionality
- Handles JSON-RPC request/response matching
- Manages pending requests and timeouts (30s default)
- Provides connection lifecycle hooks

**SseTransport.ts**
- Implements Server-Sent Events transport
- Uses EventSource for receiving messages
- Listens for `endpoint` event to capture sessionId
- Sends messages via HTTP POST to session-specific endpoint

**HttpStreamTransport.ts**
- Implements HTTP streaming transport
- Maintains persistent HTTP connection
- Buffers and parses newline-delimited JSON responses

**StdioTransport.ts**
- Implements stdio transport for local processes
- Spawns child process with configured command
- Communicates via stdin/stdout pipes
- Supports Windows (shell mode enabled)

#### `src/client/McpClient.ts`
- Main client class orchestrating all functionality
- Loads configuration from `mcp_servers.json`
- Auto-detects transport type from config (stdio/sse)
- Creates and manages transport instances
- Implements aggregation logic for multi-server operations
- Provides public API methods

#### `src/utils/jsonrpc.ts`
- JSON-RPC 2.0 utility functions
- Request creation and ID generation
- Response validation
- Error handling utilities

#### `src/index.ts`
- Main entry point for the library
- Exports public API
- Re-exports types and classes

### Test Scripts and Unit Tests (`tests/`)

#### `McpClient.test.ts`
- Unit tests for McpClient class
- Uses Jest testing framework
- Mocks transports and file system
- Tests connection, tool listing, and API methods
- Run with: `npm test`

#### `test-quick.ts`
- Quick integration test for single server (SSE server MCP)
- Minimal output for fast verification
- Tests connection, tools, resources, prompts
- Run with: `npm run test:quick`

#### `test-all-servers.ts`
- Comprehensive integration test for all configured servers
- Color-coded output with detailed diagnostics
- Individual server connection status
- Capability listings per server
- Summary statistics and error reporting
- Run with: `npm run test:all`

#### `test-local.ts`
- Integration test script for local SSE server MCP server
- Creates temporary configuration
- Detailed capability exploration
- Tests resource reading and prompt fetching
- Run with: `npm run test:local`

### Root Documentation Files

#### `CLAUDE.md` (Root)
- Guidance for Claude Code when working with this repository
- Kept in root directory for easy discoverability
- Architecture overview and key concepts
- Development commands
- Implementation patterns
- Testing considerations
- Debugging tips

#### `README.md` (Root)
- Main project documentation
- User-facing guide
- Installation and usage instructions
- API reference

#### `LICENSE` (Root)
- MIT License file
- Copyright information

### Documentation (`docs/`)

#### `PROJECT_STRUCTURE.md`
- This file - comprehensive project layout documentation
- Directory structure
- File descriptions
- Development workflow
- Component addition guidelines

#### `TEST_RESULTS.md`
- Test results and status
- Server configuration analysis
- Bug fixes and improvements
- Recommendations for setup
- Library features verification

#### `NPM_PUBLISH_CHECKLIST.md`
- Quick npm publishing checklist
- Pre-publish requirements
- Publishing commands
- What gets published

### Examples (`examples/`)

Runnable examples demonstrating library usage:
- **basic-usage.ts**: Simple connection and tool listing
- **advanced-usage.ts**: Resources, prompts, error handling
- **stdio-transport.ts**: Local process communication

### Configuration Files

#### `package.json`
- Project metadata
- Main entry: `build/index.js`
- Type definitions: `build/index.d.ts`
- Dependencies: `eventsource` for SSE
- Dev dependencies: TypeScript, Jest, ESLint, Prettier
- npm scripts:
  - `build`: Compile TypeScript
  - `build:watch`: Watch mode compilation
  - `test`: Run Jest tests
  - `test:quick`: Quick server test
  - `test:all`: Comprehensive server test
  - `test:local`: Local server test
  - `lint`: Check code quality
  - `format`: Format code

#### `tsconfig.json`
- TypeScript compiler options
- Target: ES2020
- Module: CommonJS
- Strict mode enabled
- Outputs to `build/` directory
- Source maps and declarations enabled
- Excludes tests, examples, and test files from compilation

#### `jest.config.js`
- Jest testing framework configuration
- Uses ts-jest for TypeScript support
- Coverage collection settings
- Test file patterns

#### `.eslintrc.js`
- ESLint configuration for code quality
- Uses @typescript-eslint parser and rules
- Recommended rule sets

#### `.prettierrc`
- Code formatting rules
- Consistent code style across project
- Single quotes, 100 char width

#### `mcp_servers.json`
- Main server configuration file
- Defines available MCP servers
- Specifies transport types and connection details
- Includes authentication headers

#### `mcp_servers_test.json`
- Test configuration for SSE server MCP server
- Used by test:quick script

## Build Artifacts

### `build/` (Generated)
- Compiled JavaScript files (`.js`)
- TypeScript declaration files (`.d.ts`)
- Declaration maps (`.d.ts.map`)
- Source maps (`.js.map`)

### `coverage/` (Generated)
- Test coverage reports
- HTML and lcov formats

## Development Workflow

1. **Edit source**: Modify files in `src/`
2. **Build**: Run `npm run build` to compile TypeScript to `build/`
3. **Test**: Run `npm test` for unit tests, `npm run test:quick` for integration
4. **Lint**: Run `npm run lint` to check code quality
5. **Format**: Run `npm run format` to format code

## Testing Workflow

1. **Quick Test**: `npm run test:quick` - Fast single-server verification
2. **All Servers**: `npm run test:all` - Test all configured servers
3. **Local Test**: `npm run test:local` - Test local SSE server server with detailed output
4. **Unit Tests**: `npm test` - Run Jest unit tests

## Adding New Components

### New Transport
1. Create file in `src/transports/` (e.g., `WebSocketTransport.ts`)
2. Extend `BaseTransport` class
3. Implement abstract methods: `connect()`, `disconnect()`, `sendMessage()`
4. Export from `src/transports/index.ts`
5. Update `createTransport()` in `src/client/McpClient.ts`
6. Update `TransportType` in `src/types/index.ts`

### New API Method
1. Add method to `IMcpClient` in `src/types/index.ts`
2. Implement in `src/client/McpClient.ts`
3. Export types from `src/index.ts`
4. Add unit tests in `tests/McpClient.test.ts`
5. Document in `README.md`

### New Test Script or Unit Test
1. Create file in `tests/` directory
2. Import from `../src` (not `./src`)
3. For integration tests: Config paths should reference `path.join(__dirname, '..', 'config.json')`
4. For unit tests: Use Jest with proper mocking
5. Add npm script to `package.json` if it's an integration test
6. Unit tests run automatically with `npm test`

### New Documentation
1. Create file in `docs/` directory
2. Link from `README.md` if user-facing
3. Update this file (`PROJECT_STRUCTURE.md`) if structural change

## Important Implementation Details

### Transport Layer
- All transports extend `BaseTransport`
- Request timeout: 30 seconds (configurable)
- SSE transport captures sessionId from `endpoint` event
- Stdio transport uses shell mode for Windows compatibility
- HTTP Stream maintains persistent connection

### Configuration
- Transport type auto-detected if not specified
- If `command` present → stdio
- If `url` present → sse (default)
- Headers passed through for authentication

### Error Handling
- Connection failures logged but don't stop other servers
- Request timeouts reject pending promises
- JSON-RPC errors converted to JavaScript errors
- Transport disconnections reject all pending requests

## Project Structure Changes

This project was reorganized from the original structure:
- Tests moved from root to `tests/` directory
- Documentation moved to `docs/` directory (except README.md and CLAUDE.md)
- CLAUDE.md kept in root for easy discoverability by Claude Code
- Build output changed from `dist/` to `build/`
- npm scripts added for convenient test execution
- npm publishing configuration added (LICENSE, .npmignore, publishing docs)
