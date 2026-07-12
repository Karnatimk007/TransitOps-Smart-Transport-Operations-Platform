import { useAuth } from '../contexts/AuthContext';
import { Users } from 'lucide-react';

export default function RoleSwitcher() {
  const { user, login } = useAuth();
  
  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in dev mode for demo purposes
  }

  const switchRole = async (email) => {
    try {
      await login(email, 'password123');
      window.location.reload();
    } catch (err) {
      console.error('Failed to switch role', err);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '0.75rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 'var(--radius-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
        <Users size={18} />
        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Demo Role Switcher</span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button 
          onClick={() => switchRole('fleet@transitops.com')}
          className={`badge ${user?.role === 'FLEET_MANAGER' ? 'badge-indigo' : 'badge-gray'}`}
          style={{ cursor: 'pointer', background: user?.role === 'FLEET_MANAGER' ? 'var(--accent)' : '', color: user?.role === 'FLEET_MANAGER' ? 'white' : '' }}
        >
          Fleet Manager
        </button>
        <button 
          onClick={() => switchRole('driver@transitops.com')}
          className={`badge ${user?.role === 'DRIVER' ? 'badge-green' : 'badge-gray'}`}
          style={{ cursor: 'pointer', background: user?.role === 'DRIVER' ? 'var(--color-green)' : '', color: user?.role === 'DRIVER' ? 'white' : '' }}
        >
          Driver
        </button>
        <button 
          onClick={() => switchRole('safety@transitops.com')}
          className={`badge ${user?.role === 'SAFETY_OFFICER' ? 'badge-amber' : 'badge-gray'}`}
          style={{ cursor: 'pointer', background: user?.role === 'SAFETY_OFFICER' ? 'var(--color-amber)' : '', color: user?.role === 'SAFETY_OFFICER' ? 'white' : '' }}
        >
          Safety Officer
        </button>
        <button 
          onClick={() => switchRole('finance@transitops.com')}
          className={`badge ${user?.role === 'FINANCIAL_ANALYST' ? 'badge-blue' : 'badge-gray'}`}
          style={{ cursor: 'pointer', background: user?.role === 'FINANCIAL_ANALYST' ? 'var(--color-blue)' : '', color: user?.role === 'FINANCIAL_ANALYST' ? 'white' : '' }}
        >
          Finance
        </button>
      </div>
    </div>
  );
}
