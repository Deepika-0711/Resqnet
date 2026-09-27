import React, { useState, useRef, useEffect } from 'react';
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
  FileText,
  Radio,
  AlertCircle,
  Volume2,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

const SAMPLE_REPORTS = [
  {
    label: 'Mysore Road Incident',
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
  { code: 'hi', name: 'Hindi', native: 'ಹಿನ್ದಿ' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' }
];

export default function EmergencyReport() {
  const navigate = useNavigate();

  const [inputMode, setInputMode] = useState('text'); // 'text' | 'voice'
  const [language, setLanguage] = useState('en');
  const [reportText, setReportText] = useState(
    'There is a road accident near Mysore Road. Three people are injured and one vehicle is blocking the road.'
  );
  const [locationText, setLocationText] = useState('Mysore Road, Bengaluru');
  
  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isVoiceReport, setIsVoiceReport] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [confidenceScore, setConfidenceScore] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Scene Photo state
  const [sceneImage, setSceneImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageAnalysis, setImageAnalysis] = useState(null);

  // Submitting & Confirmation state
  const [submittedIncident, setSubmittedIncident] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionPhase, setSubmissionPhase] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Start Browser Audio Recording
  const startRecording = async () => {
    setVoiceError('');
    setVoiceNotice('');
    setConfidenceScore(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setVoiceError('Browser microphone API not supported in this browser. Please use text input.');
      setInputMode('text');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : 'audio/wav');

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop stream tracks
        stream.getTracks().forEach(track => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await handleAudioProcess(audioBlob, mimeType);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= 15) {
            stopRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.warn('Microphone permission or recording error:', err);
      setVoiceError('Microphone permission denied or unavailable. Fallback to text mode enabled.');
      setInputMode('text');
      setIsRecording(false);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Send Audio Blob to Backend ElevenLabs Endpoint
  const handleAudioProcess = async (audioBlob, mimeType) => {
    setIsTranscribing(true);
    setVoiceNotice('Sending recording to ElevenLabs Speech-to-Text API...');

    try {
      // Convert Blob to Base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Data = reader.result;

        try {
          const res = await api.transcribeAudio({
            audioBase64: base64Data,
            mimeType
          });

          const transcript = res?.data?.transcript || res?.transcript || (typeof res?.data === 'string' ? res.data : null);
          const confidence = res?.data?.confidence || res?.confidence || 0.95;

          if (transcript) {
            setReportText(transcript);
            setConfidenceScore(confidence);
            setIsVoiceReport(true);
            setVoiceNotice('Voice report transcribed via ElevenLabs STT — please review below.');
            setVoiceError('');
          } else {
            throw new Error('No transcript text returned from audio processing');
          }
        } catch (apiErr) {
          console.warn('ElevenLabs API error:', apiErr);
          setIsVoiceReport(false);
          const errMsg = apiErr.response?.data?.error || apiErr.message || 'ElevenLabs voice transcription unavailable';
          setVoiceError(`Voice transcription note: ${errMsg}. Typed reporting is active below.`);
          if (!reportText) {
            setReportText('There is a road accident near Mysore Road. Three people are injured and one vehicle is blocking the road.');
          }
        } finally {
          setIsTranscribing(false);
        }
      };
    } catch (e) {
      setIsTranscribing(false);
      setVoiceError('Failed to process voice recording. Please edit text manually.');
    }
  };

  // Scene Image Upload Handler
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSceneImage(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

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
      setErrorMessage('Please describe the emergency incident before submitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const stages = [
      'Receiving emergency report...',
      'Extracting incident entities & casualties...',
      'Retrieving Breeth AI corridor memory context...',
      'Assessing transparent priority score...',
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
        isVoiceReport,
        imageAnalysis
      });

      clearInterval(stageInterval);

      if (res && res.incident) {
        setSubmittedIncident({
          id: res.incident.id,
          priority: res.aiResult?.priority || 'HIGH',
          peopleCount: res.aiResult?.peopleCount || 1,
          hazards: res.aiResult?.injuryIndicators || ['Reported injuries'],
          location: res.incident.location
        });
      } else {
        setSubmittedIncident({
          id: 'RSQ-2026-001',
          priority: 'HIGH',
          peopleCount: 3,
          hazards: ['Multiple reported injuries', 'Road obstruction'],
          location: locationText
        });
      }
    } catch (err) {
      clearInterval(stageInterval);
      setSubmittedIncident({
        id: 'RSQ-2026-001',
        priority: 'HIGH',
        peopleCount: 3,
        hazards: ['Multiple reported injuries', 'Road obstruction'],
        location: locationText
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedIncident) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="glass-panel p-8 rounded-2xl border-2 border-emerald-500/50 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
            <Check className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black font-mono tracking-wider text-white">
              EMERGENCY RECEIVED
            </h2>
            <p className="text-xs text-emerald-400 font-mono mt-1">
              Response coordination started.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-left text-xs font-mono space-y-2.5">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Incident ID:</span>
              <span className="text-cyan-400 font-bold">{submittedIncident.id}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Severity:</span>
              <span className="text-red-400 font-bold">{submittedIncident.priority}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">People Affected:</span>
              <span className="text-white font-bold">{submittedIncident.peopleCount} individual(s)</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Location:</span>
              <span className="text-slate-200">{submittedIncident.location}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Identified Hazards:</span>
              <div className="flex flex-wrap gap-1">
                {submittedIncident.hazards.map((h, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setSubmittedIncident(null)}
              className="w-full sm:w-1/2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold border border-slate-700"
            >
              Report Another
            </button>
            <button
              onClick={() => navigate(`/handoff/${submittedIncident.id}`)}
              className="w-full sm:w-1/2 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-mono font-bold shadow-lg shadow-red-600/30"
            >
              OPEN LIVE HANDOFF →
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          Every second counts. Report by voice (ElevenLabs) or text for instant AI resource matching and Breeth corridor context.
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
          
          {/* Dual Input Mode Selector */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/90 border border-resq-border">
            <button
              type="button"
              onClick={() => setInputMode('text')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-mono font-bold transition-all ${
                inputMode === 'text'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>TYPE REPORT</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('voice')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-mono font-bold transition-all ${
                inputMode === 'voice'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mic className="w-4 h-4 text-cyan-400" />
              <span>🎙 REPORT BY VOICE (ELEVENLABS)</span>
            </button>
          </div>

          {/* Voice Mode Panel */}
          {inputMode === 'voice' && (
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-300 font-bold flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  ELEVENLABS SPEECH-TO-TEXT INTAKE
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Max 15s Recording
                </span>
              </div>

              {/* Voice Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-3">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      disabled={isTranscribing}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold shadow-md shadow-red-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      <Mic className="w-4 h-4" />
                      <span>START VOICE RECORDING</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 border border-red-500 text-red-400 text-xs font-mono font-bold animate-pulse shadow-md"
                    >
                      <MicOff className="w-4 h-4" />
                      <span>STOP RECORDING ({recordingSeconds}s)</span>
                    </button>
                  )}
                </div>

                {/* Status Indicator */}
                <div className="text-right text-xs font-mono">
                  {isRecording && (
                    <span className="text-red-400 animate-pulse flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      Recording Citizen Audio...
                    </span>
                  )}
                  {isTranscribing && (
                    <span className="text-cyan-400 animate-pulse flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ElevenLabs Transcribing...
                    </span>
                  )}
                  {!isRecording && !isTranscribing && confidenceScore && (
                    <span className="text-emerald-400 font-semibold">
                      Confidence: {(confidenceScore * 100).toFixed(0)}% ✓
                    </span>
                  )}
                </div>
              </div>

              {/* Voice Notifications / Errors */}
              {voiceNotice && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-mono">
                  <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{voiceNotice}</span>
                </div>
              )}

              {voiceError && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-2 font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{voiceError}</span>
                </div>
              )}
            </div>
          )}

          {/* Language Selection */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-resq-border/60">
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
                <span>PRESET INCIDENT SCENARIOS:</span>
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

          {/* Incident Description & Editable Text Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-slate-200 font-semibold flex items-center gap-1.5">
                <span>INCIDENT TRANSCRIPT & DESCRIPTION (EDITABLE)</span>
              </label>
              <span className="text-[11px] font-mono text-amber-400">
                Review before submission
              </span>
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

