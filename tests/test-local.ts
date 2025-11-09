/**
 * Test script for connecting to local SSE server MCP server
 */

import { McpClient } from '../src';
import * as path from 'path';
import * as fs from 'fs/promises';

async function main() {
  // Create a test configuration for the local server
  const testConfig = {
    mcpServers: {
      'sse-mcp-local': {
        type: 'sse' as const,
        url: 'http://localhost:3000/sse',
        headers: {
          'Authorization': 'Bearer leo-dGluaHRkLmluZm9AZ21haWwuY29t',
        },
      },
    },
  };

  const configPath = path.join(__dirname, 'test-config.json');

  try {
    // Write temporary config
    await fs.writeFile(configPath, JSON.stringify(testConfig, null, 2));
    console.log('[Test] Configuration file created\n');

    // Create client
    const client = new McpClient(configPath);
    console.log('[Test] McpClient instance created\n');

    // Connect
    console.log('[Test] Connecting to MCP server...');
    await client.connect();
    console.log('[Test] ✓ Connected successfully!\n');

    // Get connected servers
    const servers = client.getConnectedServers();
    console.log(`[Test] Connected servers: ${servers.join(', ')}\n`);

    // List all tools
    console.log('[Test] Fetching tools...');
    const tools = await client.listTools();
    console.log(`[Test] ✓ Found ${tools.length} tools:\n`);
    tools.forEach((tool) => {
      console.log(`  - [${tool.serverName}] ${tool.name}`);
      if (tool.description) {
        console.log(`    Description: ${tool.description}`);
      }
    });
    console.log();

    // List all resources
    console.log('[Test] Fetching resources...');
    const resources = await client.listResources();
    console.log(`[Test] ✓ Found ${resources.length} resources:\n`);
    resources.forEach((resource) => {
      console.log(`  - [${resource.serverName}] ${resource.name}`);
      console.log(`    URI: ${resource.uri}`);
      if (resource.description) {
        console.log(`    Description: ${resource.description}`);
      }
    });
    console.log();

    // List all prompts
    console.log('[Test] Fetching prompts...');
    const prompts = await client.listPrompts();
    console.log(`[Test] ✓ Found ${prompts.length} prompts:\n`);
    prompts.forEach((prompt) => {
      console.log(`  - [${prompt.serverName}] ${prompt.name}`);
      if (prompt.description) {
        console.log(`    Description: ${prompt.description}`);
      }
      if (prompt.arguments && prompt.arguments.length > 0) {
        console.log(`    Arguments: ${prompt.arguments.map(a => a.name).join(', ')}`);
      }
    });
    console.log();

    // Test reading a resource (if available)
    if (resources.length > 0) {
      const firstResource = resources[0];
      console.log(`[Test] Reading resource: ${firstResource.name}...`);
      try {
        const resourceContent = await client.readResource(
          firstResource.serverName,
          firstResource.uri
        );
        console.log('[Test] ✓ Resource content:');
        console.log(JSON.stringify(resourceContent, null, 2));
        console.log();
      } catch (error) {
        console.error('[Test] ✗ Failed to read resource:', (error as Error).message);
        console.log();
      }
    }

    // Test getting a prompt (if available)
    if (prompts.length > 0) {
      const firstPrompt = prompts[0];
      console.log(`[Test] Getting prompt: ${firstPrompt.name}...`);
      try {
        const promptContent = await client.getPrompt(
          firstPrompt.serverName,
          firstPrompt.name,
          {}
        );
        console.log('[Test] ✓ Prompt content:');
        console.log(JSON.stringify(promptContent, null, 2));
        console.log();
      } catch (error) {
        console.error('[Test] ✗ Failed to get prompt:', (error as Error).message);
        console.log();
      }
    }

    // Disconnect
    console.log('[Test] Disconnecting...');
    await client.disconnect();
    console.log('[Test] ✓ Disconnected successfully\n');

    console.log('[Test] ==========================================');
    console.log('[Test] All tests completed successfully! ✓');
    console.log('[Test] ==========================================');

  } catch (error) {
    console.error('\n[Test] ✗ Error occurred:');
    console.error(error);
    process.exit(1);
  } finally {
    // Clean up
    try {
      await fs.unlink(configPath);
      console.log('[Test] Cleaned up temporary config file');
    } catch {}
  }
}

// Run the test
console.log('[Test] ==========================================');
console.log('[Test] Testing mcp-client-kit with local server');
console.log('[Test] ==========================================\n');

main().catch((error) => {
  console.error('[Test] Fatal error:', error);
  process.exit(1);
});
