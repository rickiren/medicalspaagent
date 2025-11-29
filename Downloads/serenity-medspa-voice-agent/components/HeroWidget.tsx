import React, { useState, useEffect, useRef } from 'react';
import { Mic, Activity, AlertTriangle, User, Sparkles, CreditCard, Check, Lock } from 'lucide-react';
import Waveform from './Waveform';
import { Message, SimulationState, ConnectionStatus } from '../types';
import { useGeminiLive } from '../src/hooks/useGeminiLive';

const DEFAULT_MESSAGES: Message[] = [
  { id: '1', role: 'ai', text: "Good morning. I'm Cynthia, your scheduling assistant. How can I help you today?", timestamp: new Date() }
];

const DEMO_SCRIPT = [
  { role: 'user', text: "Do you have any openings for a Hydrafacial this Friday afternoon?", delay: 1500 },
  { role: 'system', action: 'analyze', delay: 1000 },
  { role: 'ai', text: "Checking the schedule... Yes, I have a slot at 2:00 PM and another at 4:30 PM. Which one works best?", delay: 2000 },
  { role: 'user', text: "4:30 PM is perfect. Is there any downtime?", delay: 2000 },
  { role: 'system', action: 'insight', delay: 800 },
  { role: 'ai', text: "No downtime at all—you'll be glowing immediately. Since you've had Dermaplaning before, would you like to add that on for $45?", delay: 3000 },
  { role: 'user', text: "Oh good idea, yes please add it.", delay: 1500 },
  { role: 'system', action: 'payment', delay: 1000 },
  { role: 'ai', text: "Great, I've added that. To secure the appointment, I just need to process the $50 deposit. Sending the link now.", delay: 2500 },
  { role: 'user', text: "Sure, go ahead and use the card ending in 4242.", delay: 2000 },
  { role: 'system', action: 'confirm', delay: 1200 },
  { role: 'ai', text: "Perfect, payment received! You're all set for Friday at 4:30 PM. I've sent the calendar invite.", delay: 3000 }
];

export const HeroWidget: React.FC = () => {
  // Modes: 'simulation' (default) or 'live' (real gemini)
  const [mode, setMode] = useState<'simulation' | 'live'>('simulation');
  const [messages, setMessages] = useState<Message[]>(DEFAULT_MESSAGES);
  const [simState, setSimState] = useState<SimulationState>({
    step: 0,
    isTyping: false,
    sentiment: 85,
    intent: 'General Inquiry',
    recommendation: null,
    alert: null,
    paymentActive: false,
    bookingConfirmed: false
  });

  // Handlers for real mode
  const handleTranscript = (text: string, isUser: boolean) => {
      // In a real app we'd debounce this or handle partials better
      // For now, we rely on Gemini's audio output mostly, but we can display the transcript
      setMessages(prev => {
        // Simple de-dupe logic or append
        const last = prev[prev.length - 1];
        if (last && last.role === (isUser ? 'user' : 'ai') && last.text === text) return prev;
        return [...prev, { 
            id: Date.now().toString(), 
            role: isUser ? 'user' : 'ai', 
            text, 
            timestamp: new Date() 
        }];
      });
  };

  const { status, connect, disconnect, isSpeaking: isLiveSpeaking, audioVolume } = useGeminiLive({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY, // Use Vite env var
    systemInstruction: "You are Cynthia, a sophisticated and warm AI booking agent for Lumina MedSpa. You help clients book treatments like Botox, Hydrafacials, and Lasers. Be concise, professional, and helpful. Current date: Friday Oct 24th.",
    onTranscript: handleTranscript
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat (only within the chat container, not the page)
  useEffect(() => {
    if (chatContainerRef.current && chatEndRef.current) {
      const container = chatContainerRef.current;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      
      // Only auto-scroll if user is near the bottom (within 100px)
      const isNearBottom = container.scrollTop + clientHeight >= scrollHeight - 100;
      
      if (isNearBottom) {
        container.scrollTo({
          top: scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages, simState.isTyping, simState.paymentActive, simState.bookingConfirmed]);

  // Simulation Loop
  useEffect(() => {
    if (mode !== 'simulation') return;

    let timeoutId: any;
    const currentScript = DEMO_SCRIPT[simState.step];

    if (!currentScript) {
        // Loop back after delay
        timeoutId = setTimeout(() => {
            setMessages(DEFAULT_MESSAGES);
            setSimState({
                step: 0,
                isTyping: false,
                sentiment: 85,
                intent: 'General Inquiry',
                recommendation: null,
                alert: null,
                paymentActive: false,
                bookingConfirmed: false
            });
        }, 8000);
        return () => clearTimeout(timeoutId);
    }

    const runStep = async () => {
      if (currentScript.role === 'system') {
        if (currentScript.action === 'analyze') {
             setSimState(prev => ({ ...prev, isTyping: true, intent: 'Checking Availability...' }));
             await new Promise(r => setTimeout(r, currentScript.delay));
             setSimState(prev => ({ 
                 ...prev, 
                 isTyping: false, 
                 step: prev.step + 1,
                 sentiment: 92,
                 intent: 'Booking Request',
                 alert: 'High Demand Slot'
            }));
        } else if (currentScript.action === 'insight') {
             setSimState(prev => ({ 
                 ...prev, 
                 recommendation: 'Add-on: Dermaplaning',
                 intent: 'Upselling',
                 step: prev.step + 1 
            }));
        } else if (currentScript.action === 'payment') {
            setSimState(prev => ({
                ...prev,
                paymentActive: true,
                intent: 'Processing Payment',
                recommendation: null, // Clear upsell
                step: prev.step + 1
            }));
        } else if (currentScript.action === 'confirm') {
             setSimState(prev => ({
                ...prev,
                paymentActive: false,
                bookingConfirmed: true,
                intent: 'Booking Confirmed',
                step: prev.step + 1
             }));
        }
      } else {
        // User or AI Message
        setSimState(prev => ({ ...prev, isTyping: currentScript.role === 'ai' }));
        await new Promise(r => setTimeout(r, currentScript.delay));
        
        setMessages(prev => [
            ...prev, 
            { 
                id: Date.now().toString(), 
                role: currentScript.role as any, 
                text: currentScript.text!, 
                timestamp: new Date() 
            }
        ]);
        setSimState(prev => ({ ...prev, isTyping: false, step: prev.step + 1 }));
      }
    };

    timeoutId = setTimeout(runStep, 500); // Small buffer before starting step

    return () => clearTimeout(timeoutId);
  }, [simState.step, mode]);

  const handleStartLive = () => {
      setMode('live');
      setMessages([{ id: 'init', role: 'ai', text: 'Hello! I am ready to listen. How can I help you with your appointment?', timestamp: new Date() }]);
      connect();
  };
  
  const activeVolume = mode === 'live' ? (isLiveSpeaking ? 0.6 : Math.min(audioVolume * 5, 0.8)) : (simState.isTyping ? 0.6 : 0);

  return (
    <div className="relative w-full max-w-md mx-auto">
        {/* Main Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl relative z-10 transition-all duration-500 hover:border-slate-500 hover:scale-[1.02] hover:shadow-[0_30px_60px_-15px_rgba(139,92,246,0.3)]">
            
            {/* Header */}
            <div className="bg-slate-800/60 backdrop-blur-sm p-4 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-800 animate-pulse"></div>
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-sm">Cynthia AI</h3>
                        <p className="text-xs text-slate-400 font-mono flex items-center gap-1">
                            {mode === 'simulation' ? (
                                <span className="text-emerald-400">• Online (Demo)</span>
                            ) : status === ConnectionStatus.CONNECTED ? (
                                <span className="text-red-400 animate-pulse">• LIVE AUDIO</span>
                            ) : (
                                <span>{status}</span>
                            )}
                        </p>
                    </div>
                </div>
                
                {/* Sentiment Pill */}
                <div className="hidden sm:flex items-center gap-2 bg-slate-800/70 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">Intent</span>
                    <span className="text-xs font-bold text-emerald-400">{mode === 'live' ? 'Dynamic' : simState.intent}</span>
                </div>
            </div>

            {/* Chat Area */}
            <div ref={chatContainerRef} className="h-[380px] p-5 overflow-y-auto no-scrollbar flex flex-col gap-4 relative bg-slate-900/50">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        {msg.role === 'ai' && (
                           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center mr-2 shrink-0 shadow-md border border-white/10 self-start">
                                <Sparkles className="w-3.5 h-3.5 text-white" />
                           </div>
                        )}
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            msg.role === 'user' 
                                ? 'bg-slate-800 text-slate-200 rounded-tr-none' 
                                : 'bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 text-indigo-100 rounded-tl-none backdrop-blur-md'
                        }`}>
                            {msg.text}
                        </div>
                        {msg.role === 'user' && (
                           <div className="w-8 h-8 rounded-full bg-slate-700/70 flex items-center justify-center ml-2 shrink-0 border border-white/10 self-start">
                                <User className="w-4 h-4 text-slate-400" />
                           </div>
                        )}
                    </div>
                ))}

                {/* Enhanced Typing Indicator */}
                {(simState.isTyping || status === ConnectionStatus.CONNECTING) && (
                    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 items-center mt-2">
                        <div className="relative mr-2 group self-start">
                             <div className="absolute inset-0 bg-violet-500/40 rounded-full blur-md animate-pulse"></div>
                             <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 border border-white/10 z-10">
                                <Sparkles className="w-3.5 h-3.5 text-white" />
                             </div>
                        </div>
                        
                        <div className="bg-slate-800/80 backdrop-blur-md border border-violet-500/30 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-3 shadow-xl">
                            <div className="flex gap-1.5 h-2 items-center">
                                <span className="w-2 h-2 bg-violet-400 rounded-full animate-[bounce_1s_infinite_-0.3s]"></span>
                                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-[bounce_1s_infinite_-0.15s]"></span>
                                <span className="w-2 h-2 bg-violet-400 rounded-full animate-[bounce_1s_infinite]"></span>
                            </div>
                            <span className="text-xs font-medium bg-gradient-to-r from-violet-200 to-indigo-200 bg-clip-text text-transparent animate-pulse">
                                {status === ConnectionStatus.CONNECTING ? 'Connecting...' : 'Cynthia is typing...'}
                            </span>
                        </div>
                    </div>
                )}
                
                {/* TOOL BADGE: Upsell Recommendation */}
                {simState.recommendation && mode === 'simulation' && (
                     <div className="mx-auto w-full mt-2 bg-gradient-to-r from-slate-800/90 to-slate-900/90 border-l-4 border-l-amber-400 rounded-r-lg p-3 shadow-lg animate-in zoom-in duration-500 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Opportunity Detected</span>
                            <span className="text-xs font-bold text-white">A+</span>
                        </div>
                        <div className="text-sm text-slate-300">
                            Client interest in facial treatments. <span className="text-white font-medium">Upsell: {simState.recommendation}</span>
                        </div>
                     </div>
                )}

                {/* TOOL BADGE: Payment Request */}
                {simState.paymentActive && mode === 'simulation' && (
                     <div className="mx-auto w-full mt-2 bg-gradient-to-r from-slate-800/90 to-slate-900/90 border-l-4 border-l-blue-500 rounded-r-lg p-3 shadow-lg animate-in zoom-in duration-500 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-1">
                             <div className="p-1 bg-blue-500/20 rounded">
                                 <Lock className="w-3 h-3 text-blue-400" />
                             </div>
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Payment Request</span>
                        </div>
                        <div className="flex items-center justify-between mt-2 bg-slate-950/70 p-2 rounded border border-white/10">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-slate-400" />
                                <span className="text-xs text-slate-300">Deposit: Hydrafacial</span>
                            </div>
                            <span className="text-sm font-bold text-white">$50.00</span>
                        </div>
                        <div className="mt-2 text-[10px] text-center text-slate-500 animate-pulse">Waiting for customer authorization...</div>
                     </div>
                )}

                {/* TOOL BADGE: Booking Confirmed */}
                {simState.bookingConfirmed && mode === 'simulation' && (
                     <div className="mx-auto w-full mt-2 bg-gradient-to-r from-slate-800/90 to-slate-900/90 border-l-4 border-l-emerald-500 rounded-r-lg p-3 shadow-lg animate-in zoom-in duration-500 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-1">
                             <div className="p-1 bg-emerald-500/20 rounded-full">
                                 <Check className="w-3 h-3 text-emerald-400" />
                             </div>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Booking Confirmed</span>
                        </div>
                        <div className="text-sm text-slate-300 mt-1">
                            Appointment synced with <span className="text-white font-medium">Zenoti</span>. Confirmation email sent.
                        </div>
                     </div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Bottom Controls / Visualizer */}
            <div className="bg-slate-800/60 backdrop-blur-sm p-4 border-t border-white/10 relative overflow-hidden">
                {/* Visualizer Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-violet-500/20 blur-[50px] rounded-full pointer-events-none"></div>

                <div className="relative z-10 flex flex-col gap-4">
                    {/* Floating Alert (Simulated) */}
                    {simState.alert && mode === 'simulation' && (
                        <div className="absolute -top-16 left-0 bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-200 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 animate-in slide-in-from-left-4 fade-in">
                            <AlertTriangle className="w-3 h-3 text-red-400" />
                            {simState.alert}
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-4">
                         {/* Input Area (Mock or Real) */}
                         <div className="flex-1 bg-slate-950/70 rounded-xl h-12 px-4 flex items-center border border-white/10 transition-colors focus-within:border-violet-500/50">
                            {mode === 'simulation' ? (
                                <span className="text-slate-500 text-sm truncate">Cynthia is listening...</span>
                            ) : (
                                <span className="text-emerald-400 text-sm truncate animate-pulse">Listening to your voice...</span>
                            )}
                         </div>

                         {/* Mic Button / Visualizer */}
                         <button 
                            onClick={mode === 'simulation' ? handleStartLive : disconnect}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg ${
                                mode === 'live' && status === ConnectionStatus.CONNECTED
                                ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
                                : 'bg-violet-600 text-white hover:bg-violet-500 hover:scale-105 shadow-violet-500/25'
                            }`}
                         >
                            {mode === 'live' && status === ConnectionStatus.CONNECTED ? (
                                <Activity className="w-5 h-5 animate-pulse" />
                            ) : (
                                <Mic className="w-5 h-5" />
                            )}
                         </button>
                    </div>

                    {/* Audio Waveform */}
                    <div className="flex items-center justify-center pt-1 h-8">
                        <Waveform isActive={mode === 'simulation' ? simState.isTyping || simState.step % 2 === 1 : status === ConnectionStatus.CONNECTED} />
                    </div>
                </div>
            </div>
        </div>

        {/* Decorative Background Elements behind the card */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-600/30 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  );
};

