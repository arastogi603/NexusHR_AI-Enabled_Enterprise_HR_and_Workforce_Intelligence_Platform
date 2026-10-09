import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, LayoutDashboard, UserCheck, Calendar } from 'lucide-react';

export default function Layout() {
  const { token, logout, user } = useAuthStore();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-brand">NexusHR</div>
        <nav>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <LayoutDashboard size={20} style={{ marginRight: '10px' }} />
            Dashboard
          </Link>
          <Link to="/leaves" className={`nav-link ${location.pathname === '/leaves' ? 'active' : ''}`}>
            <Calendar size={20} style={{ marginRight: '10px' }} />
            Leave Management
          </Link>
          <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>
            <UserCheck size={20} style={{ marginRight: '10px' }} />
            Profile
          </Link>
        </nav>
        
        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
          <div style={{ padding: '0 1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            Logged in as:<br/><strong>{user?.email}</strong>
          </div>
          <button onClick={logout} className="nav-link" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}>
            <LogOut size={20} style={{ marginRight: '10px' }} />
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
