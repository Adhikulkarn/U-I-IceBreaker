export default function PixelButton({
  children,
  className = "",
  type = "button",
  variant = "primary",
  disabled = false,
  ...props
}) {
  const variants = {
    primary:
      "border-neonPink bg-neonPink text-void shadow-neon hover:bg-[#ff6ae0]",
    secondary:
      "border-neonGreen bg-neonGreen text-void shadow-green hover:bg-[#92ff8f]",
    ghost:
      "border-neonBlue bg-hud text-neonBlue hover:bg-hud/80",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        "pixel-corners min-h-[56px] rounded-2xl border-4 px-3 py-3 text-center font-pixel text-[0.58rem] uppercase tracking-[0.14em] transition duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[60px] sm:px-4 sm:py-4 sm:text-[0.65rem] lg:text-xs",
        variants[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
