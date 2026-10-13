import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, CheckCircle2, Activity, ChevronUp, Minimize2, Maximize2 } from 'lucide-react';
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
  const [isMinimized, setIsMinimized] = useState(false);

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

  // Minimized Pill View
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-6 z-40">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-[#CBDACD] text-xs font-sans font-semibold text-[#203B32] shadow-sheet hover:border-[#245C4A] transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-[#245C4A]" />
          <span>Demo Controller ({currentStep}/10)</span>
          <ChevronUp className="w-4 h-4 text-[#707970]" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl transition-all">
      <div className="bg-white/95 backdrop-blur-md border border-[#CBDACD] rounded-3xl p-3.5 sm:p-4 shadow-dropdown text-[#203B32]">
        
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-2.5">
          
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#EEF4EF] text-[#245C4A] border border-[#CBDACD] shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-sans font-bold tracking-tight text-[#203B32]">
                  Live Response Scenario Controller
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EEF4EF] border border-[#CBDACD] text-[#245C4A] font-bold">
                  Step {currentStep} of 10
                </span>
              </div>
              <p className="text-xs text-[#707970] font-sans truncate max-w-md">
                {statusMessage}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {isRunning ? (
              <button
                onClick={() => setIsRunning(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FCF7ED] text-[#9E6F18] border border-[#F4DCAD] text-xs font-semibold hover:bg-[#FCF5E6] transition-all"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
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
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#245C4A] hover:bg-[#1D4A3B] text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{currentStep >= 10 ? 'Restart Scenario' : 'Run Scenario'}</span>
              </button>
            )}

            {/* Manual Next Step */}
            <button
              onClick={() => {
                if (currentStep < 10) executeStep(currentStep + 1);
              }}
              disabled={loading || isRunning || currentStep >= 10}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F8F7F2] hover:bg-[#EEF4EF] text-[#203B32] border border-[#E8E8E1] text-xs font-semibold disabled:opacity-40"
              title="Next Step"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              disabled={loading}
              className="p-2 rounded-xl bg-[#F8F7F2] hover:bg-[#EEF4EF] text-[#707970] hover:text-[#203B32] border border-[#E8E8E1] transition-colors"
              title="Reset Operational Scenario"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Minimize */}
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 rounded-xl bg-[#F8F7F2] hover:bg-[#EEF4EF] text-[#707970] hover:text-[#203B32] border border-[#E8E8E1] transition-colors ml-1"
              title="Minimize Controller"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Progress Bar & Mini Steps */}
        <div className="space-y-1.5">
          <div className="w-full bg-[#F8F7F2] rounded-full h-1.5 overflow-hidden border border-[#E8E8E1]">
            <div
              className="bg-[#245C4A] h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="hidden md:grid grid-cols-10 gap-1 text-[10px] font-mono text-center pt-0.5">
            {STEPS.map((s) => (
              <button
                key={s.step}
                onClick={() => executeStep(s.step)}
                className={`py-0.5 rounded truncate px-1 transition-colors ${
                  s.step === currentStep 
                    ? 'bg-[#245C4A] text-white font-bold' 
                    : s.step < currentStep 
                    ? 'text-[#245C4A] bg-[#EEF4EF]' 
                    : 'text-[#707970] hover:text-[#203B32]'
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
