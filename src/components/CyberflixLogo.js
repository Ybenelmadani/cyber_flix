import React from "react";

function LogoMark({ className = "h-11 w-11" }) {
  return (
    <svg
      viewBox="0 0 72 72"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="cyberflix-stroke" x1="10" y1="8" x2="61" y2="63">
          <stop offset="0%" stopColor="#2DD4BF" />
          <stop offset="52%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="cyberflix-bg" x1="14" y1="10" x2="55" y2="60">
          <stop offset="0%" stopColor="#0B1329" />
          <stop offset="100%" stopColor="#101A35" />
        </linearGradient>
      </defs>

      <rect
        x="8"
        y="8"
        width="56"
        height="56"
        rx="18"
        fill="url(#cyberflix-bg)"
        stroke="url(#cyberflix-stroke)"
        strokeWidth="2.5"
      />
      <path
        d="M27 23C21.9 23 18 26.9 18 32V40C18 45.1 21.9 49 27 49H31.5"
        stroke="url(#cyberflix-stroke)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M44 24L54 34L44 44"
        stroke="#EC4899"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M31 27L43 36L31 45V27Z"
        fill="#E2E8F0"
        fillOpacity="0.95"
      />
      <circle cx="55" cy="18" r="3" fill="#22D3EE" fillOpacity="0.85" />
    </svg>
  );
}

export default function CyberflixLogo({ compact = false }) {
  return (
    <span className={`inline-flex items-center ${compact ? "gap-2.5" : "gap-3"}`}>
      <LogoMark className={compact ? "h-8 w-8" : "h-11 w-11"} />

      <span className="flex flex-col">
        <span
          className={`font-semibold uppercase tracking-[0.35em] text-cyber-cyan/60 ${
            compact ? "text-[0.5rem]" : "text-[0.68rem]"
          }`}
        >
          Streaming hub
        </span>
        <span
          className={`bg-[linear-gradient(135deg,#E2E8F0_0%,#67E8F9_48%,#F0ABFC_100%)] bg-clip-text font-black tracking-[0.18em] text-transparent ${
            compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
          }`}
        >
          CYBERFLIX
        </span>
      </span>
    </span>
  );
}
