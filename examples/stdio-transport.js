"use strict";
/**
 * Example configuration for stdio transport
 *
 * This example shows how to configure a local MCP server
 * that runs as a child process using stdio for communication.
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
const fs = __importStar(require("fs/promises"));
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
        const client = new src_1.McpClient(tempConfigPath);
        console.log('Connecting to local MCP servers via stdio...');
        await client.connect();
        const tools = await client.listTools();
        console.log(`Found ${tools.length} tools from local servers`);
        await client.disconnect();
        // Clean up
        await fs.unlink(tempConfigPath);
    }
    catch (error) {
        console.error('Error:', error);
        // Clean up on error
        try {
            await fs.unlink(tempConfigPath);
        }
        catch { }
    }
}
main().catch(console.error);
//# sourceMappingURL=stdio-transport.js.map