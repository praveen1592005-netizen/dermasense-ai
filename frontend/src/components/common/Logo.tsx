import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  clickable?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  clickable = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-lg', sub: 'text-[9px]' },
    md: { icon: 36, text: 'text-xl', sub: 'text-[10px]' },
    lg: { icon: 44, text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 56, text: 'text-3xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  const logoContent = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* SVG Logo Emblem */}
      <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="50%" stopColor="#14B8A6" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
            <linearGradient id="logoGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Outer AI Scan Ring with Dashes */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="url(#logoGrad)"
            strokeWidth="3.5"
            strokeDasharray="10 5"
            className="animate-spin-slow origin-center opacity-80"
          />
          {/* Inner Glowing Backdrop */}
          <circle cx="50" cy="50" r="38" fill="url(#logoGlow)" opacity="0.18" />

          {/* Facial Silhouette / Shield Geometry */}
          <path
            d="M50 16 C30 24 20 44 24 63 C27 78 40 86 50 89 C60 86 73 78 76 63 C80 44 70 24 50 16 Z"
            fill="url(#logoGrad)"
          />

          {/* Central AI Cross & Sensory Dots */}
          <path
            d="M50 30 L50 70 M30 50 L70 50"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="50" cy="50" r="5.5" fill="#FFFFFF" />
          <circle cx="50" cy="30" r="3.5" fill="#FFFFFF" />
          <circle cx="50" cy="70" r="3.5" fill="#FFFFFF" />
          <circle cx="30" cy="50" r="3.5" fill="#FFFFFF" />
          <circle cx="70" cy="50" r="3.5" fill="#FFFFFF" />
        </svg>

        {/* Subtle Ambient Pulse */}
        <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-md -z-10 group-hover:bg-brand-400/30 transition-colors" />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-center">
          <span className={`font-extrabold tracking-tight text-slate-900 dark:text-white ${currentSize.text}`}>
            Derma
          </span>
          <span className={`font-extrabold tracking-tight bg-gradient-to-r from-brand-500 to-tealBrand-500 bg-clip-text text-transparent ${currentSize.text}`}>
            Sense
          </span>
          <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-brand-500/10 dark:bg-brand-400/15 text-brand-600 dark:text-brand-400 border border-brand-500/20">
            AI
          </span>
        </div>
        {showTagline && (
          <span className={`text-slate-500 dark:text-slate-400 font-medium tracking-wide ${currentSize.sub}`}>
            AI-Powered Skin Health & Care
          </span>
        )}
      </div>
    </div>
  );

  if (clickable) {
    return (
      <Link to="/" className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};
