export default function PixelInput({ label, className = "", ...props }) {
  return (
    <label className="flex w-full flex-col gap-3">
      <span className="font-pixel text-[0.62rem] uppercase tracking-[0.18em] text-neonGreen sm:text-[0.68rem]">
        {label}
      </span>
      <input
        className={[
          "pixel-corners min-h-[56px] w-full rounded-2xl border-4 border-borderGlow bg-hud px-4 py-4 text-base font-semibold text-white outline-none transition placeholder:text-zinc-500 focus:border-neonPink focus:shadow-neon",
          className,
        ].join(" ")}
        {...props}
      />
    </label>
  );
}
