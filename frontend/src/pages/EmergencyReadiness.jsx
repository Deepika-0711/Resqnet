import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  MapPin, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Truck, 
  CheckCircle2, 
  Radio, 
  Zap,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { SimulationBadge } from '../components/StatusBadge';
import { api } from '../services/api';

const SEVERITY_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MODERATE: '#eab308',
  LOW: '#10b981'
};

export default function EmergencyReadiness() {
  const [readinessData, setReadinessData] = useState(null);
  const [hotspotData, setHotspotData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [readiness, hotspots] = await Promise.all([
          api.getReadiness().catch(() => null),
          api.getHotspots().catch(() => null)
        ]);
        if (readiness) setReadinessData(readiness);
        if (hotspots) setHotspotData(hotspots);
      } catch (err) {
        console.error('Failed loading readiness analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const hourlyDistribution = readinessData?.hourlyDistribution || [
    { hourLabel: '08:00', incidentCount: 6, severeCount: 3 },
    { hourLabel: '09:00', incidentCount: 8, severeCount: 4 },
    { hourLabel: '12:00', incidentCount: 4, severeCount: 1 },
    { hourLabel: '15:00', incidentCount: 3, severeCount: 1 },
    { hourLabel: '18:00', incidentCount: 12, severeCount: 7 },
    { hourLabel: '19:00', incidentCount: 14, severeCount: 9 },
    { hourLabel: '20:00', incidentCount: 11, severeCount: 6 },
    { hourLabel: '21:00', incidentCount: 7, severeCount: 3 }
  ];

  const severityDistribution = readinessData?.severityDistribution || [
    { severity: 'CRITICAL', count: 18 },
    { severity: 'HIGH', count: 22 },
    { severity: 'MODERATE', count: 10 },
    { severity: 'LOW', count: 5 }
  ];

  const recommendations = readinessData?.recommendations || [
    {
      corridor: 'Mysore Road (Kengeri - Satellite Bus Stand)',
      historicalDemand: 'HIGH',
      peakPeriod: '6 PM – 9 PM',
      recommendedPositioning: 'Consider positioning additional emergency capacity (ALS Units) near Nayandahalli Junction during peak evening commute.',
      priorityLevel: 'HIGH',
      suggestedUnits: ['AMB-102', 'AMB-108']
    },
    {
      corridor: 'Silk Board Junction & Hosur Road Flyover',
      historicalDemand: 'HIGH',
      peakPeriod: '8 AM – 11 AM & 6 PM – 9 PM',
      recommendedPositioning: 'Pre-deploy BLS rapid responder unit on elevated toll access ramp to bypass grade bottlenecks.',
      priorityLevel: 'HIGH',
      suggestedUnits: ['AMB-104']
    },
    {
      corridor: 'Outer Ring Road (Marathahalli - Bellandur)',
      historicalDemand: 'MODERATE',
      peakPeriod: '7 PM – 10 PM',
      recommendedPositioning: 'Maintain green-corridor liaison with HAL traffic division for fast transit to Manipal Hospital.',
      priorityLevel: 'MODERATE',
      suggestedUnits: ['AMB-125']
    }
  ];

  const hotspots = hotspotData?.hotspots || [
    { corridor: 'Mysore Road (Kengeri - Satellite Bus Stand)', totalAccidents: 15, criticalCount: 9, avgResponseTime: 9.8, avgRiskIndex: 0.88 },
    { corridor: 'Silk Board Junction & Hosur Road Flyover', totalAccidents: 12, criticalCount: 6, avgResponseTime: 14.2, avgRiskIndex: 0.76 },
    { corridor: 'Outer Ring Road (Marathahalli - Bellandur)', totalAccidents: 10, criticalCount: 5, avgResponseTime: 16.5, avgRiskIndex: 0.82 },
    { corridor: 'Hebbal Flyover - Bellary Road Highway', totalAccidents: 9, criticalCount: 4, avgResponseTime: 11.2, avgRiskIndex: 0.65 }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-32 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-resq-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              PREDICTIVE CORRIDOR READINESS &amp; AMBULANCE STAGING
            </span>
            <SimulationBadge />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Predictive Emergency Readiness
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyzes historical accident patterns, peak evening congestion, and response bottlenecks to recommend proactive fleet staging.
          </p>
        </div>
      </div>

      {/* Recommended Fleet Staging Zones (Section 12 Hero Callout) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
            PROACTIVE FLEET STAGING RECOMMENDATIONS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="glass-panel p-5 rounded-2xl border-2 border-cyan-500/30 hover:border-cyan-500/60 bg-gradient-to-br from-[#0c1527] to-[#080d19] transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 font-bold">
                    {rec.historicalDemand} DEMAND
                  </span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {rec.peakPeriod}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white mb-2 leading-snug">
                  {rec.corridor}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
                  <strong>Recommendation:</strong> “{rec.recommendedPositioning}”
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Suggested Units:</span>
                <span className="text-cyan-400 font-bold">{rec.suggestedUnits.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Hourly Distribution Bar Chart (8 cols) */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-resq-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                ACCIDENT FREQUENCY BY TIME OF DAY (HISTORICAL BENGALURU DATA)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Clear surge during evening peak commute (6 PM – 9 PM)
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">Peak: 19:00</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="hourLabel" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090e1a', borderColor: '#1e2c4a', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#06b6d4' }}
                />
                <Bar dataKey="incidentCount" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Total Incidents" />
                <Bar dataKey="severeCount" fill="#ef4444" radius={[4, 4, 0, 0]} name="Critical/High Severity" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-cyan-400 rounded-sm" />
              <span>Total Accidents</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-sm" />
              <span>Critical / Severe Casualties</span>
            </div>
          </div>
        </div>

        {/* Severity Breakdown Donut Chart (4 cols) */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-resq-border space-y-4">
          <div>
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              SEVERITY COMPOSITION
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              55 simulated historical corridor collisions
            </p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityDistribution}
                  dataKey="count"
                  nameKey="severity"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {severityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.severity] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#090e1a', borderColor: '#1e2c4a', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {severityDistribution.map(s => (
              <div key={s.severity} className="flex items-center gap-2 p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: SEVERITY_COLORS[s.severity] }} />
                <span className="text-slate-300 font-semibold">{s.severity}:</span>
                <span className="text-white ml-auto font-bold">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Historical Hotspot Corridors Table */}
      <div className="glass-panel p-6 rounded-2xl border border-resq-border">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            HIGH-DEMAND ACCIDENT CORRIDORS (SIMULATED DATASET)
          </span>
          <span className="text-[11px] font-mono text-slate-500">Sorted by historical collision frequency</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-resq-border text-slate-400 font-mono text-[11px] uppercase">
                <th className="pb-3 font-semibold">Arterial Corridor</th>
                <th className="pb-3 font-semibold">Total Collisions</th>
                <th className="pb-3 font-semibold">Critical / High</th>
                <th className="pb-3 font-semibold">Avg. Transit Time</th>
                <th className="pb-3 font-semibold">Composite Risk Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-resq-border/40">
              {hotspots.map((h, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-bold text-white font-sans flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-resq-accent shrink-0" />
                    <span>{h.corridor}</span>
                  </td>
                  <td className="py-3 font-mono font-bold text-cyan-400">
                    {h.totalAccidents} accidents
                  </td>
                  <td className="py-3 font-mono text-red-400 font-semibold">
                    {h.criticalCount}
                  </td>
                  <td className="py-3 font-mono text-slate-300">
                    {h.avgResponseTime} min
                  </td>
                  <td className="py-3 font-mono">
                    <span className="px-2 py-0.5 rounded bg-red-950/60 border border-red-800 text-red-300 font-bold">
                      {h.avgRiskIndex} / 1.00
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Safety Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300 font-mono">SIMULATION &amp; ETHICAL DISCLOSURE:</span>
          <p className="mt-0.5 leading-relaxed">
            All historical collision numbers and corridor risk indexes presented on this page are synthetically simulated for hackathon demonstration purposes. They do not represent official police, NHAI, or municipal emergency service records.
          </p>
        </div>
      </div>

    </div>
  );
}
