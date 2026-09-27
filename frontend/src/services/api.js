import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for consistent error unwrapping
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An emergency coordination error occurred';
    return Promise.reject(new Error(message));
  }
);

export const api = {
  // Incidents
  createIncident: (payload) => apiClient.post('/incidents', payload),
  getIncidents: () => apiClient.get('/incidents'),
  getIncidentById: (id) => apiClient.get(`/incidents/${id}`),
  analyzeIncident: (id, payload) => apiClient.post(`/incidents/${id}/analyze`, payload),
  updateIncidentStatus: (id, status) => apiClient.put(`/incidents/${id}/status`, { status }),
  getIncidentTimeline: (id) => apiClient.get(`/incidents/${id}/timeline`),

  // Ambulances
  getAvailableAmbulances: (incidentId) => apiClient.get('/ambulances/available', { params: { incidentId } }),
  assignAmbulance: (incidentId, ambulanceId) => apiClient.post('/ambulances/assign', { incidentId, ambulanceId }),

  // Hospitals
  getAvailableHospitals: (incidentId) => apiClient.get('/hospitals/available', { params: { incidentId } }),
  recommendHospitals: (incidentId) => apiClient.post('/hospitals/recommend', { incidentId }),
  selectHospital: (incidentId, hospitalId) => apiClient.post(`/hospitals/${hospitalId}/select`, { incidentId, hospitalId }),

  // Routes
  calculateRoutes: (incidentId) => apiClient.post('/routes/calculate', { incidentId }),
  selectRoute: (incidentId, routeId) => apiClient.post('/routes/select', { incidentId, routeId }),

  // Signature Hero Feature: RESQ HANDOFF
  getHandoff: (incidentId) => apiClient.get(`/handoffs/${incidentId}`),

  // Operations Command Center & Predictive Analytics
  getDashboardData: () => apiClient.get('/dashboard'),
  getHotspots: () => apiClient.get('/analytics/hotspots'),
  getReadiness: () => apiClient.get('/analytics/readiness'),

  // Deterministic Demo Controller
  executeDemoStep: (step) => apiClient.post('/demo/step', { step }),
  resetDemo: () => apiClient.post('/demo/reset')
};

export default api;
