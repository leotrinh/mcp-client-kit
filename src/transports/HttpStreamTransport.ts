/**
 * HTTP Streaming Transport implementation
 */

import { BaseTransport } from './BaseTransport';
import { IMcpServerConfig } from '../types';
import * as http from 'http';
import * as https from 'https';

export class HttpStreamTransport extends BaseTransport {
  private readonly url: string;
  private readonly headers: Record<string, string>;
  private responseStream: http.IncomingMessage | null = null;
  private buffer: string = '';

  constructor(config: IMcpServerConfig) {
    super();

    if (!config.url) {
      throw new Error('HTTP Stream transport requires a URL');
    }

    this.url = config.url;
    this.headers = config.headers || {};
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    return new Promise((resolve, reject) => {
      const urlObj = new URL(this.url);
      const client = urlObj.protocol === 'https:' ? https : http;

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...this.headers,
        },
      };

      const req = client.request(this.url, options, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to connect: ${res.statusCode} ${res.statusMessage}`));
          return;
        }

        this.responseStream = res;
        this.connected = true;
        resolve();

        res.setEncoding('utf8');
        res.on('data', (chunk: string) => {
          this.handleStreamData(chunk);
        });

        res.on('end', () => {
          this.handleDisconnect();
        });

        res.on('error', (error) => {
          console.error('Stream error:', error);
          this.handleDisconnect();
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      // Keep the request open for streaming
      // Don't call req.end() to keep connection alive
    });
  }

  async disconnect(): Promise<void> {
    if (this.responseStream) {
      this.responseStream.destroy();
      this.responseStream = null;
    }
    this.cleanup();
  }

  protected async sendMessage(message: string): Promise<void> {
    // For streaming HTTP, messages are sent via POST requests
    const urlObj = new URL(this.url);
    const client = urlObj.protocol === 'https:' ? https : http;

    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers,
        },
      };

      const req = client.request(this.url, options, (res) => {
        if (res.statusCode === 200 || res.statusCode === 202) {
          resolve();
        } else {
          reject(new Error(`Failed to send message: ${res.statusCode}`));
        }
      });

      req.on('error', reject);
      req.write(message);
      req.end();
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
