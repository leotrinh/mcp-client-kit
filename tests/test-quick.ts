/**
 * Quick test for the SSE server MCP server
 */

import { McpClient } from '../src';
import * as path from 'path';

async function main() {
  const configPath = path.join(__dirname, '..', 'mcp_servers_test.json');
  const client = new McpClient(configPath);

  try {
    console.log('Connecting to SSE server MCP server...');
    await client.connect();
    console.log('✓ Connected!\n');

    const servers = client.getConnectedServers();
    console.log(`Connected servers: ${servers.join(', ')}\n`);

    console.log('Fetching capabilities...');
    const [tools, resources, prompts] = await Promise.all([
      client.listTools(),
      client.listResources(),
      client.listPrompts(),
    ]);

    console.log(`\n✓ Found ${tools.length} tools, ${resources.length} resources, ${prompts.length} prompts\n`);

    if (tools.length > 0) {
      console.log('Tools:');
      tools.forEach(t => console.log(`  - ${t.name}`));
    }

    await client.disconnect();
    console.log('\n✓ Test completed successfully!');
  } catch (error) {
    console.error('✗ Error:', (error as Error).message);
    await client.disconnect();
    process.exit(1);
  }
}

main();
