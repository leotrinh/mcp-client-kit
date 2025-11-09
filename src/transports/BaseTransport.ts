/**
 * Base transport class with common functionality
 */

import { ITransport, JsonRpcRequest, JsonRpcResponse } from '../types';
import { validateResponse, isErrorResponse } from '../utils/jsonrpc';

export abstract class BaseTransport implements ITransport {
  protected connected: boolean = false;
  protected pendingRequests: Map<string | number, {
    resolve: (value: JsonRpcResponse<unknown>) => void;
    reject: (reason: unknown) => void;
    timeout: NodeJS.Timeout;
  }> = new Map();

  // Helper method to get pending request with proper typing
  private getPendingRequest(id: string | number) {
    return this.pendingRequests.get(id);
  }
  protected readonly requestTimeout: number = 30000; // 30 seconds

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  protected abstract sendMessage(message: string): Promise<void>;

  isConnected(): boolean {
    return this.connected;
  }

  async sendRequest<T = unknown>(request: JsonRpcRequest): Promise<JsonRpcResponse<T>> {
    if (!this.connected) {
      throw new Error('Transport not connected');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(request.id);
        reject(new Error(`Request ${request.id} timed out after ${this.requestTimeout}ms`));
      }, this.requestTimeout);

      // Store with type assertion since we know the resolve will be called with the correct type
      this.pendingRequests.set(request.id, { 
        resolve: resolve as (value: JsonRpcResponse<unknown>) => void, 
        reject, 
        timeout 
      });

      this.sendMessage(JSON.stringify(request))
        .catch((error) => {
          this.pendingRequests.delete(request.id);
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  protected handleResponse(data: string): void {
    try {
      const response = validateResponse(JSON.parse(data));

      if (!response.id) {
        return;
      }

      const pending = this.pendingRequests.get(response.id);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingRequests.delete(response.id);

        if (isErrorResponse(response)) {
          pending.reject(new Error(`JSON-RPC error ${response.error.code}: ${response.error.message}`));
        } else {
          pending.resolve(response);
        }
      }
    } catch (error) {
      console.error('Error handling response:', error);
    }
  }

  protected cleanup(): void {
    // Reject all pending requests
    for (const [, pending] of this.pendingRequests) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Transport disconnected'));
    }
    this.pendingRequests.clear();
    this.connected = false;
  }
}