import StaggerReveal, { StaggerItem } from "./StaggerReveal";
import MagneticButton from "./MagneticButton";
import { Link } from "react-router-dom";

export default function BrandSpirit() {
  return (
    <section className="py-30 md:py-40 bg-cream">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <StaggerReveal className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <StaggerItem>
              <span className="inline-block text-[10px] font-sans tracking-[0.5em] uppercase text-gold mb-6">
                L&apos;Esprit Goyard
              </span>
            </StaggerItem>
            <StaggerItem>
              <h2 className="font-serif text-display-md md:text-display-lg text-charcoal mb-8 text-balance">
                匠心传承
                <br />
                <span className="text-warm-gray">永恒之美</span>
              </h2>
            </StaggerItem>
            <StaggerItem>
              <p className="font-sans text-warm-gray text-base md:text-lg leading-relaxed max-w-md mb-6">
                每一件 Goyard 作品都承载着超过一个半世纪的工艺传承。从巴黎工坊到世界舞台，我们始终坚守对卓越品质的执着追求。
              </p>
            </StaggerItem>
            <StaggerItem>
              <p className="font-sans text-warm-gray/70 text-sm leading-relaxed max-w-md mb-10">
                Goyardine 帆布上的每一道人字纹，都是匠人手工点绘的痕迹。这种独特的工艺，自 1892 年延续至今，从未改变。
              </p>
            </StaggerItem>
            <StaggerItem>
              <MagneticButton strength={0.2}>
                <Link
                  to="/story"
                  data-cursor="pointer"
                  data-cursor-text="更多"
                  className="pill-button text-charcoal"
                >
                  <span>探索品牌故事</span>
                </Link>
              </MagneticButton>
            </StaggerItem>
          </div>

          <div className="relative">
            <StaggerItem>
              <div className="relative">
                <div className="image-hover-zoom rounded-sm overflow-hidden">
                  <img
                    src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=artisan%20hands%20painting%20chevron%20pattern%20on%20beige%20canvas%2C%20close%20up%20detail%2C%20warm%20golden%20lighting%2C%20luxury%20craftsmanship%2C%20elegant%20minimal%20photography&image_size=portrait_4_3"
                    alt="Goyard Craftsmanship"
                    className="w-full aspect-[4/5] object-cover"
                  />
                </div>
                <div className="absolute -bottom-8 -left-8 w-48 h-48 md:w-64 md:h-64 image-hover-zoom rounded-sm overflow-hidden shadow-2xl shadow-charcoal/10">
                  <img
                    src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20leather%20working%20tools%20on%20wooden%20workbench%2C%20warm%20amber%20lighting%2C%20luxury%20craftsmanship%20detail%2C%20elegant%20minimal%20still%20life&image_size=square"
                    alt="Goyard Tools"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </StaggerItem>
          </div>
        </StaggerReveal>

        <StaggerReveal
          className="mt-30 md:mt-40 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
          staggerDelay={0.15}
        >
          {[
            {
              number: "1853",
              title: "创立年份",
              desc: "在巴黎创立，跨越三个世纪的传奇",
            },
            {
              number: "100+",
              title: "手工工序",
              desc: "每件作品历经百余道手工工序",
            },
            {
              number: "6",
              title: "全球门店",
              desc: "遍布世界顶级城市的精品门店",
            },
          ].map((item) => (
            <StaggerItem key={item.number}>
              <div className="text-center md:text-left">
                <span className="font-serif text-display-sm md:text-display-md text-gold/30">
                  {item.number}
                </span>
                <h3 className="font-serif text-xl text-charcoal mt-2 mb-3">
                  {item.title}
                </h3>
                <p className="font-sans text-sm text-warm-gray leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
