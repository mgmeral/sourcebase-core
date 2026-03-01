export type Role = 'ADMIN' | 'USER';

export interface User {
  name: string;
  role: Role;
}

export interface Location {
  id: string;
  code: string;
  name: string;
  country: string;
  city: string;
}

export interface LocationCreateRequest {
  code: string;
  name: string;
  country: string;
  city: string;
}

export interface Transportation {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface TransportationInput {
  name: string;
  [key: string]: unknown;
}

export interface RouteSegmentResponse {
  [key: string]: unknown;
}

export interface RouteResponse {
  from: string;
  to: string;
  date: string;
  segments: RouteSegmentResponse[];
}

export interface NormalizedSegment {
  transportLabel: string;
  locationLabel: string;
}

export interface NormalizedRoute {
  from: string;
  to: string;
  date: string;
  segments: NormalizedSegment[];
}
