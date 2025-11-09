/**
 * Comprehensive test script for all MCP servers in mcp_servers.json
 *
 * This script will:
 * 1. Connect to all configured MCP servers
 * 2. Check connection status for each server
 * 3. List capabilities (tools, resources, prompts) from each server
 * 4. Provide detailed diagnostics and error reporting
 */

import { McpClient } from '../src';
import * as path from 'path';
import * as fs from 'fs';

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function printHeader(text: string) {
  console.log(`\n${colors.bright}${colors.blue}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${text}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${'='.repeat(80)}${colors.reset}\n`);
}

function printSection(text: string) {
  console.log(`\n${colors.bright}${colors.cyan}${text}${colors.reset}`);
  console.log(`${colors.cyan}${'-'.repeat(text.length)}${colors.reset}`);
}

function printSuccess(text: string) {
  console.log(`${colors.green}✓${colors.reset} ${text}`);
}

function printError(text: string) {
  console.log(`${colors.red}✗${colors.reset} ${text}`);
}

function printWarning(text: string) {
  console.log(`${colors.yellow}⚠${colors.reset} ${text}`);
}

function printInfo(text: string) {
  console.log(`${colors.cyan}ℹ${colors.reset} ${text}`);
}

interface ServerTestResult {
  serverName: string;
  connected: boolean;
  transportType?: string;
  error?: string;
  toolCount?: number;
  resourceCount?: number;
  promptCount?: number;
  connectionTime?: number;
}

async function testServerConnection(
  client: McpClient,
  serverName: string
): Promise<ServerTestResult> {
  const startTime = Date.now();
  const result: ServerTestResult = {
    serverName,
    connected: false,
  };

  try {
    // Check if server is connected
    const isConnected = client.isServerConnected(serverName);
    result.connected = isConnected;
    result.connectionTime = Date.now() - startTime;

    if (isConnected) {
      printSuccess(`Connected to ${serverName}`);
      return result;
    } else {
      printError(`Failed to connect to ${serverName}`);
      result.error = 'Connection failed';
      return result;
    }
  } catch (error) {
    result.error = (error as Error).message;
    printError(`Error testing ${serverName}: ${result.error}`);
    return result;
  }
}

async function getServerCapabilities(
  client: McpClient,
  serverName: string
): Promise<Pick<ServerTestResult, 'toolCount' | 'resourceCount' | 'promptCount'>> {
  const result: Pick<ServerTestResult, 'toolCount' | 'resourceCount' | 'promptCount'> = {};

  try {
    // Get all tools and filter by server
    const allTools = await client.listTools();
    const serverTools = allTools.filter(t => t.serverName === serverName);
    result.toolCount = serverTools.length;

    // Get all resources and filter by server
    const allResources = await client.listResources();
    const serverResources = allResources.filter(r => r.serverName === serverName);
    result.resourceCount = serverResources.length;

    // Get all prompts and filter by server
    const allPrompts = await client.listPrompts();
    const serverPrompts = allPrompts.filter(p => p.serverName === serverName);
    result.promptCount = serverPrompts.length;

  } catch (error) {
    console.error(`Error fetching capabilities for ${serverName}:`, (error as Error).message);
  }

  return result;
}

async function main() {
  const configPath = path.join(__dirname, '..', 'mcp_servers.json');

  printHeader('MCP Client Kit - Multi-Server Connection Test');

  // Check if config file exists
  if (!fs.existsSync(configPath)) {
    printError(`Configuration file not found: ${configPath}`);
    process.exit(1);
  }

  printInfo(`Configuration file: ${configPath}`);

  // Load and display configuration
  const configContent = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(configContent);
  const serverNames = Object.keys(config.mcpServers || {});

  if (serverNames.length === 0) {
    printWarning('No servers configured in mcp_servers.json');
    process.exit(0);
  }

  printInfo(`Found ${serverNames.length} server(s) configured:\n`);

  // Display configured servers
  serverNames.forEach((name, index) => {
    const serverConfig = config.mcpServers[name];
    const type = serverConfig.type || (serverConfig.command ? 'stdio' : 'sse');
    console.log(`  ${index + 1}. ${colors.bright}${name}${colors.reset} (${type})`);
    if (serverConfig.url) {
      console.log(`     URL: ${serverConfig.url}`);
    }
    if (serverConfig.command) {
      console.log(`     Command: ${serverConfig.command} ${(serverConfig.args || []).join(' ')}`);
    }
  });

  const client = new McpClient(configPath);
  const testResults: ServerTestResult[] = [];

  try {
    printSection('Connecting to Servers');

    const connectStartTime = Date.now();

    // Attempt to connect to all servers
    try {
      printInfo('Attempting to connect... (this may take a moment for stdio servers)\n');
      await client.connect();
      const connectTime = Date.now() - connectStartTime;
      printSuccess(`Connection phase completed in ${connectTime}ms\n`);
    } catch (error) {
      printWarning(`Connection phase completed with errors:\n  ${(error as Error).message}\n`);
    }

    // Give stdio servers a moment to fully initialize
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get list of connected servers
    const connectedServers = client.getConnectedServers();
    printInfo(`Successfully connected to ${connectedServers.length}/${serverNames.length} server(s)\n`);

    printSection('Testing Individual Connections');

    // Test each server individually
    for (const serverName of serverNames) {
      const result = await testServerConnection(client, serverName);
      testResults.push(result);
    }

    printSection('Fetching Server Capabilities');

    // Fetch capabilities for each connected server
    for (const result of testResults) {
      if (result.connected) {
        printInfo(`Fetching capabilities for ${result.serverName}...`);
        const capabilities = await getServerCapabilities(client, result.serverName);
        Object.assign(result, capabilities);

        console.log(`  Tools: ${capabilities.toolCount || 0}`);
        console.log(`  Resources: ${capabilities.resourceCount || 0}`);
        console.log(`  Prompts: ${capabilities.promptCount || 0}`);
      }
    }

    // Display detailed results for each server
    printSection('Detailed Server Information');

    for (const serverName of serverNames) {
      const result = testResults.find(r => r.serverName === serverName);
      console.log(`\n${colors.bright}${serverName}:${colors.reset}`);

      if (result?.connected) {
        printSuccess(`Status: Connected (${result.connectionTime}ms)`);
        console.log(`  ${colors.green}●${colors.reset} Tools: ${result.toolCount || 0}`);
        console.log(`  ${colors.green}●${colors.reset} Resources: ${result.resourceCount || 0}`);
        console.log(`  ${colors.green}●${colors.reset} Prompts: ${result.promptCount || 0}`);

        // List tools if available
        if (result.toolCount && result.toolCount > 0) {
          const allTools = await client.listTools();
          const serverTools = allTools.filter(t => t.serverName === serverName);
          console.log(`\n  Available Tools:`);
          serverTools.forEach(tool => {
            console.log(`    - ${tool.name}`);
            if (tool.description) {
              console.log(`      ${colors.cyan}${tool.description}${colors.reset}`);
            }
          });
        }
      } else {
        printError(`Status: Disconnected`);
        if (result?.error) {
          console.log(`  ${colors.red}●${colors.reset} Error: ${result.error}`);
        }
      }
    }

    // Summary
    printHeader('Test Summary');

    const connectedCount = testResults.filter(r => r.connected).length;
    const failedCount = testResults.length - connectedCount;
    const totalTools = testResults.reduce((sum, r) => sum + (r.toolCount || 0), 0);
    const totalResources = testResults.reduce((sum, r) => sum + (r.resourceCount || 0), 0);
    const totalPrompts = testResults.reduce((sum, r) => sum + (r.promptCount || 0), 0);

    console.log(`Total Servers: ${colors.bright}${testResults.length}${colors.reset}`);
    console.log(`Connected: ${colors.green}${connectedCount}${colors.reset}`);
    if (failedCount > 0) {
      console.log(`Failed: ${colors.red}${failedCount}${colors.reset}`);
    }
    console.log(`\nTotal Capabilities:`);
    console.log(`  Tools: ${colors.bright}${totalTools}${colors.reset}`);
    console.log(`  Resources: ${colors.bright}${totalResources}${colors.reset}`);
    console.log(`  Prompts: ${colors.bright}${totalPrompts}${colors.reset}`);

    if (connectedCount === testResults.length) {
      console.log(`\n${colors.green}${colors.bright}✓ All servers connected successfully!${colors.reset}\n`);
    } else {
      console.log(`\n${colors.yellow}${colors.bright}⚠ Some servers failed to connect${colors.reset}\n`);
    }

    // Disconnect from all servers
    printSection('Disconnecting');
    await client.disconnect();
    printSuccess('Disconnected from all servers\n');

    process.exit(failedCount > 0 ? 1 : 0);

  } catch (error) {
    printError(`Fatal error: ${(error as Error).message}`);
    console.error(error);

    try {
      await client.disconnect();
    } catch {}

    process.exit(1);
  }
}

// Run the test
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
