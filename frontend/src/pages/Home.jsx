import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  ArrowRight, 
  Truck, 
  Building2, 
  Navigation, 
  FileText, 
  Radio, 
  CheckCircle2, 
  PhoneCall,
  Activity,
  ShieldCheck,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import MapView from '../components/MapView';
import { SimulationBadge } from '../components/StatusBadge';
import { api } from '../services/api';

export default function Home() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getDashboardData();
        if (data) {
          setDashboardData(data);
          const firstInc = data.activeIncidents?.[0];
          if (firstInc?.id) {
            const routeRes = await api.calculateRoutes(firstInc.id);
            if (routeRes?.routes) setRoutes(routeRes.routes);
          }
        }
      } catch (err) {
        console.warn('Failed loading dashboard overview telemetry:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const metrics = dashboardData?.metrics || {
    activeIncidents: 1,
    ambulancesAvailable: 10,
    ambulancesEnRoute: 0,
    hospitalsAvailable: 5
  };

  const activeIncidents = dashboardData?.activeIncidents || [];
  const ambulances = dashboardData?.ambulances || [];
  const hospitals = dashboardData?.hospitals || [];

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#203B32] pb-24">
      {/* 1. WELCOME AREA - SPLIT EDITORIAL COMPOSITION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#CBDACD] bg-[#EEF4EF] text-[#245C4A] text-xs font-sans font-medium">
              <span className="w-2 h-2 rounded-full bg-[#245C4A]" />
              Bharat Emergency Response Network
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#203B32] leading-[1.08]">
              Every second matters.<br />
              <span className="italic text-[#245C4A]">Every response connects.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#707970] max-w-xl font-sans leading-relaxed">
              One coordinated response, from the first report to hospital arrival. Connecting emergency intake, incident assessment, ambulances, hospitals, and transit routes in real time.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#E66B55] hover:bg-[#D45943] text-white text-sm font-sans font-semibold shadow-sm transition-all hover:translate-y-[-1px] active:translate-y-[0px]"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Report an Emergency</span>
              </Link>

              <Link
                to="/command-center"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-[#F4F7F4] text-[#203B32] border border-[#E8E8E1] text-sm font-sans font-semibold shadow-subtle transition-all hover:border-[#CBDACD]"
              >
                <Radio className="w-4 h-4 text-[#245C4A]" />
                <span>Open Command Center</span>
              </Link>
            </div>

            <div className="pt-2 text-xs text-[#707970] font-sans flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#245C4A]" />
                Deterministic Scoring
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#245C4A]" />
                Corridor Memory
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#245C4A]" />
                Zero Chatbot Friction
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Coordination Visual Map */}
          <div className="lg:col-span-6">
            <div className="bg-white p-3 rounded-3xl border border-[#E8E8E1] shadow-sheet relative">
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#E8E8E1] mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E66B55]" />
                  <span className="font-serif font-semibold text-sm text-[#203B32]">
                    Live Coordination Spatial Overview
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#707970] bg-[#F8F7F2] px-2 py-0.5 rounded border border-[#E8E8E1]">
                  Bengaluru Corridor
                </span>
              </div>

              <div className="h-[360px] sm:h-[400px] rounded-2xl overflow-hidden relative border border-[#E8E8E1]">
                <MapView
                  incidents={activeIncidents}
                  ambulances={ambulances}
                  hospitals={hospitals}
                  routes={routes}
                  height="100%"
                />
              </div>

              <div className="mt-3 px-3 py-1.5 flex items-center justify-between text-xs font-sans text-[#707970]">
                <span>Showing incident, ambulance, hospital &amp; Route B</span>
                <Link to="/map" className="text-[#245C4A] font-semibold hover:underline flex items-center gap-1">
                  Full Spatial Map <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. COMPACT OPERATIONAL STATUS STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
        <div className="bg-white rounded-2xl border border-[#E8E8E1] p-5 shadow-subtle">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-[#E8E8E1] gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#245C4A]" />
              <h2 className="font-serif text-sm font-semibold text-[#203B32]">
                Active Operational Network State
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <SimulationBadge />
              <span className="text-[11px] text-[#707970] font-sans">
                Real-time SQLite database synchronization
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E8E8E1]">
            
            {/* Metric 1 */}
            <div className="pt-2 sm:pt-0 sm:px-4 first:pl-0">
              <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-[#707970] block">
                Active Incidents
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-serif font-bold text-[#E66B55]">
                  {metrics.activeIncidents}
                </span>
                <span className="text-xs font-sans text-[#707970]">corridor cases</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="pt-2 sm:pt-0 sm:px-4">
              <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-[#707970] block">
                Ambulances Available
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-serif font-bold text-[#245C4A]">
                  {metrics.ambulancesAvailable}
                </span>
                <span className="text-xs font-sans text-[#707970]">ALS / BLS units</span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="pt-2 sm:pt-0 sm:px-4">
              <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-[#707970] block">
                Responses in Progress
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-serif font-bold text-[#E7B65C]">
                  {metrics.ambulancesEnRoute || 0}
                </span>
                <span className="text-xs font-sans text-[#707970]">dispatched en route</span>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="pt-2 sm:pt-0 sm:px-4">
              <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-[#707970] block">
                Hospitals Available
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-serif font-bold text-[#203B32]">
                  {metrics.hospitalsAvailable}
                </span>
                <span className="text-xs font-sans text-[#707970]">trauma facilities</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. COORDINATION ARCHITECTURE - THE COMPLETE LOOP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-medium text-[#203B32]">
              The Coordinated Emergency Sequence
            </h2>
            <p className="text-sm text-[#707970] font-sans mt-0.5">
              Every stage communicates with the next. No fragmented phone calls, no lost information.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Intake & Intelligence */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8E8E1] shadow-subtle hover:border-[#CBDACD] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#FCECE9] text-[#B94430] flex items-center justify-center mb-4">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#203B32] mb-1.5">
              1. Intake &amp; Point-Based Scoring
            </h3>
            <p className="text-xs text-[#707970] leading-relaxed font-sans mb-4">
              Voice-enabled citizen reporting with ElevenLabs transcription and deterministic 0–6+ priority scoring for instant, transparent classification.
            </p>
            <Link to="/report" className="text-xs font-semibold text-[#245C4A] hover:underline flex items-center gap-1 font-sans">
              Open Intake Console <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Resource Matching */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8E8E1] shadow-subtle hover:border-[#CBDACD] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#EEF4EF] text-[#245C4A] flex items-center justify-center mb-4">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#203B32] mb-1.5">
              2. Fleet &amp; Trauma Coordination
            </h3>
            <p className="text-xs text-[#707970] leading-relaxed font-sans mb-4">
              Simultaneous ALS/BLS fleet matching, risk-weighted corridor routing (Route B vs A), and automated ER/ICU trauma hospital pre-alerts.
            </p>
            <Link to="/ambulances" className="text-xs font-semibold text-[#245C4A] hover:underline flex items-center gap-1 font-sans">
              View Fleet Operations <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: RESQ Handoff */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8E8E1] shadow-subtle hover:border-[#CBDACD] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#EEF4EF] text-[#245C4A] flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#203B32] mb-1.5">
              3. Synchronized RESQ Handoff
            </h3>
            <p className="text-xs text-[#707970] leading-relaxed font-sans mb-4">
              One live, continuously updated emergency brief shared synchronously between dispatchers, ambulance paramedics, and trauma teams.
            </p>
            <Link to="/handoff" className="text-xs font-semibold text-[#245C4A] hover:underline flex items-center gap-1 font-sans">
              View Live Briefing <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
