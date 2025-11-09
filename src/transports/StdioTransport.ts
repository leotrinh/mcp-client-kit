/**
 * Standard I/O (stdio) Transport implementation for local processes
 */

import { BaseTransport } from './BaseTransport';
import { IMcpServerConfig } from '../types';
import { spawn, ChildProcess } from 'child_process';

export class StdioTransport extends BaseTransport {
  private process: ChildProcess | null = null;
  private readonly command: string;
  private readonly args: string[];
  private readonly env: Record<string, string>;
  private buffer: string = '';

  constructor(config: IMcpServerConfig) {
    super();

    if (!config.command) {
      throw new Error('Stdio transport requires a command');
    }

    this.command = config.command;
    this.args = config.args || [];
    this.env = config.env || {};
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.process = spawn(this.command, this.args, {
          env: { ...process.env, ...this.env },
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: true, // Required for Windows to find commands like npx
        });

        this.process.stdout?.setEncoding('utf8');
        this.process.stdout?.on('data', (data: string) => {
          this.handleStreamData(data);
        });

        this.process.stderr?.setEncoding('utf8');
        this.process.stderr?.on('data', (data: string) => {
          console.error(`[${this.command}] stderr:`, data);
        });

        this.process.on('error', (error) => {
          if (!this.connected) {
            reject(error);
          } else {
            console.error('Process error:', error);
            this.handleDisconnect();
          }
        });

        this.process.on('exit', (code, signal) => {
          console.log(`Process exited with code ${code} and signal ${signal}`);
          this.handleDisconnect();
        });

        // Give the process a moment to start
        setTimeout(() => {
          if (this.process && !this.process.killed) {
            this.connected = true;
            resolve();
          } else {
            reject(new Error('Process failed to start'));
          }
        }, 100);
      } catch (error) {
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.process) {
      this.process.kill('SIGTERM');
      this.process = null;
    }
    this.cleanup();
  }

  protected async sendMessage(message: string): Promise<void> {
    if (!this.process || !this.process.stdin) {
      throw new Error('Process not available');
    }

    return new Promise((resolve, reject) => {
      this.process!.stdin!.write(message + '\n', (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  private handleStreamData(chunk: string): void {
    this.buffer += chunk;

    // Split by newlines to handle multiple JSON-RPC responses
    const lines = this.buffer.split('\n');

    // Keep the last incomplete line in the buffer
    this.buffer = lines.pop() || '';

    // Process complete lines
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        this.handleResponse(trimmed);
      }
    }
  }

  private handleDisconnect(): void {
    this.cleanup();
  }
}
