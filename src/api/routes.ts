import { mockApi } from './mockStore';
import { apiFetch, isNetworkError, ApiError } from './fetcher';
import type { NormalizedRoute, NormalizedSegment, RouteResponse, RouteSegmentResponse } from '../types';

const base = '/api/routes';

const pick = (raw: RouteSegmentResponse, keys: string[]) => {
  for (const key of keys) {
    const value = raw[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value);
    }
  }
  return '';
};

const normalizeSegment = (raw: RouteSegmentResponse): NormalizedSegment => {
  const transportLabel = pick(raw, ['transportationName', 'transportation', 'mode', 'type', 'name']);
  const locationLabel = pick(raw, ['to', 'destination', 'end', 'location', 'locationName', 'toName']);

  if (!transportLabel || !locationLabel) {
    const fallback = JSON.stringify(raw);
    return {
      transportLabel: transportLabel || `Segment: ${fallback}`,
      locationLabel: locationLabel || `Stop: ${fallback}`
    };
  }

  return { transportLabel, locationLabel };
};

const normalizeRoute = (route: RouteResponse): NormalizedRoute => ({
  from: route.from,
  to: route.to,
  date: route.date,
  segments: (route.segments ?? []).map(normalizeSegment)
});

export async function searchRoutes(originId: string, destinationId: string, tripDate: string): Promise<NormalizedRoute[]> {
  const params = new URLSearchParams({ originId, destinationId, tripDate });
  try {
    const response = await apiFetch<RouteResponse[]>(`${base}?${params.toString()}`);
    return response.map(normalizeRoute);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      throw error;
    }
    if (isNetworkError(error)) {
      const response = await mockApi.searchRoutes(originId, destinationId, tripDate);
      return response.map(normalizeRoute);
    }
    throw error;
  }
}
