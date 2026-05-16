export default function LoadingBar({ active = false }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 font-pixel text-[0.5rem] uppercase tracking-[0.16em] text-zinc-400 sm:text-[0.55rem]">
        <span>{active ? "Round Sync" : "Host Signal"}</span>
        <span className={active ? "text-neonGreen" : "text-neonPink"}>
          {active ? "LIVE" : "WAITING"}
        </span>
      </div>
      <div className="pixel-corners relative h-5 overflow-hidden rounded-2xl border-4 border-borderGlow bg-hud">
        <div
          className={[
            "absolute inset-y-0 left-0 w-1/3 rounded-r-xl",
            active ? "bg-neonGreen animate-marquee" : "bg-neonPink animate-marquee",
          ].join(" ")}
        />
      </div>
    </div>
  );
}
