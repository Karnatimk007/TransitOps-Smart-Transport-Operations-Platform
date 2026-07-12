import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { NAV_ITEMS, hasPermission } from '../utils/rbac';
import { LayoutDashboard, Truck, Users, MapPin, Wrench, Fuel, DollarSign, BarChart3, Settings, LogOut, Menu, X } from 'lucide-react';
import RoleSwitcher from './RoleSwitcher';

const iconMap = {
  LayoutDashboard, Truck, Users, MapPin, Wrench, Fuel, DollarSign, BarChart3, Settings
};

export default function Layout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = NAV_ITEMS.filter(item => hasPermission(user?.role, item.requiredPermission));

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="mobile-overlay" onClick={closeSidebar}></div>}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Truck className="text-accent" size={28} color="#6366f1" />
          <h1>TransitOps</h1>
          <button className="mobile-toggle close-btn" onClick={closeSidebar} style={{ display: 'none' }}>
            <X size={20} />
          </button>
        </div>

        <div className="user-profile-section">
          <div className="user-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role?.replace('_', ' ')}</div>
          </div>
        </div>

        <nav className="nav-links">
          {navItems.map(item => {
            const Icon = iconMap[item.icon];
            return (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color-light)' }}>
          <NavLink 
            to="/settings" 
            className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
          <button 
            className="nav-item" 
            onClick={() => { closeSidebar(); logout(); }}
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', marginTop: '0.5rem', color: 'var(--color-red)' }}
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', display: 'none' }} className="mobile-header">
           <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', color: 'var(--text-primary)' }}>
             <Menu size={24} />
           </button>
           <h2 style={{ fontFamily: 'Outfit', margin: 0 }}>TransitOps</h2>
        </div>
        <RoleSwitcher />
        <Outlet />
      </main>
    </div>
  );
}
