import React from 'react';
import { PreviewLandingPageData } from '../types';

interface PreviewLandingPageProps {
  data: PreviewLandingPageData;
  businessName: string;
}

const PreviewLandingPage: React.FC<PreviewLandingPageProps> = ({ data, businessName }) => {
  const colors = data.colors || {};
  const hero = data.hero || {};
  const nav = data.navigation || [];
  const sections = data.sections || [];

  return (
    <div 
      className="min-h-screen w-full"
      style={{
        backgroundColor: colors.background || '#ffffff',
        color: colors.text || '#1e293b',
        fontFamily: data.fonts?.body || 'system-ui, sans-serif',
      }}
    >
      {/* Navigation */}
      <nav 
        className="w-full px-6 py-4 border-b"
        style={{ 
          backgroundColor: colors.background || '#ffffff',
          borderColor: colors.primary ? `${colors.primary}20` : '#e2e8f0'
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {data.logo ? (
            <img src={data.logo} alt={businessName} className="h-10" />
          ) : (
            <div 
              className="text-2xl font-bold"
              style={{ color: colors.primary || '#f43f5e' }}
            >
              {businessName}
            </div>
          )}
          <div className="hidden md:flex items-center gap-8">
            {nav.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                className="text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ color: colors.text || '#1e293b' }}
              >
                {item.label}
              </a>
            ))}
          </div>
          <button
            className="px-6 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: colors.primary || '#f43f5e' }}
          >
            {hero.ctaText || 'Book Appointment'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full" style={{ minHeight: '600px' }}>
        {hero.image && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${hero.image})` }}
          >
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            style={{ 
              fontFamily: data.fonts?.heading || 'system-ui, sans-serif',
              color: hero.image ? '#ffffff' : (colors.text || '#1e293b')
            }}
          >
            {hero.title || `Welcome to ${businessName}`}
          </h1>
          {hero.subtitle && (
            <p 
              className="text-xl md:text-2xl mb-8 max-w-2xl"
              style={{ color: hero.image ? '#ffffff' : (colors.text || '#64748b') }}
            >
              {hero.subtitle}
            </p>
          )}
          <button
            className="px-8 py-4 rounded-lg text-lg font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: colors.primary || '#f43f5e' }}
          >
            {hero.ctaText || 'Get Started'}
          </button>
        </div>
      </section>

      {/* Sections */}
      {sections.map((section, idx) => (
        <section 
          key={idx} 
          className="w-full py-16 px-6"
          style={{ 
            backgroundColor: idx % 2 === 0 ? colors.background || '#ffffff' : '#f8fafc'
          }}
        >
          <div className="max-w-6xl mx-auto">
            {section.title && (
              <h2 
                className="text-3xl md:text-4xl font-bold mb-8 text-center"
                style={{ 
                  fontFamily: data.fonts?.heading || 'system-ui, sans-serif',
                  color: colors.text || '#1e293b'
                }}
              >
                {section.title}
              </h2>
            )}
            {section.content && (
              <p 
                className="text-lg mb-8 text-center max-w-2xl mx-auto"
                style={{ color: colors.text || '#64748b' }}
              >
                {section.content}
              </p>
            )}
            {section.images && section.images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                {section.images.slice(0, 6).map((img, imgIdx) => (
                  <img
                    key={imgIdx}
                    src={img}
                    alt={`${section.title} ${imgIdx + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      ))}

      {/* Footer */}
      <footer 
        className="w-full py-12 px-6 border-t text-center"
        style={{ 
          backgroundColor: colors.background || '#ffffff',
          borderColor: colors.primary ? `${colors.primary}20` : '#e2e8f0'
        }}
      >
        <p style={{ color: colors.text || '#64748b' }}>
          &copy; {new Date().getFullYear()} {businessName}. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default PreviewLandingPage;

