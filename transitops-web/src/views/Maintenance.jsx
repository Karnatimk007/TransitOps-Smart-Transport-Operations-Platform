import { useState, useEffect } from 'react';
import { getMaintenanceLogs, createMaintenanceLog, closeMaintenanceLog, getVehicles } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../utils/rbac';
import { Plus, Wrench, CheckCircle, X } from 'lucide-react';

export default function Maintenance() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  
  const canManage = hasPermission(user?.role, 'manage_maintenance');

  const [formData, setFormData] = useState({ vehicleId: '', description: '', cost: '' });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getMaintenanceLogs();
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const openModal = async () => {
    try {
      const res = await getVehicles();
      // Only available vehicles can be put in maintenance (rule: not ON_TRIP)
      setVehicles(res.data.filter(v => v.status !== 'ON_TRIP' && v.status !== 'RETIRED'));
      setFormData({ vehicleId: '', description: '', cost: '' });
      setShowModal(true);
    } catch (err) {
      alert('Failed to load vehicles');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMaintenanceLog({ ...formData, cost: Number(formData.cost) });
      setShowModal(false);
      fetchLogs();
    } catch (err) {
      alert(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleClose = async (id) => {
    if (window.confirm('Close this maintenance record? This will restore the vehicle to Available status.')) {
      try {
        await closeMaintenanceLog(id);
        fetchLogs();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to close maintenance log');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Maintenance</h1>
          <p>Vehicle maintenance tracking</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={openModal}>
            <Plus size={18} /> Log Maintenance
          </button>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Description</th>
              <th>Cost (₹)</th>
              <th>Started At</th>
              <th>Status / Closed At</th>
              {canManage && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="6" style={{textAlign:'center'}}>Loading...</td></tr> : logs.map(l => (
              <tr key={l.id} style={{ borderLeft: l.isActive ? '4px solid var(--color-amber)' : '4px solid transparent' }}>
                <td style={{ fontWeight: 500 }}>{l.vehicle?.name} ({l.vehicle?.registrationNo})</td>
                <td>{l.description}</td>
                <td>{l.cost}</td>
                <td>{new Date(l.startedAt).toLocaleString()}</td>
                <td>
                  {l.isActive 
                    ? <span className="badge badge-amber"><Wrench size={12} /> IN SHOP</span>
                    : <span style={{ color: 'var(--text-secondary)' }}>{new Date(l.closedAt).toLocaleString()}</span>
                  }
                </td>
                {canManage && (
                  <td className="actions-cell">
                    {l.isActive && (
                      <button className="btn btn-success btn-icon" title="Close Maintenance" onClick={() => handleClose(l.id)}>
                        <CheckCircle size={16} />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Log Maintenance</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--color-amber)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  <strong>Note:</strong> Logging maintenance will automatically change the vehicle's status to <strong>IN SHOP</strong> and remove it from the dispatch selection pool.
                </div>
                <div className="form-group">
                  <label>Vehicle</label>
                  <select className="select" required value={formData.vehicleId} onChange={e => setFormData({...formData, vehicleId: e.target.value})}>
                    <option value="">Select Vehicle</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.registrationNo})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="textarea" required rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
                <div className="form-group">
                  <label>Cost (₹)</label>
                  <input className="input" type="number" required value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
