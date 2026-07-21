import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import MagneticButton from "./MagneticButton";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "首页", path: "/" },
  { label: "品牌故事", path: "/story" },
  { label: "产品系列", path: "/collection" },
];

const darkHeroPages = ["/", "/story", "/about"];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const hasDarkHero = darkHeroPages.includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("lenis-scroll", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("lenis-scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsScrolled(window.scrollY > 50);
  }, [location.pathname]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const useLightNav = hasDarkHero && !isScrolled;

  const logoColor = useLightNav ? "text-cream" : "text-charcoal";
  const logoSubColor = useLightNav ? "text-cream/40" : "text-warm-gray";
  const linkActiveColor = useLightNav ? "text-cream" : "text-charcoal";
  const linkInactiveColor = useLightNav
    ? "text-cream/50 hover:text-cream"
    : "text-warm-gray hover:text-charcoal";
  const iconColor = useLightNav
    ? "text-cream hover:text-gold"
    : "text-charcoal hover:text-gold";
  const mobileIconColor = useLightNav ? "text-cream" : "text-charcoal";

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out-expo ${
          isScrolled
            ? "glass-effect shadow-sm shadow-charcoal/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex items-center justify-between h-20 md:h-24">
            <Link to="/" data-cursor="pointer" data-cursor-text="首页">
              <motion.div
                className="flex flex-col items-start"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span
                  className={`font-serif text-lg md:text-xl tracking-[0.2em] transition-colors duration-700 ease-out-expo ${logoColor}`}
                >
                  GOYARD
                </span>
                <span
                  className={`text-[8px] font-sans tracking-[0.4em] uppercase transition-colors duration-700 ease-out-expo ${logoSubColor}`}
                >
                  Paris
                </span>
              </motion.div>
            </Link>

            <div className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <MagneticButton key={link.path} strength={0.15}>
                  <Link
                    to={link.path}
                    data-cursor="pointer"
                    className={`relative text-xs font-sans font-medium tracking-[0.2em] uppercase transition-colors duration-700 ease-out-expo ${
                      location.pathname === link.path
                        ? linkActiveColor
                        : linkInactiveColor
                    }`}
                  >
                    {link.label}
                    {location.pathname === link.path && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-1 left-0 right-0 h-px bg-gold"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                </MagneticButton>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-6">
              <MagneticButton strength={0.2}>
                <button
                  data-cursor="pointer"
                  data-cursor-text="搜索"
                  className={`p-2 transition-colors duration-700 ease-out-expo ${iconColor}`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </button>
              </MagneticButton>
              <MagneticButton strength={0.2}>
                <Link
                  to="/about"
                  data-cursor="pointer"
                  data-cursor-text="联系"
                  className={`pill-button transition-all duration-700 ease-out-expo ${
                    useLightNav
                      ? "pill-button-nav-light"
                      : "text-charcoal"
                  }`}
                >
                  <span>联系我们</span>
                </Link>
              </MagneticButton>
            </div>

            <button
              className={`md:hidden p-2 transition-colors duration-700 ease-out-expo ${mobileIconColor}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-cursor="pointer"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-cream/98 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <Link
                    to={link.path}
                    className="font-serif text-3xl tracking-[0.15em] text-charcoal"
                    data-cursor="pointer"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
