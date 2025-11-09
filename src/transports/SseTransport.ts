/**
 * Server-Sent Events (SSE) Transport implementation
 */

import EventSource from 'eventsource';
import { BaseTransport } from './BaseTransport';
import { IMcpServerConfig } from '../types';

export class SseTransport extends BaseTransport {
  private eventSource: EventSource | null = null;
  private readonly url: string;
  private readonly headers: Record<string, string>;
  private messageEndpoint: string | null = null;

  constructor(config: IMcpServerConfig) {
    super();

    if (!config.url) {
      throw new Error('SSE transport requires a URL');
    }

    this.url = config.url;
    this.headers = config.headers || {};
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        // Add Accept header for SSE
        const headers = {
          ...this.headers,
          'Accept': 'text/event-stream',
        };

        this.eventSource = new EventSource(this.url, {
          headers: headers,
        });

        // Track if we've received any event (indicating connection success)
        let receivedEvent = false;

        // Listen for the endpoint event to get the message endpoint with sessionId
        this.eventSource.addEventListener('endpoint', (event: any) => {
          receivedEvent = true;
          this.messageEndpoint = event.data;
          this.connected = true;
          resolve();
        });

        // Also listen for 'open' event as fallback
        this.eventSource.addEventListener('open', (event: any) => {
          console.log('[SseTransport] Connection opened');
        });

        this.eventSource.onmessage = (event: any) => {
          receivedEvent = true;
          this.handleResponse(event.data);
        };

        this.eventSource.onerror = (error: any) => {
          // Only reject on initial connection error
          // After connection, just log the error
          if (!this.connected && !receivedEvent) {
            this.eventSource?.close();
            this.eventSource = null;

            // Get more details about the error
            let errorMessage = `Failed to connect to SSE endpoint: ${this.url}`;
            if (error && typeof error === 'object') {
              if ('status' in error) {
                errorMessage += ` (HTTP ${error.status})`;
              }
              if ('message' in error && error.message) {
                errorMessage += ` - ${error.message}`;
              }
            }

            reject(new Error(errorMessage));
          } else {
            console.error('[SseTransport] SSE connection error:', error);
            this.handleDisconnect();
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.cleanup();
  }

  protected async sendMessage(message: string): Promise<void> {
    if (!this.messageEndpoint) {
      throw new Error('Message endpoint not available. Connection may not be fully established.');
    }

    // Build the full URL using the base URL and the message endpoint path
    const urlObj = new URL(this.url);
    const postUrl = `${urlObj.protocol}//${urlObj.host}${this.messageEndpoint}`;

    const response = await fetch(postUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.headers,
      },
      body: message,
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
    }
  }

  private handleDisconnect(): void {
    this.cleanup();
    // Optionally implement reconnection logic here
  }
}
