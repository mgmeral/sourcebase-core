import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobileMenu: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobileMenu }: SidebarProps) {
  const { currentUser } = useAuth();
  const role = currentUser?.role;

  const links = [
    { to: '/routes', label: 'Routes', visible: true },
    { to: '/locations', label: 'Locations', visible: role === 'ADMIN' },
    { to: '/transportations', label: 'Transportations', visible: role === 'ADMIN' }
  ];

  return (
    <>
      {mobileOpen && <div className="backdrop" onClick={onCloseMobileMenu} />}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <nav>
          {links
            .filter((link) => link.visible)
            .map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onCloseMobileMenu}
              >
                {link.label}
              </NavLink>
            ))}
        </nav>
      </aside>
    </>
  );
}
