import React, { useState } from 'react';
import { Mail, Sparkles, Loader2, Copy, Send, Settings, Eye } from 'lucide-react';

interface EmailConfig {
  recipientName: string;
  recipientEmail: string;
  businessName: string;
  businessType: string;
  personalizationLevel: 'low' | 'medium' | 'high';
  tone: 'professional' | 'friendly' | 'casual';
  includeStats: boolean;
  includeTestimonial: boolean;
  customPrompt?: string;
}

interface GeneratedEmail {
  subject: string;
  body: string;
  personalization: {
    usedElements: string[];
    confidence: number;
  };
}

const EmailGenerator: React.FC = () => {
  const [config, setConfig] = useState<EmailConfig>({
    recipientName: '',
    recipientEmail: '',
    businessName: '',
    businessType: 'Medical Spa',
    personalizationLevel: 'medium',
    tone: 'professional',
    includeStats: true,
    includeTestimonial: true,
  });

  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = async () => {
    if (!config.recipientName || !config.recipientEmail || !config.businessName) {
      setError('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedEmail(null);

    try {
      const response = await fetch('/api/email-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate email');
      }

      const data = await response.json();
      setGeneratedEmail(data);
      setShowPreview(true);
    } catch (err: any) {
      setError(err.message || 'Failed to generate email');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyEmail = () => {
    if (generatedEmail) {
      const fullEmail = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
      navigator.clipboard.writeText(fullEmail);
      alert('Email copied to clipboard!');
    }
  };

  const handleSendEmail = async () => {
    if (!generatedEmail || !config.recipientEmail) {
      setError('No email to send');
      return;
    }

    try {
      const response = await fetch('/api/email-generator/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: config.recipientEmail,
          subject: generatedEmail.subject,
          body: generatedEmail.body,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      alert('Email sent successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to send email');
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-violet-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold text-white">Email Generator</h2>
            <p className="text-slate-400">AI-powered cold outreach with LangGraph</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="glass-card border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-rose-400" />
            <h3 className="text-xl font-bold text-white">Configuration</h3>
          </div>

          <div className="space-y-4">
            {/* Recipient Info */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Recipient Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={config.recipientName}
                onChange={(e) => setConfig({ ...config, recipientName: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50 transition-colors"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Recipient Email <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                value={config.recipientEmail}
                onChange={(e) => setConfig({ ...config, recipientEmail: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50 transition-colors"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Business Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={config.businessName}
                onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50 transition-colors"
                placeholder="Serenity MedSpa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Business Type
              </label>
              <select
                value={config.businessType}
                onChange={(e) => setConfig({ ...config, businessType: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-rose-500/50 transition-colors"
              >
                <option value="Medical Spa">Medical Spa</option>
                <option value="Dental Practice">Dental Practice</option>
                <option value="Aesthetic Clinic">Aesthetic Clinic</option>
                <option value="Wellness Center">Wellness Center</option>
                <option value="Beauty Salon">Beauty Salon</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Personalization Level */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Personalization Level
              </label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setConfig({ ...config, personalizationLevel: level })}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      config.personalizationLevel === level
                        ? 'bg-gradient-to-r from-rose-500 to-violet-600 text-white'
                        : 'bg-slate-800/50 border border-white/10 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tone
              </label>
              <div className="flex gap-2">
                {(['professional', 'friendly', 'casual'] as const).map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setConfig({ ...config, tone })}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      config.tone === tone
                        ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white'
                        : 'bg-slate-800/50 border border-white/10 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {tone.charAt(0).toUpperCase() + tone.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeStats}
                  onChange={(e) => setConfig({ ...config, includeStats: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-800 border-white/10 text-rose-500 focus:ring-rose-500 focus:ring-offset-0"
                />
                <span className="text-slate-300">Include Statistics & ROI Data</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeTestimonial}
                  onChange={(e) => setConfig({ ...config, includeTestimonial: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-800 border-white/10 text-rose-500 focus:ring-rose-500 focus:ring-offset-0"
                />
                <span className="text-slate-300">Include Customer Testimonials</span>
              </label>
            </div>

            {/* Custom Prompt */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Custom Prompt (Optional)
              </label>
              <textarea
                value={config.customPrompt || ''}
                onChange={(e) => setConfig({ ...config, customPrompt: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50 transition-colors resize-none"
                rows={3}
                placeholder="Add any specific instructions or talking points..."
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-violet-600 text-white rounded-lg hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-all duration-300 font-semibold hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Email
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="glass-card border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-rose-400" />
              <h3 className="text-xl font-bold text-white">Generated Email</h3>
            </div>
            {generatedEmail && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopyEmail}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
                <button
                  onClick={handleSendEmail}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            )}
          </div>

          {generatedEmail ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                <div className="px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white font-semibold">
                  {generatedEmail.subject}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Body</label>
                <div className="px-4 py-4 bg-slate-800/50 border border-white/10 rounded-lg text-white whitespace-pre-wrap leading-relaxed">
                  {generatedEmail.body}
                </div>
              </div>
              {generatedEmail.personalization && (
                <div className="pt-4 border-t border-white/10">
                  <div className="text-sm text-slate-400 mb-2">Personalization Analysis</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {generatedEmail.personalization.usedElements.map((element, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-full text-xs"
                      >
                        {element}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-slate-500">
                    Confidence: {Math.round(generatedEmail.personalization.confidence * 100)}%
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-slate-500">
              <div className="text-center">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Configure settings and generate your first email</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailGenerator;

