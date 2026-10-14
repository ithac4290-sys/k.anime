import React from 'react';

interface LoadingScreenProps {
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingScreen({ 
  text = 'Sahifa yuklanmoqda...', 
  fullScreen = true 
}: LoadingScreenProps) {
  return (
    <div 
      className={`${
        fullScreen ? 'fixed inset-0 z-50' : 'w-full py-24'
      } flex flex-col items-center justify-center bg-black text-center select-none animate-in fade-in duration-200`}
    >
      {/* Center Emblem with Neon Red Spinning Ring matching Screenshot */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Outer glowing rotating ring */}
        <div className="absolute w-20 h-20 rounded-full border-2 border-red-500/15 border-t-red-500 animate-spin shadow-[0_0_30px_rgba(239,68,68,0.45)]" />
        <div className="absolute w-20 h-20 rounded-full border-2 border-transparent border-b-rose-600/60 animate-spin [animation-duration:1.5s]" />

        {/* Center Circular Logo */}
        <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-red-500/80 shadow-lg shadow-red-500/40 bg-black flex items-center justify-center">
          <img
            src="/animeko-logo.jpg"
            alt="AnimeKO.uz"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Loading Text matching Screenshot */}
      <p className="text-sm font-medium text-gray-400 tracking-wide animate-pulse">
        {text}
      </p>
    </div>
  );
}
