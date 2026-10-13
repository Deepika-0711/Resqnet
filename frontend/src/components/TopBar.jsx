import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Clock,
  Radio,
  ChevronDown,
  ShieldAlert,
  AlertTriangle,
  Truck,
  Building2,
  CheckCircle2,
  X,
  PhoneCall,
  Activity
} from 'lucide-react';
import { api } from '../services/api';
import { socket } from '../services/socket';

export default function TopBar({ onMenuClick, isCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allIncidents, setAllIncidents] = useState([]);
  const searchDropdownRef = useRef(null);

  // Notifications state
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifDropdownRef = useRef(null);

  // Live Clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Socket & Backend Status
  const [isConnected, setIsConnected] = useState(socket.connected);

  // Load active incidents for search
  const loadSearchData = async () => {
    try {
      const res = await api.getIncidents();
      if (res && res.incidents) {
        setAllIncidents(res.incidents);
      }
    } catch (e) {
      // ignore
    }
  };

  // Load recent logs for notifications
  const loadNotifications = async () => {
    try {
      const data = await api.getDashboardData();
      if (data && data.recentLogs) {
        setNotifications(data.recentLogs.slice(0, 8));
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadSearchData();
    loadNotifications();

    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onUpdate = () => {
      loadNotifications();
      loadSearchData();
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('incidentCreated', onUpdate);
    socket.on('ambulanceAssigned', onUpdate);
    socket.on('hospitalAlerted', onUpdate);
    socket.on('dashboardUpdated', onUpdate);

    return () => {
      clearInterval(clockTimer);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('incidentCreated', onUpdate);
      socket.off('ambulanceAssigned', onUpdate);
      socket.off('hospitalAlerted', onUpdate);
      socket.off('dashboardUpdated', onUpdate);
    };
  }, []);

  // Handle Search Input
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase();
    const results = allIncidents.filter((inc) => {
      return (
        inc.id.toLowerCase().includes(query) ||
        inc.location.toLowerCase().includes(query) ||
        (inc.priority && inc.priority.toLowerCase().includes(query)) ||
        (inc.raw_text && inc.raw_text.toLowerCase().includes(query))
      );
    });
    setSearchResults(results.slice(0, 5));
  }, [searchQuery, allIncidents]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
        setIsSearching(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Page titles map
  const getPageInfo = () => {
    const p = location.pathname;
    if (p === '/') return { title: 'Welcome & System Status', subtitle: 'Coordinated emergency response from first report to hospital arrival' };
    if (p.includes('/command-center')) return { title: 'Command Center', subtitle: 'Live incident coordination and spatial telemetry' };
    if (p.includes('/report')) return { title: 'Emergency Intake', subtitle: 'Guided incident intake and dispatch preparation' };
    if (p.includes('/incidents')) return { title: 'Active Incidents', subtitle: 'Live emergency incident queue' };
    if (p.includes('/analysis')) return { title: 'Incident Intelligence', subtitle: 'Point-based priority assessment and corridor context' };
    if (p.includes('/ambulances')) return { title: 'Ambulance Fleet', subtitle: 'Multi-factor ALS/BLS fleet matching and dispatch' };
    if (p.includes('/hospitals')) return { title: 'Trauma Network', subtitle: 'Hospital capacity and emergency pre-alert broadcast' };
    if (p.includes('/map')) return { title: 'Route Intelligence', subtitle: 'Corridor risk analysis and navigation paths' };
    if (p.includes('/handoff')) return { title: 'RESQ Handoff', subtitle: 'Unified digital emergency briefing' };
    if (p.includes('/readiness')) return { title: 'Emergency Readiness', subtitle: 'Predictive corridor demand and staging' };
    if (p.includes('/settings')) return { title: 'System Telemetry', subtitle: 'Operational health and services monitor' };
    return { title: 'Operations Console', subtitle: 'Emergency Response Coordination' };
  };

  const pageInfo = getPageInfo();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#FFFFFF] border-b border-[#E8E8E1] px-4 sm:px-6 flex items-center justify-between shadow-subtle">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-[#707970] hover:text-[#203B32] hover:bg-[#F8F7F2] lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="font-serif text-lg sm:text-xl font-bold text-[#203B32] tracking-tight leading-none">
            {pageInfo.title}
          </h1>
          <p className="text-[11px] text-[#707970] hidden sm:block mt-0.5 font-sans">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Search, Clock, Notifications & Quick Report CTA */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Input with Dropdown */}
        <div className="relative hidden md:block" ref={searchDropdownRef}>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#929B92] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setIsSearching(true)}
              placeholder="Search incidents or corridors..."
              className="w-48 lg:w-64 pl-9 pr-8 py-1.5 text-xs bg-[#F8F7F2] border border-[#E8E8E1] rounded-xl text-[#203B32] placeholder-[#929B92] focus:outline-none focus:border-[#245C4A] focus:bg-white transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-[#929B92] hover:text-[#203B32]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {isSearching && searchResults.length > 0 && (
            <div className="absolute right-0 top-11 w-80 bg-white border border-[#E8E8E1] rounded-2xl shadow-dropdown p-2 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="text-[10px] uppercase font-bold text-[#929B92] px-2.5 py-1 tracking-wider">
                Matching Incidents
              </div>
              <div className="space-y-1">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setIsSearching(false);
                      setSearchQuery('');
                      navigate(`/handoff/${item.id}`);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-[#F8F7F2] transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-xs text-[#245C4A] block">{item.id}</span>
                      <span className="text-[11px] text-[#707970] truncate max-w-[180px] block font-sans">
                        {item.location}
                      </span>
                    </div>
                    <span className={`text-[10px] font-sans font-medium px-2 py-0.5 rounded-full ${
                      item.priority === 'CRITICAL'
                        ? 'bg-[#FCECE9] text-[#B94430]'
                        : item.priority === 'HIGH'
                        ? 'bg-[#FCF7ED] text-[#9E6F18]'
                        : 'bg-[#EEF4EF] text-[#245C4A]'
                    }`}>
                      {item.priority}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Clock (IST) */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8F7F2] border border-[#E8E8E1] text-[11px] font-mono text-[#203B32]">
          <Clock className="w-3.5 h-3.5 text-[#707970]" />
          <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          <span className="text-[10px] text-[#929B92]">IST</span>
        </div>

        {/* Notification Bell Drawer */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl text-[#707970] hover:text-[#203B32] hover:bg-[#F8F7F2] border border-transparent hover:border-[#E8E8E1] transition-all relative"
            title="Operational updates"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E66B55]" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white border border-[#E8E8E1] rounded-2xl shadow-dropdown p-3 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E8E1] mb-2 px-1">
                <span className="font-serif font-bold text-sm text-[#203B32]">Telemetry Feed</span>
                <span className="text-[10px] font-sans text-[#707970]">{notifications.length} updates</span>
              </div>
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {notifications.map((n, i) => (
                  <div key={i} className="p-2 rounded-xl hover:bg-[#F8F7F2] transition-colors border border-transparent hover:border-[#E8E8E1]">
                    <div className="flex items-center justify-between text-[11px] font-sans">
                      <span className="font-medium text-[#203B32]">{n.description || n.event_type}</span>
                      <span className="text-[10px] font-mono text-[#929B92]">{n.time_display || 'Just now'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Primary Quick Report Button */}
        <Link
          to="/report"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E66B55] hover:bg-[#D45943] text-white text-xs font-sans font-semibold shadow-sm transition-all active:scale-95"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Report Emergency</span>
          <span className="sm:hidden">Report</span>
        </Link>
      </div>
    </header>
  );
}
