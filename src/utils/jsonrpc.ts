/**
 * JSON-RPC 2.0 utility functions
 */

import { JsonRpcRequest, JsonRpcResponse, JsonRpcError } from '../types';

let requestIdCounter = 0;

/**
 * Generate a unique request ID
 */
export function generateRequestId(): number {
  return ++requestIdCounter;
}

/**
 * Create a JSON-RPC 2.0 request
 */
export function createRequest(method: string, params?: unknown): JsonRpcRequest {
  return {
    jsonrpc: '2.0',
    method,
    params,
    id: generateRequestId(),
  };
}

/**
 * Validate a JSON-RPC 2.0 response
 */
export function validateResponse<T>(response: unknown): JsonRpcResponse<T> {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid JSON-RPC response: not an object');
  }

  const resp = response as Partial<JsonRpcResponse<T>>;

  if (resp.jsonrpc !== '2.0') {
    throw new Error('Invalid JSON-RPC response: missing or invalid jsonrpc field');
  }

  if (resp.id === undefined) {
    throw new Error('Invalid JSON-RPC response: missing id field');
  }

  return resp as JsonRpcResponse<T>;
}

/**
 * Check if a response contains an error
 */
export function isErrorResponse<T>(response: JsonRpcResponse<T>): response is JsonRpcResponse<T> & { error: JsonRpcError } {
  return response.error !== undefined;
}

/**
 * Create a JSON-RPC error object
 */
export function createError(code: number, message: string, data?: unknown): JsonRpcError {
  return { code, message, data };
}

/**
 * Standard JSON-RPC error codes
 */
export const ErrorCodes = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
} as const;
