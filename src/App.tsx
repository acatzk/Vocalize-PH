import React, { useState, useEffect, useRef } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Code, 
  Sparkles, 
  HelpCircle, 
  Cpu, 
  DollarSign, 
  Calculator,
  Layers, 
  ExternalLink, 
  Check, 
  ArrowRight,
  Info
} from 'lucide-react';
import { VOICES, TAGALOG_PRESETS, PROVIDER_DETAILS, HOW_IT_WORKS_EXPLANATION } from './data';
import { VoiceData, TtsSnippetLanguage } from './types';
import { generateCurlSnippet, generateNodeSnippet, generatePythonSnippet } from './utils';

export default function App() {
  // Application state
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('gcp-hina');
  const [inputText, setInputText] = useState<string>(TAGALOG_PRESETS[0].text);
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(0.9);
  
  // Custom Estimator Character Count
  const [monthlyChars, setMonthlyChars] = useState<number>(200000);
  
  // Code snippet language tab
  const [snippetLang, setSnippetLang] = useState<TtsSnippetLanguage>('curl');
  const [copied, setCopied] = useState<boolean>(false);

  // Audio Playback states
  const [isCurrentlyPlaying, setIsCurrentlyPlaying] = useState<boolean>(false);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  
  // Audio animation visualizer values
  const [visualizerHeights, setVisualizerHeights] = useState<number[]>([15, 25, 40, 20, 30, 45, 15, 35, 50, 25, 40, 20, 30, 15]);
  const animationRef = useRef<number | null>(null);

  const selectedVoice = VOICES.find(v => v.id === selectedVoiceId) || VOICES[0];

  // Synthesis engine instance
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Copy code utility
  const handleCopyCode = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Soundwave visualizer animation
  useEffect(() => {
    if (isCurrentlyPlaying) {
      const animate = () => {
        setVisualizerHeights(prev => 
          prev.map(() => Math.floor(Math.random() * 45) + 8)
        );
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setVisualizerHeights([15, 20, 15, 25, 15, 30, 15, 25, 15, 20, 15, 20, 10, 15]);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isCurrentlyPlaying]);

  // Clean play stop voice on unmount or voice change
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Web Speech Synthesis Action
  const triggerSpeechSynthesis = () => {
    if (window.speechSynthesis) {
      // If already playing, stop it
      if (isCurrentlyPlaying) {
        window.speechSynthesis.cancel();
        setIsCurrentlyPlaying(false);
        return;
      }

      setIsSynthesizing(true);
      
      // Cancel outstanding tasks
      window.speechSynthesis.cancel();

      // Small artificial timeout to simulate cloud synthesis latency
      setTimeout(() => {
        setIsSynthesizing(false);
        setIsCurrentlyPlaying(true);
        
        try {
          const u = new SpeechSynthesisUtterance(inputText);
          u.rate = speed;
          u.pitch = pitch;
          u.volume = volume;

          // Attempt to find Filipino/Tagalog voice
          const systemVoices = window.speechSynthesis.getVoices();
          // Filter matching language codes like tl, tl-PH, fil, fil-PH
          const tlVoice = systemVoices.find(v => 
            v.lang.toLowerCase().startsWith('tl') || 
            v.lang.toLowerCase().startsWith('fil')
          );
          
          if (tlVoice) {
            u.voice = tlVoice;
          }

          u.onend = () => {
            setIsCurrentlyPlaying(false);
          };

          u.onerror = (e) => {
            console.error('SpeechSynthesis error:', e);
            setIsCurrentlyPlaying(false);
          };

          utteranceRef.current = u;
          window.speechSynthesis.speak(u);
        } catch (err) {
          console.error('Failed to speak', err);
          setIsCurrentlyPlaying(false);
        }
      }, 350);
    } else {
      alert("Browser does not support local Text-to-Speech synthesis.");
    }
  };

  const handleStopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsCurrentlyPlaying(false);
    }
  };

  // Helper code generation generator
  const getActiveCodeSnippet = () => {
    const p = selectedVoice.provider;
    // We proxy system to google for code snippet display, so developers always have usable API code
    const actualProvider = p === 'system' ? 'google' : p;
    const code = p === 'system' ? 'tl-PH-Neural2-A' : selectedVoice.voiceCode;

    switch (snippetLang) {
      case 'curl':
        return generateCurlSnippet(actualProvider, inputText, code, pitch, speed);
      case 'nodejs':
        return generateNodeSnippet(actualProvider, inputText, code, pitch, speed);
      case 'python':
        return generatePythonSnippet(actualProvider, inputText, code, pitch, speed);
    }
  };

  // Dynamic cost calculators
  const calculatedCosts = {
    google: (() => {
      // First 4 Million characters free, then $16 per million
      const paidChars = Math.max(0, monthlyChars - 4000000);
      const cost = (paidChars / 1000000) * 16;
      return cost.toFixed(2);
    })(),
    azure: (() => {
      // First 500,000 characters free, then $16 per million
      const paidChars = Math.max(0, monthlyChars - 500000);
      const cost = (paidChars / 1000000) * 16;
      return cost.toFixed(2);
    })(),
    elevenlabs: (() => {
      // First 10,000 characters free, then ~$150 per million
      const paidChars = Math.max(0, monthlyChars - 10000);
      const cost = (paidChars / 1000000) * 150;
      return cost.toFixed(2);
    })()
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* 1. NAVIGATION HEADER */}
      <nav className="flex items-center justify-between px-6 md:px-12 h-16 bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <Volume2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-slate-800 font-display">Vocalize.ph</span>
            <span className="text-[10px] text-blue-600 font-semibold tracking-wider uppercase -mt-1">Tagalog Neural Hub</span>
          </div>
        </div>
        
        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
          <a href="#playground" className="hover:text-blue-600 transition-colors">Sandbox Console</a>
          <a href="#explanation" className="hover:text-blue-600 transition-colors">Where are voices from?</a>
          <a href="#pricing" className="hover:text-blue-600 transition-colors">Paid API Pricing</a>
          <a href="#bento" className="hover:text-blue-600 transition-colors">Provider Comparison</a>
        </div>
        
        <div className="flex items-center gap-3">
          <a 
            href="#pricing"
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all rounded shadow-md flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            Vocalize Paid API Options
          </a>
        </div>
      </nav>

      {/* 2. HERO DESCRIPTION SEGMENT */}
      <header className="bg-gradient-to-b from-blue-50/50 to-transparent py-10 px-6 md:px-12 border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/80 rounded-full">
                Interactive Developer Guide
              </span>
              <span className="inline-block px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-200/80 rounded-full">
                Tagalog (Filipino) TTS
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight font-display tracking-tight">
              High-Fidelity <span className="text-blue-600">Tagalog TTS</span> Architectures
            </h1>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Confused about where mobile apps or sites get native-sounding Filipino voices? 
              Explore direct pricing packages, compare premium cloud providers, and test interactive parameters in our real-time developer sandbox.
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-xl border border-blue-100 shadow-sm flex items-center gap-3 max-w-sm">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Current Local Time</p>
              <p className="text-sm font-semibold text-slate-700">June 9, 2026 • Manila & Global</p>
            </div>
          </div>
        </div>
      </header>

      {/* 3. MAIN WORKSPACE CONTENT */}
      <main id="playground" className="max-w-7xl mx-auto px-6 md:px-12 py-8 grid grid-cols-12 gap-8 flex-1">
        
        {/* LEFT COLUMN: EDUCATIONAL, SOURCE ANALYSIS & CALCULATOR (5 cols on lg desktop) */}
        <section className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          
          {/* ARTICLE CARD: STCODESAPP ANATOMY */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -translate-y-6 translate-x-6"></div>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600 border border-amber-100">
                <HelpCircle className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-800 font-display">
                Where do Android apps find these Tagalog voices?
              </h2>
            </div>
            
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              The Play Store app you cited (<span className="text-blue-600 font-medium">STCodesApp Text to Speech</span>) gets its beautiful Tagalog voices directly from the <strong>Android Text-to-Speech Service</strong>:
            </p>

            <ul className="space-y-3.5 border-t border-slate-100 pt-4">
              {HOW_IT_WORKS_EXPLANATION.androidSource.details.map((item, idx) => (
                <li key={idx} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800">{item.header}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-5 p-3.5 bg-blue-50/50 rounded-xl border border-blue-100/50 text-xs text-slate-600 leading-relaxed flex gap-2.5">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>The Web Problem:</strong> Web applications do not have a standard offline engine across all browsers. You must consume paid <strong>Cloud Rest APIs</strong> to guarantee 100% stable, flawless audio quality on Safari (iOS), Chrome, and desktop clients alike!
              </span>
            </div>
          </div>

          {/* DYNAMIC COST ESTIMATOR INTERACTIVE WIDGET */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-xl relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Calculator className="w-24 h-24" />
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="p-1.5 bg-slate-800 rounded-lg text-blue-400 border border-slate-700">
                <DollarSign className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold font-display text-white">
                Interactive Paid API Cost Estimator
              </h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              Can we pay for these APIs? <strong>Yes!</strong> Enter your expected monthly synthesized characters below to calculate exactly how much it will cost you per provider:
            </p>

            {/* Slider and Input container */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-lg border border-slate-700">
                <span className="text-xs font-bold text-slate-300">Monthly Characters</span>
                <input 
                  type="number" 
                  value={monthlyChars}
                  onChange={(e) => setMonthlyChars(Math.max(0, parseInt(e.target.value) || 0))}
                  className="bg-slate-950 text-slate-100 text-right font-mono font-bold text-sm px-2.5 py-1 rounded w-36 outline-none border border-slate-600 focus:border-blue-500"
                />
              </div>

              <input 
                type="range"
                min="10000"
                max="2000000"
                step="10000"
                value={monthlyChars}
                onChange={(e) => setMonthlyChars(parseInt(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>10K chars</span>
                <span>1.0M chars</span>
                <span>2.0M chars</span>
              </div>
            </div>

            {/* Cost outputs side-by-side card */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 bg-slate-950/40 rounded-lg border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs font-bold text-slate-300">Google Cloud TTS</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-extrabold text-green-400">${calculatedCosts.google}</span>
                  <p className="text-[9px] text-slate-500 uppercase font-semibold">/ month (4M Chars Free!)</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950/40 rounded-lg border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-xs font-bold text-slate-300">Azure Cognitive Speech</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-extrabold text-blue-400">${calculatedCosts.azure}</span>
                  <p className="text-[9px] text-slate-500 uppercase font-semibold">/ month (500K Free!)</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950/40 rounded-lg border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                  <span className="text-xs font-bold text-slate-300">ElevenLabs API</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-extrabold text-pink-400">${calculatedCosts.elevenlabs}</span>
                  <p className="text-[9px] text-slate-500 uppercase font-semibold">/ month (Premium Quality)</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: LIVE VOICE SANDBOX & API CONSOLE (7 cols on lg desktop) */}
        <section className="col-span-12 lg:col-span-7 flex flex-col gap-6 bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              <h2 className="font-extrabold text-slate-800 font-display text-lg">Interactive Voice Sandbox</h2>
            </div>
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 font-mono rounded-full">
              Neural-Synthesis Engine
            </span>
          </div>

          <div className="space-y-5">
            
            {/* VOICE SELECTOR SLOTS */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Select Voice Model Accent
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {VOICES.map((v) => {
                  const isSelected = v.id === selectedVoiceId;
                  const providerTag = 
                    v.provider === 'google' ? 'Google' : 
                    v.provider === 'azure' ? 'Azure' : 
                    v.provider === 'elevenlabs' ? 'Eleven' : 'System';

                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVoiceId(v.id)}
                      className={`flex items-center gap-3 p-3.5 border-2 rounded-xl text-left transition-all ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/75 shadow-sm' 
                          : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                        v.gender === 'male' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-pink-100 text-pink-700'
                      }`}>
                        {v.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className={`text-xs font-extrabold truncate ${isSelected ? 'text-blue-800' : 'text-slate-800'}`}>
                            {v.name}
                          </p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            v.provider === 'google' ? 'bg-green-100 text-green-700' :
                            v.provider === 'azure' ? 'bg-blue-100 text-blue-700' :
                            v.provider === 'elevenlabs' ? 'bg-pink-100 text-pink-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {providerTag}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{v.style}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PRESET CHIPS */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick-Load Tagalog Phrases
              </span>
              <div className="flex flex-wrap gap-2">
                {TAGALOG_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setInputText(preset.text)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-600 border border-slate-200 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* MAIN TEXT AREA INPUT */}
            <div className="flex flex-col space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Input Text (Tagalog / Filipino)</span>
                <span className="font-mono text-slate-500">{inputText.length} characters</span>
              </div>
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm leading-relaxed"
                  placeholder="I-type ang iyong Tagalog na teksto rito..."
                />
              </div>
            </div>

            {/* PHYSICAL AUDIO SYNTH CONTROLS PANEL */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Speed Controls */}
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Speaking Speed (Rate)</span>
                    <span className="font-mono text-blue-600">{speed.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.75"
                    step="0.05"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 h-1.5 rounded-lg cursor-pointer bg-slate-200"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span>Slow (0.5x)</span>
                    <span>Standard (1.0x)</span>
                    <span>Fast (1.75x)</span>
                  </div>
                </div>

                {/* Pitch Controls */}
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Vocal Pitch</span>
                    <span className="font-mono text-blue-600">{pitch.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.4"
                    step="0.05"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 h-1.5 rounded-lg cursor-pointer bg-slate-200"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span>Deep (0.6x)</span>
                    <span>Standard (1.0x)</span>
                    <span>High (1.4x)</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Soundwave display & synthesis triggers */}
              <div className="flex flex-col md:flex-row items-center justify-between pt-3 border-t border-slate-200/60 gap-4">
                
                {/* Visualizer bars */}
                <div className="flex items-center gap-1.5 h-10 w-full md:w-auto px-2 justify-center md:justify-start">
                  <AnimatePresence>
                    {isCurrentlyPlaying ? (
                      <div className="flex items-center gap-1 h-12">
                        {visualizerHeights.map((h, i) => (
                          <motion.div
                            key={i}
                            layout
                            style={{ height: `${h}px` }}
                            className="w-1 bg-gradient-to-t from-blue-600 to-indigo-500 rounded-full"
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <VolumeX className="w-4 h-4 text-slate-400" />
                        <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                          Audio Idle
                        </span>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Control synthesizers */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  {isCurrentlyPlaying && (
                    <button
                      onClick={handleStopSpeech}
                      className="px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-full font-bold text-xs flex items-center gap-2 transition-colors flex-1 md:flex-none justify-center"
                    >
                      <Square className="w-3.5 h-3.5 fill-red-600" />
                      Stop
                    </button>
                  )}
                  
                  <button
                    onClick={triggerSpeechSynthesis}
                    disabled={isSynthesizing || !inputText}
                    className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white shadow-md transition-all w-full md:w-auto ${
                      isCurrentlyPlaying 
                        ? 'bg-amber-500 hover:bg-amber-600' 
                        : 'bg-slate-900 hover:bg-slate-800'
                    } ${isSynthesizing ? 'opacity-80' : ''}`}
                  >
                    {isSynthesizing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Synthesizing...
                      </>
                    ) : isCurrentlyPlaying ? (
                      <>
                        <Volume2 className="w-4 h-4 animate-bounce" />
                        Stop Voice Sample
                      </>
                    ) : (
                      <>
                        <Play className="w-4.5 h-4.5 fill-current" />
                        Test Speech Voice
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* DYNAMIC CODE blueprint TERMINAL */}
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-900 px-4 py-2 bg-slate-950 rounded-t-xl border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-semibold text-slate-300 font-mono">Paid API Server Blueprints</span>
                </div>

                <div className="flex gap-2.5">
                  <button 
                    onClick={() => setSnippetLang('curl')}
                    className={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${
                      snippetLang === 'curl' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    cURL
                  </button>
                  <button 
                    onClick={() => setSnippetLang('nodejs')}
                    className={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${
                      snippetLang === 'nodejs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    NodeJS
                  </button>
                  <button 
                    onClick={() => setSnippetLang('python')}
                    className={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${
                      snippetLang === 'python' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Python
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 rounded-b-xl shadow-inner p-4 relative overflow-x-auto border border-slate-900 border-t-0">
                <button
                  onClick={() => handleCopyCode(getActiveCodeSnippet())}
                  className="absolute right-4 top-4 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded font-bold border border-slate-700 transition"
                >
                  {copied ? 'Copied✓' : 'Copy'}
                </button>
                <pre className="text-xs font-mono text-blue-300/90 whitespace-pre scrollbar-thin">
                  <code>{getActiveCodeSnippet()}</code>
                </pre>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed italic">
                * Note: Replace sample API keys in headers with your true credential values obtained securely from each voice provider's console.
              </p>
            </div>

          </div>
        </section>
      </main>

      {/* 4. EXPLANATION GRID (WHERE Android vs. Web gets its TTS) */}
      <section id="explanation" className="bg-white border-t border-b border-slate-200 py-12 px-6 md:px-12 mt-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display">
              The TTS Web Architecture Blueprint
            </h2>
            <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto">
              How the mobile app environment operates with local systems, and how your web environment operates with secure cloud micro-instances.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4">
              <span className="px-3 py-1 text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 rounded-full">
                Native Android Stack (Free)
              </span>
              <h3 className="text-lg font-bold text-slate-800 font-display">
                How STCodesApp Achieves High-Quality Free TTS
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Android allows developers to compile code that coordinates directly with standard services on-device. When you click play in STCodesApp, it does not communicate with expensive clouds.
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="flex gap-2 items-start text-xs text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-1.5 flex-shrink-0"></div>
                  <span>Uses device's stored <strong>Google TTS resource block</strong>.</span>
                </div>
                <div className="flex gap-2 items-start text-xs text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-1.5 flex-shrink-0"></div>
                  <span>Renders audio local-side on the telephone CPU, reducing bandwidth.</span>
                </div>
                <div className="flex gap-2 items-start text-xs text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-1.5 flex-shrink-0"></div>
                  <span>Provides instantaneous response without requiring server token exchanges.</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4">
              <span className="px-3 py-1 text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 rounded-full">
                Professional Web App Stack (Paid)
              </span>
              <h3 className="text-lg font-bold text-slate-800 font-display">
                How to Replicate Studio Quality on any Web Browser
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Browsers are extremely sandboxed. If a user visits your web application using Safari on iOS or Chrome on Linux, their native system speech synthetics may not contain genuine Tagalog voices. To build a robust web solution:
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="flex gap-2 items-start text-xs text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-1.5 flex-shrink-0"></div>
                  <span>Configure a standard Node backend with server-side proxy routes.</span>
                </div>
                <div className="flex gap-2 items-start text-xs text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-1.5 flex-shrink-0"></div>
                  <span>Trigger HTTP requests securely with your service token hidden safely inside server environment keys.</span>
                </div>
                <div className="flex gap-2 items-start text-xs text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-1.5 flex-shrink-0"></div>
                  <span>Stream beautiful, studio-grade neural Tagalog MP3 structures directly on web browsers securely.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SIDE-BY-SIDE API COMPARISON BENTO GRID */}
      <section id="bento" className="py-12 px-6 md:px-12 max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display text-center">
            Comprehensive Paid API Comparison
          </h2>
          <p className="text-slate-500 text-center max-w-xl mx-auto text-sm">
            Determine the ultimate developer choice for pricing, response times, and vocal pronunciation qualities of Filipino dialects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROVIDER_DETAILS.map((provider) => {
            const hasStarScore = Array.from({ length: 5 }, (_, i) => i < Math.floor(provider.qualityScore));
            return (
              <div key={provider.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative">
                {provider.id === 'google' && (
                  <span className="absolute top-4 right-4 bg-green-100 text-green-700 text-[10px] font-bold uppercase py-0.5 px-2 rounded-full">
                    Best Value
                  </span>
                )}
                {provider.id === 'elevenlabs' && (
                  <span className="absolute top-4 right-4 bg-pink-100 text-pink-700 text-[10px] font-bold uppercase py-0.5 px-2 rounded-full">
                    Studio Grade
                  </span>
                )}
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 font-display text-lg">{provider.displayName}</h3>
                    <p className="text-xs text-slate-400 truncate">{provider.name}</p>
                  </div>

                  <div className="pb-3 border-b border-slate-100">
                    <p className="text-xs text-slate-400 uppercase font-bold">Estimated Cost</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-slate-950 font-mono">${provider.pricePerMillion}</span>
                      <span className="text-xs text-slate-500 font-semibold uppercase font-display">/ Million Characters</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-medium bg-slate-50 p-2 rounded border border-slate-100">
                      <strong>Free Limit:</strong> {provider.freeLimit}
                    </p>
                  </div>

                  {/* Quality stars */}
                  <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg text-xs font-semibold">
                    <span className="text-slate-500">Latency Rating</span>
                    <span className="font-mono text-slate-800">{provider.latency}</span>
                  </div>

                  {/* High quality Pros/Cons */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pros</p>
                    <div className="space-y-1.5">
                      {provider.pros.map((p, idx) => (
                        <div key={idx} className="flex gap-2 items-start text-xs text-slate-600">
                          <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Cons</p>
                    <ul className="space-y-1.5">
                      {provider.cons.map((c, idx) => (
                        <li key={idx} className="flex gap-2 items-start text-xs text-slate-500">
                          <span className="text-rose-500 text-xs flex-shrink-0 mt-0.5">✕</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                  <div className="text-xs">
                    <span className="font-bold text-slate-700 block">Best Suited For:</span>
                    <p className="text-slate-500 leading-relaxed mt-0.5">{provider.recommendedFor}</p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* 6. STATIC BOTTOM PRICING PLAN CARDS (Matches requested layout) */}
      <section id="pricing" className="px-6 md:px-12 pb-12 max-w-7xl mx-auto">
        <h2 className="text-center font-extrabold text-slate-950 text-xl font-display mb-6 uppercase tracking-wider">
          Suggested Pricing Tier Configurations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex justify-between items-center shadow-xs">
            <div>
              <h3 className="font-black text-slate-800 font-display text-base">Free Starter</h3>
              <p className="text-xs text-slate-500 mt-1">10,000 chars / month (Local Native Free API)</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900">$0</span>
              <p className="text-[10px] text-slate-400 font-mono">FOREVER</p>
            </div>
          </div>
          
          <div className="bg-blue-600 rounded-2xl p-6 flex justify-between items-center shadow-lg shadow-blue-500/20 text-white border border-blue-500">
            <div>
              <h3 className="font-black font-display text-base">Pro Cloud API</h3>
              <p className="text-xs text-blue-100 mt-1">500,000 chars + Premium Cloud Neural Voices</p>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-0.5 text-white justify-end">
                <span className="text-2xl font-black">$49</span>
              </div>
              <p className="text-[10px] uppercase opacity-80 font-bold">per month</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex justify-between items-center shadow-xs">
            <div>
              <h3 className="font-black text-slate-800 font-display text-base">Enterprise Scale</h3>
              <p className="text-xs text-slate-500 mt-1">Custom character limits & Direct Dedicated SLAs</p>
            </div>
            <a 
              href="mailto:contact@vocalize.ph" 
              className="text-xs font-bold text-blue-600 border border-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-10 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Volume2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-200 font-display">Vocalize.ph</span>
            <span className="text-xs text-slate-600">• Premium Tagalog TTS</span>
          </div>
          <p className="text-xs text-slate-500">
            © 2026 Vocalize.ph. Dedicated strictly to high-fidelity audio system analysis and documentation tools.
          </p>
        </div>
      </footer>

    </div>
  );
}
