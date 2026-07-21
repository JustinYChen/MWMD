import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { products, categories } from "@/data/products";
import StaggerReveal, { StaggerItem } from "@/components/StaggerReveal";
import MagneticButton from "@/components/MagneticButton";
import { X } from "lucide-react";

export default function Collection() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<
    (typeof products)[0] | null
  >(null);

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <main>
      <section className="relative h-[50vh] md:h-[60vh] flex items-center justify-center bg-beige/30 overflow-hidden">
        <StaggerReveal className="relative z-10 text-center px-6">
          <StaggerItem>
            <span className="inline-block text-[10px] font-sans tracking-[0.5em] uppercase text-gold mb-6">
              Collection
            </span>
          </StaggerItem>
          <StaggerItem>
            <h1 className="font-serif text-display-lg md:text-display-xl text-charcoal mb-6">
              产品系列
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="font-sans text-warm-gray text-base max-w-lg mx-auto">探索 Maison Goyard 的经典与当代作品，每一件都承载着非凡的工艺传承</p>
          </StaggerItem>
        </StaggerReveal>
      </section>

      <section className="py-16 md:py-20 bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {categories.map((cat) => (
              <MagneticButton key={cat.id} strength={0.15}>
                <button
                  data-cursor="pointer"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-6 py-2 rounded-full text-xs font-sans font-medium tracking-[0.15em] uppercase transition-all duration-500 ease-out-expo border ${
                    activeCategory === cat.id
                      ? "bg-charcoal text-cream border-charcoal"
                      : "bg-transparent text-warm-gray border-charcoal/15 hover:border-charcoal/40 hover:text-charcoal"
                  }`}
                >
                  {cat.label}
                </button>
              </MagneticButton>
            ))}
          </div>

          <StaggerReveal
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
            staggerDelay={0.08}
            key={activeCategory}
          >
            {filteredProducts.map((product, index) => (
              <StaggerItem key={product.id}>
                <motion.div
                  data-cursor="pointer"
                  data-cursor-text="详情"
                  className="group"
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="image-hover-zoom rounded-sm overflow-hidden bg-sand/20 aspect-[3/4]">
                    <img
                      src={product.imageUrl}
                      alt={product.nameZh}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-serif text-base text-charcoal group-hover:text-gold transition-colors duration-300">
                      {product.nameZh}
                    </h3>
                    <p className="font-sans text-[11px] text-warm-gray tracking-wider uppercase mt-1">
                      {product.name}
                    </p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      </section>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedProduct(null)}
          >
            <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-cream max-w-3xl w-full rounded-sm overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedProduct(null)}
                data-cursor="pointer"
                data-cursor-text="关闭"
                className="absolute top-4 right-4 z-10 p-2 text-charcoal/50 hover:text-charcoal transition-colors"
              >
                <X size={20} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="aspect-square md:aspect-auto">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.nameZh}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <span className="text-[10px] font-sans tracking-[0.4em] uppercase text-gold mb-4">
                    {selectedProduct.category === "bags"
                      ? "包袋"
                      : selectedProduct.category}
                  </span>
                  <h2 className="font-serif text-2xl md:text-3xl text-charcoal mb-2">
                    {selectedProduct.nameZh}
                  </h2>
                  <p className="font-sans text-xs text-warm-gray tracking-wider uppercase mb-6">
                    {selectedProduct.name}
                  </p>
                  <p className="font-sans text-warm-gray text-sm leading-relaxed mb-8">
                    {selectedProduct.description}
                  </p>
                  <MagneticButton strength={0.2}>
                    <button
                      data-cursor="pointer"
                      data-cursor-text="咨询"
                      className="pill-button text-charcoal"
                    >
                      <span>咨询详情</span>
                    </button>
                  </MagneticButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
