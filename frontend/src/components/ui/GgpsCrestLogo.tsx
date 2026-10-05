import React from "react";

interface GgpsCrestLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "light" | "dark" | "auto";
}

export default function GgpsCrestLogo({
  size = "md",
  className = "",
}: GgpsCrestLogoProps) {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105 ${sizeMap[size]} ${className}`}
      aria-label="GGPS School Crest"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_8px_rgba(0,80,203,0.18)]"
      >
        <defs>
          <linearGradient id="ggpsBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E6BFF" />
            <stop offset="100%" stopColor="#003E9E" />
          </linearGradient>
          <linearGradient id="ggpsGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5B942" />
            <stop offset="100%" stopColor="#FF690C" />
          </linearGradient>
          <linearGradient id="ggpsPageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0050CB" />
            <stop offset="100%" stopColor="#002D75" />
          </linearGradient>
        </defs>

        {/* Outer Circular Ring with Compass Notches */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#ggpsBlueGrad)"
          strokeWidth="3.2"
          fill="none"
        />

        {/* Outer Gold Accent Ring Segments */}
        <path
          d="M32 90 A45 45 0 0 0 68 90"
          stroke="url(#ggpsGoldGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M44 5 A45 45 0 0 1 56 5"
          stroke="url(#ggpsGoldGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Top & Bottom Crest Point Pins */}
        <polygon points="50,1 53,6 47,6" fill="url(#ggpsBlueGrad)" />
        <polygon points="50,99 53,94 47,94" fill="url(#ggpsGoldGrad)" />
        <polygon points="1,50 6,47 6,53" fill="url(#ggpsBlueGrad)" />
        <polygon points="99,50 94,47 94,53" fill="url(#ggpsBlueGrad)" />

        {/* Left Laurel Wreath Branch */}
        <path
          d="M24 74 C16 62 16 42 22 28"
          stroke="url(#ggpsBlueGrad)"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Left Laurel Leaves */}
        <path d="M19 36 C16 34 13 36 14 39 C15 42 19 40 19 36 Z" fill="url(#ggpsBlueGrad)" />
        <path d="M17 48 C14 46 12 48 13 51 C14 54 18 52 17 48 Z" fill="url(#ggpsBlueGrad)" />
        <path d="M19 60 C16 58 15 61 16 64 C17 67 21 64 19 60 Z" fill="url(#ggpsBlueGrad)" />
        <path d="M23 70 C20 68 20 72 22 75 C24 77 26 74 23 70 Z" fill="url(#ggpsBlueGrad)" />
        <path d="M22 26 C20 24 18 25 18 27 C19 30 22 29 22 26 Z" fill="url(#ggpsBlueGrad)" />

        {/* Right Laurel Wreath Branch */}
        <path
          d="M76 74 C84 62 84 42 78 28"
          stroke="url(#ggpsBlueGrad)"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Right Laurel Leaves */}
        <path d="M81 36 C84 34 87 36 86 39 C85 42 81 40 81 36 Z" fill="url(#ggpsBlueGrad)" />
        <path d="M83 48 C86 46 88 48 87 51 C86 54 82 52 83 48 Z" fill="url(#ggpsBlueGrad)" />
        <path d="M81 60 C84 58 85 61 84 64 C83 67 79 64 81 60 Z" fill="url(#ggpsBlueGrad)" />
        <path d="M77 70 C80 68 80 72 78 75 C76 77 74 74 77 70 Z" fill="url(#ggpsBlueGrad)" />
        <path d="M78 26 C80 24 82 25 82 27 C81 30 78 29 78 26 Z" fill="url(#ggpsBlueGrad)" />

        {/* Rising Student / Golden Achievement Figure (Arms Raised) */}
        {/* Golden Head */}
        <circle cx="50" cy="27" r="7" fill="url(#ggpsGoldGrad)" />

        {/* Golden Raised Arms & Torso (V-shape) */}
        <path
          d="M33 34 C38 41 45 46 50 46 C55 46 62 41 67 34 C63 32 58 35 50 39 C42 35 37 32 33 34 Z"
          fill="url(#ggpsGoldGrad)"
        />

        {/* Open Book Pages */}
        {/* Left Book Page */}
        <path
          d="M48 50 C38 48 30 50 28 52 C27 52.5 27 76 27 76 C30 74 38 72 48 74 Z"
          fill="url(#ggpsPageGrad)"
        />
        <path
          d="M48 50 C38 48 30 50 28 52"
          stroke="#E5EEFF"
          strokeWidth="1.2"
          fill="none"
        />
        <path
          d="M31 55 L31 73 M36 54 L36 72 M41 53 L41 72 M46 52 L46 73"
          stroke="#FFFFFF"
          strokeOpacity="0.3"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Right Book Page */}
        <path
          d="M52 50 C62 48 70 50 72 52 C73 52.5 73 76 73 76 C70 74 62 72 52 74 Z"
          fill="url(#ggpsPageGrad)"
        />
        <path
          d="M52 50 C62 48 70 50 72 52"
          stroke="#E5EEFF"
          strokeWidth="1.2"
          fill="none"
        />
        <path
          d="M69 55 L69 73 M64 54 L64 72 M59 53 L59 72 M54 52 L54 73"
          stroke="#FFFFFF"
          strokeOpacity="0.3"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Book Spine Center Notch */}
        <path
          d="M50 49 L48 75 C49 76 51 76 52 75 Z"
          fill="#001844"
        />
      </svg>
    </div>
  );
}
