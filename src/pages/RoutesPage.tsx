import { useEffect, useMemo, useState } from 'react';
import { getLocations } from '../api/locations';
import { searchRoutes } from '../api/routes';
import { extractErrorMessage } from '../api/fetcher';
import type { Location, NormalizedRoute } from '../types';
import { downloadJson } from '../utils/download';
import { useAuth } from '../auth/AuthContext';

interface TimelineItem {
  type: 'LOCATION' | 'TRANSPORT';
  label: string;
  emph?: boolean;
}

const deriveVia = (route: NormalizedRoute) => {
  const stops = route.segments
    .map((segment) => segment.locationLabel)
    .filter((location) => location && location !== route.to);
  if (stops.length === 0) return 'Direct';
  const unique = [...new Set(stops)];
  return `Via ${unique.slice(0, 3).join(', ')}`;
};

export function RoutesPage() {
  const { currentUser } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [originId, setOriginId] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [tripDate, setTripDate] = useState('');

  const [loadingFilters, setLoadingFilters] = useState(true);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [error, setError] = useState('');
  const [routes, setRoutes] = useState<NormalizedRoute[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [timelineClosed, setTimelineClosed] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setLocations([]);
      setRoutes([]);
      setSelectedIndex(null);
      setLoadingFilters(false);
      return;
    }

    const load = async () => {
      setLoadingFilters(true);
      setError('');
      try {
        const list = await getLocations();
        setLocations(list);
      } catch (err) {
        setError(extractErrorMessage(err, 'Could not load locations for filters'));
      } finally {
        setLoadingFilters(false);
      }
    };

    void load();
  }, [currentUser]);

  const validationError = useMemo(() => {
    if (!originId || !destinationId || !tripDate) return 'Origin, destination and trip date are required.';
    if (originId === destinationId) return 'Origin and destination must be different.';
    return '';
  }, [originId, destinationId, tripDate]);

  const search = async () => {
    if (validationError) return;
    setLoadingRoutes(true);
    setError('');
    try {
      const foundRoutes = await searchRoutes(originId, destinationId, tripDate);
      setRoutes(foundRoutes);
      setSelectedIndex(foundRoutes.length > 0 ? 0 : null);
      setTimelineClosed(false);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to search routes'));
      setRoutes([]);
      setSelectedIndex(null);
    } finally {
      setLoadingRoutes(false);
    }
  };

  const selectedRoute = selectedIndex !== null ? routes[selectedIndex] : null;

  const timelineItems: TimelineItem[] = useMemo(() => {
    if (!selectedRoute) return [];
    const items: TimelineItem[] = [{ type: 'LOCATION', label: selectedRoute.from, emph: true }];
    selectedRoute.segments.forEach((segment) => {
      items.push({ type: 'TRANSPORT', label: segment.transportLabel });
      items.push({ type: 'LOCATION', label: segment.locationLabel });
    });
    items.push({ type: 'LOCATION', label: selectedRoute.to, emph: true });
    return items;
  }, [selectedRoute]);

  return (
    <section className="routes-page">
      <div className="card filter-panel">
        <h2>Routes Search</h2>
        {!currentUser ? <p>Please login to search routes.</p> : null}
        {loadingFilters && currentUser ? <p>Loading locations...</p> : null}
        <div className="filters-grid">
          <label>
            Origin
            <select value={originId} onChange={(event) => setOriginId(event.target.value)}>
              <option value="">Select origin</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Destination
            <select value={destinationId} onChange={(event) => setDestinationId(event.target.value)}>
              <option value="">Select destination</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Trip Date
            <input type="date" value={tripDate} onChange={(event) => setTripDate(event.target.value)} />
          </label>
          <div className="actions-end">
            <button className="btn" onClick={search} disabled={!currentUser || !!validationError || loadingRoutes}>
              {loadingRoutes ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
        {validationError ? <small className="error">{validationError}</small> : null}
        {error ? <p className="error">{error}</p> : null}
      </div>

      <div className="route-columns">
        <div className="card">
          <div className="card-header">
            <h3>Available Routes</h3>
            <button
              className="btn ghost small"
              onClick={() => downloadJson('available-routes.json', routes)}
              disabled={routes.length === 0}
            >
              Hepsini İndir
            </button>
          </div>
          {routes.length === 0 ? <p>No routes yet. Run a search.</p> : null}
          <div className="route-list">
            {routes.map((route, index) => (
              <button
                key={`${route.date}-${index}`}
                className={`route-item ${selectedIndex === index ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedIndex(index);
                  setTimelineClosed(false);
                }}
              >
                <strong>{deriveVia(route)}</strong>
                <span>
                  {route.from} → {route.to}
                </span>
              </button>
            ))}
          </div>
        </div>

        {!timelineClosed && (
          <div className="card timeline-panel">
            <h3>Route Timeline</h3>
            {!selectedRoute ? (
              <p>Select a route to see details</p>
            ) : (
              <div className="timeline">
                {timelineItems.map((item, idx) => (
                  <div className="timeline-item" key={`${item.label}-${idx}`}>
                    <div className="timeline-marker" />
                    <div className="timeline-content">
                      <small>{item.type}</small>
                      <div className={item.emph ? 'emph' : ''}>{item.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="actions-end">
              <button className="btn ghost" onClick={() => setTimelineClosed(true)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
