'use client';

export default function BackgroundOrbs() {
  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-[#090d16]">
      {/* Dynamic gradient background using deep neutrals (#0f172a, #090d16) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#090d16] via-[#111827] to-[#080c14]" />

      {/* Floating blurred ambient orbs matching the palette:
          Primary: #F97316 (Orange)
          Secondary: #10B981 (Emerald)
          Tertiary: #FBBF24 (Amber/Gold)
      */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#F97316]/25 blur-[130px] animate-pulse" />
      <div className="absolute top-1/4 -right-24 w-88 h-88 rounded-full bg-[#10B981]/20 blur-[140px]" />
      <div className="absolute top-2/3 left-10 w-96 h-96 rounded-full bg-[#FBBF24]/18 blur-[130px]" />
      <div className="absolute -bottom-24 right-1/4 w-96 h-96 rounded-full bg-[#F97316]/20 blur-[140px]" />

      {/* Subtle fine grid texture for spatial iOS precision with Neutral #F8FAFC */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(#F8FAFC 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
}
