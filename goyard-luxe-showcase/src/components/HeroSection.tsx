import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import MagneticButton from "./MagneticButton";
import { Link } from "react-router-dom";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 20;
      const y = (clientY / innerHeight - 0.5) * 20;
      const bg = containerRef.current.querySelector(
        ".hero-bg"
      ) as HTMLElement;
      if (bg) {
        bg.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-charcoal"
    >
      <div
        className="hero-bg absolute inset-0 transition-transform duration-[1200ms] ease-out"
        style={{ transform: "scale(1.05)" }}
      >
        <img
          src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20leather%20goods%20workshop%20interior%2C%20warm%20amber%20lighting%2C%20craftsman%20hands%20working%20on%20beige%20canvas%20with%20chevron%20pattern%2C%20elegant%20dark%20atmosphere%2C%20cinematic%20depth%20of%20field%2C%20high%20end%20fashion%20photography&image_size=landscape_16_9"
          alt="Maison Goyard"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-transparent to-charcoal/80" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
          className="mb-6"
        >
          <span className="inline-block text-[10px] font-sans tracking-[0.5em] uppercase text-gold/80">
            Since 1853
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 1 }}
          className="font-serif text-cream text-display-xl md:text-[8rem] lg:text-[10rem] leading-none tracking-[0.05em] mb-8"
        >
          GOYARD
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 1.3 }}
          className="font-serif text-cream/70 text-lg md:text-xl tracking-[0.15em] max-w-lg mb-12"
        >
          传承百年的法式优雅
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 1.6 }}
          className="flex gap-4"
        >
          <MagneticButton strength={0.25}>
            <Link
              to="/collection"
              data-cursor="pointer"
              data-cursor-text="探索"
              className="pill-button pill-button-light"
            >
              <span>探索系列</span>
            </Link>
          </MagneticButton>
          <MagneticButton strength={0.25}>
            <Link
              to="/story"
              data-cursor="pointer"
              data-cursor-text="故事"
              className="pill-button pill-button-light border-cream/20"
            >
              <span>品牌故事</span>
            </Link>
          </MagneticButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[9px] font-sans tracking-[0.3em] uppercase text-cream/40">
              Scroll
            </span>
            <div className="w-px h-8 bg-gradient-to-b from-cream/40 to-transparent" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
