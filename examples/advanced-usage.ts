/**
 * Advanced usage example for mcp-client-kit
 *
 * This example demonstrates advanced features:
 * 1. Working with resources
 * 2. Working with prompts
 * 3. Error handling
 * 4. Checking server connection status
 */

import { McpClient } from '../src';
import * as path from 'path';

async function main() {
  const configPath = path.join(process.cwd(), 'mcp_servers.json');
  const client = new McpClient(configPath);

  try {
    await client.connect();
    console.log('Connected to MCP servers\n');

    // Example 1: Working with Resources
    console.log('=== Working with Resources ===');
    const resources = await client.listResources();

    if (resources.length > 0) {
      const firstResource = resources[0];
      console.log(`Reading resource: ${firstResource.name} from ${firstResource.serverName}`);

      try {
        const resourceContent = await client.readResource(
          firstResource.serverName,
          firstResource.uri
        );
        console.log('Resource content:', resourceContent);
      } catch (error) {
        console.error('Failed to read resource:', error);
      }
    }
    console.log();

    // Example 2: Working with Prompts
    console.log('=== Working with Prompts ===');
    const prompts = await client.listPrompts();

    if (prompts.length > 0) {
      const firstPrompt = prompts[0];
      console.log(`Getting prompt: ${firstPrompt.name} from ${firstPrompt.serverName}`);

      try {
        const promptContent = await client.getPrompt(
          firstPrompt.serverName,
          firstPrompt.name,
          { exampleArg: 'value' } // Adjust based on prompt requirements
        );
        console.log('Prompt content:', promptContent);
      } catch (error) {
        console.error('Failed to get prompt:', error);
      }
    }
    console.log();

    // Example 3: Checking Server Status
    console.log('=== Server Status ===');
    const servers = client.getConnectedServers();
    servers.forEach((serverName) => {
      const isConnected = client.isServerConnected(serverName);
      console.log(`${serverName}: ${isConnected ? 'Connected' : 'Disconnected'}`);
    });
    console.log();

    // Example 4: Error Handling for Tool Calls
    console.log('=== Error Handling ===');
    try {
      await client.callTool('non-existent-server', 'some-tool', {});
    } catch (error) {
      console.log('Expected error caught:', (error as Error).message);
    }

    // Example 5: Filtering Tools by Server
    console.log('\n=== Filtering Tools by Server ===');
    const allTools = await client.listTools();
    const toolsByServer = allTools.reduce((acc, tool) => {
      if (!acc[tool.serverName]) {
        acc[tool.serverName] = [];
      }
      acc[tool.serverName].push(tool);
      return acc;
    }, {} as Record<string, typeof allTools>);

    Object.entries(toolsByServer).forEach(([serverName, tools]) => {
      console.log(`\n${serverName} (${tools.length} tools):`);
      tools.forEach((tool) => {
        console.log(`  - ${tool.name}`);
      });
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.disconnect();
  }
}

main().catch(console.error);
