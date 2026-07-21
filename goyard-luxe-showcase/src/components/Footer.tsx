import { Link } from "react-router-dom";
import StaggerReveal, { StaggerItem } from "./StaggerReveal";
import MagneticButton from "./MagneticButton";

const footerLinks = [
  {
    title: "探索",
    links: [
      { label: "产品系列", path: "/collection" },
      { label: "品牌故事", path: "/story" },
      { label: "工艺传承", path: "/story" },
    ],
  },
  {
    title: "服务",
    links: [
      { label: "门店查询", path: "/" },
      { label: "客户服务", path: "/" },
      { label: "定制服务", path: "/" },
    ],
  },
  {
    title: "关于",
    links: [
      { label: "品牌历史", path: "/story" },
      { label: "新闻动态", path: "/" },
      { label: "加入我们", path: "/" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream/60 pt-20 md:pt-28 pb-10">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20">
          <StaggerItem>
            <div>
              <span className="font-serif text-2xl tracking-[0.2em] text-cream block mb-1">
                GOYARD
              </span>
              <span className="text-[8px] font-sans tracking-[0.4em] uppercase text-cream/30">
                Paris
              </span>
              <p className="font-sans text-sm text-cream/40 mt-6 leading-relaxed max-w-xs">
                传承百年的法式优雅，每一件作品都是时间与匠心的见证。
              </p>
            </div>
          </StaggerItem>

          {footerLinks.map((group) => (
            <StaggerItem key={group.title}>
              <h4 className="font-sans text-xs tracking-[0.2em] uppercase text-cream/80 mb-6">
                {group.title}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      data-cursor="pointer"
                      className="font-sans text-sm text-cream/40 hover:text-gold transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </StaggerItem>
          ))}
        </StaggerReveal>

        <div className="border-t border-cream/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-sans text-[11px] text-cream/25 tracking-wider">
            &copy; {new Date().getFullYear()} Maison Goyard. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <MagneticButton strength={0.15}>
              <button
                data-cursor="pointer"
                className="font-sans text-[11px] text-cream/25 hover:text-cream/50 tracking-wider transition-colors duration-300"
              >
                隐私政策
              </button>
            </MagneticButton>
            <MagneticButton strength={0.15}>
              <button
                data-cursor="pointer"
                className="font-sans text-[11px] text-cream/25 hover:text-cream/50 tracking-wider transition-colors duration-300"
              >
                使用条款
              </button>
            </MagneticButton>
          </div>
        </div>
      </div>
    </footer>
  );
}
