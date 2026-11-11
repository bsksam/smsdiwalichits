import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className = "", size = "md", showText = true }: LogoProps) {
  const iconSize = size === "sm" ? 36 : size === "lg" ? 64 : 46;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Brand Logo Container with Gold Glow */}
      <div
        className="relative flex items-center justify-center rounded-2xl bg-white p-1 shadow-lg shadow-black/40 border border-amber-400/40 overflow-hidden shrink-0"
        style={{ width: iconSize, height: iconSize }}
      >
        <img
          src="/logo.png"
          alt="smstreat Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-extrabold text-amber-300 tracking-tight text-xl font-serif drop-shadow-sm">
              DIWALI
            </span>
            <span className="font-black text-amber-500 tracking-tight text-xl font-serif">
              CHIT
            </span>
          </div>
          <span className="text-[10px] font-bold tracking-widest text-amber-400/90 uppercase mt-0.5">
            SMSTREAT • SUPERMARKET ERP
          </span>
        </div>
      )}
    </div>
  );
}
