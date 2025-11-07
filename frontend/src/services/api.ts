/**
 * API service for backend communication
 */

import type { ChatRequest, ChatResponse, HealthResponse } from '../types/api';

// Get API URL from environment variable or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  status?: number;
  detail?: string;

  constructor(message: string, status?: number, detail?: string) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.detail = detail;
  }
}

/**
 * Send a chat message to the backend API
 */
export async function sendChatMessage(
  request: ChatRequest
): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        `API request failed: ${response.statusText}`,
        response.status,
        errorData.detail || 'Unknown error'
      );
    }

    const data: ChatResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Network error or other issues
    throw new APIError(
      `Failed to connect to API: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      'Network or connection error'
    );
  }
}

/**
 * Check backend health status
 */
export async function checkHealth(): Promise<HealthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new APIError(
        `Health check failed: ${response.statusText}`,
        response.status
      );
    }

    const data: HealthResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    throw new APIError(
      `Failed to check health: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      'Network or connection error'
    );
  }
}
