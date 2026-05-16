export default function RetroCard({
  children,
  className = "",
  glow = "pink",
}) {
  const glowClass = glow === "green" ? "shadow-green" : "shadow-neon";

  return (
    <div
      className={[
        "pixel-corners w-full overflow-hidden rounded-[1.5rem] border-4 border-borderGlow bg-panel/90 p-4 shadow-card backdrop-blur-sm sm:rounded-[1.75rem] sm:p-5 lg:p-6",
        glowClass,
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
