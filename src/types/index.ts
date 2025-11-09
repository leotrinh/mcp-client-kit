/**
 * Core type definitions for mcp-client-kit
 */

/**
 * Transport type enumeration
 */
export type TransportType = 'sse' | 'httpStream' | 'stdio';

/**
 * Configuration for a single MCP server
 */
export interface IMcpServerConfig {
  type?: TransportType; // Optional - auto-detected from command/url if not specified
  url?: string; // Required for 'sse' and 'httpStream'
  command?: string; // Required for 'stdio'
  args?: string[]; // Optional for 'stdio'
  headers?: Record<string, string>; // Optional headers (e.g., Authorization)
  env?: Record<string, string>; // Optional environment variables for 'stdio'
}

/**
 * Root configuration structure from mcp_servers.json
 */
export interface IMcpServersConfig {
  mcpServers: Record<string, IMcpServerConfig>;
}

/**
 * JSON-RPC 2.0 Request
 */
export interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: unknown;
  id: string | number;
}

/**
 * JSON-RPC 2.0 Response
 */
export interface JsonRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  result?: T;
  error?: JsonRpcError;
  id: string | number | null;
}

/**
 * JSON-RPC 2.0 Error
 */
export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

/**
 * MCP Tool definition
 */
export interface IMcpTool {
  name: string;
  description?: string;
  inputSchema?: unknown;
}

/**
 * MCP Resource definition
 */
export interface IMcpResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

/**
 * MCP Prompt definition
 */
export interface IMcpPrompt {
  name: string;
  description?: string;
  arguments?: Array<{
    name: string;
    description?: string;
    required?: boolean;
  }>;
}

/**
 * Aggregated tool with server context
 */
export interface IAggregatedTool extends IMcpTool {
  serverName: string;
}

/**
 * Aggregated resource with server context
 */
export interface IAggregatedResource extends IMcpResource {
  serverName: string;
}

/**
 * Aggregated prompt with server context
 */
export interface IAggregatedPrompt extends IMcpPrompt {
  serverName: string;
}

/**
 * Transport interface that all transport implementations must follow
 */
export interface ITransport {
  /**
   * Connect to the MCP server
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the MCP server
   */
  disconnect(): Promise<void>;

  /**
   * Send a JSON-RPC request and wait for response
   */
  sendRequest<T = unknown>(request: JsonRpcRequest): Promise<JsonRpcResponse<T>>;

  /**
   * Check if transport is connected
   */
  isConnected(): boolean;
}

/**
 * MCP Client interface
 */
export interface IMcpClient {
  /**
   * Initialize and connect to all configured servers
   */
  connect(): Promise<void>;

  /**
   * Disconnect from all servers
   */
  disconnect(): Promise<void>;

  /**
   * List all tools from all connected servers
   */
  listTools(): Promise<IAggregatedTool[]>;

  /**
   * List all resources from all connected servers
   */
  listResources(): Promise<IAggregatedResource[]>;

  /**
   * List all prompts from all connected servers
   */
  listPrompts(): Promise<IAggregatedPrompt[]>;

  /**
   * Call a specific tool on a specific server
   */
  callTool(serverName: string, toolName: string, params?: unknown): Promise<unknown>;

  /**
   * Read a resource from a specific server
   */
  readResource(serverName: string, uri: string): Promise<unknown>;

  /**
   * Get a prompt from a specific server
   */
  getPrompt(serverName: string, promptName: string, args?: Record<string, unknown>): Promise<unknown>;
}
