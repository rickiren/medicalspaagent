import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, ConnectionState, BookingDetails, BusinessConfig } from '../types';
import { normalizeBusinessConfig } from '../utils/businessConfig';
import { decodeBase64, decodeAudioData, createPCMBlob } from '../utils/audioUtils';
import { generateSystemPrompt } from '../utils/generateSystemPrompt';
import { handleBookingRequest } from '../utils/bookingHandler';
import Visualizer from './Visualizer';

// --- Assets ---
// Placeholder image for the agent - using a more neutral/professional portrait
const AGENT_AVATAR = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop";

type JsonSchema = {
  type: 'object';
  properties: Record<string, { type: 'string'; description?: string }>;
  required?: string[];
};

type FunctionDeclaration = {
  name: string;
  description: string;
  parameters: JsonSchema;
};

type OpenAIRealtimeEvent = {
  type: string;
  [key: string]: any;
};

// Helper to create booking function from config
const createBookingFunction = (config: BusinessConfig): FunctionDeclaration => {
  const bookingType = config.booking.type;
  const servicesList = config.services.map(s => s.name).join(', ');
  
  let bookingDescription = `Book a service appointment. Available services: ${servicesList}.`;
  
  // Add booking type-specific information
  if (bookingType === 'mock') {
    bookingDescription += ' This will create a mock booking confirmation.';
  } else if (bookingType === 'calendly') {
    bookingDescription += ` Complete booking through Calendly at: ${config.booking.calendarUrl || 'the booking page'}.`;
  } else if (bookingType === 'custom') {
    bookingDescription += ' Booking will be processed through our custom system.';
  }
  
  return {
    name: 'bookAppointment',
    description: bookingDescription,
    parameters: {
      type: 'object',
      properties: {
        service: { type: 'string', description: 'The service to book.' },
        date: { type: 'string', description: 'The date of the appointment (YYYY-MM-DD).' },
        time: { type: 'string', description: 'The time of the appointment (HH:MM).' },
        customerName: { type: 'string', description: 'Name of the customer.' }
      },
      required: ['service', 'date', 'time']
    }
  };
};

const requestCameraFunction: FunctionDeclaration = {
  name: 'requestCamera',
  description: 'Request the user to turn on their camera for a visual skin or body analysis.',
  parameters: {
    type: 'object',
    properties: {
      reason: { type: 'string', description: 'The reason for requesting the camera.' }
    }
  }
};

interface VoiceWidgetProps {
  businessId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const VoiceWidget: React.FC<VoiceWidgetProps> = ({ businessId, open: controlledOpen, onOpenChange }) => {
  // --- State ---
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = (value: boolean) => {
    if (controlledOpen !== undefined) {
      onOpenChange?.(value);
    } else {
      setInternalOpen(value);
    }
  };
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentVolume, setCurrentVolume] = useState(0);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [cameraRequestOpen, setCameraRequestOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  
  // --- Refs ---
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pendingAssistantIdRef = useRef<string | null>(null);
  const toolCallBuffersRef = useRef<Record<string, string>>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Flag to temporarily suppress mic input when user sends text
  const audioInputSubduedRef = useRef<boolean>(false);
  const subduedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoIntervalRef = useRef<number | null>(null);

  // --- Scroll to bottom helper ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, cameraRequestOpen]);

  // Load business config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        let config: BusinessConfig;
        
        if (businessId) {
          // Load from backend API
          const response = await fetch(`/api/business/${businessId}/config`);
          if (!response.ok) {
            throw new Error(`Failed to fetch config: ${response.statusText}`);
          }
          config = normalizeBusinessConfig(await response.json());
        } else {
          // Load from local config file
          const response = await fetch('/businessConfig.json');
          config = normalizeBusinessConfig(await response.json());
        }
        
        setBusinessConfig(config);
        setConfigLoading(false);
      } catch (error) {
        console.error('Failed to load business config:', error);
        setConfigLoading(false);
      }
    };

    loadConfig();
  }, [businessId]);

  // --- Audio Output Helper ---
  const stopAudioPlayback = useCallback(() => {
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  // --- Cleanup ---
  const stopSession = useCallback(() => {
    // Stop Audio Processing
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }
    if (inputSourceRef.current) {
      inputSourceRef.current.disconnect();
      inputSourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    stopAudioPlayback();
    
    if (outputContextRef.current) {
      outputContextRef.current.close();
      outputContextRef.current = null;
    }

    // Stop Video
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(track => track.stop());
      videoStreamRef.current = null;
    }
    if (videoIntervalRef.current) {
      window.clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = null;
    }
    setIsVideoActive(false);
    setCameraRequestOpen(false);

    // Reset Subdued State
    audioInputSubduedRef.current = false;
    if (subduedTimeoutRef.current) {
      clearTimeout(subduedTimeoutRef.current);
      subduedTimeoutRef.current = null;
    }

    // Close OpenAI session
    if (wsRef.current) {
      try { wsRef.current.close(); } catch(e) { console.warn("Session close error", e); }
      wsRef.current = null;
    }
    pendingAssistantIdRef.current = null;
    toolCallBuffersRef.current = {};

    setConnectionState(ConnectionState.DISCONNECTED);
  }, [stopAudioPlayback]);

  // --- Video Handling ---
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      videoStreamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setIsVideoActive(true);
      setCameraRequestOpen(false); // Close request modal if open

      // Start sending frames
      videoIntervalRef.current = window.setInterval(() => {
        captureAndSendFrame();
      }, 500); // 2 FPS is sufficient for basic analysis and saves bandwidth

    } catch (err) {
      console.error("Failed to access camera", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopVideo = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(track => track.stop());
      videoStreamRef.current = null;
    }
    if (videoIntervalRef.current) {
      window.clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsVideoActive(false);
  };

  const captureAndSendFrame = () => {
    if (!videoRef.current || !canvasRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Draw video frame to canvas
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);

    // Convert to base64 jpeg
    const base64Data = canvasRef.current.toDataURL('image/jpeg', 0.6).split(',')[1];

    try {
      wsRef.current.send(JSON.stringify({
        type: 'input_image',
        image: {
          data: base64Data,
          mime_type: 'image/jpeg'
        }
      }));
    } catch (e) {
      console.error("Error sending frame:", e);
    }
  };

  const sendJson = useCallback((payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  const appendUserMessage = useCallback((text: string) => {
    if (!text) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString() + 'user',
      role: 'user',
      text,
      timestamp: new Date()
    }]);
  }, []);

  const appendAssistantMessage = useCallback((text: string) => {
    if (!text) return;
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last && last.role === 'assistant' && last.id === pendingAssistantIdRef.current) {
        return [...prev.slice(0, -1), { ...last, text: last.text + text }];
      }
      const id = Date.now().toString() + 'ai';
      pendingAssistantIdRef.current = id;
      return [...prev, { id, role: 'assistant', text, timestamp: new Date() }];
    });
  }, []);

  const handleToolCall = useCallback((name: string, toolCallId: string, argsRaw: any) => {
    if (!businessConfig) return;

    let parsedArgs: any = argsRaw;
    if (typeof argsRaw === 'string') {
      try { parsedArgs = JSON.parse(argsRaw); } catch (e) { parsedArgs = argsRaw; }
    }

    if (name === 'bookAppointment') {
      const bookingResult = handleBookingRequest(businessConfig, parsedArgs as BookingDetails);
      setMessages(prev => [...prev, {
        id: Date.now().toString() + 'sys',
        role: 'system',
        text: bookingResult.message,
        timestamp: new Date()
      }]);

      sendJson({
        type: 'input_tool_output',
        tool_call_id: toolCallId,
        output: JSON.stringify({
          success: bookingResult.success,
          confirmationId: bookingResult.confirmationId,
          message: bookingResult.message
        })
      });
    } else if (name === 'requestCamera') {
      setCameraRequestOpen(true);
      sendJson({
        type: 'input_tool_output',
        tool_call_id: toolCallId,
        output: JSON.stringify({ result: 'Camera prompt shown to user' })
      });
    }
  }, [businessConfig, sendJson]);

  const handleServerEvent = useCallback(async (event: OpenAIRealtimeEvent) => {
    switch (event.type) {
      case 'response.created':
        pendingAssistantIdRef.current = null;
        break;
      case 'response.output_text.delta':
        appendAssistantMessage(event.delta || event.text || '');
        break;
      case 'response.output_audio.delta': {
        const audioData = event.delta || event.audio || event.output_audio;
        if (audioData && outputContextRef.current) {
          audioInputSubduedRef.current = false;
          const ctx = outputContextRef.current;
          nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

          try {
            const audioBuffer = await decodeAudioData(decodeBase64(audioData), ctx, 24000);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          } catch (err) {
            console.error('Failed to play audio chunk', err);
          }
        }
        break;
      }
      case 'input_audio_buffer.speech_started':
        stopAudioPlayback();
        break;
      case 'conversation.item.input_audio_transcription.completed':
        appendUserMessage(event.transcript || event.text || '');
        break;
      case 'response.output_tool_calls': {
        const calls = event.output_tool_calls || event.tool_calls || [];
        calls.forEach((tc: any) => {
          handleToolCall(tc.name, tc.id, tc.arguments || tc.args || tc.input);
        });
        break;
      }
      case 'response.output_tool_call.delta': {
        const call = event.delta?.tool_call || event.tool_call;
        if (call?.id) {
          const existing = toolCallBuffersRef.current[call.id] || '';
          const next = existing + (call.arguments ?? call.args ?? '');
          toolCallBuffersRef.current[call.id] = next;
          if (call.status === 'completed' || call.is_final) {
            handleToolCall(call.name, call.id, next);
            delete toolCallBuffersRef.current[call.id];
          }
        }
        break;
      }
      case 'response.error':
      case 'error':
        console.error("[VOICE-WIDGET] ❌ OpenAI Live Error:", event);
        setConnectionState(ConnectionState.ERROR);
        alert(`OpenAI Live connection error: ${event.error?.message || event.message || 'Unknown error'}. Check console for details.`);
        stopSession();
        break;
      default:
        break;
    }
  }, [appendAssistantMessage, appendUserMessage, handleToolCall, stopAudioPlayback, stopSession]);

  // --- Connection Handler ---
  const connectToOpenAI = async () => {
    try {
      if (!businessConfig) {
        throw new Error("Business config not loaded yet.");
      }

      setConnectionState(ConnectionState.CONNECTING);
      setMessages([]);

      // Determine the correct proxy URLs based on environment (HTTP for session fetch, WS for live audio)
      let httpProxyUrl: string;
      let wsProxyUrl: string;
      
      // Check for explicit environment variable override
      const envProxy = import.meta.env.VITE_OPENAI_REALTIME_URL || (import.meta.env as any).VITE_OPENAI_PROXY_URL;
      const isLocalDev = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1' ||
                          window.location.hostname.includes('localhost');

      if (envProxy) {
        if (envProxy.startsWith('ws')) {
          wsProxyUrl = envProxy;
          httpProxyUrl = envProxy.replace(/^ws/, 'http');
        } else {
          httpProxyUrl = envProxy;
          wsProxyUrl = envProxy.replace(/^http/, 'ws');
        }
      } else if (isLocalDev) {
        // Use Firebase Functions emulator URL for local development
        httpProxyUrl = 'http://127.0.0.1:5001/gen-lang-client-0046334557/us-central1/openaiRealtimeProxy';
        wsProxyUrl = 'ws://127.0.0.1:5001/gen-lang-client-0046334557/us-central1/openaiRealtimeProxy';
      } else {
        // Production: use the rewrite URL via Firebase Hosting
        const baseUrl = `${window.location.protocol}//${window.location.host}/api/openai-realtime-proxy`;
        httpProxyUrl = baseUrl;
        wsProxyUrl = baseUrl.replace(/^http/, 'ws');
      }
      
      console.log('[VOICE-WIDGET] 🔌 Connecting to OpenAI Live...');
      console.log('[VOICE-WIDGET] 📍 HTTP URL (session):', httpProxyUrl);
      console.log('[VOICE-WIDGET] 📍 WS URL (proxy):', wsProxyUrl);
      console.log('[VOICE-WIDGET] 🌐 Hostname:', window.location.hostname);
      console.log('[VOICE-WIDGET] 🔧 Is Local Dev:', isLocalDev);
      console.log('[VOICE-WIDGET] 🪪 Fetching session/client_id from proxy...');

      const sessionResponse = await fetch(httpProxyUrl, { method: 'POST' });
      if (!sessionResponse.ok) {
        throw new Error(`Proxy session request failed: ${sessionResponse.status} ${sessionResponse.statusText}`);
      }
      const session = await sessionResponse.json();
      const clientId = session?.client_id || session?.clientId || (crypto as any).randomUUID?.() || `client-${Date.now()}`;

      const connectionUrl = `${wsProxyUrl}?client_id=${encodeURIComponent(clientId)}`;
      console.log('[VOICE-WIDGET] 🚀 Creating WebSocket connection...');
      console.log('[VOICE-WIDGET] 🪪 client_id:', clientId);
      console.log('[VOICE-WIDGET] 📍 Final WS URL:', connectionUrl);

      const ws = new WebSocket(connectionUrl);
      console.log('[VOICE-WIDGET] 📡 WebSocket created, readyState:', ws.readyState, '(0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED)');
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = async () => {
        console.log('[VOICE-WIDGET] ✅ OpenAI Live connection opened!');
        setConnectionState(ConnectionState.CONNECTED);

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
        outputContextRef.current = new AudioContextClass({ sampleRate: 24000 });

        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = audioStream;
        } catch (err) {
          console.error('Failed to access microphone', err);
          alert('Could not access microphone. Please check permissions.');
          stopSession();
          return;
        }

        const systemPrompt = generateSystemPrompt(businessConfig);
        const bookingFunction = createBookingFunction(businessConfig);

        sendJson({
          type: 'session.update',
          session: {
            instructions: systemPrompt,
            modalities: ['text', 'audio'],
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            voice: 'alloy',
            tool_choice: 'auto',
            turn_detection: { type: 'server_vad', threshold: 0.5, silence_duration_ms: 700, create_response: true },
            tools: [
              {
                name: bookingFunction.name,
                description: bookingFunction.description,
                parameters: bookingFunction.parameters
              },
              {
                name: requestCameraFunction.name,
                description: requestCameraFunction.description,
                parameters: requestCameraFunction.parameters
              }
            ]
          }
        });

        // Audio Pipeline
        if (!audioContextRef.current || !streamRef.current) return;

        inputSourceRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current);
        processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

        processorRef.current.onaudioprocess = (e) => {
          if (audioInputSubduedRef.current || wsRef.current?.readyState !== WebSocket.OPEN) return;

          const inputData = e.inputBuffer.getChannelData(0);
          const pcmBlob = createPCMBlob(inputData, audioContextRef.current?.sampleRate || 24000);

          sendJson({ type: 'input_audio_buffer.append', audio: pcmBlob.data });

          let sum = 0;
          for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
          setCurrentVolume(Math.sqrt(sum / inputData.length));
        };

        inputSourceRef.current.connect(processorRef.current);
        processorRef.current.connect(audioContextRef.current.destination);
      };

      ws.onmessage = (event) => {
        try {
          const textData = typeof event.data === 'string'
            ? event.data
            : new TextDecoder().decode(event.data as ArrayBuffer);
          const payload: OpenAIRealtimeEvent = JSON.parse(textData);
          handleServerEvent(payload);
        } catch (err) {
          console.error('[VOICE-WIDGET] Failed to process server event', err);
        }
      };

      ws.onclose = (event) => {
        console.log('[VOICE-WIDGET] 🔌 WebSocket closed', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        setConnectionState(ConnectionState.DISCONNECTED);
      };

      ws.onerror = (err) => {
        console.error("[VOICE-WIDGET] ❌ OpenAI Live WebSocket Error:", err);
        console.error("[VOICE-WIDGET] ❌ Failed URL:", connectionUrl);
        console.error("[VOICE-WIDGET] ❌ WebSocket readyState:", ws.readyState);
        setConnectionState(ConnectionState.ERROR);
        alert(`OpenAI Live connection error. Check console for details. URL: ${connectionUrl}`);
        stopSession();
      };
    } catch (error: any) {
      console.error("[VOICE-WIDGET] ❌ Connection failed:", error);
      const errorMsg = error?.message || 'Unknown connection error';
      alert(`Failed to connect to OpenAI Live: ${errorMsg}. Check console for details.`);
      setConnectionState(ConnectionState.ERROR);
    }
  };

  const handleToggle = () => {
      if (isOpen) {
          stopSession();
          setIsOpen(false);
      } else {
          setIsOpen(true);
      }
  };

  const handleMicClick = () => {
      if (connectionState === ConnectionState.CONNECTED) {
          stopSession();
      } else {
          if (!businessConfig) {
              alert('Business configuration is still loading. Please wait a moment.');
              return;
          }
          connectToOpenAI();
      }
  };

  const handleAllowCamera = () => {
      startVideo();
  };

  const handleDenyCamera = () => {
      setCameraRequestOpen(false);
  };

  const handleSendText = () => {
      if (!inputText.trim() || connectionState !== ConnectionState.CONNECTED || !wsRef.current) return;
      
      const text = inputText.trim();
      
      appendUserMessage(text);
      setInputText('');
      stopAudioPlayback();
      audioInputSubduedRef.current = true;
      
      if (subduedTimeoutRef.current) clearTimeout(subduedTimeoutRef.current);
      subduedTimeoutRef.current = setTimeout(() => {
          audioInputSubduedRef.current = false;
      }, 1500);

      sendJson({ type: 'input_text', text });
      sendJson({ type: 'response.create', response: { modalities: ['text', 'audio'] } });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          handleSendText();
      }
  };

  return (
    <>
        {/* Floating Action Button */}
        {!isOpen && (
            <button 
                onClick={handleToggle}
                className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 hover:bg-black text-white rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center group border border-white/10"
            >
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:animate-pulse">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>
                </svg>
            </button>
        )}

        {/* Widget Modal */}
        {isOpen && (
            <div className="fixed bottom-6 right-6 z-50 w-[360px] md:w-[380px] h-[640px] flex flex-col glass-panel rounded-3xl shadow-2xl animate-[fadeIn_0.3s_ease-out] overflow-hidden border border-white/40 font-sans ring-1 ring-black/5">
                
                {/* Header */}
                <div className="bg-white/80 p-5 border-b border-slate-100 flex items-center justify-between backdrop-blur-md z-10 relative">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <img src={AGENT_AVATAR} alt="Agent" className="w-12 h-12 rounded-full border border-slate-100 object-cover shadow-sm" />
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${connectionState === ConnectionState.CONNECTED ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        </div>
                        <div className="flex flex-col">
                            <h3 className="font-serif text-lg font-bold text-slate-900 leading-none mb-1">
                                {businessConfig?.aiPersonality?.identity || 'Serena'}
                            </h3>
                            <div className="flex items-center space-x-2">
                                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                                    {businessConfig?.name || 'AI Concierge'}
                                </p>
                                {connectionState === ConnectionState.CONNECTED && (
                                     <div className="scale-75 origin-left opacity-60"><Visualizer isActive={true} color="#1e293b" /></div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {connectionState === ConnectionState.CONNECTED && (
                             <button 
                                onClick={stopSession} 
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-500 transition-all"
                                title="End Session"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"/></svg>
                             </button>
                        )}
                        <button onClick={handleToggle} className="w-9 h-9 flex items-center justify-center rounded-full bg-transparent hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>

                {/* Main Content Area: Video or Chat */}
                <div className="flex-1 overflow-hidden relative bg-slate-50/50">
                    
                    {/* Hidden Elements for Video Processing */}
                    <video ref={videoRef} className="hidden" playsInline muted autoPlay />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Camera Active View */}
                    {isVideoActive && (
                        <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
                            {/* Mirror the video so it feels natural */}
                            <video 
                                ref={ref => {
                                    if (ref && videoStreamRef.current) ref.srcObject = videoStreamRef.current;
                                }}
                                className="w-full h-full object-cover transform -scale-x-100 opacity-90"
                                autoPlay 
                                muted 
                                playsInline 
                            />
                            <div className="absolute top-4 left-0 right-0 flex justify-center">
                                <span className="bg-black/60 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wider backdrop-blur-md border border-white/10 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                    LIVE ANALYSIS
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Chat Area */}
                    <div className={`absolute inset-0 overflow-y-auto p-6 space-y-6 no-scrollbar scroll-smooth z-10 ${isVideoActive ? 'bg-gradient-to-t from-black/80 via-transparent to-transparent pt-32' : ''}`}>
                        
                        {messages.length === 0 && connectionState !== ConnectionState.CONNECTED && (
                             <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                                    {configLoading ? (
                                        <svg className="animate-spin h-8 w-8 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                                    )}
                                </div>
                                <h4 className="font-serif text-2xl text-slate-800 mb-2">
                                    {configLoading ? 'Loading...' : 'Welcome'}
                                </h4>
                                <p className="text-slate-500 text-sm leading-relaxed max-w-[200px]">
                                    {configLoading 
                                        ? 'Setting up your experience...'
                                        : `I am ${businessConfig?.aiPersonality?.identity || 'your AI assistant'}. How may I assist you today?`
                                    }
                                </p>
                             </div>
                        )}
                        
                        {messages.map((msg, idx) => (
                            <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.3s_ease-out]`}>
                                <div className={`max-w-[85%] px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${
                                    msg.role === 'user' 
                                        ? 'bg-slate-900 text-white rounded-2xl rounded-br-none' 
                                        : msg.role === 'system'
                                        ? 'bg-transparent text-slate-500 border border-slate-200/50 rounded-xl w-full text-center text-xs font-medium py-2'
                                        : isVideoActive 
                                            ? 'bg-white/90 backdrop-blur-md text-slate-900 rounded-2xl rounded-bl-none border border-white/50'
                                            : 'bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-bl-none'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} className="h-2" />
                    </div>

                    {/* Camera Permission Request Overlay */}
                    {cameraRequestOpen && !isVideoActive && (
                        <div className="absolute inset-0 z-20 flex items-end justify-center pb-6 px-4 bg-slate-900/10 backdrop-blur-[2px] animate-[fadeIn_0.3s]">
                            <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm mx-auto border border-slate-100 ring-1 ring-black/5">
                                <div className="flex items-start space-x-4 mb-5">
                                    <div className="bg-slate-100 p-3 rounded-full text-slate-900">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-base">Allow Camera Access?</h4>
                                        <p className="text-sm text-slate-500 mt-1 leading-normal">Serena requires camera access to perform a personalized visual analysis.</p>
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <button onClick={handleDenyCamera} className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">Decline</button>
                                    <button onClick={handleAllowCamera} className="flex-1 py-3 px-4 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-black shadow-lg transition-colors">Allow Camera</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls Area */}
                <div className="p-4 bg-white border-t border-slate-100 z-20">
                     
                     {connectionState === ConnectionState.CONNECTED ? (
                        /* Connected: Chat Interface */
                        <div className="flex items-center space-x-3">
                            {/* Camera Toggle */}
                             <button 
                                onClick={isVideoActive ? stopVideo : startVideo}
                                className={`p-3 rounded-full transition-all flex items-center justify-center ${
                                    isVideoActive ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                                title={isVideoActive ? "Turn Camera Off" : "Turn Camera On"}
                             >
                                {isVideoActive ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                                )}
                             </button>

                             {/* Text Input */}
                             <div className="flex-1 relative">
                                <input 
                                    type="text" 
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type your message..."
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-[15px] rounded-full py-3.5 px-5 pl-5 pr-10 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all placeholder:text-slate-400"
                                />
                             </div>

                             {/* Send Button */}
                             <button 
                                onClick={handleSendText}
                                disabled={!inputText.trim()}
                                className={`p-3.5 rounded-full transition-all shadow-sm flex items-center justify-center transform ${
                                    inputText.trim() 
                                    ? 'bg-slate-900 text-white hover:bg-black hover:scale-105 active:scale-95' 
                                    : 'bg-slate-100 text-slate-300'
                                }`}
                             >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                             </button>
                        </div>
                     ) : (
                        /* Disconnected: Start Button */
                        <div className="flex flex-col items-center space-y-4">
                            <button 
                                onClick={handleMicClick}
                                className="w-full py-4 px-6 rounded-2xl flex items-center justify-center space-x-3 font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 bg-slate-900 text-white hover:bg-black border border-white/10"
                            >
                                {connectionState === ConnectionState.CONNECTING ? (
                                    <span className="animate-pulse flex items-center gap-2">
                                        <span className="w-2 h-2 bg-white rounded-full"></span>
                                        Connecting...
                                    </span>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                                        <span>Start Conversation</span>
                                    </>
                                )}
                             </button>
                             <div className="flex items-center space-x-2 opacity-30 hover:opacity-60 transition-all duration-500">
                                 <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-500">O</span>
                                 <p className="text-[10px] text-slate-500 font-medium tracking-wide">Powered by OpenAI Live</p>
                             </div>
                        </div>
                     )}
                </div>
            </div>
        )}
    </>
  );
};

export default VoiceWidget;
