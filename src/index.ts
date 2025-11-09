/**
 * mcp-client-kit - TypeScript/Node.js client library for MCP servers
 *
 * A client library for connecting to multiple Model Context Protocol (MCP) servers
 * and aggregating their capabilities through a unified interface.
 */

// Main client
export { McpClient } from './client/McpClient';

// Type definitions
export type {
  IMcpClient,
  IMcpServerConfig,
  IMcpServersConfig,
  ITransport,
  TransportType,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcError,
  IMcpTool,
  IMcpResource,
  IMcpPrompt,
  IAggregatedTool,
  IAggregatedResource,
  IAggregatedPrompt,
} from './types';

// Transport implementations (for advanced usage)
export {
  BaseTransport,
  SseTransport,
  HttpStreamTransport,
  StdioTransport,
} from './transports';

// JSON-RPC utilities (for advanced usage)
export {
  createRequest,
  validateResponse,
  isErrorResponse,
  createError,
  ErrorCodes,
} from './utils/jsonrpc';
