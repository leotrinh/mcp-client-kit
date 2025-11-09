"use strict";
/**
 * Advanced usage example for mcp-client-kit
 *
 * This example demonstrates advanced features:
 * 1. Working with resources
 * 2. Working with prompts
 * 3. Error handling
 * 4. Checking server connection status
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
    const configPath = path.join(process.cwd(), 'mcp_servers.json');
    const client = new src_1.McpClient(configPath);
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
                const resourceContent = await client.readResource(firstResource.serverName, firstResource.uri);
                console.log('Resource content:', resourceContent);
            }
            catch (error) {
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
                const promptContent = await client.getPrompt(firstPrompt.serverName, firstPrompt.name, { exampleArg: 'value' } // Adjust based on prompt requirements
                );
                console.log('Prompt content:', promptContent);
            }
            catch (error) {
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
        }
        catch (error) {
            console.log('Expected error caught:', error.message);
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
        }, {});
        Object.entries(toolsByServer).forEach(([serverName, tools]) => {
            console.log(`\n${serverName} (${tools.length} tools):`);
            tools.forEach((tool) => {
                console.log(`  - ${tool.name}`);
            });
        });
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await client.disconnect();
    }
}
main().catch(console.error);
//# sourceMappingURL=advanced-usage.js.map