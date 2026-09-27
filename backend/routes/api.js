const express = require('express');
const router = express.Router();

const incidentCtrl = require('../controllers/incidentController');
const resourceCtrl = require('../controllers/resourceController');
const routeCtrl = require('../controllers/routeController');
const handoffCtrl = require('../controllers/handoffController');
const analyticsCtrl = require('../controllers/analyticsController');
const demoCtrl = require('../controllers/demoController');

// Incident Routes
router.post('/incidents', incidentCtrl.createIncident);
router.post('/incidents/transcribe', incidentCtrl.transcribeAudio);
router.get('/incidents', incidentCtrl.getIncidents);
router.get('/incidents/:id', incidentCtrl.getIncidentById);
router.post('/incidents/:id/analyze', incidentCtrl.analyzeIncident);
router.put('/incidents/:id/status', incidentCtrl.updateIncidentStatus);
router.get('/incidents/:id/timeline', incidentCtrl.getIncidentTimeline);

// Resource - Ambulance Routes
router.get('/ambulances/available', resourceCtrl.getAmbulances);
router.post('/ambulances/assign', resourceCtrl.assignAmbulance);

// Resource - Hospital Routes
router.get('/hospitals/available', resourceCtrl.getHospitals);
router.post('/hospitals/recommend', resourceCtrl.recommendHospitals);
router.post('/hospitals/:id/select', resourceCtrl.selectHospital);
router.post('/hospitals/select', resourceCtrl.selectHospital);

// Route Intelligence
router.post('/routes/calculate', routeCtrl.getRoutes);
router.get('/routes', routeCtrl.getRoutes);
router.post('/routes/select', routeCtrl.selectRoute);

// RESQ HANDOFF (The Signature Feature)
router.get('/handoffs/:incidentId', handoffCtrl.getHandoffByIncidentId);

// Command Center & Analytics
router.get('/dashboard', analyticsCtrl.getDashboardData);
router.get('/analytics/hotspots', analyticsCtrl.getHotspots);
router.get('/analytics/readiness', analyticsCtrl.getReadiness);

// Demo Mode
router.post('/demo/step', demoCtrl.executeDemoStep);
router.post('/demo/reset', demoCtrl.resetDemo);

module.exports = router;
