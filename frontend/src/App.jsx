import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import DemoRunner from './components/DemoRunner';

// Pages
import Home from './pages/Home';
import EmergencyReport from './pages/EmergencyReport';
import IncidentAnalysis from './pages/IncidentAnalysis';
import AmbulanceMatching from './pages/AmbulanceMatching';
import HospitalMatching from './pages/HospitalMatching';
import EmergencyMap from './pages/EmergencyMap';
import ResqHandoff from './pages/ResqHandoff';
import CommandCenter from './pages/CommandCenter';
import EmergencyReadiness from './pages/EmergencyReadiness';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-resq-dark flex flex-col text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
        {/* Navigation Header */}
        <Navbar />

        {/* Primary Page View */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/report" element={<EmergencyReport />} />
            <Route path="/analysis" element={<IncidentAnalysis />} />
            <Route path="/ambulances" element={<AmbulanceMatching />} />
            <Route path="/hospitals" element={<HospitalMatching />} />
            <Route path="/map" element={<EmergencyMap />} />
            <Route path="/handoff" element={<ResqHandoff />} />
            <Route path="/handoff/:incidentId" element={<ResqHandoff />} />
            <Route path="/command-center" element={<CommandCenter />} />
            <Route path="/readiness" element={<EmergencyReadiness />} />
          </Routes>
        </main>

        {/* Global Sticky Hackathon Demo Controller Bar */}
        <DemoRunner />

        {/* Footer */}
        <footer className="border-t border-resq-border/60 bg-resq-panel/80 py-6 text-center text-xs text-slate-500 font-mono">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p className="text-slate-400 font-semibold">
              RESQNET • Bharat Emergency Response &amp; Coordination Platform
            </p>
            <p className="text-[11px] text-slate-500 max-w-2xl mx-auto leading-relaxed">
              RESQNET is an emergency coordination and decision support platform. Operational priority assessments provide decision support and do not replace trained emergency medical professionals, triage physicians, or official emergency services.
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
