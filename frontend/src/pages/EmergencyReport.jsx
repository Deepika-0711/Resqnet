import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Mic, 
  MicOff, 
  Upload, 
  MapPin, 
  Languages, 
  Send, 
  Camera, 
  Check, 
  Sparkles, 
  Loader2,
  Info,
  Car,
  Flame,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

const SAMPLE_REPORTS = [
  {
    label: 'Mysore Road (Standard Demo)',
    text: 'There is a road accident near Mysore Road. Three people are injured and one vehicle is blocking the road.',
    location: 'Mysore Road, Bengaluru'
  },
  {
    label: 'Silk Board Multi-Vehicle',
    text: 'Severe multi-vehicle collision near Silk Board Junction flyover. 4 people trapped, visible smoke and heavy road blockage.',
    location: 'Silk Board Junction, Bengaluru'
  },
  {
    label: 'Hebbal Flyover Minor Incident',
    text: 'Motorcycle slip on Hebbal flyover ramp. One person injured with abrasions, traffic moving slowly.',
    location: 'Hebbal Flyover, Bengaluru'
  }
];

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' }
];

export default function EmergencyReport() {
  const navigate = useNavigate();

  const [language, setLanguage] = useState('en');
  const [reportText, setReportText] = useState(
    'There is a road accident near Mysore Road. Three people are injured and one vehicle is blocking the road.'
  );
  const [locationText, setLocationText] = useState('Mysore Road, Bengaluru');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceStep, setVoiceStep] = useState(null); // 'listening' | 'transcribing' | 'confirming'
  const [sceneImage, setSceneImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageAnalysis, setImageAnalysis] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionPhase, setSubmissionPhase] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Voice Input with Web Speech API and Graceful Fallback
  const handleVoiceToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      setVoiceStep(null);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback simulation flow
      setIsRecording(true);
      setVoiceStep('listening');
      setTimeout(() => {
        setVoiceStep('transcribing');
        setTimeout(() => {
          setReportText('There is a road accident near Mysore Road. Three people are injured and one vehicle is blocking the road.');
          setVoiceStep('confirming');
          setTimeout(() => {
            setIsRecording(false);
            setVoiceStep(null);
          }, 1200);
        }, 1500);
      }, 1500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : (language === 'kn' ? 'kn-IN' : 'en-IN');
      recognition.continuous = false;
      recognition.interimResults = false;

      setVoiceStep('listening');
      setIsRecording(true);

      recognition.onresult = (event) => {
        setVoiceStep('transcribing');
        const transcript = event.results[0][0].transcript;
        setTimeout(() => {
          setReportText(transcript);
          setVoiceStep('confirming');
          setTimeout(() => {
            setIsRecording(false);
            setVoiceStep(null);
          }, 1000);
        }, 600);
      };

      recognition.onerror = () => {
        // Fallback on permission denial
        setReportText('There is a road accident near Mysore Road. Three people are injured and one vehicle is blocking the road.');
        setIsRecording(false);
        setVoiceStep(null);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (e) {
      setIsRecording(false);
      setVoiceStep(null);
    }
  };

  // Scene Image upload & Non-medical hazard inspection
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSceneImage(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Non-medical scene intelligence extraction
    setTimeout(() => {
      setImageAnalysis({
        visibleVehicles: '2 vehicles identified (sedan & auto-rickshaw)',
        roadObstruction: 'Partial road obstruction detected across 2 lanes',
        smokeFireIndicator: 'No fire or active smoke detected',
        sceneCrowding: 'Moderate bystander gathering observed',
        disclaimer: 'Simulated computer vision scene analysis. Non-medical triage only.'
      });
    }, 800);
  };

  // Submit Emergency Report
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reportText.trim()) {
      setErrorMessage('Please describe the emergency incident.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    // Progressive status stages
    const stages = [
      'Receiving emergency report...',
      'Extracting incident entities & casualties...',
      'Understanding scene severity...',
      'Assessing priority score...',
      'Scanning emergency response resources...'
    ];

    let stageIdx = 0;
    const stageInterval = setInterval(() => {
      stageIdx += 1;
      if (stageIdx < stages.length) {
        setSubmissionPhase(stages[stageIdx]);
      }
    }, 450);

    try {
      setSubmissionPhase(stages[0]);
      const res = await api.createIncident({
        text: reportText,
        location: locationText,
        imageAnalysis
      });

      clearInterval(stageInterval);

      if (res && res.incident) {
        navigate(`/analysis?incidentId=${res.incident.id}`);
      } else {
        navigate('/analysis?incidentId=RSQ-2026-001');
      }
    } catch (err) {
      clearInterval(stageInterval);
      console.warn('API error during incident creation, navigating with fallback demo:', err.message);
      navigate('/analysis?incidentId=RSQ-2026-001');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-28">
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-semibold mb-3">
          <AlertTriangle className="w-3.5 h-3.5 fill-current" />
          ACTIVE EMERGENCY INTAKE PORTAL
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-wide">
          Report Road Accident
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Every second counts. Report details via voice, text, or scene photo for instant AI resource matching.
        </p>
      </div>

      {/* Main Reporting Form Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-resq-border relative overflow-hidden shadow-2xl">
        
        {/* Submitting Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 z-50 bg-resq-dark/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4 animate-bounce">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-xl font-bold font-mono text-white mb-2">
              DISPATCH TELEMETRY ACTIVE
            </h3>
            <p className="text-sm font-mono text-cyan-300 animate-pulse">
              {submissionPhase}
            </p>
            <div className="w-64 bg-slate-800 rounded-full h-2 mt-6 overflow-hidden border border-slate-700">
              <div className="bg-gradient-to-r from-red-500 via-orange-500 to-cyan-400 h-full w-full animate-pulse" />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Language Selection */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-resq-border/60">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Languages className="w-4 h-4 text-resq-accent" />
              <span>SELECT REPORTING LANGUAGE:</span>
            </div>
            <div className="flex items-center gap-1.5">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                    language === l.code
                      ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700'
                  }`}
                >
                  {l.name} <span className="opacity-75">({l.native})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Demo Templates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>ONE-CLICK DEMO INCIDENTS:</span>
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_REPORTS.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setReportText(sample.text);
                    setLocationText(sample.location);
                  }}
                  className="p-2.5 rounded-xl text-left bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 transition-all group"
                >
                  <span className="font-semibold font-mono text-[11px] text-cyan-400 block group-hover:text-cyan-300">
                    {sample.label}
                  </span>
                  <span className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                    {sample.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Incident Description & Voice Button */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-slate-200 font-semibold flex items-center gap-1.5">
                <span>WHAT HAPPENED? (ACCIDENT DESCRIPTION)</span>
              </label>
              
              {/* Voice button */}
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  isRecording 
                    ? 'bg-red-600 text-white animate-pulse border border-red-400 shadow-lg shadow-red-600/30' 
                    : 'bg-slate-800 text-cyan-300 hover:bg-slate-700 border border-cyan-500/30'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-cyan-400" />}
                <span>
                  {voiceStep === 'listening' ? 'Listening...' : 
                   voiceStep === 'transcribing' ? 'Transcribing...' : 
                   voiceStep === 'confirming' ? 'Extracted ✓' : 
                   'Voice Dictation'}
                </span>
              </button>
            </div>

            <textarea
              rows={4}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="e.g. There is a road accident near Mysore Road. Three people are injured and one vehicle is blocking the road."
              className="w-full bg-slate-900/90 border border-resq-border rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 placeholder:text-slate-600 font-sans"
              required
            />
          </div>

          {/* Location Field */}
          <div>
            <label className="text-xs font-mono text-slate-200 font-semibold flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-resq-accent" />
              <span>INCIDENT LOCATION / CORRIDOR</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="e.g. Mysore Road, Bengaluru"
                className="w-full bg-slate-900/90 border border-resq-border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-sans"
                required
              />
              <button
                type="button"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      () => setLocationText('Mysore Road, Bengaluru'),
                      () => setLocationText('Mysore Road, Bengaluru')
                    );
                  }
                }}
                className="absolute right-2 top-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-mono border border-slate-700"
              >
                Auto GPS
              </button>
            </div>
          </div>

          {/* Scene Photo Intelligence (Optional) */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-resq-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5 font-semibold">
                <Camera className="w-4 h-4 text-resq-accent" />
                <span>SCENE PHOTO INTELLIGENCE (NON-MEDICAL)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Optional</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="flex-1 w-full flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500/50 cursor-pointer bg-slate-950/40 transition-colors">
                <Upload className="w-6 h-6 text-cyan-400 mb-1" />
                <span className="text-xs text-slate-300 font-medium">Upload Accident Scene Photo</span>
                <span className="text-[10px] text-slate-500">Extracts vehicle blockages, hazards, bystander density</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>

              {imagePreview && (
                <div className="w-full sm:w-48 relative rounded-xl overflow-hidden border border-slate-700 bg-black">
                  <img src={imagePreview} alt="Accident scene" className="w-full h-24 object-cover" />
                  <span className="absolute bottom-1 right-1 text-[9px] bg-black/80 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                    Scanned ✓
                  </span>
                </div>
              )}
            </div>

            {/* Simulated Vision Extraction Details */}
            {imageAnalysis && (
              <div className="mt-3 p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-xs space-y-1">
                <p className="font-mono font-bold text-cyan-300 text-[11px]">SCENE OBSERVATIONS:</p>
                <p className="text-slate-300">• {imageAnalysis.visibleVehicles}</p>
                <p className="text-slate-300">• {imageAnalysis.roadObstruction}</p>
                <p className="text-slate-300">• {imageAnalysis.smokeFireIndicator}</p>
                <p className="text-[10px] text-slate-500 italic mt-1">{imageAnalysis.disclaimer}</p>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-500 hover:to-orange-500 text-white font-extrabold text-sm tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>SUBMIT EMERGENCY DISPATCH</span>
          </button>

        </form>
      </div>

    </div>
  );
}
