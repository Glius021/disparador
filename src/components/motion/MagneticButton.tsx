import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const variantClasses = {
  primary:
    "border border-transparent bg-foreground text-background hover:shadow-[0_0_36px_-8px_var(--glow-faint)]",
  ghost:
    "border border-line-strong bg-transparent text-foreground hover:border-glow-cyan/50 hover:bg-surface-strong",
} as const;

export function MagneticButton({
  children,
  href,
  onClick,
  variant = "primary",
  className,
  type = "button",
  disabled = false,
}: MagneticButtonProps) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 180, damping: 14, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 180, damping: 14, mass: 0.4 });

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    if (reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    x.set(clamp(dx * 0.18, -8, 8));
    y.set(clamp(dy * 0.18, -6, 6));
  }

  function handlePointerLeave() {
    x.set(0);
    y.set(0);
  }

  const classes = cn(
    "inline-flex items-center justify-center gap-2 px-7 py-4 text-sm font-medium tracking-wide transition-[color,background-color,border-color,box-shadow] duration-300 disabled:pointer-events-none disabled:opacity-60",
    variantClasses[variant],
    className,
  );
  const style = { x: springX, y: springY };

  if (href) {
    return (
      <motion.a
        href={href}
        className={classes}
        style={style}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={onClick}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      className={classes}
      style={style}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
