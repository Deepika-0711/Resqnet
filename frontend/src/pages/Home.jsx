import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Radio, 
  ArrowRight, 
  Truck, 
  Building2, 
  Navigation, 
  FileText, 
  BarChart3, 
  ShieldAlert, 
  CheckCircle2, 
  Zap,
  Activity
} from 'lucide-react';
import LiveHandoffCard from '../components/LiveHandoffCard';

export default function Home() {
  const workflowSteps = [
    { num: '01', title: 'REPORT', desc: 'Citizen voice, text or scene image submission' },
    { num: '02', title: 'ANALYZE', desc: 'AI entity & casualty extraction with 0-6+ scoring' },
    { num: '03', title: 'MATCH', desc: 'Multi-factor ALS/BLS fleet & trauma intake ranking' },
    { num: '04', title: 'ROUTE', desc: 'Risk-weighted corridor selection (Route B vs A)' },
    { num: '05', title: 'HANDOFF', desc: 'One live synchronized emergency brief generated' },
    { num: '06', title: 'RESPOND', desc: 'Ambulance en route with pre-alerted ER intake' }
  ];

  const capabilities = [
    {
      icon: ShieldAlert,
      title: 'AI Incident Intelligence',
      desc: 'Instant NLP token parsing extracting casualties, entrapment, and road obstructions with transparent point scoring.'
    },
    {
      icon: Truck,
      title: 'Smart Ambulance Matching',
      desc: 'Evaluates crew status, Advanced (ALS) vs Basic (BLS) capability, and transit time rather than raw geographic proximity.'
    },
    {
      icon: Building2,
      title: 'Hospital Matching & Pre-Alert',
      desc: 'Ranks trauma networks by live emergency bed and ICU availability, dispatching automated pre-alerts before arrival.'
    },
    {
      icon: Navigation,
      title: 'Emergency Route Intelligence',
      desc: 'Dynamic risk scoring balances traffic choke-points and incident hotspots, recommending safer transit corridors.'
    },
    {
      icon: FileText,
      title: 'Live RESQ HANDOFF',
      desc: 'The signature hero record: unified live telemetry brief shared in real-time across ambulances, ERs, and command staff.'
    },
    {
      icon: BarChart3,
      title: 'Predictive Readiness',
      desc: 'Corridor demand analytics analyzing peak hours and accident clusters to recommend proactive fleet staging.'
    }
  ];

  return (
    <div className="space-y-16 pb-24">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-8">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/15 via-red-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 px-4">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 text-xs font-mono font-medium mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            BHARAT EMERGENCY RESPONSE INFRASTRUCTURE
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
            RESQ<span className="text-resq-accent">NET</span>
          </h1>

          <p className="text-xl sm:text-2xl font-medium text-slate-200 mb-4 tracking-wide">
            AI-Powered Road Accident Response &amp; Coordination Platform
          </p>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-8 font-light italic">
            “From accident detection to coordinated response — faster, smarter, safer.”
          </p>

          {/* Primary Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              to="/report"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold text-sm tracking-wider shadow-lg shadow-red-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <AlertTriangle className="w-4 h-4 fill-current" />
              <span>REPORT EMERGENCY</span>
            </Link>

            <Link
              to="/command-center"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-resq-panel hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-bold text-sm tracking-wider shadow-lg transition-all hover:border-cyan-400"
            >
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>OPEN COMMAND CENTER</span>
            </Link>
          </div>

          {/* Operational Disclaimer */}
          <p className="text-[11px] text-slate-500 max-w-xl mx-auto font-mono">
            RESQNET is an emergency coordination and decision support platform. Operational priority assessments provide decision support and do not replace trained emergency medical professionals.
          </p>
        </div>
      </section>

      {/* Signature Hero Showcase: RESQ HANDOFF */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
            <Zap className="w-3.5 h-3.5" />
            THE HERO INNOVATION
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            RESQ HANDOFF — “One Live Emergency Brief”
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Eliminates multi-agency telephone delays by synchronizing telemetry between ambulance crew, trauma center triage, and command dispatch.
          </p>
        </div>

        <LiveHandoffCard incidentId="RSQ-2026-001" />
      </section>

      {/* Visual Workflow: REPORT -> RESPOND */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            END-TO-END COORDINATION LIFECYCLE
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">
            How RESQNET Accelerates the Golden Hour
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {workflowSteps.map((step, idx) => (
            <div
              key={step.num}
              className="glass-card p-4 rounded-xl border border-resq-border/70 relative hover:border-cyan-500/50 transition-all text-center flex flex-col justify-between"
            >
              <div className="text-[10px] font-mono text-cyan-400 font-bold mb-1">
                {step.num}
              </div>
              <h3 className="text-sm font-bold text-white tracking-wider mb-2">
                {step.title}
              </h3>
              <p className="text-[11px] text-slate-400 leading-tight">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            COMPREHENSIVE EMERGENCY STACK
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">
            Core Capabilities Built for Indian Corridors
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {capabilities.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={i}
                className="glass-panel p-5 rounded-xl border border-resq-border/80 hover:border-cyan-500/30 transition-all group"
              >
                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 w-fit text-cyan-400 mb-3 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white mb-1.5">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {c.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
