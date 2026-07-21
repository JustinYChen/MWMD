import { useState, useEffect, useRef, lazy, Suspense, useCallback } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MapGL, { Marker, Popup, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MagneticButton from "@/components/MagneticButton";
import {
  storeLocations,
  cityGroups,
  type StoreLocation,
} from "@/data/stores";

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

const HERO_BG =
  "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20gift%20box%20products%20elegant%20display%2C%20warm%20amber%20lighting%2C%20dark%20atmosphere%2C%20minimal%20composition%2C%20high%20end%20photography&image_size=landscape_16_9";

const QR_PLACEHOLDER =
  "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20elegant%20QR%20code%20placeholder%2C%20warm%20beige%20background%2C%20gold%20accents%2C%20luxury%20brand%20style&image_size=square_hd";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

const stats = [
  { target: 6, suffix: "+", label: "年行业经验" },
  { target: 6, suffix: "", label: "座城市" },
  { target: 30, suffix: "+", label: "款产品" },
];

function BrandHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 20;
      const y = (clientY / innerHeight - 0.5) * 20;
      const bg = containerRef.current.querySelector(
        ".about-hero-bg"
      ) as HTMLElement;
      if (bg) {
        bg.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !arrowRef.current) return;
    const tween = gsap.to(arrowRef.current, {
      y: 8,
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });
    return () => {
      tween.kill();
    };
  }, []);

  const textVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: [0.16, 1, 0.3, 1],
        delay: i * 0.3,
      },
    }),
  };

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-charcoal"
    >
      <div
        className="about-hero-bg absolute inset-0 transition-transform duration-[1200ms] ease-out"
        style={{ transform: "scale(1.05)" }}
      >
        <img
          src={HERO_BG}
          alt="蟹礼"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/50 via-transparent to-charcoal/80" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <motion.h1
          custom={0}
          initial="hidden"
          animate="visible"
          variants={textVariants}
          className="font-serif text-[5rem] tracking-[0.15em] text-cream mb-6"
        >
          关于蟹礼
        </motion.h1>

        <motion.p
          custom={1}
          initial="hidden"
          animate="visible"
          variants={textVariants}
          className="font-sans text-lg tracking-[0.2em] text-cream/50"
        >
          以蟹为礼，以鲜传道
        </motion.p>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <div
          ref={arrowRef}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[9px] font-sans tracking-[0.3em] uppercase text-cream/40">
            Scroll
          </span>
          <svg
            width="16"
            height="24"
            viewBox="0 0 16 24"
            fill="none"
            className="text-cream/40"
          >
            <path
              d="M8 4L8 20M8 20L2 14M8 20L14 14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}

function CompanyInfo() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stat0Ref = useRef<HTMLSpanElement>(null);
  const stat1Ref = useRef<HTMLSpanElement>(null);
  const stat2Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const statRefs = [stat0Ref, stat1Ref, stat2Ref];

    const ctx = gsap.context(() => {
      stats.forEach((stat, i) => {
        if (!statRefs[i].current) return;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: stat.target,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: statRefs[i].current,
            start: "top 85%",
            once: true,
          },
          onUpdate: () => {
            if (statRefs[i].current) {
              statRefs[i].current.textContent =
                Math.round(obj.val) + stat.suffix;
            }
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const leftVariants = {
    hidden: { opacity: 0, x: -80 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const rightVariants = {
    hidden: { opacity: 0, x: 80 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        delayChildren: 0.15,
        staggerChildren: 0.15,
      },
    },
  };

  const rightChildVariants = {
    hidden: { opacity: 0, x: 80 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section ref={sectionRef} className="py-30 md:py-40 bg-cream">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={leftVariants}
            className="flex flex-col items-start"
          >
            <h2 className="font-serif text-[3.5rem] text-gold leading-tight">
              蟹礼文化
            </h2>
            <span className="font-sans text-xs tracking-[0.3em] text-warm-gray mt-4">
              EST. 2018
            </span>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={rightVariants}
          >
            <motion.p
              variants={rightChildVariants}
              className="font-sans text-base text-warm-gray leading-relaxed max-w-[600px] mb-6"
            >
              蟹礼，始于对极致鲜味的执着追求。我们深耕高端蟹类礼品领域，
              从源头甄选每一只大闸蟹，以严苛标准把控品质，只为将最纯正的江南鲜味送达您的餐桌。
            </motion.p>
            <motion.p
              variants={rightChildVariants}
              className="font-sans text-base text-warm-gray leading-relaxed max-w-[600px] mb-6"
            >
              从阳澄湖畔到全国六座核心城市，蟹礼始终秉持"以蟹为礼，以鲜传道"的品牌理念，
              将传统蟹文化与现代精致生活方式完美融合，为每一位追求品质的食客呈现超越期待的味觉盛宴。
            </motion.p>
            <motion.p
              variants={rightChildVariants}
              className="font-sans text-base text-warm-gray leading-relaxed max-w-[600px] mb-12"
            >
              每一份蟹礼，都承载着对品质的坚守与对传统的敬意。我们相信，真正的好礼，
              不在于奢华的包装，而在于每一口鲜甜中传递的诚意与匠心。
            </motion.p>

            <motion.div
              variants={rightChildVariants}
              className="grid grid-cols-3 gap-8"
            >
              {stats.map((stat, i) => (
                <div key={stat.label} className="text-center">
                  <span
                    ref={[stat0Ref, stat1Ref, stat2Ref][i]}
                    className="font-serif text-[3rem] text-gold block"
                  >
                    0{stat.suffix}
                  </span>
                  <div className="w-12 h-px bg-gold/30 mx-auto my-3" />
                  <span className="font-sans text-sm text-warm-gray">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

interface MapViewProps {
  selectedStore: StoreLocation | null;
  onSelectStore: (store: StoreLocation) => void;
}

function MapView({ selectedStore, onSelectStore }: MapViewProps) {
  const [viewState, setViewState] = useState({
    longitude: 116.4,
    latitude: 32.0,
    zoom: 4,
  });
  const [hoveredStore, setHoveredStore] = useState<string | null>(null);

  const flyToStore = useCallback(
    (store: StoreLocation) => {
      setViewState((prev) => ({
        ...prev,
        longitude: store.longitude,
        latitude: store.latitude,
        zoom: 13,
      }));
    },
    []
  );

  useEffect(() => {
    if (selectedStore) {
      flyToStore(selectedStore);
    }
  }, [selectedStore, flyToStore]);

  return (
    <MapGL
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
    >
      <NavigationControl position="top-right" />

      {storeLocations.map((store) => {
        const isSelected = selectedStore?.id === store.id;
        const isHovered = hoveredStore === store.id;

        return (
          <Marker
            key={store.id}
            longitude={store.longitude}
            latitude={store.latitude}
            anchor="center"
          >
            <button
              type="button"
              className="relative focus:outline-none"
              onClick={() => onSelectStore(store)}
              onMouseEnter={() => setHoveredStore(store.id)}
              onMouseLeave={() => setHoveredStore(null)}
              style={{ cursor: "pointer" }}
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  isSelected
                    ? "w-5 h-5 bg-gold"
                    : isHovered
                    ? "w-[18px] h-[18px] bg-gold"
                    : "w-3 h-3 bg-gold"
                }`}
                style={{
                  boxShadow: isSelected
                    ? "0 0 0 4px rgba(196,162,101,0.3), 0 0 12px rgba(196,162,101,0.4)"
                    : isHovered
                    ? "0 0 0 3px rgba(196,162,101,0.25), 0 0 8px rgba(196,162,101,0.3)"
                    : "0 0 0 2px rgba(196,162,101,0.2)",
                }}
              />
              {isSelected && (
                <span className="absolute inset-0 rounded-full bg-gold/40 animate-ping" />
              )}
            </button>
          </Marker>
        );
      })}

      {selectedStore && (
        <Popup
          longitude={selectedStore.longitude}
          latitude={selectedStore.latitude}
          anchor="bottom"
          offset={[0, -16] as [number, number]}
          closeOnClick={false}
          onClose={() => onSelectStore(null as unknown as StoreLocation)}
          className="about-map-popup"
        >
          <div className="bg-charcoal/90 backdrop-blur-md rounded-lg p-4 min-w-[220px] border border-sand/20">
            <h4 className="font-serif text-sm text-cream mb-2">
              {selectedStore.name}
            </h4>
            <p className="font-sans text-xs text-cream/60 mb-1">
              {selectedStore.address}
            </p>
            <p className="font-sans text-xs text-cream/60 mb-1">
              {selectedStore.hours}
            </p>
            <p className="font-sans text-xs text-cream/60 mb-3">
              {selectedStore.phone}
            </p>
            <a
              href={`https://uri.amap.com/marker?position=${selectedStore.longitude},${selectedStore.latitude}&name=${encodeURIComponent(selectedStore.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gold/20 text-gold text-xs font-sans tracking-wider hover:bg-gold/30 transition-colors duration-300"
            >
              获取导航
            </a>
          </div>
        </Popup>
      )}
    </MapGL>
  );
}

const LazyMapView = lazy(() =>
  Promise.resolve({ default: MapView })
);

function StoreMapSection() {
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const filteredStores = searchQuery.trim()
    ? storeLocations.filter(
        (s) =>
          s.name.includes(searchQuery) ||
          s.city.includes(searchQuery) ||
          s.address.includes(searchQuery)
      )
    : storeLocations;

  const filteredCityGroups = searchQuery.trim()
    ? filteredStores.reduce<Record<string, StoreLocation[]>>((acc, store) => {
        if (!acc[store.city]) acc[store.city] = [];
        acc[store.city].push(store);
        return acc;
      }, {})
    : cityGroups;

  const leftVariants = {
    hidden: { opacity: 0, x: -60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 },
    },
  };

  const rightVariants = {
    hidden: { opacity: 0, x: 60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 },
    },
  };

  return (
    <section className="bg-charcoal">
      <div className="grid grid-cols-1 md:grid-cols-[30%_70%] min-h-[80vh]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={leftVariants}
          className="p-6 md:p-8 lg:p-10 overflow-y-auto h-[80vh] order-2 md:order-1 lenis-stopper"
        >
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="搜索门店..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full bg-charcoal/50 border border-sand/20 focus:border-gold focus:outline-none px-5 py-2.5 font-sans text-sm text-cream placeholder:text-cream/30 transition-colors duration-300"
            />
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/30"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          <div className="space-y-6">
            {Object.entries(filteredCityGroups).map(([city, stores]) => (
              <div key={city}>
                <h3 className="font-sans text-xs tracking-[0.2em] uppercase text-cream/40 mb-3">
                  {city}
                </h3>
                <div className="space-y-1">
                  {stores.map((store) => (
                    <button
                      key={store.id}
                      type="button"
                      onClick={() => {
                        setSelectedStore(store);
                        setIsDrawerOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-sm border-l-2 transition-all duration-300 group ${
                        selectedStore?.id === store.id
                          ? "border-l-gold bg-gold/5"
                          : "border-l-transparent hover:border-l-gold hover:bg-gold/5"
                      }`}
                    >
                      <p
                        className={`font-serif text-sm transition-colors duration-300 ${
                          selectedStore?.id === store.id
                            ? "text-gold"
                            : "text-cream/80 group-hover:text-gold"
                        }`}
                      >
                        {store.name}
                      </p>
                      <p className="font-sans text-xs text-cream/40 mt-1">
                        {store.address}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={rightVariants}
          className="relative min-h-[50vh] md:min-h-[80vh] order-1 md:order-2"
        >
          <Suspense
            fallback={
              <div className="w-full h-full bg-charcoal flex items-center justify-center">
                <span className="font-sans text-sm text-cream/30 tracking-wider">
                  地图加载中...
                </span>
              </div>
            }
          >
            <LazyMapView
              selectedStore={selectedStore}
              onSelectStore={setSelectedStore}
            />
          </Suspense>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="md:hidden absolute bottom-4 left-4 right-4 z-20 bg-charcoal/90 backdrop-blur-md rounded-xl border border-sand/20 px-5 py-3 flex items-center justify-between"
          >
            <span className="font-sans text-sm text-cream/80">
              {selectedStore ? selectedStore.name : "选择门店"}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className={`text-cream/40 transition-transform duration-300 ${
                isDrawerOpen ? "rotate-180" : ""
              }`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {isDrawerOpen && (
            <div className="md:hidden absolute bottom-16 left-4 right-4 z-20 bg-charcoal/95 backdrop-blur-md rounded-xl border border-sand/20 max-h-[50vh] overflow-y-auto p-4">
              {Object.entries(filteredCityGroups).map(([city, stores]) => (
                <div key={city} className="mb-4">
                  <h3 className="font-sans text-xs tracking-[0.2em] uppercase text-cream/40 mb-2">
                    {city}
                  </h3>
                  {stores.map((store) => (
                    <button
                      key={store.id}
                      type="button"
                      onClick={() => {
                        setSelectedStore(store);
                        setIsDrawerOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-sm border-l-2 transition-all duration-300 ${
                        selectedStore?.id === store.id
                          ? "border-l-gold bg-gold/5"
                          : "border-l-transparent hover:border-l-gold hover:bg-gold/5"
                      }`}
                    >
                      <p
                        className={`font-serif text-sm ${
                          selectedStore?.id === store.id
                            ? "text-gold"
                            : "text-cream/80"
                        }`}
                      >
                        {store.name}
                      </p>
                      <p className="font-sans text-xs text-cream/40 mt-0.5">
                        {store.address}
                      </p>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function ContactSection() {
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion || !qrRef.current) return;

    const el = qrRef.current;
    const enter = () => {
      gsap.to(el, {
        y: -4,
        boxShadow: "0 12px 40px rgba(196,162,101,0.15)",
        duration: 0.4,
        ease: "power2.out",
      });
    };
    const leave = () => {
      gsap.to(el, {
        y: 0,
        boxShadow: "0 0px 0px rgba(196,162,101,0)",
        duration: 0.4,
        ease: "power2.out",
      });
    };

    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
    };
  }, []);

  const colVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        delay: i * 0.2,
      },
    }),
  };

  return (
    <section className="py-30 md:py-40 bg-cream">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0 items-start">
          <motion.div
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={colVariants}
            className="md:px-8"
          >
            <h3 className="font-serif text-2xl text-gold mb-8">联系我们</h3>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />
                <div>
                  <p className="font-sans text-sm text-warm-gray mb-1">
                    客服热线
                  </p>
                  <a
                    href="tel:400-888-6688"
                    className="font-sans text-base text-dark-brown hover:text-gold transition-colors duration-300"
                  >
                    400-888-6688
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />
                <div>
                  <p className="font-sans text-sm text-warm-gray mb-1">
                    电子邮箱
                  </p>
                  <a
                    href="mailto:service@xieli.com"
                    className="font-sans text-base text-dark-brown hover:text-gold transition-colors duration-300"
                  >
                    service@xieli.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />
                <div>
                  <p className="font-sans text-sm text-warm-gray mb-1">
                    公司地址
                  </p>
                  <p className="font-sans text-base text-dark-brown">
                    上海市静安区南京西路1266号恒隆广场
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="hidden md:flex justify-center">
            <div className="w-px h-20 bg-gold/30" />
          </div>
          <div className="md:hidden flex justify-center">
            <div className="w-20 h-px bg-gold/30" />
          </div>

          <motion.div
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={colVariants}
            className="md:px-8 flex flex-col items-center text-center"
          >
            <div
              ref={qrRef}
              className="p-4 rounded-xl border border-sand/30 mb-4"
            >
              <img
                src={QR_PLACEHOLDER}
                alt="公众号二维码"
                className="w-32 h-32 object-cover rounded-lg"
              />
            </div>
            <p className="font-sans text-sm text-warm-gray">
              关注首鲜道公众号
            </p>
          </motion.div>

          <div className="hidden md:flex justify-center">
            <div className="w-px h-20 bg-gold/30" />
          </div>
          <div className="md:hidden flex justify-center">
            <div className="w-20 h-px bg-gold/30" />
          </div>

          <motion.div
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={colVariants}
            className="md:px-8"
          >
            <h3 className="font-serif text-2xl text-gold mb-4">商务合作</h3>
            <p className="font-sans text-sm text-warm-gray leading-relaxed mb-8">
              我们欢迎各类商务合作洽谈，包括企业定制、渠道合作、品牌联名等。
              期待与您携手，共同传递蟹礼的鲜味与诚意。
            </p>
            <MagneticButton strength={0.2}>
              <a
                href="mailto:business@xieli.com"
                data-cursor="pointer"
                className="pill-button text-charcoal"
              >
                <span>联系我们</span>
              </a>
            </MagneticButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function About() {
  return (
    <main>
      <BrandHero />
      <CompanyInfo />
      <StoreMapSection />
      <ContactSection />
    </main>
  );
}
