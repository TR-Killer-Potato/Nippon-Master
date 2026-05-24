import React, { useRef, useEffect } from "react";

interface TooltipProps {
  reading: string;
  meaning: string;
  x: number;
  y: number;
  isVisible: boolean;
  onClose: () => void;
}

export default function Tooltip({ reading, meaning, x, y, isVisible, onClose }: TooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      ref={tooltipRef}
      className="absolute bg-[#1e293b] text-white p-3 rounded-lg shadow-xl border border-white/10 z-50 text-sm font-sans"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: "translate(-50%, -100%)",
        marginTop: "-10px",
      }}
    >
      <div className="font-bold text-amber-400 mb-1">[{reading}]</div>
      <div className="italic">{meaning}</div>
    </div>
  );
}
