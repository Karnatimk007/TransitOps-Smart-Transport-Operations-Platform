import { useState, useEffect } from 'react';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../utils/rbac';
import { Plus, Search, Edit2, Trash2, Truck, X } from 'lucide-react';

export default function Vehicles() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const canManage = hasPermission(user?.role, 'manage_vehicles');

  const [formData, setFormData] = useState({
    registrationNo: '', name: '', type: 'Truck', maxLoadCapacityKg: '', odometerKm: 0, acquisitionCost: '', region: ''
  });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await getVehicles();
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const openModal = (vehicle = null) => {
    if (vehicle) {
      setEditingId(vehicle.id);
      setFormData({
        registrationNo: vehicle.registrationNo, name: vehicle.name, type: vehicle.type,
        maxLoadCapacityKg: vehicle.maxLoadCapacityKg, odometerKm: vehicle.odometerKm,
        acquisitionCost: vehicle.acquisitionCost, region: vehicle.region || ''
      });
    } else {
      setEditingId(null);
      setFormData({ registrationNo: '', name: '', type: 'Truck', maxLoadCapacityKg: '', odometerKm: 0, acquisitionCost: '', region: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, maxLoadCapacityKg: Number(formData.maxLoadCapacityKg), odometerKm: Number(formData.odometerKm), acquisitionCost: Number(formData.acquisitionCost) };
      if (editingId) {
        await updateVehicle(editingId, payload);
      } else {
        await createVehicle(payload);
      }
      setShowModal(false);
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleRetire = async (id) => {
    if (window.confirm('Are you sure you want to retire this vehicle?')) {
      try {
        await deleteVehicle(id);
        fetchVehicles();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to retire vehicle');
      }
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      AVAILABLE: 'badge-green', ON_TRIP: 'badge-amber', IN_SHOP: 'badge-blue', RETIRED: 'badge-red'
    };
    return <span className={`badge ${map[status] || 'badge-gray'}`}>{status.replace('_', ' ')}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Vehicle Registry</h1>
          <p>Manage fleet vehicles</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={() => openModal()}>
            <Plus size={18} /> Add Vehicle
          </button>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Registration No</th>
              <th>Name / Model</th>
              <th>Type</th>
              <th>Max Load (kg)</th>
              <th>Odometer (km)</th>
              <th>Status</th>
              {canManage && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : vehicles.map(v => (
              <tr key={v.id}>
                <td style={{ fontWeight: 500 }}>{v.registrationNo}</td>
                <td>{v.name}</td>
                <td>{v.type}</td>
                <td>{v.maxLoadCapacityKg}</td>
                <td>{v.odometerKm}</td>
                <td>{getStatusBadge(v.status)}</td>
                {canManage && (
                  <td className="actions-cell">
                    <button className="btn btn-secondary btn-icon" onClick={() => openModal(v)}><Edit2 size={16} /></button>
                    {v.status !== 'RETIRED' && (
                      <button className="btn btn-danger btn-icon" onClick={() => handleRetire(v.id)} title="Retire Vehicle"><Trash2 size={16} /></button>
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
              <h2>{editingId ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Registration Number</label>
                  <input className="input" required value={formData.registrationNo} onChange={e => setFormData({...formData, registrationNo: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Name / Model</label>
                  <input className="input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>Type</label>
                    <select className="select" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option>Truck</option><option>Van</option><option>Bus</option><option>Pickup</option>
                    </select>
                  </div>
                  <div>
                    <label>Region</label>
                    <input className="input" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} />
                  </div>
                </div>
                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>Max Load Capacity (kg)</label>
                    <input className="input" type="number" required value={formData.maxLoadCapacityKg} onChange={e => setFormData({...formData, maxLoadCapacityKg: e.target.value})} />
                  </div>
                  <div>
                    <label>Acquisition Cost (₹)</label>
                    <input className="input" type="number" required value={formData.acquisitionCost} onChange={e => setFormData({...formData, acquisitionCost: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Initial Odometer (km)</label>
                  <input className="input" type="number" value={formData.odometerKm} onChange={e => setFormData({...formData, odometerKm: e.target.value})} disabled={!!editingId} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Add Vehicle'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
