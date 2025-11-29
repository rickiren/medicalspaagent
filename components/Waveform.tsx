import React, { useEffect, useState } from 'react';

interface WaveformProps {
  isActive: boolean;
  color?: string;
  intensity?: number; // 0 to 1
}

const Waveform: React.FC<WaveformProps> = ({ isActive, color = 'bg-violet-500', intensity = 0.5 }) => {
  const [bars, setBars] = useState<number[]>(Array(12).fill(10));

  useEffect(() => {
    let interval: number;
    if (isActive) {
      interval = window.setInterval(() => {
        setBars(prev => prev.map(() => Math.max(10, Math.random() * 100 * intensity)));
      }, 100);
    } else {
      setBars(Array(12).fill(10));
    }
    return () => clearInterval(interval);
  }, [isActive, intensity]);

  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {bars.map((height, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full transition-all duration-100 ${color}`}
          style={{ height: `${height}%`, opacity: isActive ? 1 : 0.3 }}
        />
      ))}
    </div>
  );
};

export default Waveform;

