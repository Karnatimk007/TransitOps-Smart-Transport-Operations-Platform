import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Truck, Shield, BarChart3, Users, Mail, Lock, LogIn } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-hero">
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--accent), #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={32} color="white" />
            </div>
            <h1 style={{ fontSize: '3rem', margin: 0 }}>TransitOps</h1>
          </div>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Smart Transport Operations Platform</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <FeatureItem icon={Truck} title="Fleet Management" desc="Track vehicles, status, and availability in real-time." color="var(--color-blue)" />
          <FeatureItem icon={Users} title="Driver Operations" desc="Manage profiles, safety scores, and assignments." color="var(--color-green)" />
          <FeatureItem icon={Shield} title="Safety & Compliance" desc="Automated license checks and maintenance tracking." color="var(--color-amber)" />
          <FeatureItem icon={BarChart3} title="Financial Insights" desc="Calculate operational costs and vehicle ROI automatically." color="var(--color-indigo)" />
        </div>
      </div>

      <div className="auth-form-wrapper">
        <div style={{ maxWidth: '360px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Sign in to your account</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Enter your credentials to access the dashboard.</p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--color-red)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  className="input" 
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="name@transitops.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  className="input" 
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Authenticating...' : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>

          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color-light)' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Demo Accounts (password: password123)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <DemoAccount label="Fleet Manager" email="fleet@transitops.com" setCreds={() => { setEmail('fleet@transitops.com'); setPassword('password123'); }} />
              <DemoAccount label="Driver" email="driver@transitops.com" setCreds={() => { setEmail('driver@transitops.com'); setPassword('password123'); }} />
              <DemoAccount label="Safety Officer" email="safety@transitops.com" setCreds={() => { setEmail('safety@transitops.com'); setPassword('password123'); }} />
              <DemoAccount label="Financial Analyst" email="finance@transitops.com" setCreds={() => { setEmail('finance@transitops.com'); setPassword('password123'); }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const FeatureItem = ({ icon: Icon, title, desc, color }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
    <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color }}>
      <Icon size={24} />
    </div>
    <div>
      <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem 0' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{desc}</p>
    </div>
  </div>
);

const DemoAccount = ({ label, email, setCreds }) => (
  <div 
    onClick={setCreds}
    style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'var(--transition)' }}
    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
  >
    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{label}</span>
    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{email}</span>
  </div>
);
