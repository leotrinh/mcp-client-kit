/**
 * Example configuration for stdio transport
 *
 * This example shows how to configure a local MCP server
 * that runs as a child process using stdio for communication.
 */

import { McpClient } from '../src';
import * as path from 'path';
import * as fs from 'fs/promises';

async function main() {
  // Create a temporary config file for this example
  const tempConfigPath = path.join(process.cwd(), 'mcp_servers.json');

  const config = {
    mcpServers: {
      'local-server': {
        type: 'stdio',
        command: 'node',
        args: ['./path/to/your/mcp-server.js'],
        env: {
          DEBUG: 'mcp:*',
        },
      },
      'python-server': {
        type: 'stdio',
        command: 'python',
        args: ['-m', 'your_mcp_server'],
        env: {
          PYTHONUNBUFFERED: '1',
        },
      },
    },
  };

  try {
    // Write the temporary config
    await fs.writeFile(tempConfigPath, JSON.stringify(config, null, 2));

    // Create and use the client
    const client = new McpClient(tempConfigPath);

    console.log('Connecting to local MCP servers via stdio...');
    await client.connect();

    const tools = await client.listTools();
    console.log(`Found ${tools.length} tools from local servers`);

    await client.disconnect();

    // Clean up
    await fs.unlink(tempConfigPath);
  } catch (error) {
    console.error('Error:', error);
    // Clean up on error
    try {
      await fs.unlink(tempConfigPath);
    } catch {}
  }
}

main().catch(console.error);
