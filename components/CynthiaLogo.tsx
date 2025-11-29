import React from 'react';

interface CynthiaLogoProps {
  showTagline?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const CynthiaLogo: React.FC<CynthiaLogoProps> = ({ 
  showTagline = false, 
  size = 'medium',
  className = '' 
}) => {
  const sizeClasses = {
    small: {
      icon: 'w-8 h-8',
      text: 'text-xl',
      tagline: 'text-[9px]',
      gap: 'gap-2'
    },
    medium: {
      icon: 'w-10 h-10',
      text: 'text-2xl',
      tagline: 'text-[10px]',
      gap: 'gap-3'
    },
    large: {
      icon: 'w-14 h-14',
      text: 'text-3xl',
      tagline: 'text-xs',
      gap: 'gap-4'
    }
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`flex items-center ${sizes.gap} ${className}`}>
      <div className={`${sizes.icon} relative flex items-center justify-center`}>
        {/* Icon Ring with Glow */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #C06C84 0%, #E8B4B8 50%, #D4919A 100%)',
            animation: 'pulse-glow 3s ease-in-out infinite'
          }}
        ></div>
        <div className="absolute inset-[2px] rounded-full bg-[#1a1a1f]"></div>
        
        {/* Glow Effect */}
        <div 
          className="absolute inset-0 rounded-full -z-10"
          style={{
            background: 'linear-gradient(135deg, #C06C84 0%, #E8B4B8 50%, #D4919A 100%)',
            filter: 'blur(20px)',
            opacity: 0.4,
            animation: 'pulse-glow 3s ease-in-out infinite'
          }}
        ></div>
        
        {/* Voice Waves */}
        <div className="relative z-10 flex items-center gap-[3px]" style={{ height: size === 'small' ? '12px' : size === 'medium' ? '16px' : '24px' }}>
          <div 
            className="w-[3px] rounded-[2px]" 
            style={{ 
              height: size === 'small' ? '4px' : size === 'medium' ? '6px' : '8px',
              background: 'linear-gradient(to top, #C06C84, #E8B4B8)',
              animation: 'wave 1.2s ease-in-out infinite',
              animationDelay: '0s'
            }}
          ></div>
          <div 
            className="w-[3px] rounded-[2px]" 
            style={{ 
              height: size === 'small' ? '8px' : size === 'medium' ? '10px' : '16px',
              background: 'linear-gradient(to top, #C06C84, #E8B4B8)',
              animation: 'wave 1.2s ease-in-out infinite',
              animationDelay: '0.1s'
            }}
          ></div>
          <div 
            className="w-[3px] rounded-[2px]" 
            style={{ 
              height: size === 'small' ? '10px' : size === 'medium' ? '14px' : '24px',
              background: 'linear-gradient(to top, #C06C84, #E8B4B8)',
              animation: 'wave 1.2s ease-in-out infinite',
              animationDelay: '0.2s'
            }}
          ></div>
          <div 
            className="w-[3px] rounded-[2px]" 
            style={{ 
              height: size === 'small' ? '8px' : size === 'medium' ? '10px' : '16px',
              background: 'linear-gradient(to top, #C06C84, #E8B4B8)',
              animation: 'wave 1.2s ease-in-out infinite',
              animationDelay: '0.3s'
            }}
          ></div>
          <div 
            className="w-[3px] rounded-[2px]" 
            style={{ 
              height: size === 'small' ? '4px' : size === 'medium' ? '6px' : '8px',
              background: 'linear-gradient(to top, #C06C84, #E8B4B8)',
              animation: 'wave 1.2s ease-in-out infinite',
              animationDelay: '0.4s'
            }}
          ></div>
        </div>
      </div>
      
      <div className="flex flex-col items-start">
        <div className={`font-['Cormorant_Garamond',serif] ${sizes.text} font-normal leading-none`} style={{ color: '#FDF8F7' }}>
          Cynthia<span 
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #C06C84, #E8B4B8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >.</span><span className="font-light" style={{ fontSize: '0.857em', color: '#E8B4B8' }}>ai</span>
        </div>
        {showTagline && (
          <div className={`font-['Outfit',sans-serif] ${sizes.tagline} font-normal tracking-[0.25em] uppercase mt-[6px]`} style={{ color: 'rgba(232, 180, 184, 0.6)' }}>
            Medical Spa Concierge
          </div>
        )}
      </div>
    </div>
  );
};

export default CynthiaLogo;

