/**
 * Main MCP Client implementation
 */

import * as fs from 'fs/promises';
import {
  IMcpClient,
  IMcpServersConfig,
  IMcpServerConfig,
  ITransport,
  IAggregatedTool,
  IAggregatedResource,
  IAggregatedPrompt,
  IMcpTool,
  IMcpResource,
  IMcpPrompt,
} from '../types';
import { SseTransport, HttpStreamTransport, StdioTransport } from '../transports';
import { createRequest } from '../utils/jsonrpc';

export class McpClient implements IMcpClient {
  private servers: Map<string, ITransport> = new Map();
  private config: IMcpServersConfig | null = null;

  /**
   * Create a new MCP Client instance
   * @param configPath Path to mcp_servers.json configuration file
   */
  constructor(private configPath: string) {}

  /**
   * Load configuration from file
   */
  private async loadConfig(): Promise<IMcpServersConfig> {
    try {
      const configContent = await fs.readFile(this.configPath, 'utf-8');
      return JSON.parse(configContent) as IMcpServersConfig;
    } catch (error) {
      throw new Error(`Failed to load configuration from ${this.configPath}: ${error}`);
    }
  }

  /**
   * Create a transport instance based on server configuration
   */
  private createTransport(config: IMcpServerConfig): ITransport {
    // Auto-detect type if not specified
    let type = config.type;
    if (!type) {
      if (config.command) {
        type = 'stdio';
      } else if (config.url) {
        type = 'sse'; // Default to SSE for URL-based configs
      } else {
        throw new Error('Invalid server configuration: missing type, command, or url');
      }
    }

    switch (type) {
      case 'sse':
        return new SseTransport(config);
      case 'httpStream':
        return new HttpStreamTransport(config);
      case 'stdio':
        return new StdioTransport(config);
      default:
        throw new Error(`Unsupported transport type: ${type}`);
    }
  }

  /**
   * Initialize and connect to all configured servers
   */
  async connect(): Promise<void> {
    // Load configuration
    this.config = await this.loadConfig();

    if (!this.config.mcpServers || Object.keys(this.config.mcpServers).length === 0) {
      throw new Error('No servers configured in mcp_servers.json');
    }

    // Create and connect to all servers in parallel
    const connectionPromises = Object.entries(this.config.mcpServers).map(
      async ([serverName, serverConfig]) => {
        try {
          const transport = this.createTransport(serverConfig);
          await transport.connect();
          this.servers.set(serverName, transport);
          console.log(`Connected to server: ${serverName}`);
        } catch (error) {
          console.error(`Failed to connect to server ${serverName}:`, error);
          throw error;
        }
      }
    );

    await Promise.all(connectionPromises);
    console.log(`Successfully connected to ${this.servers.size} server(s)`);
  }

  /**
   * Disconnect from all servers
   */
  async disconnect(): Promise<void> {
    const disconnectPromises = Array.from(this.servers.entries()).map(
      async ([serverName, transport]) => {
        try {
          await transport.disconnect();
          console.log(`Disconnected from server: ${serverName}`);
        } catch (error) {
          console.error(`Error disconnecting from ${serverName}:`, error);
        }
      }
    );

    await Promise.all(disconnectPromises);
    this.servers.clear();
  }

  /**
   * List all tools from all connected servers
   */
  async listTools(): Promise<IAggregatedTool[]> {
    const toolsPromises = Array.from(this.servers.entries()).map(
      async ([serverName, transport]): Promise<IAggregatedTool[]> => {
        try {
          const request = createRequest('tools/list', {});
          const response = await transport.sendRequest<{ tools: IMcpTool[] }>(request);

          if (response.result && response.result.tools) {
            return response.result.tools.map((tool) => ({
              ...tool,
              serverName,
            }));
          }
          return [];
        } catch (error) {
          console.error(`Error listing tools from ${serverName}:`, error);
          return [];
        }
      }
    );

    const toolsArrays = await Promise.all(toolsPromises);
    return toolsArrays.flat();
  }

  /**
   * List all resources from all connected servers
   */
  async listResources(): Promise<IAggregatedResource[]> {
    const resourcesPromises = Array.from(this.servers.entries()).map(
      async ([serverName, transport]): Promise<IAggregatedResource[]> => {
        try {
          const request = createRequest('resources/list', {});
          const response = await transport.sendRequest<{ resources: IMcpResource[] }>(request);

          if (response.result && response.result.resources) {
            return response.result.resources.map((resource) => ({
              ...resource,
              serverName,
            }));
          }
          return [];
        } catch (error) {
          console.error(`Error listing resources from ${serverName}:`, error);
          return [];
        }
      }
    );

    const resourcesArrays = await Promise.all(resourcesPromises);
    return resourcesArrays.flat();
  }

  /**
   * List all prompts from all connected servers
   */
  async listPrompts(): Promise<IAggregatedPrompt[]> {
    const promptsPromises = Array.from(this.servers.entries()).map(
      async ([serverName, transport]): Promise<IAggregatedPrompt[]> => {
        try {
          const request = createRequest('prompts/list', {});
          const response = await transport.sendRequest<{ prompts: IMcpPrompt[] }>(request);

          if (response.result && response.result.prompts) {
            return response.result.prompts.map((prompt) => ({
              ...prompt,
              serverName,
            }));
          }
          return [];
        } catch (error) {
          console.error(`Error listing prompts from ${serverName}:`, error);
          return [];
        }
      }
    );

    const promptsArrays = await Promise.all(promptsPromises);
    return promptsArrays.flat();
  }

  /**
   * Call a specific tool on a specific server
   */
  async callTool(serverName: string, toolName: string, params?: unknown): Promise<unknown> {
    const transport = this.servers.get(serverName);
    if (!transport) {
      throw new Error(`Server not found: ${serverName}`);
    }

    const request = createRequest('tools/call', {
      name: toolName,
      arguments: params,
    });

    const response = await transport.sendRequest(request);

    if (response.error) {
      throw new Error(`Tool call failed: ${response.error.message}`);
    }

    return response.result;
  }

  /**
   * Read a resource from a specific server
   */
  async readResource(serverName: string, uri: string): Promise<unknown> {
    const transport = this.servers.get(serverName);
    if (!transport) {
      throw new Error(`Server not found: ${serverName}`);
    }

    const request = createRequest('resources/read', { uri });
    const response = await transport.sendRequest(request);

    if (response.error) {
      throw new Error(`Resource read failed: ${response.error.message}`);
    }

    return response.result;
  }

  /**
   * Get a prompt from a specific server
   */
  async getPrompt(
    serverName: string,
    promptName: string,
    args?: Record<string, unknown>
  ): Promise<unknown> {
    const transport = this.servers.get(serverName);
    if (!transport) {
      throw new Error(`Server not found: ${serverName}`);
    }

    const request = createRequest('prompts/get', {
      name: promptName,
      arguments: args,
    });

    const response = await transport.sendRequest(request);

    if (response.error) {
      throw new Error(`Get prompt failed: ${response.error.message}`);
    }

    return response.result;
  }

  /**
   * Get list of connected server names
   */
  getConnectedServers(): string[] {
    return Array.from(this.servers.keys());
  }

  /**
   * Check if a specific server is connected
   */
  isServerConnected(serverName: string): boolean {
    const transport = this.servers.get(serverName);
    return transport ? transport.isConnected() : false;
  }
}
