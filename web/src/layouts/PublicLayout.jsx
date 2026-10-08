import { Outlet } from "react-router";
import { APP_NAME } from "@/components/AppName";

// SVG bird mascot — inline so no network request is needed
function BirdMascot() {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="w-48 h-48 sm:w-56 sm:h-56"
    >
      {/* Branch */}
      <path d="M30 155 Q100 140 170 150" stroke="#1a4a35" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Leaves */}
      <ellipse cx="60" cy="138" rx="14" ry="8" fill="#1a4a35" transform="rotate(-30 60 138)" opacity="0.8" />
      <ellipse cx="120" cy="132" rx="16" ry="9" fill="#1a4a35" transform="rotate(20 120 132)" opacity="0.8" />
      <ellipse cx="155" cy="138" rx="12" ry="7" fill="#1a4a35" transform="rotate(-15 155 138)" opacity="0.7" />
      {/* Small flowers/berries */}
      <circle cx="75" cy="126" r="5" fill="#f4a261" opacity="0.9" />
      <circle cx="90" cy="122" r="4" fill="#e76f51" opacity="0.8" />
      <circle cx="140" cy="124" r="5" fill="#f4a261" opacity="0.9" />
      {/* Bird body */}
      <ellipse cx="100" cy="115" rx="28" ry="22" fill="#e9c46a" />
      {/* Bird breast */}
      <ellipse cx="108" cy="122" rx="16" ry="14" fill="#f4a261" />
      {/* Bird head */}
      <circle cx="88" cy="95" r="18" fill="#e9c46a" />
      {/* Bird eye */}
      <circle cx="82" cy="91" r="6" fill="white" />
      <circle cx="83" cy="91" r="4" fill="#1c1c1a" />
      <circle cx="84" cy="89" r="1.5" fill="white" />
      {/* Beak */}
      <path d="M72 95 L62 92 L72 98 Z" fill="#f4a261" />
      {/* Wing */}
      <ellipse cx="118" cy="112" rx="18" ry="10" fill="#264653" transform="rotate(20 118 112)" opacity="0.9" />
      {/* Tail */}
      <path d="M128 128 Q140 135 135 145 Q128 132 125 140 Q122 128 128 128Z" fill="#264653" />
      {/* Legs */}
      <path d="M95 136 L92 150 M100 136 L100 150" stroke="#e76f51" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M89 150 L92 150 L95 148" stroke="#e76f51" strokeWidth="2" strokeLinecap="round" />
      <path d="M97 150 L100 150 L103 148" stroke="#e76f51" strokeWidth="2" strokeLinecap="round" />
      {/* Dots decoration */}
      <circle cx="50" cy="110" r="4" fill="white" opacity="0.3" />
      <circle cx="155" cy="108" r="5" fill="white" opacity="0.25" />
      <circle cx="165" cy="95" r="3" fill="white" opacity="0.2" />
    </svg>
  );
}

// Left branding panel for the split auth layout
function BrandPanel() {
  return (
    <div className="auth-panel-left hidden lg:flex">
      {/* Top brand name */}
      <div className="self-start">
        <p className="text-white/90 font-semibold text-lg tracking-tight italic">{APP_NAME}</p>
      </div>

      {/* Center — mascot */}
      <div className="flex flex-col items-center gap-6 -mt-8">
        <BirdMascot />
        <div className="text-center">
          <h2 className="text-white text-2xl font-semibold leading-snug">Simplicity fuels momentum</h2>
          <p className="text-white/70 text-sm mt-2 max-w-xs leading-relaxed">
            Orchestrate workflows seamlessly. Keep focus where it matters most.
          </p>
        </div>
      </div>

      {/* Bottom dots */}
      <div className="flex gap-2 self-end">
        <span className="w-6 h-2 rounded-full bg-white/80" />
        <span className="w-2 h-2 rounded-full bg-white/30" />
        <span className="w-2 h-2 rounded-full bg-white/30" />
        <span className="w-2 h-2 rounded-full bg-white/30" />
      </div>
    </div>
  );
}

/**
 * Split-panel layout for Login and Register.
 * Left: brand panel (lg+ only). Right: form content.
 * On smaller screens only the form is shown.
 */
export function PublicLayout() {
  return (
    <main
      className="min-h-svh flex items-center justify-center p-4 sm:p-8"
      style={{ backgroundColor: "#3d3d3d" }}
    >
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl flex bg-white sm:min-h-[520px]">
        {/* Left branding panel */}
        <BrandPanel />

        {/* Right form panel */}
        <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16">
          {/* Brand name on small screens (when left panel is hidden) */}
          <p className="lg:hidden text-center italic font-semibold text-lg text-foreground mb-6">
            {APP_NAME}
          </p>
          {/* Brand name top-right on large screens */}
          <p className="hidden lg:block text-right italic font-semibold text-base text-foreground mb-6">
            {APP_NAME}
          </p>
          <div className="max-w-md w-full mx-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </main>
  );
}
