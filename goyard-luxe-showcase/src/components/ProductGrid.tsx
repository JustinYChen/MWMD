import { motion } from "framer-motion";
import { products } from "@/data/products";
import StaggerReveal, { StaggerItem } from "./StaggerReveal";
import MagneticButton from "./MagneticButton";
import { Link } from "react-router-dom";

export default function ProductGrid() {
  const featuredProducts = products.slice(0, 6);

  return (
    <section className="py-30 md:py-40 bg-beige/50">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <StaggerReveal className="text-center mb-16 md:mb-20">
          <StaggerItem>
            <span className="inline-block text-[10px] font-sans tracking-[0.5em] uppercase text-gold mb-6">
              Collection
            </span>
          </StaggerItem>
          <StaggerItem>
            <h2 className="font-serif text-display-md md:text-display-lg text-charcoal mb-6">
              精选系列
            </h2>
          </StaggerItem>
          <StaggerItem>
            <p className="font-sans text-warm-gray text-base max-w-lg mx-auto">
              每一件作品都是时间与匠心的结晶，承载着 Maison Goyard 的百年传承
            </p>
          </StaggerItem>
        </StaggerReveal>

        <StaggerReveal
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          staggerDelay={0.1}
        >
          {featuredProducts.map((product, index) => (
            <StaggerItem key={product.id}>
              <ProductCard product={product} index={index} />
            </StaggerItem>
          ))}
        </StaggerReveal>

        <StaggerReveal className="text-center mt-16">
          <StaggerItem>
            <MagneticButton strength={0.2}>
              <Link
                to="/collection"
                data-cursor="pointer"
                data-cursor-text="全部"
                className="pill-button text-charcoal"
              >
                <span>查看全部系列</span>
              </Link>
            </MagneticButton>
          </StaggerItem>
        </StaggerReveal>
      </div>
    </section>
  );
}

interface ProductCardProps {
  product: (typeof products)[0];
  index: number;
}

function ProductCard({ product, index }: ProductCardProps) {
  const isLarge = index === 0 || index === 3;

  return (
    <motion.div
      data-cursor="pointer"
      data-cursor-text="查看"
      className="group relative"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className={`image-hover-zoom rounded-sm overflow-hidden bg-sand/30 ${
          isLarge ? "aspect-[3/4]" : "aspect-[4/5]"
        }`}
      >
        <img
          src={product.imageUrl}
          alt={product.nameZh}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="mt-5">
        <h3 className="font-serif text-lg text-charcoal group-hover:text-gold transition-colors duration-300">
          {product.nameZh}
        </h3>
        <p className="font-sans text-xs text-warm-gray tracking-wider uppercase mt-1">
          {product.name}
        </p>
      </div>
    </motion.div>
  );
}
