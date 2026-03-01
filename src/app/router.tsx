import { Navigate, createBrowserRouter } from 'react-router-dom';
import { Shell } from '../layout/Shell';
import { RoutesPage } from '../pages/RoutesPage';
import { LocationsPage } from '../pages/LocationsPage';
import { TransportationsPage } from '../pages/TransportationsPage';
import { RequireAdmin } from '../auth/RequireAdmin';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: <Navigate to="/routes" replace /> },
      { path: 'routes', element: <RoutesPage /> },
      {
        path: 'locations',
        element: (
          <RequireAdmin>
            <LocationsPage />
          </RequireAdmin>
        )
      },
      {
        path: 'transportations',
        element: (
          <RequireAdmin>
            <TransportationsPage />
          </RequireAdmin>
        )
      }
    ]
  }
]);
