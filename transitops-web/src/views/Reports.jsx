import { useState, useEffect } from 'react';
import { getVehicles, getVehicleReport } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Printer, TrendingUp, Fuel, DollarSign, Truck } from 'lucide-react';

export default function Reports() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVid, setSelectedVid] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getVehicles().then(res => {
      setVehicles(res.data);
      if (res.data.length > 0) setSelectedVid(res.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedVid) return;
    setLoading(true);
    getVehicleReport(selectedVid).then(res => {
      setReport(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [selectedVid]);

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reports/export.csv', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transitops_report.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Reports & Analytics</h1>
          <p>Financial and operational performance</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={18} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={18} /> Print Report
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <label style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Select Vehicle for Detailed Analysis:</label>
          <select className="select" style={{ maxWidth: '300px' }} value={selectedVid} onChange={e => setSelectedVid(e.target.value)}>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.registrationNo})</option>)}
          </select>
        </div>

        {loading ? <div style={{ padding: '2rem', textAlign: 'center' }}>Loading report data...</div> : report ? (
          <>
            <div className="kpi-grid">
              <StatCard title="Fuel Efficiency" value={report.fuelEfficiencyKmPerL ? `${report.fuelEfficiencyKmPerL} km/L` : 'N/A'} icon={Fuel} color="var(--color-cyan)" />
              <StatCard title="Total Distance" value={`${report.totalDistanceKm} km`} icon={TrendingUp} color="var(--color-indigo)" />
              <StatCard title="Total Fuel" value={`${report.totalFuelL} L`} icon={Fuel} color="var(--color-amber)" />
              <StatCard title="Operational Cost" value={`₹${report.operationalCost}`} icon={DollarSign} color="var(--color-red)" />
              <StatCard title="Total Revenue" value={`₹${report.totalRevenue}`} icon={DollarSign} color="var(--color-green)" />
              
              <div className="glass-card stat-card" style={{ borderLeft: `4px solid ${report.roi >= 0 ? 'var(--color-green)' : 'var(--color-red)'}` }}>
                <div className="stat-content">
                  <div className="stat-label">Vehicle ROI</div>
                  <div className="stat-value" style={{ color: report.roi >= 0 ? 'var(--color-green)' : 'var(--color-red)' }}>
                    {report.roi !== null ? `${(report.roi * 100).toFixed(2)}%` : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>ROI Calculation Formula</h3>
              <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                ROI = (Revenue [₹{report.totalRevenue}] - Operational Cost [₹{report.operationalCost}]) / Acquisition Cost
              </div>
            </div>
          </>
        ) : (
          <div>No data available</div>
        )}
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Fleet Overview (Mock Data)</h3>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'Van-01', revenue: 4000, cost: 2400 },
              { name: 'Truck-02', revenue: 3000, cost: 1398 },
              { name: 'Bus-03', revenue: 2000, cost: 9800 },
              { name: 'Van-04', revenue: 2780, cost: 3908 },
              { name: 'Pickup-05', revenue: 1890, cost: 4800 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color-light)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }} />
              <Bar dataKey="revenue" fill="var(--color-green)" name="Revenue" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost" fill="var(--color-red)" name="Operational Cost" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="glass-card stat-card" style={{ borderLeft: `4px solid ${color}` }}>
    <div className="stat-content">
      <div className="stat-label">{title}</div>
      <div className="stat-value">{value}</div>
    </div>
    <div className="stat-icon" style={{ color }}>
      <Icon size={24} />
    </div>
  </div>
);
