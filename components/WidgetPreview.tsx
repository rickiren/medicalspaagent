import React from 'react';
import VoiceWidget from './VoiceWidget';

interface WidgetPreviewProps {
  businessId: string;
  businessName: string;
  onBack: () => void;
}

const WidgetPreview: React.FC<WidgetPreviewProps> = ({ businessId, businessName, onBack }) => {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-50">
      {/* Fake Homepage Shell */}
      <div className="absolute inset-0 z-0">
        {/* Hero Image Background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600334089648-b0d9c3024ea2?q=80&w=2600&auto=format&fit=crop')] bg-cover bg-center"></div>
        {/* Overlay */}
        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent"></div>
      </div>

      {/* Preview Banner */}
      <div className="relative z-20 bg-blue-600 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-semibold">Preview Mode</span>
          <span className="text-xs opacity-90">Business: {businessName}</span>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto px-6 py-8 font-sans">
        {/* Navigation Mockup */}
        <nav className="flex justify-between items-center mb-20">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
              <span className="text-white font-serif italic text-sm">B</span>
            </div>
            <span className="text-2xl font-serif font-bold text-slate-900 tracking-wider">
              {businessName.toUpperCase()}
            </span>
          </div>
          <div className="hidden md:flex space-x-10 text-xs font-bold text-slate-600 tracking-widest uppercase">
            <a href="#" className="hover:text-slate-900 transition-colors">Treatments</a>
            <a href="#" className="hover:text-slate-900 transition-colors">About</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
          </div>
          <button className="px-8 py-2.5 border border-slate-900 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all duration-300">
            Book Online
          </button>
        </nav>

        {/* Hero Content */}
        <main className="max-w-2xl mt-12 md:mt-24">
          <h1 className="font-serif text-5xl md:text-7xl text-slate-900 mb-8 leading-tight">
            Welcome to <br/>
            <span className="italic font-light text-slate-600">{businessName}</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 leading-relaxed font-light max-w-lg">
            Experience our premium services. Click the widget in the bottom-right to start a conversation with our AI receptionist.
          </p>
        </main>

        {/* Features Mockup */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Premium Services", desc: "Expert care and attention." },
            { title: "Personalized Care", desc: "Tailored to your needs." },
            { title: "Professional Team", desc: "Experienced specialists." }
          ].map((item, idx) => (
            <div key={idx} className="bg-white/40 backdrop-blur-md p-8 rounded-xl border border-white/60 shadow-sm">
              <h3 className="font-serif text-xl text-slate-800 mb-3">{item.title}</h3>
              <p className="text-sm text-slate-600 font-light leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Voice Widget - Loads the specific business config */}
      <VoiceWidget businessId={businessId} />
    </div>
  );
};

export default WidgetPreview;

