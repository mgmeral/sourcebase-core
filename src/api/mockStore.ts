import type {
  Location,
  LocationCreateRequest,
  RouteResponse,
  Transportation,
  TransportationInput
} from '../types';

const mkId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

let mockLocations: Location[] = [
  { id: 'loc-1', code: 'TKS', name: 'Taksim Square', country: 'Turkey', city: 'Istanbul' },
  {
    id: 'loc-2',
    code: 'IST',
    name: 'Istanbul Airport (IST)',
    country: 'Turkey',
    city: 'Istanbul'
  },
  {
    id: 'loc-3',
    code: 'SAW',
    name: 'Sabiha Gökçen Airport (SAW)',
    country: 'Turkey',
    city: 'Istanbul'
  },
  {
    id: 'loc-4',
    code: 'YEI',
    name: 'Bursa Yenişehir Airport (YEI)',
    country: 'Turkey',
    city: 'Bursa'
  },
  {
    id: 'loc-5',
    code: 'LHR',
    name: 'London Heathrow Airport (LHR)',
    country: 'United Kingdom',
    city: 'London'
  },
  {
    id: 'loc-6',
    code: 'WMB',
    name: 'Wembley Stadium',
    country: 'United Kingdom',
    city: 'London'
  }
];

let mockTransportations: Transportation[] = [
  { id: 'tr-1', name: 'Bus' },
  { id: 'tr-2', name: 'Flight' },
  { id: 'tr-3', name: 'Uber' }
];

const withDelay = async <T>(data: T): Promise<T> => {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return data;
};

export const mockApi = {
  async getLocations() {
    return withDelay([...mockLocations]);
  },
  async createLocation(input: LocationCreateRequest) {
    const item: Location = { id: mkId(), ...input };
    mockLocations = [item, ...mockLocations];
    return withDelay(item);
  },
  async updateLocation(id: string, input: LocationCreateRequest) {
    mockLocations = mockLocations.map((location) => (location.id === id ? { ...location, ...input } : location));
    return withDelay(mockLocations.find((location) => location.id === id) as Location);
  },
  async deleteLocation(id: string) {
    mockLocations = mockLocations.filter((location) => location.id !== id);
    return withDelay(undefined);
  },

  async getTransportations() {
    return withDelay([...mockTransportations]);
  },
  async createTransportation(input: TransportationInput) {
    const item: Transportation = { id: mkId(), name: input.name };
    mockTransportations = [item, ...mockTransportations];
    return withDelay(item);
  },
  async updateTransportation(id: string, input: TransportationInput) {
    mockTransportations = mockTransportations.map((item) =>
      item.id === id ? { ...item, ...input, name: String(input.name ?? item.name) } : item
    );
    return withDelay(mockTransportations.find((item) => item.id === id) as Transportation);
  },
  async deleteTransportation(id: string) {
    mockTransportations = mockTransportations.filter((item) => item.id !== id);
    return withDelay(undefined);
  },

  async searchRoutes(originId: string, destinationId: string, tripDate: string): Promise<RouteResponse[]> {
    const origin = mockLocations.find((l) => l.id === originId)?.name ?? 'Taksim Square';
    const destination = mockLocations.find((l) => l.id === destinationId)?.name ?? 'Wembley Stadium';

    const routes: RouteResponse[] = [
      {
        from: origin,
        to: destination,
        date: tripDate,
        segments: [
          { transportationName: 'Bus', toName: 'Istanbul Airport (IST)' },
          { transportationName: 'Flight', toName: 'London Heathrow Airport (LHR)' },
          { transportationName: 'Uber', toName: 'Wembley Stadium' }
        ]
      },
      {
        from: origin,
        to: destination,
        date: tripDate,
        segments: [
          { transportationName: 'Bus', toName: 'Sabiha Gökçen Airport (SAW)' },
          { transportationName: 'Flight', toName: 'London Heathrow Airport (LHR)' },
          { transportationName: 'Uber', toName: 'Wembley Stadium' }
        ]
      },
      {
        from: origin,
        to: destination,
        date: tripDate,
        segments: [
          { transportationName: 'Bus', toName: 'Bursa Yenişehir Airport (YEI)' },
          { transportationName: 'Flight', toName: 'London Heathrow Airport (LHR)' },
          { transportationName: 'Uber', toName: 'Wembley Stadium' }
        ]
      }
    ];

    return withDelay(routes);
  }
};
