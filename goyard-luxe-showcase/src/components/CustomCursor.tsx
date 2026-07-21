import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useLocation } from "react-router-dom";

const INTERACTIVE_SELECTOR =
  'a, button, [data-cursor="pointer"], input, textarea, select, [role="button"]';

function getCursorText(el: HTMLElement): string {
  if (el.dataset.cursorText) return el.dataset.cursorText;
  const closest = el.closest("[data-cursor-text]");
  return closest ? (closest as HTMLElement).dataset.cursorText || "" : "";
}

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hoverText, setHoverText] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  const resetState = useCallback(() => {
    setIsHovering(false);
    setHoverText("");
    setIsClicking(false);
  }, []);

  const location = useLocation();

  useEffect(() => {
    resetState();
  }, [location.pathname, resetState]);

  useEffect(() => {
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    let lastHoveredEl: HTMLElement | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement;
      if (!target) return;

      const interactiveEl = target.closest(INTERACTIVE_SELECTOR) as HTMLElement | null;

      if (interactiveEl) {
        if (lastHoveredEl !== interactiveEl) {
          lastHoveredEl = interactiveEl;
          setIsHovering(true);
          setHoverText(getCursorText(interactiveEl));
        }
      } else {
        if (lastHoveredEl !== null) {
          lastHoveredEl = null;
          setIsHovering(false);
          setHoverText("");
        }
      }
    };

    const handleMouseDown = () => {
      setIsClicking(true);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      lastHoveredEl = null;
      setIsHovering(false);
      setHoverText("");
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [cursorX, cursorY]);

  const isTouchDevice =
    typeof window !== "undefined" &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0);

  if (isTouchDevice) return null;

  return (
    <motion.div
      ref={ref}
      className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
      style={{
        x: smoothX,
        y: smoothY,
        opacity: isVisible ? 1 : 0,
      }}
    >
      <motion.div
        className="relative flex items-center justify-center rounded-full"
        animate={{
          width: isHovering ? (hoverText ? 80 : 60) : isClicking ? 16 : 20,
          height: isHovering ? (hoverText ? 80 : 60) : isClicking ? 16 : 20,
          x: isHovering ? (hoverText ? -40 : -30) : isClicking ? -8 : -10,
          y: isHovering ? (hoverText ? -40 : -30) : isClicking ? -8 : -10,
          backgroundColor: isHovering
            ? "rgba(255,255,255,0.15)"
            : "rgba(255,255,255,0.9)",
          borderWidth: isHovering ? 1 : 0,
          borderColor: "rgba(255,255,255,0.3)",
        }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 300,
          mass: 0.5,
        }}
      >
        {hoverText && isHovering && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[9px] font-sans font-medium tracking-widest uppercase text-white whitespace-nowrap"
          >
            {hoverText}
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  );
}
