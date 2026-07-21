import { artisanQuotes } from "@/data/brandStories";
import StaggerReveal, { StaggerItem } from "./StaggerReveal";

export default function ArtisanQuotes() {
  return (
    <section className="py-30 md:py-40 bg-charcoal relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(196,162,101,0.15) 35px, rgba(196,162,101,0.15) 36px)",
          }}
        />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <StaggerReveal className="text-center mb-20 md:mb-28">
          <StaggerItem>
            <span className="inline-block text-[10px] font-sans tracking-[0.5em] uppercase text-gold/60 mb-6">
              Les Artisans
            </span>
          </StaggerItem>
          <StaggerItem>
            <h2 className="font-serif text-display-md md:text-display-lg text-cream">
              匠人之声
            </h2>
          </StaggerItem>
        </StaggerReveal>

        <StaggerReveal
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16"
          staggerDelay={0.2}
        >
          {artisanQuotes.map((artisan) => (
            <StaggerItem key={artisan.id}>
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="shrink-0">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border border-gold/20">
                    <img
                      src={artisan.portraitUrl}
                      alt={artisan.nameZh}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <svg
                    className="w-8 h-8 text-gold/20 mb-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="font-serif text-cream/80 text-lg md:text-xl leading-relaxed mb-6 italic">
                    {artisan.quote}
                  </p>
                  <div>
                    <span className="font-serif text-cream text-base block">
                      {artisan.nameZh}
                    </span>
                    <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-gold/50">
                      {artisan.roleZh} · {artisan.role}
                    </span>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
