import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import VoiceWidget from './components/VoiceWidget';
import { HeroWidget } from './components/HeroWidget';
import Dashboard from './components/Dashboard';
import BusinessPreviewPage from './components/BusinessPreviewPage';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import HIPAACompliance from './components/HIPAACompliance';
import Security from './components/Security';
import { SEOHead } from './components/SEOHead';
import CynthiaLogo from './components/CynthiaLogo';

// Type declaration for Cal.com
declare global {
  interface Window {
    Cal?: any;
  }
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDashboard, setShowDashboard] = useState(false);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const calScriptLoaded = useRef(false);

  // Don't show dashboard if we're on a business preview page
  const isPreviewPage = location.pathname.startsWith('/business/');

  if (showDashboard && !isPreviewPage) {
    return <Dashboard onBack={() => setShowDashboard(false)} />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#1a1a1f] text-[#FDF8F7] selection:bg-[#C06C84]/30 font-sans">
      <SEOHead />

      {/* --- Navigation --- */}
      <nav className="relative z-50 w-full px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
          <CynthiaLogo size="medium" />
          <div className="flex items-center gap-3">
              <button
                  onClick={() => setShowDashboard(true)}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(232, 180, 184, 0.1)', color: '#FDF8F7' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
              >
                  Dashboard
              </button>
              <button className="hidden md:block px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(232, 180, 184, 0.1)', color: '#FDF8F7' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
              >
                  Login
              </button>
          </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="relative z-10 px-6 pt-12 md:pt-24 max-w-7xl mx-auto flex flex-col items-center">
        
        {/* --- Hero Section --- */}
        <section className="mb-32 w-full animate-fade-in-up">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12 w-full">
                {/* Left Side - Text Content */}
                <div className="flex-1 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C06C84]/10 border border-[#C06C84]/20 text-[#E8B4B8] text-xs font-semibold tracking-wide uppercase mb-8 animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8B4B8] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C06C84]"></span>
                        </span>
                        OpenAI Live Powered
                    </div>

                    <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
                        Your New 24/7 AI <br/>
                        <span className="text-transparent bg-clip-text" style={{
                          backgroundImage: 'linear-gradient(135deg, #C06C84 0%, #E8B4B8 50%, #D4919A 100%)'
                        }}>Medical Spa Receptionist</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-[#E8B4B8]/60 mb-12 max-w-3xl mx-auto lg:mx-0 leading-relaxed">
                        Increase bookings, answer questions instantly, and impress every visitor — powered by your spa's real services, pricing, and treatments. <br/>
                        <span className="text-[#FDF8F7] font-medium">Fully custom to your business. Installed in 30 seconds.</span>
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <button 
                            onClick={() => setWidgetOpen(true)}
                            className="px-8 py-4 rounded-xl text-[#FDF8F7] font-semibold text-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                            style={{
                              background: 'linear-gradient(135deg, #C06C84 0%, #E8B4B8 50%, #D4919A 100%)',
                              boxShadow: '0 0 40px rgba(192, 108, 132, 0.5)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.boxShadow = '0 0 50px rgba(192, 108, 132, 0.7)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.boxShadow = '0 0 40px rgba(192, 108, 132, 0.5)';
                            }}
                        >
                            <span>Get Your Free AI Receptionist Demo</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </button>
                    </div>
                </div>

                {/* Right Side - Hero Widget */}
                <div className="flex-1 flex justify-center lg:justify-end w-full lg:w-auto">
                    <HeroWidget />
                </div>
            </div>
        </section>

        {/* --- ROI / Business Impact Section --- */}
        <section id="roi" className="w-full mb-32 max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="font-display text-3xl md:text-5xl font-bold text-[#FDF8F7] mb-6">Turn Your Website Into a Revenue Engine</h2>
                <p className="text-[#E8B4B8]/60 max-w-2xl mx-auto text-lg">
                    Stop losing money to "Contact Us" forms. Cynthia.ai captures the <span className="text-[#FDF8F7] font-bold">60% of traffic</span> that lands after hours.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Stat 1 */}
                <div className="glass-card p-8 rounded-3xl text-center group transition-all duration-500" style={{ borderColor: 'rgba(232, 180, 184, 0.2)' }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(192, 108, 132, 0.1)', border: '1px solid rgba(192, 108, 132, 0.2)' }}>
                        💰
                    </div>
                    <div className="text-4xl font-bold text-[#FDF8F7] mb-2 group-hover:text-[#E8B4B8] transition-colors">+$5k</div>
                    <p className="text-[#E8B4B8]/60 text-sm uppercase tracking-wider font-semibold">Monthly Revenue Added</p>
                    <p className="text-[#E8B4B8]/40 text-sm mt-4 leading-relaxed">
                        By capturing missed calls and booking leads instantly when staff are unavailable.
                    </p>
                </div>

                {/* Stat 2 */}
                <div className="glass-card p-8 rounded-3xl text-center group transition-all duration-500" style={{ borderColor: 'rgba(232, 180, 184, 0.2)' }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(192, 108, 132, 0.1)', border: '1px solid rgba(192, 108, 132, 0.2)' }}>
                        ⚡
                    </div>
                    <div className="text-4xl font-bold text-[#FDF8F7] mb-2 group-hover:text-[#E8B4B8] transition-colors">0.4s</div>
                    <p className="text-[#E8B4B8]/60 text-sm uppercase tracking-wider font-semibold">Average Response Time</p>
                    <p className="text-[#E8B4B8]/40 text-sm mt-4 leading-relaxed">
                        Compared to the industry average of 4 hours. Speed to lead is everything.
                    </p>
                </div>

                {/* Stat 3 */}
                <div className="glass-card p-8 rounded-3xl text-center group transition-all duration-500" style={{ borderColor: 'rgba(232, 180, 184, 0.2)' }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(192, 108, 132, 0.1)', border: '1px solid rgba(192, 108, 132, 0.2)' }}>
                        🛍️
                    </div>
                    <div className="text-4xl font-bold text-[#FDF8F7] mb-2 group-hover:text-[#E8B4B8] transition-colors">30%</div>
                    <p className="text-[#E8B4B8]/60 text-sm uppercase tracking-wider font-semibold">Increase in Upsells</p>
                    <p className="text-[#E8B4B8]/40 text-sm mt-4 leading-relaxed">
                        Cynthia.ai suggests add-ons ("Botox with Lip Flip") and memberships during booking.
                    </p>
                </div>
            </div>

            {/* Old Way vs New Way */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="p-8 rounded-3xl grayscale opacity-70" style={{ border: '1px solid rgba(232, 180, 184, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                     <h3 className="text-xl font-bold text-[#E8B4B8]/60 mb-6 flex items-center gap-2">
                         <span>📉</span> The Old Way
                     </h3>
                     <ul className="space-y-4">
                         <li className="flex items-center gap-3 text-[#E8B4B8]/40">
                             <div className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]" style={{ borderColor: 'rgba(232, 180, 184, 0.3)' }}>✕</div>
                             "Please leave a message" (Lead lost)
                         </li>
                         <li className="flex items-center gap-3 text-[#E8B4B8]/40">
                             <div className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]" style={{ borderColor: 'rgba(232, 180, 184, 0.3)' }}>✕</div>
                             Generic "Contact Us" forms
                         </li>
                         <li className="flex items-center gap-3 text-[#E8B4B8]/40">
                             <div className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]" style={{ borderColor: 'rgba(232, 180, 184, 0.3)' }}>✕</div>
                             Staff overwhelmed with basic Q&A
                         </li>
                     </ul>
                 </div>

                 <div className="p-8 rounded-3xl glass-card relative overflow-hidden" style={{ borderColor: 'rgba(192, 108, 132, 0.3)' }}>
                     <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] pointer-events-none" style={{ backgroundColor: 'rgba(192, 108, 132, 0.2)' }}></div>
                     <h3 className="text-xl font-bold text-[#FDF8F7] mb-6 flex items-center gap-2">
                         <span className="animate-pulse">🚀</span> The Cynthia.ai Way
                     </h3>
                     <ul className="space-y-4">
                         <li className="flex items-center gap-3 text-[#FDF8F7]">
                             <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-[#FDF8F7]" style={{ backgroundColor: '#C06C84' }}>✓</div>
                             Instant Booking & Deposit Capture
                         </li>
                         <li className="flex items-center gap-3 text-[#FDF8F7]">
                             <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-[#FDF8F7]" style={{ backgroundColor: '#C06C84' }}>✓</div>
                             Visual Analysis & Personalized Upsells
                         </li>
                         <li className="flex items-center gap-3 text-[#FDF8F7]">
                             <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-[#FDF8F7]" style={{ backgroundColor: '#C06C84' }}>✓</div>
                             Staff focus on in-person care
                         </li>
                     </ul>
                 </div>
            </div>
        </section>

        {/* --- Core Features Grid (1-12) --- */}
        <section id="core-features" className="w-full mb-32">
             {/* Block 1: The Voice Interface */}
             <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 mb-32">
                <div className="flex-1 text-left space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: 'rgba(192, 108, 132, 0.1)', border: '1px solid rgba(192, 108, 132, 0.2)', color: '#E8B4B8' }}>
                        Fluid Conversation
                    </div>
                    <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
                        A Receptionist That <br/>
                        <span className="text-[#E8B4B8]">Actually Listens.</span>
                    </h2>
                    <p className="text-lg text-[#E8B4B8]/60 leading-relaxed">
                        Forget clunky chatbots. Cynthia.ai speaks with a friendly, luxurious clinic voice. It handles pricing, insurance, aftercare, and specific treatment questions with human-level nuance.
                    </p>
                    <ul className="space-y-3 pt-4">
                        <li className="flex items-center gap-3 text-[#E8B4B8]/80">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[#E8B4B8]" style={{ backgroundColor: 'rgba(192, 108, 132, 0.2)' }}>✓</div>
                            Custom Persona (Nurse, Concierge, Specialist)
                        </li>
                        <li className="flex items-center gap-3 text-[#E8B4B8]/80">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[#E8B4B8]" style={{ backgroundColor: 'rgba(192, 108, 132, 0.2)' }}>✓</div>
                            Instant Voice-to-Text Transcription
                        </li>
                        <li className="flex items-center gap-3 text-[#E8B4B8]/80">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[#E8B4B8]" style={{ backgroundColor: 'rgba(192, 108, 132, 0.2)' }}>✓</div>
                            Context-Aware Responses
                        </li>
                    </ul>
                </div>
                <div className="flex-1 relative w-full h-[400px] rounded-3xl overflow-hidden glass-card flex items-center justify-center" style={{ borderColor: 'rgba(232, 180, 184, 0.1)', background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), transparent)' }}>
                     {/* Audio Wave Visualization */}
                     <div className="flex items-center gap-2 h-32">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="w-3 rounded-full animate-float" style={{ 
                                height: `${Math.random() * 100 + 40}%`, 
                                animationDelay: `${i * 0.1}s`, 
                                animationDuration: '2s',
                                background: 'linear-gradient(to top, #C06C84, #E8B4B8)'
                            }}></div>
                        ))}
                     </div>
                     <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1f] via-transparent to-transparent opacity-50"></div>
                </div>
             </div>

             {/* Block 2: The Booking Engine */}
             <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-24 mb-32">
                <div className="flex-1 text-left space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: 'rgba(192, 108, 132, 0.1)', border: '1px solid rgba(192, 108, 132, 0.2)', color: '#E8B4B8' }}>
                        Seamless Integration
                    </div>
                    <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
                        It Doesn't Just Chat. <br/>
                        <span className="text-[#E8B4B8]">It Books.</span>
                    </h2>
                    <p className="text-lg text-[#E8B4B8]/60 leading-relaxed">
                        Cynthia.ai integrates directly with your existing software (Calendly, Acuity, Aesthetic Record). It checks availability in real-time, handles reschedules, and captures deposits instantly.
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="p-4 rounded-xl transition-colors" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(232, 180, 184, 0.1)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}>
                            <div className="text-2xl mb-2">📅</div>
                            <h4 className="font-bold text-[#FDF8F7]">Real-Time Sync</h4>
                            <p className="text-xs text-[#E8B4B8]/60">Never double-book.</p>
                        </div>
                        <div className="p-4 rounded-xl transition-colors" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(232, 180, 184, 0.1)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}>
                            <div className="text-2xl mb-2">📍</div>
                            <h4 className="font-bold text-[#FDF8F7]">Multi-Location</h4>
                            <p className="text-xs text-[#E8B4B8]/60">Smart routing logic.</p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 relative w-full h-[400px]">
                     {/* Floating Cards Visualization */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 bg-white rounded-2xl shadow-2xl rotate-[-6deg] z-10 flex flex-col p-4 animate-float border border-slate-200" style={{ animationDelay: '0s' }}>
                        <div className="w-full h-32 bg-slate-100 rounded-lg mb-4"></div>
                        <div className="space-y-2">
                            <div className="w-3/4 h-3 bg-slate-200 rounded"></div>
                            <div className="w-1/2 h-3 bg-slate-200 rounded"></div>
                        </div>
                     </div>
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 rounded-2xl shadow-2xl rotate-[6deg] z-20 flex flex-col p-6 animate-float" style={{ animationDelay: '1s', backgroundColor: '#2a2a30', border: '1px solid rgba(232, 180, 184, 0.1)' }}>
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-[#FDF8F7] font-bold">Booking Confirmed</span>
                            <span className="text-[#E8B4B8]">✓</span>
                        </div>
                        <div className="space-y-4">
                            <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(232, 180, 184, 0.1)' }}>
                                <p className="text-xs text-[#E8B4B8]/60">Service</p>
                                <p className="text-sm font-semibold text-[#FDF8F7]">HydraFacial Deluxe</p>
                            </div>
                            <div className="p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(232, 180, 184, 0.1)' }}>
                                <p className="text-xs text-[#E8B4B8]/60">Time</p>
                                <p className="text-sm font-semibold text-[#FDF8F7]">Tomorrow, 2:00 PM</p>
                            </div>
                        </div>
                     </div>
                </div>
             </div>

             {/* Block 3: Visual Intelligence */}
             <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 mb-16">
                <div className="flex-1 text-left space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: 'rgba(192, 108, 132, 0.1)', border: '1px solid rgba(192, 108, 132, 0.2)', color: '#E8B4B8' }}>
                        Computer Vision
                    </div>
                    <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
                        The AI That Can <br/>
                        <span className="text-[#E8B4B8]">Actually See.</span>
                    </h2>
                    <p className="text-lg text-[#E8B4B8]/60 leading-relaxed">
                        Visitors can enable their camera for an instant skin assessment. Cynthia.ai analyzes tone, texture, and concerns to recommend the *exact* treatments you offer. It's the ultimate conversion tool.
                    </p>
                     <ul className="space-y-3 pt-4">
                        <li className="flex items-center gap-3 text-[#E8B4B8]/80">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[#E8B4B8]" style={{ backgroundColor: 'rgba(192, 108, 132, 0.2)' }}>👁️</div>
                            Detects Acne, Aging, Pigmentation
                        </li>
                        <li className="flex items-center gap-3 text-[#E8B4B8]/80">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[#E8B4B8]" style={{ backgroundColor: 'rgba(192, 108, 132, 0.2)' }}>🛍️</div>
                            Upsells Skincare Products Instantly
                        </li>
                    </ul>
                </div>
                <div className="flex-1 relative w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl group" style={{ backgroundColor: '#1a1a1f', border: '1px solid rgba(232, 180, 184, 0.1)' }}>
                    <img 
                        src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=800&auto=format&fit=crop" 
                        alt="Face Analysis" 
                        className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1f] via-transparent to-transparent"></div>
                    
                    {/* Scanning UI */}
                    <div className="absolute inset-0 z-10">
                        <div className="absolute top-[20%] left-[20%] w-[20%] h-[20%] border-l-2 border-t-2 rounded-tl-lg" style={{ borderColor: '#E8B4B8' }}></div>
                        <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] border-r-2 border-t-2 rounded-tr-lg" style={{ borderColor: '#E8B4B8' }}></div>
                        <div className="absolute bottom-[20%] left-[20%] w-[20%] h-[20%] border-l-2 border-b-2 rounded-bl-lg" style={{ borderColor: '#E8B4B8' }}></div>
                        <div className="absolute bottom-[20%] right-[20%] w-[20%] h-[20%] border-r-2 border-b-2 rounded-br-lg" style={{ borderColor: '#E8B4B8' }}></div>
                        
                        {/* Scan Line */}
                        <div className="absolute top-0 left-0 right-0 h-0.5 animate-[scan_3s_ease-in-out_infinite]" style={{ backgroundColor: '#E8B4B8', boxShadow: '0 0 15px rgba(232, 180, 184, 1)' }}></div>
                        
                        {/* Tags */}
                        <div className="absolute top-[30%] right-[25%] backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-[#FDF8F7]" style={{ backgroundColor: 'rgba(192, 108, 132, 0.8)' }}>Pores</div>
                        <div className="absolute bottom-[40%] left-[30%] backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-[#FDF8F7]" style={{ backgroundColor: 'rgba(192, 108, 132, 0.8)' }}>Texture</div>
                    </div>
                </div>
             </div>
        </section>

        {/* --- Advanced Features (Neural Brain) (13-17) --- */}
        <section id="advanced-features" className="w-full mb-32 relative">
             <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4" style={{ backgroundColor: 'rgba(192, 108, 132, 0.1)', border: '1px solid rgba(192, 108, 132, 0.2)', color: '#E8B4B8' }}>
                    10X Differentiators
                </div>
                <h2 className="font-display text-3xl md:text-5xl font-bold text-[#FDF8F7] mb-4">Advanced Neural Features</h2>
                <p className="text-[#E8B4B8]/60 max-w-2xl mx-auto">Your WOW factors. These features make the experience feel magical.</p>
            </div>

            <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-20 min-h-[600px]">
                
                 {/* Connecting Lines (Desktop Only) - SVG Background */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block opacity-30" viewBox="0 0 1000 600" preserveAspectRatio="none">
                    {/* Left Connections */}
                    <path d="M 500 300 C 350 300, 300 150, 250 120" fill="none" stroke="url(#lineGradient)" strokeWidth="1" strokeDasharray="5,5" />
                    <path d="M 500 300 C 350 300, 300 450, 250 480" fill="none" stroke="url(#lineGradient)" strokeWidth="1" strokeDasharray="5,5" />
                    
                    {/* Right Connections */}
                    <path d="M 500 300 C 650 300, 700 150, 750 120" fill="none" stroke="url(#lineGradient)" strokeWidth="1" strokeDasharray="5,5" />
                    <path d="M 500 300 C 650 300, 700 450, 750 480" fill="none" stroke="url(#lineGradient)" strokeWidth="1" strokeDasharray="5,5" />
                    
                    {/* Bottom Connection */}
                    <path d="M 500 300 L 500 500" fill="none" stroke="url(#lineGradient)" strokeWidth="1" />

                    <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(192, 108, 132, 0)" />
                            <stop offset="50%" stopColor="rgba(192, 108, 132, 0.5)" />
                            <stop offset="100%" stopColor="rgba(192, 108, 132, 0)" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Left Advanced Cards */}
                <div className="flex flex-col gap-6 w-full max-w-sm z-10">
                     <FeatureCard 
                        icon="🖱️"
                        title="Dynamic On-Page Overlays"
                        description="AI highlights elements on your page ('Book Now', 'Pricing') in real-time as it talks about them."
                    />
                     <FeatureCard 
                        icon="🧠"
                        title="AI Memory of Visitors"
                        description="Recalls returning user names, past treatments, concerns, and pricing questions. Unbelievably premium."
                    />
                </div>

                {/* Center Brain Visualization */}
                <div className="relative z-20 flex-shrink-0 my-8 lg:my-0">
                    <div className="w-48 h-48 md:w-64 md:h-64 rounded-full flex items-center justify-center relative overflow-hidden group" style={{
                        background: 'linear-gradient(to bottom, #2a2a30, #1a1a1f)',
                        border: '1px solid rgba(192, 108, 132, 0.3)',
                        boxShadow: '0 0 80px rgba(192, 108, 132, 0.2)'
                    }}>
                         {/* Brain Icon */}
                         <div className="relative z-10 text-[#FDF8F7] animate-[pulse_4s_ease-in-out_infinite]" style={{ filter: 'drop-shadow(0 0 15px rgba(192, 108, 132, 0.8))' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
                         </div>
                         
                         {/* Inner Rings */}
                         <div className="absolute inset-0 border rounded-full scale-75 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ borderColor: 'rgba(192, 108, 132, 0.2)' }}></div>
                         <div className="absolute inset-0 border rounded-full scale-110" style={{ borderColor: 'rgba(212, 145, 154, 0.1)' }}></div>
                         
                         {/* Floating Tag */}
                         <div className="absolute bottom-6 backdrop-blur px-3 py-1 rounded text-[10px] font-bold uppercase" style={{ backgroundColor: 'rgba(192, 108, 132, 0.2)', color: '#E8B4B8' }}>
                             Neural Core
                         </div>
                    </div>
                </div>

                {/* Right Advanced Cards */}
                <div className="flex flex-col gap-6 w-full max-w-sm z-10">
                     <FeatureCard 
                        icon="🖼️"
                        title="Visual Treatment Simulator"
                        description="Upload a face and simulate Botox smoothing, Lip filler plumping, or Pigmentation fading."
                    />
                    <FeatureCard 
                        icon="🛡️"
                        title="Treatment Qualification"
                        description="Screens for age, pregnancy, medical conditions, and allergies to customize safe recommendations."
                    />
                </div>
            </div>

            {/* Bottom Advanced Feature */}
            <div className="flex justify-center mt-6 lg:mt-0 relative z-10">
                 <div className="max-w-sm w-full">
                    <FeatureCard 
                        icon="📨"
                        title="Automated Follow-Up"
                        description="Sends 'Thank you' texts, aftercare instructions, and consultation reminders automatically."
                    />
                 </div>
            </div>
        </section>

        {/* --- Testimonials Section --- */}
        <section id="testimonials" className="w-full mb-32 max-w-6xl mx-auto">
             <div className="text-center mb-16">
                <h2 className="font-display text-3xl md:text-5xl font-bold text-[#FDF8F7] mb-4">Trusted by Leading Aesthetic Practices</h2>
                <p className="text-[#E8B4B8]/60">See why clinics are switching to Cynthia.ai.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Client 1 */}
                <div className="glass-card p-8 rounded-3xl relative transition-all duration-300 group" style={{ borderColor: 'rgba(232, 180, 184, 0.2)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(192, 108, 132, 0.3)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(232, 180, 184, 0.2)'}>
                    <div className="absolute top-6 right-8 text-6xl font-serif leading-none" style={{ color: 'rgba(192, 108, 132, 0.2)' }}>"</div>
                    <p className="text-[#E8B4B8]/80 text-lg leading-relaxed mb-6 relative z-10">
                        Revenue increased by <span className="text-[#E8B4B8] font-bold">35%</span> in the first month. It captures leads at 10 PM while I'm asleep. I can't imagine running my clinic without it now.
                    </p>
                    <div className="flex items-center gap-4">
                        <img 
                            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=150&auto=format&fit=crop" 
                            alt="Dr. Emily Carter" 
                            className="w-12 h-12 rounded-full object-cover" 
                            style={{ border: '1px solid rgba(192, 108, 132, 0.3)' }}
                        />
                        <div>
                            <h4 className="font-bold text-[#FDF8F7] text-sm">Dr. Emily Carter</h4>
                            <p className="text-xs text-[#E8B4B8]/40 uppercase tracking-wide">Dermatologist, NY</p>
                        </div>
                    </div>
                </div>

                {/* Client 2 */}
                <div className="glass-card p-8 rounded-3xl relative transition-all duration-300 group" style={{ borderColor: 'rgba(232, 180, 184, 0.2)', backgroundColor: 'rgba(255, 255, 255, 0.05)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(192, 108, 132, 0.3)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(232, 180, 184, 0.2)'}>
                     <div className="absolute top-6 right-8 text-6xl font-serif leading-none" style={{ color: 'rgba(192, 108, 132, 0.2)' }}>"</div>
                    <p className="text-[#E8B4B8]/80 text-lg leading-relaxed mb-6 relative z-10">
                        The visual analysis feature shocks our patients. It's the ultimate consultation tool. It recommends the exact treatments we offer instantly.
                    </p>
                    <div className="flex items-center gap-4">
                        <img 
                            src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=150&auto=format&fit=crop" 
                            alt="Marcus Thorne" 
                            className="w-12 h-12 rounded-full object-cover" 
                            style={{ border: '1px solid rgba(192, 108, 132, 0.3)' }}
                        />
                        <div>
                            <h4 className="font-bold text-[#FDF8F7] text-sm">Marcus Thorne</h4>
                            <p className="text-xs text-[#E8B4B8]/40 uppercase tracking-wide">Clinic Director, LA</p>
                        </div>
                    </div>
                </div>

                {/* Client 3 */}
                <div className="glass-card p-8 rounded-3xl relative transition-all duration-300 group" style={{ borderColor: 'rgba(232, 180, 184, 0.2)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(192, 108, 132, 0.3)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(232, 180, 184, 0.2)'}>
                     <div className="absolute top-6 right-8 text-6xl font-serif leading-none" style={{ color: 'rgba(192, 108, 132, 0.2)' }}>"</div>
                    <p className="text-[#E8B4B8]/80 text-lg leading-relaxed mb-6 relative z-10">
                        It's like having a receptionist who never sleeps, never gets sick, and knows every single treatment protocol by heart. Absolutely brilliant.
                    </p>
                    <div className="flex items-center gap-4">
                        <img 
                            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop" 
                            alt="Sarah Jenkins" 
                            className="w-12 h-12 rounded-full object-cover" 
                            style={{ border: '1px solid rgba(192, 108, 132, 0.3)' }}
                        />
                        <div>
                            <h4 className="font-bold text-[#FDF8F7] text-sm">Sarah Jenkins</h4>
                            <p className="text-xs text-[#E8B4B8]/40 uppercase tracking-wide">Lead Aesthetician, Miami</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* --- Pricing CTA --- */}
        <div id="pricing" className="w-full max-w-4xl mx-auto glass-card p-12 rounded-[2.5rem] text-center relative overflow-hidden mb-24" style={{ borderColor: 'rgba(192, 108, 132, 0.3)' }}>
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ background: 'linear-gradient(to bottom right, rgba(192, 108, 132, 0.1), transparent)' }}></div>
            <h2 className="font-display text-4xl font-bold text-[#FDF8F7] mb-6 relative z-10">Ready to modernize your practice?</h2>
            <p className="text-[#E8B4B8]/60 mb-8 max-w-xl mx-auto relative z-10">
                Join the waiting list for Cynthia.ai Enterprise. Includes custom voice cloning, dedicated onboarding, and 24/7 priority support.
            </p>
            <div className="flex flex-col items-center gap-4 relative z-10">
                <button 
                    onClick={() => setShowBookingModal(true)}
                    className="px-10 py-4 rounded-full bg-[#FDF8F7] text-[#1a1a1f] font-bold text-lg hover:opacity-90 transition-all" 
                    style={{ boxShadow: '0 0 30px rgba(253, 248, 247, 0.3)' }}
                >
                    Book a Strategy Call
                </button>
                <p className="text-xs text-[#E8B4B8]/40 uppercase tracking-widest mt-4">Limited Availability • Starting at $5,000/mo</p>
            </div>
        </div>

        {/* Footer */}
        <footer className="w-full mt-24" style={{ borderTop: '1px solid rgba(232, 180, 184, 0.1)' }}>
            <div className="max-w-7xl mx-auto px-6 py-16">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <CynthiaLogo size="medium" />
                        <p className="text-white text-sm leading-relaxed">
                            The first AI medical spa receptionist that listens, analyzes, and helps you execute with precision.
                        </p>
                    </div>

                    {/* Product Column */}
                    <div>
                        <h3 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">Product</h3>
                        <ul className="space-y-3">
                            <li><a href="#core-features" className="text-white text-sm hover:opacity-80 transition-colors">Features</a></li>
                            <li><a href="#pricing" className="text-white text-sm hover:opacity-80 transition-colors">Pricing</a></li>
                            <li><a href="#roi" className="text-white text-sm hover:opacity-80 transition-colors">ROI Calculator</a></li>
                            <li><a href="#" className="text-white text-sm hover:opacity-80 transition-colors">Demo</a></li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h3 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">Company</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-white text-sm hover:opacity-80 transition-colors">About Us</a></li>
                            <li><a href="#testimonials" className="text-white text-sm hover:opacity-80 transition-colors">Testimonials</a></li>
                            <li><a href="#" className="text-white text-sm hover:opacity-80 transition-colors">Blog</a></li>
                            <li><a href="#" className="text-white text-sm hover:opacity-80 transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div>
                        <h3 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">Legal</h3>
                        <ul className="space-y-3">
                            <li><a href="/terms-of-service" className="text-white text-sm hover:opacity-80 transition-colors">Terms of Service</a></li>
                            <li><a href="/privacy-policy" className="text-white text-sm hover:opacity-80 transition-colors">Privacy Policy</a></li>
                            <li><a href="/hipaa-compliance" className="text-white text-sm hover:opacity-80 transition-colors">HIPAA Compliance</a></li>
                            <li><a href="/security" className="text-white text-sm hover:opacity-80 transition-colors">Security</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderTop: '1px solid rgba(232, 180, 184, 0.1)' }}>
                    <div className="flex flex-col gap-2">
                        <p className="text-white text-sm">&copy; 2024 Cynthia.ai Systems. All rights reserved.</p>
                        <p className="text-white text-xs">Cynthia.ai is an AI assistant tool, not a medical advisor. Always consult with licensed healthcare professionals.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Social Media Icons */}
                        <a href="#" className="w-10 h-10 rounded-lg flex items-center justify-center transition-all text-white hover:opacity-80" style={{ border: '1px solid rgba(232, 180, 184, 0.1)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(232, 180, 184, 0.2)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(232, 180, 184, 0.1)'; }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                        </a>
                        <a href="#" className="w-10 h-10 rounded-lg flex items-center justify-center transition-all text-white hover:opacity-80" style={{ border: '1px solid rgba(232, 180, 184, 0.1)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(232, 180, 184, 0.2)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(232, 180, 184, 0.1)'; }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                        </a>
                        <a href="#" className="w-10 h-10 rounded-lg flex items-center justify-center transition-all text-white hover:opacity-80" style={{ border: '1px solid rgba(232, 180, 184, 0.1)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(232, 180, 184, 0.2)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(232, 180, 184, 0.1)'; }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>

      </main>

      {/* --- The Widget (Demo Product) --- */}
      {/* Widget automatically fetches config from Supabase via /api/business/{businessId}/config */}
      {!isPreviewPage && <VoiceWidget businessId="test-medspa" open={widgetOpen} onOpenChange={setWidgetOpen} />}
      
      {/* --- Booking Modal --- */}
      {showBookingModal && (
        <BookingModal onClose={() => setShowBookingModal(false)} />
      )}
      
    </div>
  );
}

// Booking Modal Component
function BookingModal({ onClose }: { onClose: () => void }) {
  const calContainerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!scriptLoaded.current) {
      // Initialize Cal.com loader
      (function (C: any, A: string, L: string) { 
        let p = function (a: any, ar: any) { a.q.push(ar); }; 
        let d = C.document; 
        C.Cal = C.Cal || function () { 
          let cal = C.Cal; 
          let ar = arguments; 
          if (!cal.loaded) { 
            cal.ns = {}; 
            cal.q = cal.q || []; 
            d.head.appendChild(d.createElement("script")).src = A; 
            cal.loaded = true; 
          } 
          if (ar[0] === L) { 
            const api = function () { p(api, arguments); }; 
            const namespace = ar[1]; 
            api.q = api.q || []; 
            if(typeof namespace === "string"){
              cal.ns[namespace] = cal.ns[namespace] || api;
              p(cal.ns[namespace], ar);
              p(cal, ["initNamespace", namespace]);
            } else p(cal, ar); 
            return;
          } 
          p(cal, ar); 
        }; 
      })(window, "https://app.cal.com/embed/embed.js", "init");

      // Initialize Cal.com
      if ((window as any).Cal) {
        (window as any).Cal("init", "15min", {origin:"https://app.cal.com"});
      }

      scriptLoaded.current = true;
    }

    // Wait for Cal.com to load and then initialize the inline widget
    const initCal = () => {
      if ((window as any).Cal && (window as any).Cal.ns && (window as any).Cal.ns["15min"]) {
        try {
          (window as any).Cal.ns["15min"]("inline", {
            elementOrSelector: "#my-cal-inline-15min",
            config: { layout: "month_view" },
            calLink: "cynthia.ai/15min",
          });

          (window as any).Cal.ns["15min"]("ui", {
            "cssVarsPerTheme": {
              "light": {"cal-brand": "#2a2a30"},
              "dark": {"cal-brand": "#C06C84"}
            },
            "hideEventTypeDetails": false,
            "layout": "month_view"
          });
        } catch (e) {
          console.log("Cal.com initialization:", e);
        }
      } else {
        // Retry after a short delay if Cal.com isn't ready yet
        setTimeout(initCal, 200);
      }
    };

    const timer = setTimeout(initCal, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
    >
      <div 
        className="relative bg-[#1a1a1f] rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        style={{ border: '1px solid rgba(192, 108, 132, 0.3)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Cal.com Container */}
        <div className="p-6">
          <h3 className="text-2xl font-bold text-white mb-4 text-center">Book a Strategy Call</h3>
          <div 
            id="my-cal-inline-15min" 
            ref={calContainerRef}
            style={{ width: '100%', height: '600px', overflow: 'scroll' }}
          ></div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/business/:businessName" element={<BusinessPreviewPage />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/hipaa-compliance" element={<HIPAACompliance />} />
        <Route path="/security" element={<Security />} />
        <Route path="*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
}

// Helper Component for the Feature Cards
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="glass-card p-6 rounded-2xl flex items-start gap-4 transition-all duration-300 hover:-translate-y-1 group" style={{ borderColor: 'rgba(232, 180, 184, 0.2)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
        <div className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-2xl transition-all shadow-sm" style={{ backgroundColor: 'rgba(42, 42, 48, 0.5)', border: '1px solid rgba(232, 180, 184, 0.2)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#C06C84'; e.currentTarget.style.borderColor = '#C06C84'; e.currentTarget.style.color = '#FDF8F7'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(42, 42, 48, 0.5)'; e.currentTarget.style.borderColor = 'rgba(232, 180, 184, 0.2)'; }}>
            {icon}
        </div>
        <div className="text-left">
            <h4 className="font-bold text-[#FDF8F7] text-lg mb-2 transition-colors group-hover:text-[#E8B4B8]">{title}</h4>
            <p className="text-sm text-[#E8B4B8]/60 leading-relaxed transition-colors group-hover:text-[#E8B4B8]/80">{description}</p>
        </div>
    </div>
);

export default App;
