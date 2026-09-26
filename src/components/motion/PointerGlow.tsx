import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/**
 * Ambient violet→cyan glow that trails the cursor. Fixed behind all content;
 * disabled for coarse pointers (touch) and before first pointer movement.
 */
export function PointerGlow() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-800);
  const y = useMotionValue(-800);
  const springX = useSpring(x, { stiffness: 55, damping: 20, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 55, damping: 20, mass: 0.6 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    setEnabled(true);
    const handleMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    };
    const handleLeave = () => setVisible(false);

    window.addEventListener("pointermove", handleMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handleLeave);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      document.documentElement.removeEventListener("pointerleave", handleLeave);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute left-0 top-0 -ml-[22rem] -mt-[22rem] h-[44rem] w-[44rem] rounded-full"
        style={{
          x: springX,
          y: springY,
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--glow-violet) 16%, transparent) 0%, color-mix(in oklch, var(--glow-cyan) 9%, transparent) 38%, transparent 68%)",
        }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}
