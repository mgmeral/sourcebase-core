import { mockApi } from './mockStore';
import { apiFetch, isNetworkError, ApiError } from './fetcher';
import type { Location, LocationCreateRequest } from '../types';

const base = '/api/locations';

export async function getLocations(): Promise<Location[]> {
  try {
    return await apiFetch<Location[]>(base);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      throw error;
    }
    if (isNetworkError(error)) {
      return mockApi.getLocations();
    }
    throw error;
  }
}

export async function createLocation(payload: LocationCreateRequest): Promise<Location> {
  try {
    return await apiFetch<Location>(base, { method: 'POST', body: JSON.stringify(payload) });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      throw error;
    }
    if (isNetworkError(error)) {
      return mockApi.createLocation(payload);
    }
    throw error;
  }
}

export async function updateLocation(id: string, payload: LocationCreateRequest): Promise<Location> {
  try {
    return await apiFetch<Location>(`${base}/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      throw error;
    }
    if (isNetworkError(error)) {
      return mockApi.updateLocation(id, payload);
    }
    throw error;
  }
}

export async function deleteLocation(id: string): Promise<void> {
  try {
    await apiFetch<void>(`${base}/${id}`, { method: 'DELETE' });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      throw error;
    }
    if (isNetworkError(error)) {
      await mockApi.deleteLocation(id);
      return;
    }
    throw error;
  }
}
