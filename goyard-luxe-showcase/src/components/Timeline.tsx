import { brandStories } from "@/data/brandStories";
import { motion } from "framer-motion";
import StaggerReveal, { StaggerItem } from "./StaggerReveal";

const itemVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function Timeline() {
  return (
    <section className="py-30 md:py-40 bg-cream">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <StaggerReveal className="text-center mb-20 md:mb-28">
          <StaggerItem>
            <span className="inline-block text-[10px] font-sans tracking-[0.5em] uppercase text-gold mb-6">
              Heritage
            </span>
          </StaggerItem>
          <StaggerItem>
            <h2 className="font-serif text-display-md md:text-display-lg text-charcoal">
              百年传承
            </h2>
          </StaggerItem>
        </StaggerReveal>

        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-sand -translate-x-1/2 hidden md:block" />

          <div className="space-y-20 md:space-y-28">
            {brandStories.map((story, index) => (
              <motion.div
                key={story.id}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                className={`relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center ${
                  index % 2 === 0 ? "" : "md:direction-rtl"
                }`}
              >
                <div
                  className={`${
                    index % 2 === 0
                      ? "md:pr-16 md:text-right"
                      : "md:col-start-2 md:pl-16"
                  }`}
                >
                  <span className="font-serif text-display-sm md:text-display-md text-gold/20">
                    {story.year}
                  </span>
                  <h3 className="font-serif text-2xl md:text-3xl text-charcoal mt-2 mb-4">
                    {story.titleZh}
                  </h3>
                  <p
                    className={`font-sans text-warm-gray text-sm md:text-base leading-relaxed max-w-md ${
                      index % 2 === 0 ? "md:ml-auto" : ""
                    }`}
                  >
                    {story.description}
                  </p>
                </div>

                <div
                  className={`${
                    index % 2 === 0
                      ? "md:pl-16"
                      : "md:col-start-1 md:row-start-1 md:pr-16"
                  }`}
                >
                  <div className="image-hover-zoom rounded-sm overflow-hidden">
                    <img
                      src={story.imageUrl}
                      alt={story.titleZh}
                      className="w-full aspect-[16/10] object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
                  <div className="w-3 h-3 rounded-full bg-gold/40 border-2 border-cream" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
