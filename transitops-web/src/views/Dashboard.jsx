import { useState, useEffect } from 'react';
import { getDashboard } from '../services/api';
import { Truck, Users, MapPin, Wrench, AlertTriangle, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [type, setType] = useState('');
  const [region, setRegion] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await getDashboard({ type, region });
      setData(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [type, region]);

  if (loading && !data) {
    return <div style={{ padding: '2rem' }}>Loading dashboard...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', color: 'var(--color-red)' }}>{error}</div>;
  }

  const pieData = data ? [
    { name: 'Available', value: data.availableVehicles, color: '#22c55e' },
    { name: 'On Trip', value: data.activeVehicles - data.availableVehicles - data.vehiclesInMaintenance, color: '#f59e0b' },
    { name: 'In Shop', value: data.vehiclesInMaintenance, color: '#3b82f6' }
  ].filter(item => item.value > 0) : [];

  // Mock data for operations chart
  const areaData = [
    { name: 'Mon', trips: 12, fuel: 150 },
    { name: 'Tue', trips: 19, fuel: 230 },
    { name: 'Wed', trips: 15, fuel: 180 },
    { name: 'Thu', trips: 22, fuel: 280 },
    { name: 'Fri', trips: 28, fuel: 350 },
    { name: 'Sat', trips: 10, fuel: 120 },
    { name: 'Sun', trips: 8, fuel: 90 },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Dashboard</h1>
          <p>Real-time fleet operations overview</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select className="select" value={type} onChange={e => setType(e.target.value)} style={{ width: '150px' }}>
            <option value="">All Types</option>
            <option value="Truck">Truck</option>
            <option value="Van">Van</option>
            <option value="Bus">Bus</option>
          </select>
          <select className="select" value={region} onChange={e => setRegion(e.target.value)} style={{ width: '150px' }}>
            <option value="">All Regions</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
          </select>
          <button className="btn btn-secondary btn-icon" onClick={fetchDashboard}>
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        <StatCard title="Active Vehicles" value={data?.activeVehicles || 0} icon={Truck} color="var(--color-blue)" bg="rgba(59,130,246,0.1)" />
        <StatCard title="Available Vehicles" value={data?.availableVehicles || 0} icon={Truck} color="var(--color-green)" bg="rgba(34,197,94,0.1)" />
        <StatCard title="In Maintenance" value={data?.vehiclesInMaintenance || 0} icon={Wrench} color="var(--color-amber)" bg="rgba(245,158,11,0.1)" />
        <StatCard title="Active Trips" value={data?.activeTrips || 0} icon={MapPin} color="var(--color-indigo)" bg="rgba(99,102,241,0.1)" />
        <StatCard title="Pending Trips" value={data?.pendingTrips || 0} icon={AlertTriangle} color="var(--color-amber)" bg="rgba(245,158,11,0.1)" />
        <StatCard title="Drivers On Duty" value={data?.driversOnDuty || 0} icon={Users} color="var(--color-cyan)" bg="rgba(6,182,212,0.1)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Fleet Utilization</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '250px' }}>
            <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: `conic-gradient(var(--accent) ${data?.fleetUtilizationPct}%, rgba(255,255,255,0.05) 0)` }}>
              <div style={{ width: '170px', height: '170px', background: 'var(--bg-card)', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold', fontFamily: 'Outfit' }}>{data?.fleetUtilizationPct || 0}%</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Utilized</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Fleet Status Distribution</h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
            {pieData.map((entry, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: entry.color }}></div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Weekly Operations Trend (Mock)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color-light)" vertical={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="trips" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorTrips)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon: Icon, color, bg }) => (
  <div className="glass-card stat-card" style={{ borderLeft: `4px solid ${color}` }}>
    <div className="stat-content">
      <div className="stat-label">{title}</div>
      <div className="stat-value">{value}</div>
    </div>
    <div className="stat-icon" style={{ background: bg, color }}>
      <Icon size={24} />
    </div>
  </div>
);
