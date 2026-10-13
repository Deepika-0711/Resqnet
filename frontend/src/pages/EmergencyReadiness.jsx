import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  MapPin, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Truck, 
  CheckCircle2, 
  Info, 
  Layers
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
  CRITICAL: '#E66B55',
  HIGH: '#E7B65C',
  MODERATE: '#6E9C91',
  LOW: '#245C4A'
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
      corridor: 'Mysore Road (Near Kengeri Satellite Bus Stand)',
      priority: 'HIGH',
      recommendedUnits: '2 ALS Units',
      peakWindow: '18:00 - 21:00',
      rationale: 'Accident probability spikes 3.2x during evening peak hours with high heavy vehicle traffic.'
    },
    {
      corridor: 'Silk Board Junction Flyover Exit',
      priority: 'HIGH',
      recommendedUnits: '1 ALS + 1 BLS Unit',
      peakWindow: '08:30 - 10:30',
      rationale: 'Frequent multi-vehicle pileups during morning rush hour with high pedestrian exposure.'
    },
    {
      corridor: 'Hebbal Flyover Incline Ramp',
      priority: 'MODERATE',
      recommendedUnits: '1 BLS Unit',
      peakWindow: '20:00 - 23:00',
      rationale: 'Elevated two-wheeler skid incidents reported in corridor logs during late evening hours.'
    }
  ];

  const hotspots = hotspotData?.hotspots || [
    { id: 1, name: 'Silk Board Junction Flyover Exit', incident_count: 38, high_priority_count: 24, primary_factor: 'Weaving traffic & flyover merge' },
    { id: 2, name: 'Mysore Road / NICE Road Interchange', incident_count: 29, high_priority_count: 18, primary_factor: 'Speed variance between heavy transport & autos' },
    { id: 3, name: 'Hebbal Flyover Ramp', incident_count: 22, high_priority_count: 11, primary_factor: 'Two-wheeler lane discipline & merge curve' },
    { id: 4, name: 'Kanakapura Road / Metro Pillar Corridor', incident_count: 17, high_priority_count: 8, primary_factor: 'Blind turns & pedestrian crossing' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E8E1] gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#245C4A]" />
            <span className="text-xs uppercase font-sans font-semibold tracking-wider text-[#707970]">
              Predictive Preparedness
            </span>
            <SimulationBadge />
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#203B32] tracking-tight">
            Corridor Readiness &amp; Staging
          </h1>
          <p className="text-xs text-[#707970] font-sans mt-0.5">
            Historical demand patterns, peak hour vulnerability, and proactive ambulance deployment.
          </p>
        </div>
      </div>

      {/* Proactive Staging Directives */}
      <div className="space-y-3">
        <h2 className="font-serif text-lg font-bold text-[#203B32]">
          Proactive Fleet Staging Recommendations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec, i) => (
            <div key={i} className="p-5 bg-white rounded-3xl border border-[#E8E8E1] shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#EEF4EF] text-[#245C4A] border border-[#CBDACD]">
                  {rec.recommendedUnits}
                </span>
                <span className="text-xs font-mono text-[#707970] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#929B92]" />
                  {rec.peakWindow}
                </span>
              </div>

              <h3 className="font-serif font-bold text-sm text-[#203B32]">
                {rec.corridor}
              </h3>

              <p className="text-xs text-[#707970] leading-relaxed font-sans">
                {rec.rationale}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Hourly Distribution Bar Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E8E8E1] p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E1]">
            <div>
              <h3 className="font-serif text-base font-bold text-[#203B32]">
                Hourly Incident Distribution
              </h3>
              <p className="text-[11px] text-[#707970] font-sans">
                Severe vs total incidents across peak operating windows
              </p>
            </div>
            <span className="text-xs font-sans text-[#245C4A] font-semibold bg-[#EEF4EF] px-2.5 py-1 rounded-lg border border-[#CBDACD]">
              Peak: 18:00 - 20:00
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="hourLabel" stroke="#929B92" fontSize={11} tickLine={false} />
                <YAxis stroke="#929B92" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E8E8E1',
                    borderRadius: '12px',
                    color: '#203B32',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="incidentCount" name="Total Incidents" fill="#CBDACD" radius={[6, 6, 0, 0]} />
                <Bar dataKey="severeCount" name="Severe / Critical" fill="#245C4A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Donut Chart */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E8E8E1] p-5 shadow-subtle space-y-4">
          <div className="pb-3 border-b border-[#E8E8E1]">
            <h3 className="font-serif text-base font-bold text-[#203B32]">
              Severity Breakdown
            </h3>
            <p className="text-[11px] text-[#707970] font-sans">
              Proportion of critical vs moderate corridor calls
            </p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityDistribution}
                  dataKey="count"
                  nameKey="severity"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {severityDistribution.map((entry, idx) => (
                    <Cell key={idx} fill={SEVERITY_COLORS[entry.severity] || '#245C4A'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E8E8E1',
                    borderRadius: '12px',
                    color: '#203B32',
                    fontSize: '11px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-sans pt-2 border-t border-[#E8E8E1]">
            {severityDistribution.map((item) => (
              <div key={item.severity} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: SEVERITY_COLORS[item.severity] || '#245C4A' }}
                />
                <span className="text-[#707970] text-[11px] truncate">
                  {item.severity}: <strong className="text-[#203B32]">{item.count}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Hotspots Roster Table */}
      <div className="bg-white rounded-3xl border border-[#E8E8E1] p-5 shadow-subtle space-y-3">
        <div className="pb-2 border-b border-[#E8E8E1]">
          <h3 className="font-serif text-base font-bold text-[#203B32]">
            High-Risk Corridor Hotspots
          </h3>
          <p className="text-[11px] text-[#707970] font-sans">
            Ranked by total historical collisions and high-severity casualty frequency
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E8E8E1] text-[#707970] text-[11px] uppercase tracking-wider">
                <th className="pb-3 font-semibold pl-2">Hotspot Corridor</th>
                <th className="pb-3 font-semibold">Total Collisions</th>
                <th className="pb-3 font-semibold">High Severity</th>
                <th className="pb-3 font-semibold pr-2">Primary Contributing Factor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8E1]">
              {hotspots.map((spot) => (
                <tr key={spot.id} className="hover:bg-[#F8F7F2] transition-colors">
                  <td className="py-3 pl-2 font-medium text-[#203B32]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#245C4A] shrink-0" />
                      <span>{spot.name}</span>
                    </div>
                  </td>
                  <td className="py-3 font-mono font-bold text-[#203B32]">
                    {spot.incident_count}
                  </td>
                  <td className="py-3 font-mono font-bold text-[#E66B55]">
                    {spot.high_priority_count}
                  </td>
                  <td className="py-3 text-[#707970] pr-2">
                    {spot.primary_factor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
