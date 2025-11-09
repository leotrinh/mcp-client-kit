/**
 * Unit tests for McpClient
 */

import { McpClient } from '../src/client/McpClient';
import { ITransport, JsonRpcRequest, JsonRpcResponse } from '../src/types';
import * as fs from 'fs/promises';

// Mock the transports
jest.mock('../src/transports', () => ({
  SseTransport: jest.fn(),
  HttpStreamTransport: jest.fn(),
  StdioTransport: jest.fn(),
}));

// Mock fs module
jest.mock('fs/promises');

describe('McpClient', () => {
  let mockTransport: jest.Mocked<ITransport>;
  const testConfigPath = '/path/to/mcp_servers.json';

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a mock transport
    mockTransport = {
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      sendRequest: jest.fn(),
      isConnected: jest.fn().mockReturnValue(true),
    };

    // Mock the transport constructors
    const { SseTransport } = require('../src/transports');
    SseTransport.mockImplementation(() => mockTransport);
  });

  describe('connect', () => {
    it('should load configuration and connect to all servers', async () => {
      const mockConfig = {
        mcpServers: {
          'test-server': {
            type: 'sse',
            url: 'http://localhost:3000/sse',
          },
        },
      };

      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockConfig));

      const client = new McpClient(testConfigPath);
      await client.connect();

      expect(fs.readFile).toHaveBeenCalledWith(testConfigPath, 'utf-8');
      expect(mockTransport.connect).toHaveBeenCalled();
    });

    it('should throw error if config file cannot be loaded', async () => {
      (fs.readFile as jest.Mock).mockRejectedValue(new Error('File not found'));

      const client = new McpClient(testConfigPath);
      await expect(client.connect()).rejects.toThrow('Failed to load configuration');
    });

    it('should throw error if no servers configured', async () => {
      const mockConfig = { mcpServers: {} };
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockConfig));

      const client = new McpClient(testConfigPath);
      await expect(client.connect()).rejects.toThrow('No servers configured');
    });
  });

  describe('listTools', () => {
    it('should aggregate tools from all servers', async () => {
      const mockConfig = {
        mcpServers: {
          'server1': { type: 'sse', url: 'http://localhost:3000/sse' },
          'server2': { type: 'sse', url: 'http://localhost:3001/sse' },
        },
      };

      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockConfig));

      const mockToolsResponse: JsonRpcResponse = {
        jsonrpc: '2.0',
        result: {
          tools: [
            { name: 'tool1', description: 'Tool 1' },
            { name: 'tool2', description: 'Tool 2' },
          ],
        },
        id: 1,
      };

      mockTransport.sendRequest.mockResolvedValue(mockToolsResponse);

      const client = new McpClient(testConfigPath);
      await client.connect();
      const tools = await client.listTools();

      expect(tools).toHaveLength(4); // 2 tools from each of 2 servers
      expect(tools[0]).toHaveProperty('serverName');
    });
  });

  describe('callTool', () => {
    it('should call tool on specific server', async () => {
      const mockConfig = {
        mcpServers: {
          'test-server': { type: 'sse', url: 'http://localhost:3000/sse' },
        },
      };

      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockConfig));

      const mockResponse: JsonRpcResponse = {
        jsonrpc: '2.0',
        result: { success: true },
        id: 1,
      };

      mockTransport.sendRequest.mockResolvedValue(mockResponse);

      const client = new McpClient(testConfigPath);
      await client.connect();
      const result = await client.callTool('test-server', 'my-tool', { param: 'value' });

      expect(result).toEqual({ success: true });
      expect(mockTransport.sendRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'tools/call',
          params: expect.objectContaining({
            name: 'my-tool',
            arguments: { param: 'value' },
          }),
        })
      );
    });

    it('should throw error if server not found', async () => {
      const mockConfig = {
        mcpServers: {
          'test-server': { type: 'sse', url: 'http://localhost:3000/sse' },
        },
      };

      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockConfig));

      const client = new McpClient(testConfigPath);
      await client.connect();

      await expect(
        client.callTool('non-existent-server', 'my-tool', {})
      ).rejects.toThrow('Server not found');
    });
  });

  describe('disconnect', () => {
    it('should disconnect from all servers', async () => {
      const mockConfig = {
        mcpServers: {
          'server1': { type: 'sse', url: 'http://localhost:3000/sse' },
          'server2': { type: 'sse', url: 'http://localhost:3001/sse' },
        },
      };

      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockConfig));

      const client = new McpClient(testConfigPath);
      await client.connect();
      await client.disconnect();

      expect(mockTransport.disconnect).toHaveBeenCalledTimes(2);
    });
  });
});
