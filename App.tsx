import React, { useState } from 'react';
import VoiceWidget from './components/VoiceWidget';
import Dashboard from './components/Dashboard';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  if (showDashboard) {
    return <Dashboard onBack={() => setShowDashboard(false)} />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-50">
      
      {/* --- Background / Hero Section mimicking a luxury MedSpa Site --- */}
      <div className="absolute inset-0 z-0">
          {/* Hero Image Background */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600334089648-b0d9c3024ea2?q=80&w=2600&auto=format&fit=crop')] bg-cover bg-center"></div>
          {/* Overlay to ensure text readability - Neutral Slate Overlay */}
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px]"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent"></div>
      </div>

      {/* --- Content Overlay --- */}
      <div className="relative z-10 container mx-auto px-6 py-8 font-sans">
        {/* Navigation Mockup */}
        <nav className="flex justify-between items-center mb-20">
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                    <span className="text-white font-serif italic text-sm">S</span>
                </div>
                <span className="text-2xl font-serif font-bold text-slate-900 tracking-wider">SERENITY</span>
            </div>
            <div className="hidden md:flex space-x-10 text-xs font-bold text-slate-600 tracking-widest uppercase">
                <a href="#" className="hover:text-slate-900 transition-colors">Treatments</a>
                <a href="#" className="hover:text-slate-900 transition-colors">Membership</a>
                <a href="#" className="hover:text-slate-900 transition-colors">About</a>
                <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
            </div>
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => setShowDashboard(true)}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black transition-all duration-300"
                >
                    Dashboard
                </button>
                <button className="px-8 py-2.5 border border-slate-900 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all duration-300">
                    Book Online
                </button>
            </div>
        </nav>

        {/* Hero Content */}
        <main className="max-w-2xl mt-12 md:mt-24">
            <h1 className="font-serif text-5xl md:text-7xl text-slate-900 mb-8 leading-tight">
                Refined beauty. <br/>
                <span className="italic font-light text-slate-600">Timeless elegance.</span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed font-light max-w-lg">
                Experience world-class dermatological treatments tailored to your unique biology. 
                Talk to Serena, our AI concierge, to begin your personalized journey.
            </p>
            
            <div className="flex space-x-5">
                <button className="bg-slate-900 text-white px-8 py-4 rounded-full text-sm font-bold tracking-wide shadow-lg hover:shadow-2xl hover:bg-black transition-all transform hover:-translate-y-0.5">
                    VIEW TREATMENTS
                </button>
                <button className="bg-transparent text-slate-900 px-8 py-4 rounded-full text-sm font-bold tracking-wide border border-slate-300 hover:border-slate-900 hover:bg-white transition-all">
                    VIRTUAL TOUR
                </button>
            </div>
        </main>
        
        {/* Features Mockup */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6">
             {[
                 { title: "Clinical Excellence", desc: "Board-certified expertise." },
                 { title: "Holistic Wellness", desc: "Treatments for mind and body." },
                 { title: "Private Sanctuary", desc: "Your exclusive escape." }
             ].map((item, idx) => (
                 <div key={idx} className="bg-white/40 backdrop-blur-md p-8 rounded-xl border border-white/60 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                     <h3 className="font-serif text-xl text-slate-800 mb-3 group-hover:text-slate-900">{item.title}</h3>
                     <p className="text-sm text-slate-600 font-light leading-relaxed">{item.desc}</p>
                 </div>
             ))}
        </div>

      </div>

      {/* --- The Booking Widget --- */}
      {/* Widget automatically fetches config from Supabase via /api/business/{businessId}/config */}
      <VoiceWidget businessId="test-medspa" />
      
    </div>
  );
}

export default App;