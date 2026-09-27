import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, CheckCircle2, Radio, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

const STEPS = [
  { step: 1, label: '0s: Incident Created', desc: 'Citizen emergency reported on Mysore Road' },
  { step: 2, label: '2s: AI Analysis Pipeline', desc: 'NLP token extraction & hazard classification' },
  { step: 3, label: '4s: Priority Assessed', desc: 'HIGH priority assigned (6 points total)' },
  { step: 4, label: '6s: Fleet Scanned', desc: 'Evaluating 10 ambulance locations & capabilities' },
  { step: 5, label: '8s: AMB-102 Assigned', desc: 'Advanced Life Support dispatched (7 min ETA)' },
  { step: 6, label: '10s: Trauma Search', desc: 'Evaluating 8 hospital facilities & ICU capacities' },
  { step: 7, label: '12s: Hospital Selected', desc: 'City Emergency Hospital confirmed (12 min ETA)' },
  { step: 8, label: '16s: Route B Locked', desc: 'Risk HUD chooses Route B over congested Route A' },
  { step: 9, label: '18s: Hospital Alert Sent', desc: 'Trauma pre-alert transmitted to ER intake' },
  { step: 10, label: '20s: Live Handoff En Route', desc: 'AMB-102 sirens active; telemetry live on all HUDs' }
];

export default function DemoRunner({ onStepExecuted }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('System active & ready for response scenario.');
  const [loading, setLoading] = useState(false);

  // Auto-runner interval
  useEffect(() => {
    let timer = null;
    if (isRunning) {
      timer = setInterval(async () => {
        if (currentStep < 10) {
          const next = currentStep + 1;
          await executeStep(next);
        } else {
          setIsRunning(false);
          try {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.85 }
            });
          } catch (e) {}
        }
      }, 2200);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, currentStep]);

  const executeStep = async (stepNum) => {
    setLoading(true);
    try {
      const res = await api.executeDemoStep(stepNum);
      setCurrentStep(stepNum);
      setStatusMessage(res.message || `Sequence ${stepNum} synchronized on backend.`);
      if (onStepExecuted) onStepExecuted(res);
      if (stepNum === 10) {
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.85 }
          });
        } catch (e) {}
      }
    } catch (err) {
      console.error('Demo step error:', err.message);
      setStatusMessage(`Sequence error ${stepNum}: ${err.message}`);
      setIsRunning(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setIsRunning(false);
    setLoading(true);
    try {
      await api.resetDemo();
      setCurrentStep(1);
      setStatusMessage('Workflow reset: Initial reported emergency state restored.');
      if (onStepExecuted) onStepExecuted({ reset: true });
    } catch (err) {
      console.error('Reset error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const progressPct = Math.round((currentStep / 10) * 100);

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl">
      <div className="glass-panel border-2 border-cyan-500/50 rounded-2xl p-3 sm:p-4 shadow-2xl shadow-cyan-950/60 text-white">
        
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-2.5">
          
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-red-600 to-orange-500 text-white shadow-md shadow-red-500/30">
              <Activity className="w-4 h-4 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider text-cyan-300">
                  LIVE RESPONSE WORKFLOW CONTROLLER
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-700 text-cyan-400">
                  Sequence {currentStep}/10
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium truncate max-w-md">
                {statusMessage}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {isRunning ? (
              <button
                onClick={() => setIsRunning(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono hover:bg-amber-500/30 transition-all"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>PAUSE</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (currentStep >= 10) {
                    executeStep(1).then(() => setIsRunning(true));
                  } else {
                    setIsRunning(true);
                  }
                }}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-bold font-mono shadow-md shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{currentStep >= 10 ? 'RESTART SCENARIO' : 'RUN RESPONSE SCENARIO'}</span>
              </button>
            )}

            {/* Manual Next Step */}
            <button
              onClick={() => {
                if (currentStep < 10) executeStep(currentStep + 1);
              }}
              disabled={loading || isRunning || currentStep >= 10}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-medium disabled:opacity-40"
              title="Next Step"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              disabled={loading}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
              title="Reset Operational Scenario"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Progress Bar & Mini Steps */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 h-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="hidden md:grid grid-cols-10 gap-1 text-[9px] font-mono text-center pt-0.5">
            {STEPS.map((s) => (
              <button
                key={s.step}
                onClick={() => executeStep(s.step)}
                className={`py-0.5 rounded truncate px-1 transition-colors ${
                  s.step === currentStep 
                    ? 'bg-cyan-500 text-black font-bold' 
                    : s.step < currentStep 
                    ? 'text-cyan-400 bg-cyan-950/40' 
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                {s.label.split(':')[0]}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
