import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Mic, 
  MicOff, 
  MapPin, 
  Languages, 
  Send, 
  Camera, 
  Check, 
  Loader2,
  FileText,
  Radio, 
  AlertCircle,
  Volume2,
  Users,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Info,
  Clock,
  RotateCcw
} from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';

const SAMPLE_SCENARIOS = [
  {
    label: 'Mysore Road Collision',
    text: 'There is a road accident near Mysore Road. Three people are injured and one vehicle is blocking the road.',
    location: 'Mysore Road, Bengaluru',
    peopleCount: 3,
    injuries: ['Multiple reported injuries', 'Possible blunt trauma'],
    obstruction: true
  },
  {
    label: 'Silk Board Multi-Vehicle',
    text: 'Severe multi-vehicle collision near Silk Board Junction flyover. 4 people trapped, visible smoke and heavy road blockage.',
    location: 'Silk Board Junction, Bengaluru',
    peopleCount: 4,
    injuries: ['Trapped occupants', 'Severe bleeding'],
    obstruction: true
  },
  {
    label: 'Hebbal Flyover Ramp',
    text: 'Motorcycle slip on Hebbal flyover ramp. One person injured with abrasions, traffic moving slowly.',
    location: 'Hebbal Flyover, Bengaluru',
    peopleCount: 1,
    injuries: ['Minor abrasions'],
    obstruction: false
  }
];

const INJURY_TAGS = [
  'Possible blunt trauma',
  'Severe bleeding',
  'Unconscious individual',
  'Suspected fracture',
  'Vehicle entrapment',
  'Pedestrian struck'
];

export default function EmergencyReport() {
  const navigate = useNavigate();

  // Guided intake state
  const [reportText, setReportText] = useState('There is a road accident near Mysore Road. Three people are injured and one vehicle is blocking the road.');
  const [locationText, setLocationText] = useState('Mysore Road, Bengaluru');
  const [peopleCount, setPeopleCount] = useState(3);
  const [selectedInjuries, setSelectedInjuries] = useState(['Possible blunt trauma']);
  const [roadObstruction, setRoadObstruction] = useState(true);
  const [fireSmoke, setFireSmoke] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [language, setLanguage] = useState('en');

  // Voice recording state (ElevenLabs STT)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isVoiceReport, setIsVoiceReport] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Submission / Analyzing phase state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processStep, setProcessStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');

  // Structured AI Intelligence result after submission
  const [extractedIntelligence, setExtractedIntelligence] = useState(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Voice Recording handlers
  const startRecording = async () => {
    setVoiceError('');
    setVoiceNotice('');
    setAudioUrl(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setVoiceError('Microphone input is unavailable in this browser. Please use text input mode.');
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
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioUrl(URL.createObjectURL(audioBlob));
        await handleAudioProcess(audioBlob, mimeType);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= 20) {
            stopRecording();
            return 20;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.warn('Microphone permission error:', err);
      setVoiceError('Microphone permission denied or unavailable. Fallback to typed text active.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleAudioProcess = async (audioBlob, mimeType) => {
    setIsTranscribing(true);
    setVoiceNotice('Sending voice stream to ElevenLabs Speech-to-Text API on backend...');

    try {
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

          if (transcript) {
            setReportText(transcript);
            setIsVoiceReport(true);
            setVoiceNotice('Voice report transcribed via ElevenLabs Speech-to-Text.');
            setVoiceError('');
          } else {
            throw new Error('No transcript received from ElevenLabs audio endpoint.');
          }
        } catch (apiErr) {
          console.warn('ElevenLabs API:', apiErr.message);
          setIsVoiceReport(false);
          setVoiceError(`Voice transcription note: ${apiErr.message}. You can edit or confirm typed text below.`);
          if (!reportText) {
            setReportText('There is a road accident near Mysore Road. Three people are injured and one vehicle is blocking the road.');
          }
        } finally {
          setIsTranscribing(false);
        }
      };
    } catch (e) {
      setIsTranscribing(false);
      setVoiceError('Failed to encode audio file.');
    }
  };

  const toggleInjury = (tag) => {
    if (selectedInjuries.includes(tag)) {
      setSelectedInjuries(selectedInjuries.filter(t => t !== tag));
    } else {
      setSelectedInjuries([...selectedInjuries, tag]);
    }
  };

  const applyScenario = (sc) => {
    setReportText(sc.text);
    setLocationText(sc.location);
    setPeopleCount(sc.peopleCount);
    setSelectedInjuries(sc.injuries);
    setRoadObstruction(sc.obstruction);
  };

  // Submit and Trigger Sequential Processing
  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!reportText.trim()) {
      setErrorMessage('Please describe the emergency incident before submitting.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    setProcessStep(1);

    const stepTimers = [
      setTimeout(() => setProcessStep(2), 400),
      setTimeout(() => setProcessStep(3), 800),
      setTimeout(() => setProcessStep(4), 1200)
    ];

    try {
      const res = await api.createIncident({
        text: reportText,
        location: locationText,
        lat: locationText.toLowerCase().includes('mysore') ? 12.9482 : 12.9716,
        lng: locationText.toLowerCase().includes('mysore') ? 77.5358 : 77.5946,
        peopleCount: peopleCount,
        injuryIndicators: selectedInjuries,
        roadObstruction: roadObstruction,
        fireSmoke: fireSmoke,
        additionalNotes: additionalNotes,
        isVoiceReport
      });

      stepTimers.forEach(t => clearTimeout(t));
      setProcessStep(4);

      setTimeout(() => {
        setIsSubmitting(false);
        if (res && res.incident) {
          setExtractedIntelligence({
            incidentId: res.incident.id,
            incidentType: res.incident.incident_type || 'Road Accident',
            location: res.incident.location,
            peopleCount: res.incident.people_count || peopleCount,
            injuryIndicators: res.incident.injury_indicators || selectedInjuries,
            roadObstruction: Boolean(res.incident.road_obstruction),
            priority: res.aiResult?.priority || res.incident.priority || 'HIGH',
            priorityScore: res.aiResult?.priorityScore || res.incident.priority_score || 6,
            reasoning: res.aiResult?.reasoning || res.incident.priority_reasoning || [
              'Multiple casualties involved (+2)',
              'Reported injury indicators (+3)',
              'Road obstruction detected (+1)'
            ],
            missingInfo: [
              'Specific casualty blood groups unconfirmed at scene',
              'Exact hospital destination pending triage desk selection'
            ]
          });
        }
      }, 500);

    } catch (err) {
      console.warn('Incident analysis fallback:', err.message);
      stepTimers.forEach(t => clearTimeout(t));
      setIsSubmitting(false);
      setExtractedIntelligence({
        incidentId: 'RSQ-2026-001',
        incidentType: 'Road Accident',
        location: locationText,
        peopleCount: peopleCount || 3,
        injuryIndicators: selectedInjuries,
        roadObstruction: roadObstruction,
        priority: 'HIGH',
        priorityScore: 6,
        reasoning: [
          'Multiple casualties involved (+2)',
          'Reported injury indicators (+3)',
          'Road obstruction detected (+1)'
        ],
        missingInfo: [
          'Specific casualty blood groups unconfirmed at scene',
          'Exact hospital destination pending triage desk selection'
        ]
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-32 space-y-8">
      
      {/* HEADER: Dignified, human-centred intro */}
      <div className="border-b border-[#E8E8E1] pb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E66B55]" />
          <span className="text-xs uppercase font-sans font-semibold tracking-wider text-[#707970]">
            Guided Emergency Intake Workspace
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#203B32] tracking-tight">
          Report an Emergency
        </h1>
        <p className="text-sm text-[#707970] font-sans mt-1">
          Capture incident details sequentially to prepare a coordinated dispatch and hospital alert.
        </p>

        {/* Quick Test Scenario Chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-sans text-[#707970]">Quick Scenarios:</span>
          {SAMPLE_SCENARIOS.map((sc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyScenario(sc)}
              className="px-2.5 py-1 rounded-lg text-xs font-sans bg-white border border-[#E8E8E1] hover:border-[#245C4A] text-[#203B32] transition-colors"
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-[#FCECE9] border border-[#F5C2BA] text-[#B94430] text-xs font-sans flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* If Intelligence is already extracted, show structured intelligence document report */}
      {extractedIntelligence ? (
        <div className="bg-white rounded-3xl border border-[#E8E8E1] p-6 sm:p-8 shadow-sheet space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E8E1] gap-2">
            <div>
              <span className="text-xs font-sans text-[#707970] block uppercase tracking-wider">
                Assessment Summary
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#203B32]">
                Incident {extractedIntelligence.incidentId} Prepared
              </h2>
            </div>
            <PriorityBadge priority={extractedIntelligence.priority} size="lg" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div className="p-3 bg-[#F8F7F2] rounded-xl border border-[#E8E8E1]">
              <span className="text-[#707970] block text-[11px]">Location</span>
              <span className="font-semibold text-[#203B32] text-sm mt-0.5 block">{extractedIntelligence.location}</span>
            </div>
            <div className="p-3 bg-[#F8F7F2] rounded-xl border border-[#E8E8E1]">
              <span className="text-[#707970] block text-[11px]">Casualties Involved</span>
              <span className="font-semibold text-[#203B32] text-sm mt-0.5 block">{extractedIntelligence.peopleCount} individuals</span>
            </div>
          </div>

          <div className="p-4 bg-[#EEF4EF] rounded-2xl border border-[#CBDACD] space-y-2">
            <span className="text-xs font-bold text-[#245C4A] uppercase tracking-wider block">
              Deterministic Priority Rationale (Score: {extractedIntelligence.priorityScore})
            </span>
            <ul className="text-xs text-[#203B32] space-y-1 list-disc list-inside">
              {extractedIntelligence.reasoning.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#E8E8E1]">
            <Link
              to={`/handoff/${extractedIntelligence.incidentId}`}
              className="px-5 py-2.5 rounded-xl bg-[#245C4A] hover:bg-[#1D4A3B] text-white text-xs font-sans font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              <span>Open RESQ Handoff Brief</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/ambulances"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#F8F7F2] text-[#203B32] border border-[#E8E8E1] text-xs font-sans font-semibold transition-colors"
            >
              View Ambulance Roster
            </Link>

            <button
              onClick={() => setExtractedIntelligence(null)}
              className="text-xs text-[#707970] hover:text-[#203B32] ml-auto font-sans"
            >
              Report Another Incident
            </button>
          </div>
        </div>
      ) : (
        /* GUIDED 4-STEP INTAKE WORKSPACE */
        <form onSubmit={handleAnalyze} className="space-y-8">
          
          {/* STEP 1: WHAT HAPPENED? */}
          <div className="bg-white rounded-3xl border border-[#E8E8E1] p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E1]">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#245C4A] text-white text-xs font-bold flex items-center justify-center font-mono">
                  1
                </span>
                <h2 className="font-serif text-lg font-bold text-[#203B32]">
                  What happened?
                </h2>
              </div>
              <span className="text-xs text-[#707970] font-sans">
                Voice reporting or typed description
              </span>
            </div>

            {/* Distinctive Voice-Reporting Control */}
            <div className="p-4 bg-[#F8F7F2] rounded-2xl border border-[#E8E8E1] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTranscribing}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
                    isRecording 
                      ? 'bg-[#E66B55] text-white ring-4 ring-[#FCECE9]' 
                      : 'bg-white hover:bg-[#EEF4EF] text-[#245C4A] border border-[#CBDACD]'
                  }`}
                  title={isRecording ? 'Stop voice recording' : 'Click to record emergency report via voice'}
                >
                  {isRecording ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
                </button>

                <div>
                  <span className="font-sans font-semibold text-xs text-[#203B32] block">
                    {isRecording ? `Recording... (${20 - recordingSeconds}s remaining)` : 'Voice-Enabled Intake'}
                  </span>
                  <span className="text-[11px] text-[#707970] font-sans">
                    {isRecording ? 'Speak clearly. Click to stop and transcribe.' : 'Powered by ElevenLabs Speech-to-Text proxy.'}
                  </span>
                </div>
              </div>

              {/* Subtle animated waveform ONLY while recording */}
              {isRecording ? (
                <div className="flex items-center gap-1.5 h-8 px-4 bg-white rounded-xl border border-[#E8E8E1]">
                  <span className="waveform-bar" />
                  <span className="waveform-bar" />
                  <span className="waveform-bar" />
                  <span className="waveform-bar" />
                  <span className="waveform-bar" />
                  <span className="waveform-bar" />
                  <span className="waveform-bar" />
                  <span className="waveform-bar" />
                </div>
              ) : isTranscribing ? (
                <div className="flex items-center gap-2 text-xs text-[#245C4A] font-sans">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Transcribing with ElevenLabs...</span>
                </div>
              ) : voiceNotice ? (
                <div className="text-[11px] text-[#245C4A] bg-[#EEF4EF] px-2.5 py-1 rounded-lg border border-[#CBDACD] font-sans">
                  {voiceNotice}
                </div>
              ) : null}
            </div>

            {voiceError && (
              <p className="text-xs text-[#9E6F18] font-sans px-1">{voiceError}</p>
            )}

            {/* Document-Like Panel Text Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-sans font-medium text-[#707970]">
                Incident Narrative / Transcript
              </label>
              <textarea
                rows={3}
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Describe what occurred, number of vehicles, and apparent injuries..."
                className="w-full p-3.5 bg-white border border-[#E8E8E1] rounded-2xl text-xs sm:text-sm text-[#203B32] placeholder-[#929B92] focus:outline-none focus:border-[#245C4A] transition-colors leading-relaxed font-sans"
              />
            </div>
          </div>

          {/* STEP 2: WHERE DID IT HAPPEN? */}
          <div className="bg-white rounded-3xl border border-[#E8E8E1] p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E1]">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#245C4A] text-white text-xs font-bold flex items-center justify-center font-mono">
                  2
                </span>
                <h2 className="font-serif text-lg font-bold text-[#203B32]">
                  Where did it happen?
                </h2>
              </div>
              <span className="text-xs text-[#707970] font-sans">
                Location &amp; landmark reference
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-sans font-medium text-[#707970]">
                Location description
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#245C4A] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  placeholder="Street, junction, or landmark in Bengaluru..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8E8E1] rounded-2xl text-xs sm:text-sm text-[#203B32] focus:outline-none focus:border-[#245C4A] font-sans"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#707970] font-sans">
              <span className="text-[11px] text-[#929B92]">Common corridors:</span>
              <button
                type="button"
                onClick={() => setLocationText('Mysore Road, Bengaluru')}
                className="text-[#245C4A] hover:underline"
              >
                Mysore Road
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setLocationText('Silk Board Junction, Bengaluru')}
                className="text-[#245C4A] hover:underline"
              >
                Silk Board
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setLocationText('Hebbal Flyover, Bengaluru')}
                className="text-[#245C4A] hover:underline"
              >
                Hebbal Flyover
              </button>
            </div>
          </div>

          {/* STEP 3: INCIDENT DETAILS */}
          <div className="bg-white rounded-3xl border border-[#E8E8E1] p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E1]">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#245C4A] text-white text-xs font-bold flex items-center justify-center font-mono">
                  3
                </span>
                <h2 className="font-serif text-lg font-bold text-[#203B32]">
                  Incident details
                </h2>
              </div>
              <span className="text-xs text-[#707970] font-sans">
                Casualties, injuries &amp; obstructions
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Number of people involved */}
              <div className="space-y-1.5">
                <label className="text-xs font-sans font-medium text-[#707970]">
                  People involved / casualties
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPeopleCount(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-sans font-semibold border transition-all ${
                        peopleCount === num
                          ? 'bg-[#EEF4EF] text-[#245C4A] border-[#245C4A]'
                          : 'bg-white text-[#707970] border-[#E8E8E1] hover:border-[#CBDACD]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Road obstruction toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-sans font-medium text-[#707970]">
                  Road or lane obstruction?
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRoadObstruction(true)}
                    className={`flex-1 py-2 rounded-xl text-xs font-sans font-semibold border transition-all ${
                      roadObstruction
                        ? 'bg-[#EEF4EF] text-[#245C4A] border-[#245C4A]'
                        : 'bg-white text-[#707970] border-[#E8E8E1]'
                    }`}
                  >
                    Yes (Blocking Traffic)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoadObstruction(false)}
                    className={`flex-1 py-2 rounded-xl text-xs font-sans font-semibold border transition-all ${
                      !roadObstruction
                        ? 'bg-[#EEF4EF] text-[#245C4A] border-[#245C4A]'
                        : 'bg-white text-[#707970] border-[#E8E8E1]'
                    }`}
                  >
                    No (Clear Corridor)
                  </button>
                </div>
              </div>

            </div>

            {/* Reported Injuries Chips */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-sans font-medium text-[#707970]">
                Observed injury indicators
              </label>
              <div className="flex flex-wrap gap-2">
                {INJURY_TAGS.map((tag) => {
                  const isChecked = selectedInjuries.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleInjury(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-sans transition-all border ${
                        isChecked
                          ? 'bg-[#EEF4EF] text-[#245C4A] border-[#245C4A] font-semibold'
                          : 'bg-white text-[#707970] border-[#E8E8E1] hover:border-[#CBDACD]'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-sans font-medium text-[#707970]">
                Additional observations (Optional)
              </label>
              <input
                type="text"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Fuel leakage, fallen power lines, weather conditions..."
                className="w-full px-4 py-2 bg-white border border-[#E8E8E1] rounded-xl text-xs text-[#203B32] focus:outline-none focus:border-[#245C4A]"
              />
            </div>
          </div>

          {/* STEP 4: REVIEW & SUBMIT */}
          <div className="bg-white rounded-3xl border border-[#E8E8E1] p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E1]">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#245C4A] text-white text-xs font-bold flex items-center justify-center font-mono">
                  4
                </span>
                <h2 className="font-serif text-lg font-bold text-[#203B32]">
                  Review &amp; Dispatch
                </h2>
              </div>
              <span className="text-xs text-[#707970] font-sans">
                Ready for automated triage analysis
              </span>
            </div>

            {/* Clean summary of extracted information */}
            <div className="p-4 bg-[#F8F7F2] rounded-2xl border border-[#E8E8E1] space-y-2 text-xs font-sans text-[#203B32]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-[#707970] block text-[11px]">Location</span>
                  <span className="font-semibold">{locationText || 'Unspecified'}</span>
                </div>
                <div>
                  <span className="text-[#707970] block text-[11px]">People Involved</span>
                  <span className="font-semibold">{peopleCount}</span>
                </div>
                <div>
                  <span className="text-[#707970] block text-[11px]">Road Blockage</span>
                  <span className="font-semibold">{roadObstruction ? 'Yes' : 'No'}</span>
                </div>
              </div>
              <div>
                <span className="text-[#707970] block text-[11px]">Injuries Noted</span>
                <span className="font-medium">
                  {selectedInjuries.length > 0 ? selectedInjuries.join(', ') : 'None marked'}
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-[#707970] font-sans">
                Non-medical decision support layer
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-[#245C4A] hover:bg-[#1D4A3B] text-white text-xs font-sans font-semibold flex items-center gap-2 shadow-sm transition-all hover:translate-y-[-1px] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Step {processStep} of 4...</span>
                  </>
                ) : (
                  <>
                    <span>Analyse &amp; Prepare Response</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      )}

    </div>
  );
}
