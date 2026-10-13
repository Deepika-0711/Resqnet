import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import DemoRunner from './components/DemoRunner';

// Pages
import Home from './pages/Home';
import CommandCenter from './pages/CommandCenter';
import EmergencyReport from './pages/EmergencyReport';
import LiveIncidents from './pages/LiveIncidents';
import IncidentAnalysis from './pages/IncidentAnalysis';
import AmbulanceMatching from './pages/AmbulanceMatching';
import HospitalMatching from './pages/HospitalMatching';
import EmergencyMap from './pages/EmergencyMap';
import ResqHandoff from './pages/ResqHandoff';
import EmergencyReadiness from './pages/EmergencyReadiness';
import SettingsView from './pages/SettingsView';

export default function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F8F7F2] text-[#203B32] font-sans selection:bg-[#DCE8DE] selection:text-[#203B32] flex">
        
        {/* Left Persistent Navigation Sidebar */}
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Primary Content Shell */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}>
          
          {/* Top Persistent Operations Bar */}
          <TopBar
            onMenuClick={() => setIsMobileOpen(true)}
            isCollapsed={isCollapsed}
          />

          {/* Primary Viewport Area */}
          <main className="flex-1 bg-[#F8F7F2]">
            <Routes>
              {/* Landing & Overview Experience */}
              <Route path="/" element={<Home />} />

              {/* Emergency Command Center */}
              <Route path="/command-center" element={<CommandCenter />} />

              {/* Emergency Reporting Console */}
              <Route path="/report" element={<EmergencyReport />} />

              {/* Live Incidents Queue */}
              <Route path="/incidents" element={<LiveIncidents />} />

              {/* AI Incident Intelligence */}
              <Route path="/analysis" element={<IncidentAnalysis />} />

              {/* Ambulance Fleet Operations */}
              <Route path="/ambulances" element={<AmbulanceMatching />} />

              {/* Hospital Trauma Network */}
              <Route path="/hospitals" element={<HospitalMatching />} />

              {/* Emergency Route Intelligence & Map */}
              <Route path="/map" element={<EmergencyMap />} />

              {/* RESQ HANDOFF — Signature Feature */}
              <Route path="/handoff" element={<ResqHandoff />} />
              <Route path="/handoff/:incidentId" element={<ResqHandoff />} />

              {/* Emergency Readiness & Predictive Staging */}
              <Route path="/readiness" element={<EmergencyReadiness />} />
              <Route path="/analytics" element={<EmergencyReadiness />} />

              {/* Operations Console Settings */}
              <Route path="/settings" element={<SettingsView />} />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Global Response Workflow Demo Controller Bar */}
          <DemoRunner />

          {/* Authoritative Operations Footer */}
          <footer className="border-t border-[#E8E8E1] bg-[#FFFFFF] py-6 text-center text-xs text-[#707970] font-sans">
            <div className="max-w-7xl mx-auto px-4 space-y-1.5">
              <p className="text-[#203B32] font-semibold tracking-wide">
                RESQNET • Bharat Emergency Response Coordination Platform
              </p>
              <p className="text-[11px] text-[#707970] max-w-2xl mx-auto leading-relaxed">
                RESQNET is an emergency coordination and decision support platform. Priority assessments provide decision support and do not replace trained triage physicians, emergency personnel, or official emergency services.
              </p>
            </div>
          </footer>

        </div>

      </div>
    </BrowserRouter>
  );
}
