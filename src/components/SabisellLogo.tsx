import React from 'react';

interface SabisellLogoProps {
  className?: string; // Sizing and placement classes
  strokeWidth?: number; // Custom stroke weight
  animate?: boolean; // Whether to add subtle pulse/draw animation
}

export const SabisellLogo: React.FC<SabisellLogoProps> = ({
  className = "h-5 w-5",
  strokeWidth = 3.5,
  animate = false,
}) => {
  // S path designed beautifully inside a 32x32 viewbox
  const sPath = "M24 9.5 C24 6.5 21 5.5 16 5.5 C10 5.5 8 8 8 12.5 C8 18 24 16.5 24 22 C24 25.5 21 26.5 16 26.5 C10.5 26.5 8 24 8 20.5";

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animate ? 'animate-pulse' : ''}`}
    >
      {/* 1. Underlying light Track of the full S (representing the guiding plan or blueprint) */}
      <path
        d={sPath}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-15"
      />

      {/* 2. Main foreground 70% drawn letter S */}
      <path
        d={sPath}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="100"
        strokeDasharray="70 30"
        strokeDashoffset="0"
        style={{
          // Use CSS transition for smooth rendering
          transition: 'stroke-dashoffset 0.8s ease-in-out',
        }}
      />

      {/* 3. Tiny glowing or solid tip indicating active drawing point at 70% */}
      {/* 70% of this specific route terminates beautifully towards the bottom return curve */}
      <circle
        cx="14.8"
        cy="26.3"
        r="1.5"
        fill="currentColor"
      />
    </svg>
  );
};
