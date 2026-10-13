import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Clock,
  MapPin,
  Users,
  Truck,
  Building2,
  FileText,
  ChevronRight,
  Activity,
  ArrowRight
} from 'lucide-react';
import { PriorityBadge, StatusBadge, SimulationBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { socket } from '../services/socket';

export default function LiveIncidents() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchIncidents = async () => {
    try {
      const res = await api.getIncidents();
      if (res && res.incidents) {
        setIncidents(res.incidents);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Failed fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();

    const onUpdate = () => {
      fetchIncidents();
    };

    socket.on('incidentCreated', onUpdate);
    socket.on('incidentStatusChanged', onUpdate);
    socket.on('ambulanceAssigned', onUpdate);
    socket.on('hospitalAlerted', onUpdate);
    socket.on('dashboardUpdated', onUpdate);

    return () => {
      socket.off('incidentCreated', onUpdate);
      socket.off('incidentStatusChanged', onUpdate);
      socket.off('ambulanceAssigned', onUpdate);
      socket.off('hospitalAlerted', onUpdate);
      socket.off('dashboardUpdated', onUpdate);
    };
  }, []);

  const filtered = incidents.filter(inc => {
    const q = searchFilter.toLowerCase();
    const matchesSearch = !searchFilter.trim() ||
      inc.id.toLowerCase().includes(q) ||
      inc.location.toLowerCase().includes(q) ||
      (inc.raw_text && inc.raw_text.toLowerCase().includes(q));

    const matchesPriority = priorityFilter === 'ALL' || inc.priority === priorityFilter;
    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E8E1] gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#245C4A]" />
            <span className="text-xs uppercase font-sans font-semibold tracking-wider text-[#707970]">
              Incident Dispatch Queue
            </span>
            <SimulationBadge />
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#203B32] tracking-tight">
            Active Incidents Queue
          </h1>
          <p className="text-xs text-[#707970] font-sans mt-0.5">
            Real-time emergency queue synchronized across dispatch, fleet, and hospital intake units.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchIncidents}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-[#E8E8E1] hover:border-[#245C4A] text-[#707970] hover:text-[#203B32] transition-colors shadow-subtle"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/report"
            className="px-4 py-2 rounded-xl bg-[#E66B55] hover:bg-[#D45943] text-white text-xs font-sans font-semibold shadow-sm transition-all"
          >
            Report Emergency
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-[#E8E8E1] p-5 shadow-subtle space-y-4">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-[#929B92] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by ID, location, or caller description..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8F7F2] border border-[#E8E8E1] rounded-xl text-[#203B32] placeholder-[#929B92] focus:outline-none focus:border-[#245C4A]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
            <span className="text-[11px] text-[#707970]">Priority:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MODERATE'].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-lg border transition-all ${
                  priorityFilter === p
                    ? 'bg-[#EEF4EF] text-[#245C4A] font-semibold border-[#CBDACD]'
                    : 'bg-[#F8F7F2] text-[#707970] border-[#E8E8E1] hover:text-[#203B32]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Incidents Table / Roster */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E8E8E1] text-[#707970] text-[11px] uppercase tracking-wider">
                <th className="pb-3 font-semibold pl-2">Incident ID</th>
                <th className="pb-3 font-semibold">Priority</th>
                <th className="pb-3 font-semibold">Location</th>
                <th className="pb-3 font-semibold">Casualties</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Assigned Unit</th>
                <th className="pb-3 font-semibold pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8E1]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#707970]">
                    No active emergency incidents match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((inc) => (
                  <tr
                    key={inc.id}
                    className="hover:bg-[#F8F7F2] transition-colors"
                  >
                    <td className="py-3.5 pl-2">
                      <span className="font-mono font-bold text-[#203B32] block">{inc.id}</span>
                      <span className="text-[10px] text-[#707970] font-mono">
                        {inc.created_at ? new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                      </span>
                    </td>

                    <td className="py-3.5">
                      <PriorityBadge priority={inc.priority} size="sm" />
                    </td>

                    <td className="py-3.5">
                      <div className="flex items-center gap-1.5 text-[#203B32] font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#245C4A] shrink-0" />
                        <span className="truncate max-w-xs">{inc.location}</span>
                      </div>
                    </td>

                    <td className="py-3.5 text-[#203B32]">
                      {inc.people_count || 1} people
                    </td>

                    <td className="py-3.5">
                      <StatusBadge status={inc.status} size="sm" />
                    </td>

                    <td className="py-3.5 text-[#203B32]">
                      <span className="font-mono text-[11px]">{inc.assigned_ambulance || 'Pending'}</span>
                    </td>

                    <td className="py-3.5 pr-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/handoff/${inc.id}`}
                          className="px-3 py-1 rounded-lg bg-[#245C4A] hover:bg-[#1D4A3B] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1"
                        >
                          <span>Handoff</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
