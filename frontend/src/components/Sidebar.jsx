import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  Radio,
  AlertTriangle,
  Truck,
  Building2,
  Navigation,
  FileText,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff,
  Activity,
  PhoneCall,
  Sliders,
  Sparkles,
  MapPin,
  HeartHandshake
} from 'lucide-react';
import { socket } from '../services/socket';

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const location = useLocation();
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() { setIsConnected(true); }
    function onDisconnect() { setIsConnected(false); }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const navItems = [
    {
      to: '/',
      label: 'Welcome & Status',
      icon: HeartHandshake,
      badge: 'OVERVIEW',
      badgeColor: 'bg-[#EEF4EF] text-[#245C4A] border-[#CBDACD]'
    },
    {
      to: '/command-center',
      label: 'Command Center',
      icon: Radio,
      badge: 'LIVE',
      badgeColor: 'bg-[#EEF4EF] text-[#245C4A] border-[#CBDACD]'
    },
    {
      to: '/report',
      label: 'Emergency Intake',
      highlight: true,
      badge: 'REPORT',
      badgeColor: 'bg-[#FCECE9] text-[#B94430] border-[#F5C2BA]',
      icon: PhoneCall
    },
    {
      to: '/incidents',
      label: 'Live Incidents',
      icon: AlertTriangle
    },
    {
      to: '/analysis',
      label: 'Incident Intelligence',
      icon: ShieldAlert
    },
    {
      to: '/ambulances',
      label: 'Ambulance Fleet',
      icon: Truck
    },
    {
      to: '/hospitals',
      label: 'Trauma Network',
      icon: Building2
    },
    {
      to: '/map',
      label: 'Route Intelligence',
      icon: Navigation
    },
    {
      to: '/handoff',
      label: 'RESQ Handoff',
      signature: true,
      badge: 'BRIEF',
      badgeColor: 'bg-[#EEF4EF] text-[#245C4A] border-[#CBDACD]',
      icon: FileText
    },
    {
      to: '/readiness',
      label: 'Readiness & Staging',
      icon: BarChart3
    },
    {
      to: '/settings',
      label: 'Telemetry & Health',
      icon: Sliders
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#FFFFFF] border-r border-[#E8E8E1] transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#E8E8E1]">
          {!isCollapsed ? (
            <NavLink to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#245C4A] flex items-center justify-center text-white shadow-sm shrink-0">
                <span className="font-serif font-bold text-lg">R</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-bold text-lg text-[#203B32] tracking-tight">RESQNET</span>
                </div>
                <span className="text-[10px] text-[#707970] font-sans tracking-wide">
                  Calm in a Crisis
                </span>
              </div>
            </NavLink>
          ) : (
            <NavLink to="/" className="mx-auto">
              <div className="w-8 h-8 rounded-lg bg-[#245C4A] flex items-center justify-center text-white shadow-sm">
                <span className="font-serif font-bold text-lg">R</span>
              </div>
            </NavLink>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-[#707970] hover:text-[#203B32] hover:bg-[#F8F7F2] transition-colors"
            title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2">
            {!isCollapsed && (
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#929B92]">
                Coordination Consoles
              </span>
            )}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || (item.to === '/' && location.pathname === '/command-center' && false);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-sans font-medium transition-all group ${
                  isActive
                    ? 'bg-[#EEF4EF] text-[#245C4A] font-semibold border border-[#CBDACD]'
                    : 'text-[#707970] hover:text-[#203B32] hover:bg-[#F8F7F2]'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-[#245C4A]' : 'text-[#707970] group-hover:text-[#203B32]'
                }`} />

                {!isCollapsed && (
                  <span className="flex-1 truncate tracking-tight">{item.label}</span>
                )}

                {!isCollapsed && item.badge && (
                  <span className={`text-[9px] font-sans font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Status Strip & System Telemetry Footer */}
        <div className="p-3 border-t border-[#E8E8E1] bg-[#F8F7F2]">
          {!isCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-sans">
                <span className="text-[#707970] flex items-center gap-1.5">
                  {isConnected ? (
                    <span className="w-2 h-2 rounded-full bg-[#245C4A]" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-[#E66B55]" />
                  )}
                  {isConnected ? 'Telemetry Online' : 'Offline'}
                </span>
                <span className="text-[10px] font-mono text-[#929B92]">v2.4</span>
              </div>

              <div className="text-[11px] text-[#707970] leading-snug">
                <span className="text-[#203B32] font-semibold">Bengaluru Metro</span>
                <p className="text-[10px] text-[#929B92]">Track 2 Bharat Infrastructure</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title={isConnected ? 'Telemetry Online' : 'Offline'}>
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-[#245C4A]' : 'bg-[#E66B55]'}`} />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
