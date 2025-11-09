"use strict";
/**
 * Basic usage example for mcp-client-kit
 *
 * This example demonstrates how to:
 * 1. Initialize the MCP client with a configuration file
 * 2. Connect to all configured servers
 * 3. List all available tools from all servers
 * 4. Call a specific tool on a specific server
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
const path = __importStar(require("path"));
async function main() {
    // Create a new MCP client instance with the path to your configuration file
    const configPath = path.join(process.cwd(), 'mcp_servers.json');
    const client = new src_1.McpClient(configPath);
    try {
        // Connect to all servers defined in the configuration
        console.log('Connecting to MCP servers...');
        await client.connect();
        console.log('Connected successfully!\n');
        // List all connected servers
        const servers = client.getConnectedServers();
        console.log('Connected servers:', servers);
        console.log();
        // List all available tools from all servers
        console.log('Fetching all available tools...');
        const tools = await client.listTools();
        console.log(`Found ${tools.length} tools across all servers:\n`);
        tools.forEach((tool) => {
            console.log(`- [${tool.serverName}] ${tool.name}`);
            if (tool.description) {
                console.log(`  Description: ${tool.description}`);
            }
        });
        console.log();
        // List all available resources
        console.log('Fetching all available resources...');
        const resources = await client.listResources();
        console.log(`Found ${resources.length} resources:\n`);
        resources.forEach((resource) => {
            console.log(`- [${resource.serverName}] ${resource.name} (${resource.uri})`);
        });
        console.log();
        // List all available prompts
        console.log('Fetching all available prompts...');
        const prompts = await client.listPrompts();
        console.log(`Found ${prompts.length} prompts:\n`);
        prompts.forEach((prompt) => {
            console.log(`- [${prompt.serverName}] ${prompt.name}`);
        });
        console.log();
        // Example: Call a specific tool (uncomment and modify as needed)
        /*
        console.log('Calling a tool...');
        const result = await client.callTool('leo-sse-mcp', 'example-tool', {
          param1: 'value1',
          param2: 'value2',
        });
        console.log('Tool result:', result);
        */
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        // Always disconnect when done
        console.log('Disconnecting...');
        await client.disconnect();
        console.log('Disconnected.');
    }
}
// Run the example
main().catch(console.error);
//# sourceMappingURL=basic-usage.js.map