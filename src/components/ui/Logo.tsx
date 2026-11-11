import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className = "", size = "md", showText = true }: LogoProps) {
  const iconSize = size === "sm" ? 32 : size === "lg" ? 54 : 42;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Royal Diwali Diya Emblem */}
      <div
        className="relative flex items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 via-brand-red to-brand-blue p-2 shadow-lg shadow-amber-900/20"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow"
        >
          {/* Diya Base */}
          <path
            d="M20 58 C 22 75, 40 85, 50 85 C 60 85, 78 75, 80 58 C 82 52, 70 55, 50 55 C 30 55, 18 52, 20 58 Z"
            fill="url(#diyaGold)"
          />
          {/* Diya Rim */}
          <ellipse cx="50" cy="56" rx="30" ry="6" fill="#fef08a" />
          <ellipse cx="50" cy="56" rx="27" ry="4" fill="#b45309" opacity="0.6" />

          {/* Diya Oil Well Glow */}
          <ellipse cx="50" cy="55" rx="16" ry="2.5" fill="#f59e0b" />

          {/* Diya Flame Outer */}
          <path
            d="M50 18 C 50 18, 38 35, 38 46 C 38 53, 43 56, 50 56 C 57 56, 62 53, 62 46 C 62 35, 50 18, 50 18 Z"
            fill="url(#flameOuter)"
          />
          {/* Diya Flame Inner Glow */}
          <path
            d="M50 26 C 50 26, 43 38, 43 47 C 43 51, 46 54, 50 54 C 54 54, 57 51, 57 47 C 57 38, 50 26, 50 26 Z"
            fill="url(#flameInner)"
          />

          {/* Decorative Sparks */}
          <circle cx="50" cy="14" r="2.5" fill="#fef08a" />
          <circle cx="34" cy="28" r="1.5" fill="#fef08a" opacity="0.8" />
          <circle cx="66" cy="28" r="1.5" fill="#fef08a" opacity="0.8" />

          <defs>
            <linearGradient id="diyaGold" x1="20" y1="55" x2="80" y2="85" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f59e0b" />
              <stop offset="0.5" stopColor="#d97706" />
              <stop offset="1" stopColor="#92400e" />
            </linearGradient>
            <linearGradient id="flameOuter" x1="50" y1="18" x2="50" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ef4444" />
              <stop offset="0.6" stopColor="#f59e0b" />
              <stop offset="1" stopColor="#facc15" />
            </linearGradient>
            <linearGradient id="flameInner" x1="50" y1="26" x2="50" y2="54" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="0.7" stopColor="#fef08a" />
              <stop offset="1" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-extrabold text-brand-blue tracking-tight text-xl font-sans drop-shadow-sm">
              DIWALI
            </span>
            <span className="font-extrabold text-amber-600 tracking-tight text-xl font-sans">
              CHIT
            </span>
          </div>
          <span className="text-[10px] font-semibold tracking-wider text-rose-800 uppercase mt-0.5">
            தீபாவளி மளிகை சிட் ERP
          </span>
        </div>
      )}
    </div>
  );
}
