import React from "react";

interface AcademyLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "large" | string;
  className?: string;
  showText?: boolean;
  textClassName?: string;
  textColor?: "dark" | "light";
}

export default function AcademyLogo({
  size = "lg",
  className = "",
  showText = false,
  textClassName = "",
  textColor = "dark",
}: AcademyLogoProps) {
  const sizeMap: Record<string, string> = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
    xl: "w-14 h-14",
    "2xl": "w-16 h-16",
    large: "w-12 h-12 sm:w-14 sm:h-14",
  };

  const currentSize = sizeMap[size] || size;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Laurel Wreath + Mortarboard Academic Crest */}
      <div className={`relative flex items-center justify-center shrink-0 ${currentSize}`}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          {/* Left Laurel Wreath Branch */}
          <path
            d="M20 48C13 39 13 23 23 13"
            stroke="#0050CB"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Left Leaves */}
          <path d="M15 22C13 20 11 21 11 24C11 27 14 26 15 24" fill="#0050CB" />
          <path d="M14 31C12 30 10 31 10 34C10 37 13 36 14 33" fill="#0050CB" />
          <path d="M15 40C13 39 11 40 11 43C11 46 14 45 15 42" fill="#0050CB" />
          <path d="M19 47C17 46 15 48 15 50C15 53 18 52 19 49" fill="#0050CB" />
          <path d="M21 16C20 14 18 14 17 17C17 19 20 19 21 17" fill="#0050CB" />

          {/* Right Laurel Wreath Branch */}
          <path
            d="M44 48C51 39 51 23 41 13"
            stroke="#0050CB"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Right Leaves */}
          <path d="M49 22C51 20 53 21 53 24C53 27 50 26 49 24" fill="#0050CB" />
          <path d="M50 31C52 30 54 31 54 34C54 37 51 36 50 33" fill="#0050CB" />
          <path d="M49 40C51 39 53 40 53 43C53 46 50 45 49 42" fill="#0050CB" />
          <path d="M45 47C47 46 49 48 49 50C49 53 46 52 45 49" fill="#0050CB" />
          <path d="M43 16C44 14 46 14 47 17C47 19 44 19 43 17" fill="#0050CB" />

          {/* Graduation Cap Diamond Top */}
          <polygon points="32,19 51,28 32,37 13,28" fill="#0050CB" />
          <polygon points="13,28 32,37 32,39 13,30" fill="#003B99" />
          <polygon points="51,28 32,37 32,39 51,30" fill="#00226B" />

          {/* Skull Cap Base */}
          <path
            d="M22 32.5C22 32.5 22 44 32 45C42 44 42 32.5 42 32.5"
            fill="#000E28"
          />

          {/* Golden Orange Tassel Button & String */}
          <circle cx="32" cy="28" r="2.4" fill="#FF690C" />
          <path
            d="M32 28 Q44 30 45 38 L45 44"
            stroke="#FF690C"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="45" cy="44.5" r="2.2" fill="#FF690C" />
        </svg>
      </div>

      {/* Optional Brand Text */}
      {showText && (
        <span
          className={`text-2xl font-black tracking-tight ${
            textColor === "light" ? "text-white" : "text-[#000E28]"
          } ${textClassName}`}
        >
          GGPS <span className="text-[#0050CB]">School</span>
        </span>
      )}
    </div>
  );
}
