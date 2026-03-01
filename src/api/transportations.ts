import { mockApi } from './mockStore';
import { apiFetch, isNetworkError, ApiError } from './fetcher';
import type { Transportation, TransportationInput } from '../types';

const base = '/api/transportations';

const mapTransportation = (item: Record<string, unknown>): Transportation => ({
  ...item,
  id: String(item.id ?? item.uuid ?? item.key ?? ''),
  name: String(item.name ?? item.transportationName ?? item.label ?? 'Unnamed')
});

export async function getTransportations(): Promise<Transportation[]> {
  try {
    const response = await apiFetch<Record<string, unknown>[]>(base);
    return response.map(mapTransportation);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      throw error;
    }
    if (isNetworkError(error)) {
      return mockApi.getTransportations();
    }
    throw error;
  }
}

export async function createTransportation(payload: TransportationInput): Promise<Transportation> {
  try {
    const response = await apiFetch<Record<string, unknown>>(base, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return mapTransportation(response);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      throw error;
    }
    if (isNetworkError(error)) {
      return mockApi.createTransportation(payload);
    }
    throw error;
  }
}

export async function updateTransportation(id: string, payload: TransportationInput): Promise<Transportation> {
  try {
    const response = await apiFetch<Record<string, unknown>>(`${base}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return mapTransportation(response);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      throw error;
    }
    if (isNetworkError(error)) {
      return mockApi.updateTransportation(id, payload);
    }
    throw error;
  }
}

export async function deleteTransportation(id: string): Promise<void> {
  try {
    await apiFetch<void>(`${base}/${id}`, { method: 'DELETE' });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      throw error;
    }
    if (isNetworkError(error)) {
      await mockApi.deleteTransportation(id);
      return;
    }
    throw error;
  }
}
