import axios from 'axios';

// ---------------------------------------------------------------------------
// Axios instance – baseURL '/api' is proxied to the backend by Vite
// ---------------------------------------------------------------------------
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://transitops-smart-transport-operations-a12n.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

// ---- Request interceptor: attach Bearer token from localStorage -----------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ---- Response interceptor: redirect to /login on 401 ---------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Avoid redirect loop if already on login / register
      const { pathname } = window.location;
      if (pathname !== '/login' && pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;

// ===========================================================================
// AUTH
// ===========================================================================
export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const register = (data) =>
  api.post('/auth/register', data);

export const getMe = () =>
  api.get('/auth/me');

// ===========================================================================
// VEHICLES
// ===========================================================================
export const getVehicles = (filters = {}) =>
  api.get('/vehicles', { params: filters });

export const getVehicle = (id) =>
  api.get(`/vehicles/${id}`);

export const createVehicle = (data) =>
  api.post('/vehicles', data);

export const updateVehicle = (id, data) =>
  api.put(`/vehicles/${id}`, data);

export const deleteVehicle = (id) =>
  api.delete(`/vehicles/${id}`);

export const getAvailableVehicles = () =>
  api.get('/vehicles/available');

// ===========================================================================
// DRIVERS
// ===========================================================================
export const getDrivers = (filters = {}) =>
  api.get('/drivers', { params: filters });

export const getDriver = (id) =>
  api.get(`/drivers/${id}`);

export const createDriver = (data) =>
  api.post('/drivers', data);

export const updateDriver = (id, data) =>
  api.put(`/drivers/${id}`, data);

export const suspendDriver = (id) =>
  api.post(`/drivers/${id}/suspend`);

export const reinstateDriver = (id) =>
  api.post(`/drivers/${id}/reinstate`);

export const getAvailableDrivers = () =>
  api.get('/drivers/available');

// ===========================================================================
// TRIPS
// ===========================================================================
export const getTrips = (filters = {}) =>
  api.get('/trips', { params: filters });

export const getTrip = (id) =>
  api.get(`/trips/${id}`);

export const createTrip = (data) =>
  api.post('/trips', data);

export const dispatchTrip = (id) =>
  api.post(`/trips/${id}/dispatch`);

export const completeTrip = (id, data = {}) =>
  api.post(`/trips/${id}/complete`, data);

export const cancelTrip = (id) =>
  api.post(`/trips/${id}/cancel`);

// ===========================================================================
// MAINTENANCE
// ===========================================================================
export const getMaintenanceLogs = (filters = {}) =>
  api.get('/maintenance', { params: filters });

export const createMaintenanceLog = (data) =>
  api.post('/maintenance', data);

export const closeMaintenanceLog = (id) =>
  api.post(`/maintenance/${id}/close`);

// ===========================================================================
// FUEL LOGS
// ===========================================================================
export const getFuelLogs = (filters = {}) =>
  api.get('/fuel-logs', { params: filters });

export const createFuelLog = (data) =>
  api.post('/fuel-logs', data);

// ===========================================================================
// EXPENSES
// ===========================================================================
export const getExpenses = (filters = {}) =>
  api.get('/expenses', { params: filters });

export const createExpense = (data) =>
  api.post('/expenses', data);

export const getOperationalCost = (vehicleId) =>
  api.get(`/vehicles/${vehicleId}/operational-cost`);

// ===========================================================================
// REPORTS & DASHBOARD
// ===========================================================================
export const getDashboard = (filters = {}) =>
  api.get('/dashboard', { params: filters });

export const getVehicleReport = (id) =>
  api.get(`/reports/vehicle/${id}`);

export const exportCsv = () =>
  api.get('/reports/export.csv', { responseType: 'blob' });
