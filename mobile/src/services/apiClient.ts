/**
 * API Client for FastAPI Backend
 * Handles all backend API calls with error handling
 */

import { API_BASE_URL } from '../config/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.detail || 'Request failed',
          status: response.status,
        };
      }

      return { data, status: response.status };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  // Classification endpoint (for urgency detection)
  async classifyMessage(message: string) {
    return this.request<{
      urgency: 'urgent' | 'normal' | 'low';
      empathy: string;
    }>('/classify', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Chat endpoints
  async filterMessage(text: string) {
    return this.request<{
      textRedacted: string;
      flags: Record<string, boolean>;
    }>('/chat/filter', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async sendMessage(threadId: string, text: string, authToken?: string) {
    const headers: HeadersInit = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    return this.request<{
      messageId: string;
      textRedacted: string;
      flags: Record<string, boolean>;
      createdAt: number;
    }>('/chat/send', {
      method: 'POST',
      headers,
      body: JSON.stringify({ threadId, text }),
    });
  }

  async getThreadMessages(threadId: string, limit = 20, cursor?: string, authToken?: string) {
    const headers: HeadersInit = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const params = new URLSearchParams({ limit: limit.toString() });
    if (cursor) params.append('cursor', cursor);

    return this.request<{
      items: Array<{
        id: string;
        threadId: string;
        fromUserId: string;
        textRedacted: string;
        createdAt: number;
        flags: Record<string, boolean>;
      }>;
      nextCursor: string | null;
    }>(`/chat/thread/${threadId}?${params}`, {
      headers,
    });
  }

  async getQuickPrompts(role?: 'requester' | 'helper') {
    const params = role ? `?role=${role}` : '';
    return this.request<{
      categories: Array<{
        id: string;
        name: string;
        items: Array<{ id: string; text: string }>;
      }>;
    }>(`/chat/quick-prompts${params}`);
  }

  async sendQuickPrompt(threadId: string, promptId: string, authToken?: string) {
    const headers: HeadersInit = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    return this.request<{
      messageId: string;
      textRedacted: string;
      flags: Record<string, boolean>;
      createdAt: number;
    }>('/chat/send-quick', {
      method: 'POST',
      headers,
      body: JSON.stringify({ threadId, promptId }),
    });
  }

  // Location endpoints
  async updateLocation(
    lat: number,
    lng: number,
    available: boolean,
    role: 'helper' | 'requester'
  ) {
    return this.request<{
      geo: string;
      lastSeenAt: number;
    }>('/location/update', {
      method: 'POST',
      body: JSON.stringify({ lat, lng, available, role }),
    });
  }

  async getNearbyNetwork(
    lat: number,
    lng: number,
    role?: 'helper' | 'requester',
    radiusM = 400
  ) {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radiusM: radiusM.toString(),
    });
    if (role) params.append('role', role);

    return this.request<Array<{
      userId: string;
      role: string;
      available: boolean;
      geo: string;
      proximityBand: string;
      rating?: number;
      lastSeenAt: number;
    }>>(`/network/nearby?${params}`);
  }

  // Venue endpoints
  async getNearbyVenues(lat: number, lng: number, radiusM = 400) {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radiusM: radiusM.toString(),
    });

    return this.request<Array<{
      id: string;
      name: string;
      geo: string;
      stock: { pads: string; tampons: string; liners: string };
      stockUpdatedAt: number;
      proximityBand: string;
    }>>(`/venues/near?${params}`);
  }

  async reportVenueStock(
    venueId: string,
    stock: { pads?: string | number; tampons?: string | number; liners?: string | number }
  ) {
    return this.request<{
      stock: { pads: string; tampons: string; liners: string };
      stockUpdatedAt: number;
    }>('/venues/report-stock', {
      method: 'POST',
      body: JSON.stringify({ venueId, ...stock }),
    });
  }

  async getVenueStock(venueId: string) {
    return this.request<{
      stock: { pads: string; tampons: string; liners: string };
      stockUpdatedAt: number;
    }>(`/venues/${venueId}/stock`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

