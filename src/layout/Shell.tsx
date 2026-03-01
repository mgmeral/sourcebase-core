import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useState } from 'react';

export function Shell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <Header onOpenMobileMenu={() => setMobileOpen(true)} />
      <Sidebar mobileOpen={mobileOpen} onCloseMobileMenu={() => setMobileOpen(false)} />
      <main className="main-content" onClick={() => setMobileOpen(false)}>
        <Outlet />
      </main>
    </div>
  );
}
