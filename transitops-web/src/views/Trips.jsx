import { useState, useEffect } from 'react';
import { getTrips, createTrip, dispatchTrip, completeTrip, cancelTrip, getAvailableVehicles, getAvailableDrivers } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../utils/rbac';
import { Plus, Play, CheckCircle, XCircle, MapPin, X } from 'lucide-react';

export default function Trips() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(null);
  
  const canManage = hasPermission(user?.role, 'manage_trips');

  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);

  const [createData, setCreateData] = useState({
    source: '', destination: '', vehicleId: '', driverId: '', cargoWeightKg: '', plannedDistanceKm: ''
  });
  const [completeData, setCompleteData] = useState({
    actualDistanceKm: '', fuelConsumedL: '', revenue: ''
  });

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await getTrips();
      setTrips(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrips(); }, []);

  const openCreateModal = async () => {
    try {
      const [vRes, dRes] = await Promise.all([getAvailableVehicles(), getAvailableDrivers()]);
      setAvailableVehicles(vRes.data);
      setAvailableDrivers(dRes.data);
      setCreateData({ source: '', destination: '', vehicleId: '', driverId: '', cargoWeightKg: '', plannedDistanceKm: '' });
      setShowCreateModal(true);
    } catch (err) {
      alert('Failed to load available vehicles and drivers');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createTrip({
        ...createData,
        cargoWeightKg: Number(createData.cargoWeightKg),
        plannedDistanceKm: Number(createData.plannedDistanceKm)
      });
      setShowCreateModal(false);
      fetchTrips();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create trip');
    }
  };

  const handleDispatch = async (id) => {
    if (window.confirm('Dispatch this trip?')) {
      try {
        await dispatchTrip(id);
        fetchTrips();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to dispatch');
      }
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    try {
      await completeTrip(showCompleteModal.id, {
        actualDistanceKm: Number(completeData.actualDistanceKm),
        fuelConsumedL: completeData.fuelConsumedL ? Number(completeData.fuelConsumedL) : undefined,
        revenue: completeData.revenue ? Number(completeData.revenue) : undefined
      });
      setShowCompleteModal(null);
      fetchTrips();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to complete trip');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this trip?')) {
      try {
        await cancelTrip(id);
        fetchTrips();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to cancel');
      }
    }
  };

  const getStatusBadge = (status) => {
    const map = { DRAFT: 'badge-gray', DISPATCHED: 'badge-blue', COMPLETED: 'badge-green', CANCELLED: 'badge-red' };
    return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Trip Dispatching</h1>
          <p>Manage trip lifecycles</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={18} /> Create Trip
          </button>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Route</th>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Cargo (kg)</th>
              <th>Distance (km)</th>
              <th>Status</th>
              {canManage && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="7" style={{textAlign:'center'}}>Loading...</td></tr> : trips.map(t => (
              <tr key={t.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} className="text-accent" />
                    <span>{t.source} → {t.destination}</span>
                  </div>
                </td>
                <td>{t.vehicle?.registrationNo}</td>
                <td>{t.driver?.name}</td>
                <td>{t.cargoWeightKg}</td>
                <td>{t.plannedDistanceKm}</td>
                <td>{getStatusBadge(t.status)}</td>
                {canManage && (
                  <td className="actions-cell">
                    {t.status === 'DRAFT' && (
                      <>
                        <button className="btn btn-success btn-icon" title="Dispatch" onClick={() => handleDispatch(t.id)}><Play size={16} /></button>
                        <button className="btn btn-danger btn-icon" title="Cancel" onClick={() => handleCancel(t.id)}><XCircle size={16} /></button>
                      </>
                    )}
                    {t.status === 'DISPATCHED' && (
                      <>
                        <button className="btn btn-primary btn-icon" title="Complete" onClick={() => { setCompleteData({actualDistanceKm: t.plannedDistanceKm, fuelConsumedL: '', revenue: ''}); setShowCompleteModal(t); }}><CheckCircle size={16} /></button>
                        <button className="btn btn-danger btn-icon" title="Cancel" onClick={() => handleCancel(t.id)}><XCircle size={16} /></button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create Trip</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>Source</label>
                    <input className="input" required value={createData.source} onChange={e => setCreateData({...createData, source: e.target.value})} />
                  </div>
                  <div>
                    <label>Destination</label>
                    <input className="input" required value={createData.destination} onChange={e => setCreateData({...createData, destination: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Available Vehicle</label>
                  <select className="select" required value={createData.vehicleId} onChange={e => setCreateData({...createData, vehicleId: e.target.value})}>
                    <option value="">Select Vehicle</option>
                    {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.registrationNo}) - Max: {v.maxLoadCapacityKg}kg</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Available Driver</label>
                  <select className="select" required value={createData.driverId} onChange={e => setCreateData({...createData, driverId: e.target.value})}>
                    <option value="">Select Driver</option>
                    {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.licenseNumber})</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>Cargo Weight (kg)</label>
                    <input className="input" type="number" required value={createData.cargoWeightKg} onChange={e => setCreateData({...createData, cargoWeightKg: e.target.value})} />
                  </div>
                  <div>
                    <label>Planned Distance (km)</label>
                    <input className="input" type="number" required value={createData.plannedDistanceKm} onChange={e => setCreateData({...createData, plannedDistanceKm: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Draft Trip</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCompleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Complete Trip</h2>
              <button className="close-btn" onClick={() => setShowCompleteModal(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCompleteSubmit}>
              <div className="modal-body">
                <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Enter final trip details to complete and release assets.</p>
                <div className="form-group">
                  <label>Actual Distance (km)</label>
                  <input className="input" type="number" required value={completeData.actualDistanceKm} onChange={e => setCompleteData({...completeData, actualDistanceKm: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Fuel Consumed (L) - Optional</label>
                  <input className="input" type="number" value={completeData.fuelConsumedL} onChange={e => setCompleteData({...completeData, fuelConsumedL: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Revenue (₹) - Optional</label>
                  <input className="input" type="number" value={completeData.revenue} onChange={e => setCompleteData({...completeData, revenue: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCompleteModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-success">Complete Trip</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
