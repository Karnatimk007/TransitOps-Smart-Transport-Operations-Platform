import { useState, useEffect } from 'react';
import { getFuelLogs, createFuelLog, getExpenses, createExpense, getVehicles, getOperationalCost } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../utils/rbac';
import { Plus, Fuel, DollarSign, X } from 'lucide-react';

export default function Expenses() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('fuel'); // 'fuel' or 'expenses'
  const [vehicles, setVehicles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedVid, setSelectedVid] = useState('');
  const [opCost, setOpCost] = useState(null);
  
  const canManage = hasPermission(user?.role, 'log_fuel_expense');

  const [fuelData, setFuelData] = useState({ vehicleId: '', liters: '', cost: '', date: new Date().toISOString().split('T')[0] });
  const [expenseData, setExpenseData] = useState({ vehicleId: '', type: 'TOLL', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });

  useEffect(() => {
    getVehicles().then(res => setVehicles(res.data)).catch(err => console.error(err));
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'fuel') {
        const res = await getFuelLogs();
        setLogs(res.data);
      } else {
        const res = await getExpenses();
        setLogs(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  useEffect(() => {
    if (selectedVid) {
      getOperationalCost(selectedVid).then(res => setOpCost(res.data)).catch(err => console.error(err));
    } else {
      setOpCost(null);
    }
  }, [selectedVid, logs]);

  const openModal = () => {
    if (activeTab === 'fuel') setFuelData({ vehicleId: '', liters: '', cost: '', date: new Date().toISOString().split('T')[0] });
    else setExpenseData({ vehicleId: '', type: 'TOLL', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
    setShowModal(true);
  };

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    try {
      await createFuelLog({ ...fuelData, liters: Number(fuelData.liters), cost: Number(fuelData.cost) });
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      await createExpense({ ...expenseData, amount: Number(expenseData.amount) });
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Operation failed');
    }
  };

  const getTypeBadge = (type) => {
    const map = { TOLL: 'badge-blue', MAINTENANCE: 'badge-amber', OTHER: 'badge-gray' };
    return <span className={`badge ${map[type] || 'badge-gray'}`}>{type}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Fuel & Expenses</h1>
          <p>Track operational costs</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={openModal}>
            <Plus size={18} /> {activeTab === 'fuel' ? 'Log Fuel' : 'Add Expense'}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color-light)', paddingBottom: '1rem' }}>
        <button className={`btn ${activeTab === 'fuel' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('fuel')}>
          <Fuel size={18} /> Fuel Logs
        </button>
        <button className={`btn ${activeTab === 'expenses' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('expenses')}>
          <DollarSign size={18} /> Other Expenses
        </button>
      </div>

      <div className="table-container" style={{ marginBottom: '2rem' }}>
        <table>
          <thead>
            {activeTab === 'fuel' ? (
              <tr>
                <th>Vehicle</th>
                <th>Liters</th>
                <th>Cost (₹)</th>
                <th>Date</th>
              </tr>
            ) : (
              <tr>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Amount (₹)</th>
                <th>Date</th>
                <th>Notes</th>
              </tr>
            )}
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5" style={{textAlign:'center'}}>Loading...</td></tr> : logs.map(l => (
              <tr key={l.id}>
                {activeTab === 'fuel' ? (
                  <>
                    <td style={{ fontWeight: 500 }}>{vehicles.find(v => v.id === l.vehicleId)?.registrationNo || l.vehicleId}</td>
                    <td>{l.liters} L</td>
                    <td>₹{l.cost}</td>
                    <td>{new Date(l.date).toLocaleDateString()}</td>
                  </>
                ) : (
                  <>
                    <td style={{ fontWeight: 500 }}>{vehicles.find(v => v.id === l.vehicleId)?.registrationNo || l.vehicleId}</td>
                    <td>{getTypeBadge(l.type)}</td>
                    <td>₹{l.amount}</td>
                    <td>{new Date(l.date).toLocaleDateString()}</td>
                    <td>{l.notes}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <DollarSign size={20} className="text-accent" /> Operational Cost Breakdown
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <label style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Select Vehicle:</label>
          <select className="select" style={{ maxWidth: '300px' }} value={selectedVid} onChange={e => setSelectedVid(e.target.value)}>
            <option value="">-- Choose a Vehicle --</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.registrationNo})</option>)}
          </select>
        </div>

        {opCost ? (
          <div className="kpi-grid">
            <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--color-amber)' }}>
              <div className="stat-content">
                <div className="stat-label">Total Fuel Cost</div>
                <div className="stat-value">₹{opCost.fuelCost}</div>
              </div>
            </div>
            <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--color-blue)' }}>
              <div className="stat-content">
                <div className="stat-label">Other Expenses</div>
                <div className="stat-value">₹{opCost.expenseCost}</div>
              </div>
            </div>
            <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--color-red)' }}>
              <div className="stat-content">
                <div className="stat-label">Maintenance Logs</div>
                <div className="stat-value">₹{opCost.maintenanceCost}</div>
              </div>
            </div>
            <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--color-green)' }}>
              <div className="stat-content">
                <div className="stat-label">Total Operational Cost</div>
                <div className="stat-value text-accent">₹{opCost.totalOperationalCost}</div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Select a vehicle to view its operational costs.</div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{activeTab === 'fuel' ? 'Log Fuel' : 'Add Expense'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={activeTab === 'fuel' ? handleFuelSubmit : handleExpenseSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Vehicle</label>
                  <select className="select" required value={activeTab === 'fuel' ? fuelData.vehicleId : expenseData.vehicleId} onChange={e => activeTab === 'fuel' ? setFuelData({...fuelData, vehicleId: e.target.value}) : setExpenseData({...expenseData, vehicleId: e.target.value})}>
                    <option value="">Select Vehicle</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.registrationNo})</option>)}
                  </select>
                </div>
                
                {activeTab === 'fuel' ? (
                  <>
                    <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label>Liters</label>
                        <input className="input" type="number" step="0.01" required value={fuelData.liters} onChange={e => setFuelData({...fuelData, liters: e.target.value})} />
                      </div>
                      <div>
                        <label>Cost (₹)</label>
                        <input className="input" type="number" step="0.01" required value={fuelData.cost} onChange={e => setFuelData({...fuelData, cost: e.target.value})} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Date</label>
                      <input className="input" type="date" required value={fuelData.date} onChange={e => setFuelData({...fuelData, date: e.target.value})} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label>Type</label>
                        <select className="select" value={expenseData.type} onChange={e => setExpenseData({...expenseData, type: e.target.value})}>
                          <option>TOLL</option>
                          <option>MAINTENANCE</option>
                          <option>OTHER</option>
                        </select>
                      </div>
                      <div>
                        <label>Amount (₹)</label>
                        <input className="input" type="number" step="0.01" required value={expenseData.amount} onChange={e => setExpenseData({...expenseData, amount: e.target.value})} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Date</label>
                      <input className="input" type="date" required value={expenseData.date} onChange={e => setExpenseData({...expenseData, date: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Notes</label>
                      <textarea className="textarea" rows="2" value={expenseData.notes} onChange={e => setExpenseData({...expenseData, notes: e.target.value})}></textarea>
                    </div>
                  </>
                )}
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
