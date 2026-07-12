import { useState, useEffect } from 'react';
import { getDrivers, createDriver, updateDriver, suspendDriver, reinstateDriver } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../utils/rbac';
import { Plus, UserX, UserCheck, Edit2, X } from 'lucide-react';

export default function Drivers() {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const canManage = hasPermission(user?.role, 'manage_drivers');
  const canSuspend = hasPermission(user?.role, 'suspend_driver');

  const [formData, setFormData] = useState({
    name: '', licenseNumber: '', licenseCategory: 'C', licenseExpiry: '', contactNumber: '', safetyScore: 100, region: ''
  });

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await getDrivers();
      setDrivers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrivers(); }, []);

  const openModal = (driver = null) => {
    if (driver) {
      setEditingId(driver.id);
      setFormData({
        name: driver.name, licenseNumber: driver.licenseNumber, licenseCategory: driver.licenseCategory,
        licenseExpiry: new Date(driver.licenseExpiry).toISOString().split('T')[0],
        contactNumber: driver.contactNumber, safetyScore: driver.safetyScore, region: driver.region || ''
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', licenseNumber: '', licenseCategory: 'C', licenseExpiry: '', contactNumber: '', safetyScore: 100, region: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, safetyScore: Number(formData.safetyScore) };
      if (editingId) {
        await updateDriver(editingId, payload);
      } else {
        await createDriver(payload);
      }
      setShowModal(false);
      fetchDrivers();
    } catch (err) {
      alert(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleStatusChange = async (id, action) => {
    if (window.confirm(`Are you sure you want to ${action} this driver?`)) {
      try {
        if (action === 'suspend') await suspendDriver(id);
        else await reinstateDriver(id);
        fetchDrivers();
      } catch (err) {
        alert(err.response?.data?.error || `Failed to ${action} driver`);
      }
    }
  };

  const getStatusBadge = (status) => {
    const map = { AVAILABLE: 'badge-green', ON_TRIP: 'badge-amber', OFF_DUTY: 'badge-gray', SUSPENDED: 'badge-red' };
    return <span className={`badge ${map[status] || 'badge-gray'}`}>{status.replace('_', ' ')}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Drivers & Safety Profiles</h1>
          <p>Manage driver compliance and scores</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={() => openModal()}>
            <Plus size={18} /> Add Driver
          </button>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>License No</th>
              <th>Expiry</th>
              <th>Contact</th>
              <th>Safety Score</th>
              <th>Status</th>
              {(canManage || canSuspend) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="7" style={{textAlign:'center'}}>Loading...</td></tr> : drivers.map(d => {
              const isExpired = new Date(d.licenseExpiry) < new Date();
              return (
                <tr key={d.id}>
                  <td style={{ fontWeight: 500 }}>{d.name}</td>
                  <td>{d.licenseNumber} ({d.licenseCategory})</td>
                  <td style={{ color: isExpired ? 'var(--color-red)' : '' }}>
                    {new Date(d.licenseExpiry).toLocaleDateString()} {isExpired && ' (Expired)'}
                  </td>
                  <td>{d.contactNumber}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${d.safetyScore}%`, background: d.safetyScore > 80 ? 'var(--color-green)' : d.safetyScore > 50 ? 'var(--color-amber)' : 'var(--color-red)' }}></div>
                      </div>
                      <span style={{ fontSize: '0.85rem' }}>{d.safetyScore}</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(d.status)}</td>
                  {(canManage || canSuspend) && (
                    <td className="actions-cell">
                      {canManage && <button className="btn btn-secondary btn-icon" onClick={() => openModal(d)}><Edit2 size={16} /></button>}
                      {canSuspend && d.status !== 'SUSPENDED' && <button className="btn btn-danger btn-icon" title="Suspend" onClick={() => handleStatusChange(d.id, 'suspend')}><UserX size={16} /></button>}
                      {canSuspend && d.status === 'SUSPENDED' && <button className="btn btn-success btn-icon" title="Reinstate" onClick={() => handleStatusChange(d.id, 'reinstate')}><UserCheck size={16} /></button>}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Driver' : 'Add Driver'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name</label>
                  <input className="input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>License Number</label>
                    <input className="input" required value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} />
                  </div>
                  <div>
                    <label>License Category</label>
                    <select className="select" value={formData.licenseCategory} onChange={e => setFormData({...formData, licenseCategory: e.target.value})}>
                      <option>A</option><option>B</option><option>C</option><option>D</option><option>E</option>
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>License Expiry</label>
                    <input className="input" type="date" required value={formData.licenseExpiry} onChange={e => setFormData({...formData, licenseExpiry: e.target.value})} />
                  </div>
                  <div>
                    <label>Contact Number</label>
                    <input className="input" required value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
                  </div>
                </div>
                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>Safety Score (0-100)</label>
                    <input className="input" type="number" min="0" max="100" required value={formData.safetyScore} onChange={e => setFormData({...formData, safetyScore: e.target.value})} />
                  </div>
                  <div>
                    <label>Region</label>
                    <input className="input" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Add Driver'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
