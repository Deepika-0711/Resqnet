import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  MapPin, 
  Users, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Truck, 
  Code, 
  FileText, 
  ChevronRight,
  Info
} from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';

export default function IncidentAnalysis() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const incidentId = searchParams.get('incidentId') || 'RSQ-2026-001';

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getIncidentById(incidentId);
        if (res && res.incident) {
          setIncident(res.incident);
        }
      } catch (err) {
        console.warn('Using default demo incident analysis data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [incidentId]);

  const inc = incident || {
    id: incidentId,
    raw_text: 'There is a road accident near Mysore Road. Three people are injured and one vehicle is blocking the road.',
    incident_type: 'Road Accident',
    location: 'Mysore Road, Bengaluru',
    people_count: 3,
    injury_indicators: ['Multiple reported injuries', 'Possible blunt trauma'],
    road_obstruction: 1,
    fire_smoke: 0,
    access_difficulty: 0,
    priority: 'HIGH',
    priority_score: 6,
    priority_reasoning: [
      'Multiple people involved (+2)',
      'Reported injuries (+3)',
      'Road obstruction detected (+1)'
    ],
    status: 'ASSESSED'
  };

  const priorityScore = inc.priority_score || 6;
  const maxScore = 10;
  const scorePct = Math.min(100, (priorityScore / maxScore) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-28 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-resq-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              AI INCIDENT INTELLIGENCE &amp; TRIAGE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 border border-purple-700 text-purple-300">
              FASTAPI NLP ENGINE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {inc.id}
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-resq-accent" />
            <span>{inc.location}</span>
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2">
          <PriorityBadge priority={inc.priority} size="lg" />
          <StatusBadge status={inc.status || 'ASSESSED'} />
        </div>
      </div>

      {/* Raw Witness Text Box */}
      <div className="glass-card p-4 rounded-xl border border-resq-border">
        <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider block mb-1">
          CITIZEN / WITNESS REPORT (INPUT):
        </span>
        <blockquote className="text-sm text-slate-200 italic border-l-2 border-cyan-500 pl-3 py-0.5 font-sans">
          "{inc.raw_text}"
        </blockquote>
      </div>

      {/* AI Structured Extraction Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        
        <div className="glass-panel p-4 rounded-xl border border-resq-border">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            INCIDENT TYPE
          </span>
          <p className="font-bold text-sm text-white">{inc.incident_type}</p>
          <span className="text-[10px] text-emerald-400 font-mono mt-1 inline-block">Confirmed</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-resq-border">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            PEOPLE INVOLVED
          </span>
          <p className="font-bold text-sm text-amber-300 font-mono flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>{inc.people_count} INDIVIDUALS</span>
          </p>
          <span className="text-[10px] text-slate-400 font-mono mt-1 inline-block">Multi-casualty</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-resq-border">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            ROAD OBSTRUCTION
          </span>
          <p className={`font-bold text-sm font-mono ${inc.road_obstruction ? 'text-red-400' : 'text-emerald-400'}`}>
            {inc.road_obstruction ? 'YES (LANE BLOCKED)' : 'NO (CLEAR)'}
          </p>
          <span className="text-[10px] text-slate-400 font-mono mt-1 inline-block">Secondary hazard</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-resq-border">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            INJURY INDICATORS
          </span>
          <p className="font-bold text-xs text-orange-300 line-clamp-2">
            {Array.isArray(inc.injury_indicators) ? inc.injury_indicators.join(', ') : inc.injury_indicators}
          </p>
        </div>

      </div>

      {/* Transparent Priority Assessment Engine */}
      <div className="glass-panel p-6 rounded-2xl border-2 border-orange-500/30 bg-gradient-to-br from-[#0c1424] to-[#090d18] relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-bold text-white font-mono">
                TRANSPARENT PRIORITY ASSESSMENT ENGINE
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic point-based emergency severity formula. Open, explainable, and non-black-box.
            </p>
          </div>

          {/* Score Badge */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/40">
            <span className="text-xs font-mono text-orange-300 font-medium">TOTAL SCORE:</span>
            <span className="text-2xl font-mono font-extrabold text-orange-400">
              {priorityScore} <span className="text-xs text-slate-400">/ 10</span>
            </span>
          </div>
        </div>

        {/* Scoring Factor Breakdown */}
        <div className="space-y-3 mb-6">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            WHY WAS {inc.priority} PRIORITY ASSIGNED?
          </span>

          <div className="space-y-2">
            {(inc.priority_reasoning || []).map((reason, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                  <span className="font-medium">{reason}</span>
                </div>
                <span className="font-mono text-xs font-bold text-orange-400 px-2 py-0.5 rounded bg-orange-950/60 border border-orange-800">
                  POINT FACTOR
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Threshold Reference */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-2">
            SCORE THRESHOLDS:
          </span>
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
            <div className={`p-1.5 rounded text-xs font-mono ${inc.priority === 'LOW' ? 'bg-emerald-900/80 border-2 border-emerald-400 text-emerald-200 font-bold shadow-md' : 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300'}`}>
              0–1: LOW {inc.priority === 'LOW' && '✓'}
            </div>
            <div className={`p-1.5 rounded text-xs font-mono ${inc.priority === 'MODERATE' ? 'bg-amber-900/80 border-2 border-amber-400 text-amber-200 font-bold shadow-md' : 'bg-amber-950/40 border border-amber-800/60 text-amber-300'}`}>
              2–3: MODERATE {inc.priority === 'MODERATE' && '✓'}
            </div>
            <div className={`p-1.5 rounded text-xs font-mono ${inc.priority === 'HIGH' ? 'bg-orange-900/80 border-2 border-orange-400 text-orange-200 font-bold shadow-md' : 'bg-orange-950/40 border border-orange-800/60 text-orange-300'}`}>
              4–5: HIGH {inc.priority === 'HIGH' && '✓'}
            </div>
            <div className={`p-1.5 rounded text-xs font-mono ${inc.priority === 'CRITICAL' ? 'bg-red-900/80 border-2 border-red-400 text-red-200 font-bold shadow-md' : 'bg-red-950/40 border border-red-800/60 text-red-300'}`}>
              6+: CRITICAL {inc.priority === 'CRITICAL' && '✓'}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-[11px] text-slate-400">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            <strong>Disclaimer:</strong> This is a decision-support prototype for emergency fleet and hospital coordination. It does not constitute medical diagnosis and does not replace trained triage clinicians.
          </span>
        </div>

      </div>

      {/* JSON Output Toggle */}
      <div className="space-y-2">
        <button
          onClick={() => setShowJson(!showJson)}
          className="flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <Code className="w-4 h-4" />
          <span>{showJson ? 'Hide Structured AI JSON' : 'Inspect Structured AI JSON'}</span>
        </button>

        {showJson && (
          <pre className="p-4 rounded-xl bg-black/90 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
            {JSON.stringify({
              incidentType: inc.incident_type,
              location: inc.location,
              peopleCount: inc.people_count,
              injuryIndicators: inc.injury_indicators,
              roadObstruction: Boolean(inc.road_obstruction),
              priority: inc.priority,
              priorityScore: inc.priority_score,
              reasoning: inc.priority_reasoning,
              source: 'FASTAPI_ORCHESTRATOR'
            }, null, 2)}
          </pre>
        )}
      </div>

      {/* Navigation to Next Step */}
      <div className="flex justify-end pt-4">
        <Link
          to={`/ambulances?incidentId=${inc.id}`}
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm tracking-wider shadow-lg shadow-cyan-600/20 transition-all hover:scale-105 active:scale-95"
        >
          <span>MATCH AVAILABLE AMBULANCES</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
