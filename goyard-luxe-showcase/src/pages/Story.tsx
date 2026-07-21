import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Timeline from "@/components/Timeline";
import Scene3D from "@/components/Scene3D";
import Craftsmanship from "@/components/Craftsmanship";
import ArtisanQuotes from "@/components/ArtisanQuotes";
import StoreList from "@/components/StoreList";
import StaggerReveal, { StaggerItem } from "@/components/StaggerReveal";
import MagneticButton from "@/components/MagneticButton";
import { Link } from "react-router-dom";

export default function Story() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 20;
      const y = (clientY / innerHeight - 0.5) * 20;
      const bg = heroRef.current.querySelector(
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
    <main>
      <section
        ref={heroRef}
        className="relative h-screen w-full overflow-hidden bg-charcoal"
      >
        <div
          className="hero-bg absolute inset-0 transition-transform duration-[1200ms] ease-out"
          style={{ transform: "scale(1.05)" }}
        >
          <img
            src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=grand%20parisian%20workshop%20interior%20with%20natural%20light%2C%20vintage%20leather%20trunks%20displayed%2C%20warm%20amber%20tones%2C%20luxury%20heritage%20atmosphere%2C%20cinematic&image_size=landscape_16_9"
            alt="Maison Goyard Heritage"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-transparent to-charcoal/80" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="mb-6"
          >
            <span className="inline-block text-[10px] font-sans tracking-[0.5em] uppercase text-gold/80">
              Notre Histoire
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="font-serif text-cream text-display-xl md:text-[8rem] lg:text-[10rem] leading-none tracking-[0.05em] mb-8"
          >
            品牌故事
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
            className="font-serif text-cream/70 text-lg md:text-xl tracking-[0.15em] max-w-lg mb-12"
          >
            从 1853 年的巴黎工坊到今日的全球传奇
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 1.1 }}
            className="flex gap-4"
          >
            <MagneticButton strength={0.25}>
              <Link
                to="/collection"
                data-cursor="pointer"
                data-cursor-text="系列"
                className="pill-button pill-button-light"
              >
                <span>探索系列</span>
              </Link>
            </MagneticButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
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

      <section className="py-30 md:py-40 bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <StaggerReveal className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <StaggerItem>
                <span className="inline-block text-[10px] font-sans tracking-[0.5em] uppercase text-gold mb-6">
                  Philosophy
                </span>
              </StaggerItem>
              <StaggerItem>
                <h2 className="font-serif text-display-md md:text-display-lg text-charcoal mb-8 text-balance">
                  时间是最好的
                  <br />
                  <span className="text-warm-gray">品质证明</span>
                </h2>
              </StaggerItem>
              <StaggerItem>
                <p className="font-sans text-warm-gray text-base md:text-lg leading-relaxed max-w-md mb-6">
                  在一个追求速度的时代，Maison Goyard 选择了一条不同的路。我们相信，真正持久的优雅，来自对每一个细节的极致追求，来自对传统的敬畏与坚守。
                </p>
              </StaggerItem>
              <StaggerItem>
                <p className="font-sans text-warm-gray/70 text-sm leading-relaxed max-w-md mb-10">
                  一百七十余年来，我们从未改变这一信念。每一只 Goyard 箱包，都是时间与匠心的结晶——它不会随潮流褪色，只会随岁月愈发珍贵。
                </p>
              </StaggerItem>
              <StaggerItem>
                <MagneticButton strength={0.2}>
                  <Link
                    to="/collection"
                    data-cursor="pointer"
                    data-cursor-text="系列"
                    className="pill-button text-charcoal"
                  >
                    <span>探索产品系列</span>
                  </Link>
                </MagneticButton>
              </StaggerItem>
            </div>

            <div className="relative">
              <StaggerItem>
                <div className="relative">
                  <div className="image-hover-zoom rounded-sm overflow-hidden">
                    <img
                      src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20leather%20goods%20atelier%20interior%2C%20warm%20golden%20lighting%2C%20handmade%20bags%20on%20wooden%20table%2C%20craftsman%20tools%2C%20elegant%20minimal%20photography&image_size=portrait_4_3"
                      alt="Goyard Atelier"
                      className="w-full aspect-[4/5] object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-40 h-40 md:w-56 md:h-56 image-hover-zoom rounded-sm overflow-hidden shadow-2xl shadow-charcoal/10">
                    <img
                      src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=close%20up%20of%20luxury%20bag%20stitching%20detail%2C%20warm%20golden%20lighting%2C%20handmade%20saddle%20stitch%2C%20beige%20thread%20on%20brown%20leather%2C%20elegant%20minimal&image_size=square"
                      alt="Stitching Detail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </StaggerItem>
            </div>
          </StaggerReveal>
        </div>
      </section>

      <Timeline />
      <Craftsmanship />
      <Scene3D />
      <ArtisanQuotes />

      <section className="py-20 md:py-28 bg-beige/30">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <StaggerReveal className="text-center mb-16">
            <StaggerItem>
              <span className="inline-block text-[10px] font-sans tracking-[0.5em] uppercase text-gold mb-6">
                Film
              </span>
            </StaggerItem>
            <StaggerItem>
              <h2 className="font-serif text-display-sm md:text-display-md text-charcoal mb-6">
                品牌影片
              </h2>
            </StaggerItem>
          </StaggerReveal>

          <StaggerReveal>
            <StaggerItem>
              <div
                className="relative aspect-video rounded-sm overflow-hidden bg-charcoal group"
                data-cursor="pointer"
                data-cursor-text="播放"
              >
                <img
                  src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cinematic%20wide%20shot%20of%20luxury%20leather%20workshop%2C%20dramatic%20lighting%2C%20artisan%20at%20work%2C%20warm%20amber%20tones%2C%20film%20still%20quality%2C%20anamorphic&image_size=landscape_16_9"
                  alt="Brand Film"
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-opacity duration-500"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-cream/60 flex items-center justify-center group-hover:scale-110 group-hover:border-gold transition-all duration-500">
                    <div className="ml-1.5 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[16px] border-l-cream/80 group-hover:border-l-gold transition-colors duration-500" />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8">
                  <p className="font-serif text-cream text-lg md:text-xl">
                    L&apos;Art du Voyage
                  </p>
                  <p className="font-sans text-cream/40 text-xs tracking-wider mt-1">
                    2024 · 3:42
                  </p>
                </div>
              </div>
            </StaggerItem>
          </StaggerReveal>
        </div>
      </section>

      <StoreList />

      <section className="py-30 md:py-40 bg-charcoal text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(196,162,101,0.1) 35px, rgba(196,162,101,0.1) 36px)",
            }}
          />
        </div>
        <StaggerReveal className="max-w-2xl mx-auto px-6 relative z-10">
          <StaggerItem>
            <h2 className="font-serif text-display-sm md:text-display-md text-cream mb-8">
              开启您的 Goyard 之旅
            </h2>
          </StaggerItem>
          <StaggerItem>
            <p className="font-sans text-cream/40 text-base leading-relaxed mb-10">
              每一件 Goyard 作品，都在等待与您相遇。欢迎莅临我们的精品门店，或在线探索完整系列。
            </p>
          </StaggerItem>
          <StaggerItem>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <MagneticButton strength={0.2}>
                <Link
                  to="/collection"
                  data-cursor="pointer"
                  data-cursor-text="系列"
                  className="pill-button pill-button-light"
                >
                  <span>探索产品系列</span>
                </Link>
              </MagneticButton>
              <MagneticButton strength={0.2}>
                <button
                  data-cursor="pointer"
                  data-cursor-text="联系"
                  className="pill-button pill-button-light border-cream/20"
                >
                  <span>预约到店</span>
                </button>
              </MagneticButton>
            </div>
          </StaggerItem>
        </StaggerReveal>
      </section>
    </main>
  );
}
