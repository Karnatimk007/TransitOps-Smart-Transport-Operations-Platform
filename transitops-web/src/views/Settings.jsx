import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, Crown, Eye, User, Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();

  const roles = [
    { name: 'FLEET_MANAGER', label: 'Fleet Manager', icon: Crown, color: 'var(--color-indigo)', desc: 'Full system access and configuration.' },
    { name: 'DRIVER', label: 'Driver', icon: User, color: 'var(--color-green)', desc: 'Trip dispatch, completion, and expense tracking.' },
    { name: 'SAFETY_OFFICER', label: 'Safety Officer', icon: Shield, color: 'var(--color-amber)', desc: 'Driver oversight, suspensions, and safety compliance.' },
    { name: 'FINANCIAL_ANALYST', label: 'Financial Analyst', icon: Eye, color: 'var(--color-cyan)', desc: 'View-only access to operational reports and analytics.' },
  ];

  const permissions = [
    { label: 'Create/edit vehicles', roles: ['FLEET_MANAGER'] },
    { label: 'Create/edit drivers', roles: ['FLEET_MANAGER'] },
    { label: 'Suspend/reinstate driver', roles: ['FLEET_MANAGER', 'SAFETY_OFFICER'] },
    { label: 'Manage trips (Dispatch/Complete)', roles: ['FLEET_MANAGER', 'DRIVER'] },
    { label: 'Log vehicle maintenance', roles: ['FLEET_MANAGER'] },
    { label: 'Log fuel & expenses', roles: ['FLEET_MANAGER', 'DRIVER'] },
    { label: 'View dashboard & reports', roles: ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'] },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Settings & RBAC</h1>
          <p>Role-based access control configuration</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SettingsIcon size={20} className="text-accent" /> Your Current Session
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600 }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{user?.name}</div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{user?.email}</div>
              <span className={`badge ${
                user?.role === 'FLEET_MANAGER' ? 'badge-indigo' : 
                user?.role === 'DRIVER' ? 'badge-green' : 
                user?.role === 'SAFETY_OFFICER' ? 'badge-amber' : 'badge-cyan'
              }`}>{user?.role?.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', gridColumn: 'span 2' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} className="text-accent" /> System Roles
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {roles.map(r => (
              <div key={r.name} style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: `1px solid ${r.color}40` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <r.icon size={18} color={r.color} />
                  <span style={{ fontWeight: 600 }}>{r.label}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={20} className="text-accent" /> Permission Matrix
        </h3>
        <div className="table-container">
          <table style={{ textAlign: 'center' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Action / Permission</th>
                <th>Fleet Manager</th>
                <th>Driver</th>
                <th>Safety Officer</th>
                <th>Financial Analyst</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((p, idx) => (
                <tr key={idx}>
                  <td style={{ textAlign: 'left', fontWeight: 500 }}>{p.label}</td>
                  <td>{p.roles.includes('FLEET_MANAGER') ? <span style={{color:'var(--color-green)'}}>✓</span> : <span style={{color:'var(--text-muted)'}}>–</span>}</td>
                  <td>{p.roles.includes('DRIVER') ? <span style={{color:'var(--color-green)'}}>✓</span> : <span style={{color:'var(--text-muted)'}}>–</span>}</td>
                  <td>{p.roles.includes('SAFETY_OFFICER') ? <span style={{color:'var(--color-green)'}}>✓</span> : <span style={{color:'var(--text-muted)'}}>–</span>}</td>
                  <td>{p.roles.includes('FINANCIAL_ANALYST') ? <span style={{color:'var(--color-green)'}}>✓</span> : <span style={{color:'var(--text-muted)'}}>–</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
