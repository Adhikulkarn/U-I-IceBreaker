export default function HUDStat({ label, value, accent = "pink" }) {
  const accentClass = accent === "green" ? "text-neonGreen" : "text-neonPink";

  return (
    <div className="pixel-corners min-w-0 rounded-2xl border-4 border-borderGlow bg-hud px-4 py-4">
      <p className="font-pixel text-[0.55rem] uppercase tracking-[0.18em] text-zinc-400">
        {label}
      </p>
      <p className={`mt-3 break-words text-base font-bold sm:text-lg ${accentClass}`}>
        {value}
      </p>
    </div>
  );
}
