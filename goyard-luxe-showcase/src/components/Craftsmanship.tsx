import { craftSteps } from "@/data/brandStories";
import StaggerReveal, { StaggerItem } from "./StaggerReveal";

export default function Craftsmanship() {
  return (
    <section className="py-30 md:py-40 bg-beige/40">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <StaggerReveal className="text-center mb-20 md:mb-28">
          <StaggerItem>
            <span className="inline-block text-[10px] font-sans tracking-[0.5em] uppercase text-gold mb-6">
              Savoir-Faire
            </span>
          </StaggerItem>
          <StaggerItem>
            <h2 className="font-serif text-display-md md:text-display-lg text-charcoal mb-6">
              工艺之道
            </h2>
          </StaggerItem>
          <StaggerItem>
            <p className="font-sans text-warm-gray text-base max-w-xl mx-auto leading-relaxed">
              每一件 Goyard 作品的诞生，都经历了一场从选材到成型的漫长旅程。
              百余道工序，每一步都凝聚着匠人的专注与智慧。
            </p>
          </StaggerItem>
        </StaggerReveal>

        <StaggerReveal
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12"
          staggerDelay={0.15}
        >
          {craftSteps.map((step) => (
            <StaggerItem key={step.id}>
              <div className="group relative bg-cream rounded-sm overflow-hidden">
                <div className="image-hover-zoom aspect-[4/3]">
                  <img
                    src={step.imageUrl}
                    alt={step.titleZh}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-8 md:p-10">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full border border-gold/30 text-gold font-serif text-sm">
                      {step.step}
                    </span>
                    <div>
                      <h3 className="font-serif text-xl text-charcoal">
                        {step.titleZh}
                      </h3>
                      <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-warm-gray">
                        {step.title}
                      </span>
                    </div>
                  </div>
                  <p className="font-sans text-warm-gray text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>

        <StaggerReveal className="mt-20 md:mt-28 text-center">
          <StaggerItem>
            <div className="max-w-2xl mx-auto">
              <span className="inline-block text-[10px] font-sans tracking-[0.5em] uppercase text-gold/60 mb-8">
                Numbers
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                {[
                  { value: "170+", label: "年传承" },
                  { value: "100+", label: "道工序" },
                  { value: "6", label: "代匠人" },
                  { value: "1", label: "个标准" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <span className="font-serif text-display-sm text-charcoal/80 block">
                      {stat.value}
                    </span>
                    <span className="font-sans text-xs tracking-[0.15em] text-warm-gray uppercase">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </StaggerItem>
        </StaggerReveal>
      </div>
    </section>
  );
}
