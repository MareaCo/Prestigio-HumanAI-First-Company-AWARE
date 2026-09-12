import React from "react";

interface PrestigioLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "dark" | "light";
  showTagline?: boolean;
}

export function PrestigioLogo({
  className = "",
  iconOnly = false,
  size = "md",
  variant = "dark",
  showTagline = true,
}: PrestigioLogoProps) {
  // Brand Colors from the Prestigio logo
  // Dark Teal: #004757
  // Lime Green: #a3b808
  // Light Grey: #a0aec0
  const tealColor = variant === "dark" ? "#004757" : "#ffffff";
  const textColor = variant === "dark" ? "text-[#004757]" : "text-white";

  // Dimensions based on size
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-5xl",
  };

  const gapSizes = {
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4",
    xl: "gap-6",
  };

  const renderIcon = () => (
    <svg
      viewBox="0 0 50 50"
      className={`${iconSizes[size]} shrink-0 select-none`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Central solid dot */}
      <circle cx="22" cy="28" r="5" fill={tealColor} />

      {/* Middle ring with a top-right gap */}
      {/* Center at (22, 28), radius 11. Arc from 45deg (30, 20) around clockwise to 90deg (22, 17) */}
      <path
        d="M 29.8 20.2 A 11 11 0 1 1 22 17"
        stroke={tealColor}
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Outer ring with a top-right gap */}
      {/* Center at (22, 28), radius 17. Arc from 45deg (34, 16) around clockwise to 90deg (22, 11) */}
      <path
        d="M 34.0 16.0 A 17 17 0 1 1 22 11"
        stroke={tealColor}
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Connection link in grey between lime green dots */}
      <line
        x1="29.8"
        y1="20.2"
        x2="35.5"
        y2="14.5"
        stroke="#cbd5e1"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Lime green dots at the top right gap */}
      {/* Lower dot at middle ring end */}
      <circle cx="29.8" cy="20.2" r="3.8" fill="#a3b808" />
      {/* Upper dot at outer ring end / slightly further out */}
      <circle cx="35.5" cy="14.5" r="3.2" fill="#d2e01b" />
      <circle
        cx="35.5"
        cy="14.5"
        r="3.2"
        fill="#a3b808"
        stroke="#d2e01b"
        strokeWidth="0.8"
      />
    </svg>
  );

  if (iconOnly) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderIcon()}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${gapSizes[size]} ${className}`}>
      {renderIcon()}
      <div className="flex flex-col items-start justify-center">
        <span
          className={`font-display font-black tracking-tight leading-none ${textColor} ${textSizes[size]}`}
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Prestigio
        </span>
        {showTagline && (
          <span className="hidden sm:inline-block text-[#96a900] font-bold text-[9px] sm:text-[9.5px] tracking-tight leading-none mt-0.5">
            Liderando desde el ser
          </span>
        )}
      </div>
    </div>
  );
}

export function PrestigioBrandLockup({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center justify-center gap-3.5 sm:gap-4.5 ${className}`}
    >
      {/* Left: Prestigio Logo */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <PrestigioLogo iconOnly size="md" />
        <span
          className="font-display font-black text-2xl sm:text-[27px] tracking-tight text-[#004757] leading-none select-none"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Prestigio
        </span>
      </div>

      {/* Vertical Divider */}
      <div className="w-px h-11 sm:h-12 bg-slate-300/80 shrink-0" />

      {/* Right: HumanAI First Company info */}
      <div className="flex flex-col justify-center text-left leading-snug">
        <span className="font-extrabold text-[15px] sm:text-[16px] text-[#545759] tracking-tight leading-tight flex items-center">
          HumanAI First Company
          <span className="text-[28px] sm:text-[30px] font-extrabold ml-0.5 text-[#545759] inline-block align-middle leading-none relative -top-[2px]">
            ®
          </span>
        </span>
        <span className="font-bold text-[13px] sm:text-[14px] text-[#64748b] leading-tight">
          by Prestigio
        </span>
        <span className="font-bold text-[9px] sm:text-[10px] text-[#64748b] tracking-[0.14em] uppercase mt-0.5 leading-tight">
          GOBERNANZA Y OBSERVABILIDAD
        </span>
      </div>
    </div>
  );
}
