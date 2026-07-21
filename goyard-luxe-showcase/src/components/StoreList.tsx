import { stores } from "@/data/brandStories";
import StaggerReveal, { StaggerItem } from "./StaggerReveal";
import MagneticButton from "./MagneticButton";
import { MapPin } from "lucide-react";

export default function StoreList() {
  return (
    <section className="py-30 md:py-40 bg-cream">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <StaggerReveal className="text-center mb-20 md:mb-28">
          <StaggerItem>
            <span className="inline-block text-[10px] font-sans tracking-[0.5em] uppercase text-gold mb-6">
              Boutiques
            </span>
          </StaggerItem>
          <StaggerItem>
            <h2 className="font-serif text-display-md md:text-display-lg text-charcoal mb-6">
              全球精品门店
            </h2>
          </StaggerItem>
          <StaggerItem>
            <p className="font-sans text-warm-gray text-base max-w-lg mx-auto leading-relaxed">
              从巴黎到东京，从北京到纽约，在全球最负盛名的都市中，Maison Goyard 静候您的莅临
            </p>
          </StaggerItem>
        </StaggerReveal>

        <StaggerReveal
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          staggerDelay={0.1}
        >
          {stores.map((store) => (
            <StaggerItem key={store.id}>
              <div
                className="group relative bg-beige/30 rounded-sm overflow-hidden"
                data-cursor="pointer"
                data-cursor-text="详情"
              >
                <div className="image-hover-zoom aspect-[4/3]">
                  <img
                    src={store.imageUrl}
                    alt={store.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-serif text-lg text-charcoal">
                      {store.cityZh}
                    </h3>
                    <span className="font-sans text-[10px] tracking-[0.15em] uppercase text-warm-gray">
                      {store.city}
                    </span>
                  </div>
                  <p className="font-serif text-sm text-charcoal/70 mb-3">
                    {store.name}
                  </p>
                  <div className="flex items-start gap-2">
                    <MapPin
                      size={12}
                      className="text-gold/50 shrink-0 mt-1"
                    />
                    <p className="font-sans text-xs text-warm-gray leading-relaxed">
                      {store.address}
                    </p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>

        <StaggerReveal className="text-center mt-16">
          <StaggerItem>
            <MagneticButton strength={0.2}>
              <button
                data-cursor="pointer"
                data-cursor-text="全部"
                className="pill-button text-charcoal"
              >
                <span>查看全部门店</span>
              </button>
            </MagneticButton>
          </StaggerItem>
        </StaggerReveal>
      </div>
    </section>
  );
}
