import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkle, Layers, Cross, Heart } from 'lucide-react'
import { GreetingHeader } from '@/components/profile/GreetingHeader'
import { StaggerReveal, StaggerItem } from '@/components/ui/StaggerReveal'
import { Footer } from '@/components/layout/Footer'
import { QUOTES } from '@/data/quotes'

const MODES = [
  { icon: Sparkle, zh: '单抽', en: 'Single', desc: '抽一张，深聊一题，慢慢靠近。' },
  { icon: Layers, zh: '三张叙事', en: 'Triple', desc: '过去、现在、未来，串起你们的故事。' },
  { icon: Cross, zh: '十字阵', en: 'Cross', desc: '五维深度对话，看见彼此的根与未来。' },
]

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const didPlay = useRef(false)

  useGSAP(
    () => {
      // StrictMode 双挂载时只播放一次,避免动画重复
      if (didPlay.current) return
      didPlay.current = true
      gsap.fromTo(
        '.hero-char',
        { y: 60, opacity: 0, rotate: 8 },
        { y: 0, opacity: 1, rotate: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 }
      )
      gsap.fromTo(
        '.hero-sub',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.6, ease: 'power2.out' }
      )
      gsap.fromTo(
        '.hero-cta',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.9, ease: 'power2.out' }
      )
    },
    { scope: heroRef }
  )

  const title = '"慢"问"慢"答'

  return (
    <div>
      {/* 英雄区 */}
      <section
        ref={heroRef}
        className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute top-1/3 left-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, color-mix(in srgb, var(--accent-rose) 35%, transparent), transparent 70%)',
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10">
          <div className="mb-6">
            <GreetingHeader />
          </div>
          <h1 className="flex flex-wrap justify-center gap-1 font-serif text-[12vw] font-bold leading-tight text-fg md:text-[7rem]">
            {title.split('').map((ch, i) => (
              <span key={i} className="hero-char inline-block text-gradient">
                {ch}
              </span>
            ))}
          </h1>
          <p className="hero-sub mt-2 font-display text-2xl italic text-fg-soft md:text-4xl">
            Slow Ask Slow Answer · 一场只属于两人的对话
          </p>
          <p className="hero-sub mt-4 max-w-xl text-sm leading-relaxed text-fg-soft md:text-base">
            塔罗牌阵式问题抽卡。
            <br />
            悬停、翻牌、揭示，让每一次提问都成为靠近彼此的仪式。
          </p>
          <div className="hero-cta mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/draw"
              className="group inline-flex items-center gap-2 rounded-full px-9 py-4 font-semibold text-bg shadow-card transition-transform hover:scale-105"
              style={{
                background: 'linear-gradient(120deg, var(--accent-rose), var(--accent-gold))',
              }}
            >
              开始抽牌
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/favorites"
              className="inline-flex items-center gap-2 rounded-full border border-border-c px-7 py-4 font-medium text-fg-soft transition-colors hover:text-fg"
            >
              <Heart size={16} />
              我的收藏
            </Link>
          </div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-fg-soft"
          animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xs tracking-widest">SCROLL</span>
        </motion.div>
      </section>

      {/* 模式介绍 */}
      <section className="container-x py-24">
        <StaggerReveal>
          <StaggerItem>
            <p className="text-center font-display text-xl italic text-fg-soft">
              三种牌阵，三种靠近的方式
            </p>
          </StaggerItem>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {MODES.map((m) => {
              const Icon = m.icon
              return (
                <StaggerItem key={m.zh}>
                  <Link
                    to="/draw"
                    className="group flex h-full flex-col rounded-4xl glass p-8 transition-transform hover:-translate-y-2"
                  >
                    <div
                      className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
                      style={{
                        background:
                          'linear-gradient(120deg, color-mix(in srgb, var(--accent-rose) 25%, transparent), color-mix(in srgb, var(--accent-gold) 25%, transparent))',
                      }}
                    >
                      <Icon className="text-rose" size={26} />
                    </div>
                    <h3 className="font-serif text-2xl font-semibold text-fg">
                      {m.zh}
                      <span className="ml-2 font-display text-sm italic text-fg-soft">
                        {m.en}
                      </span>
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-fg-soft">
                      {m.desc}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1 text-sm text-rose">
                      去试试 <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </StaggerItem>
              )
            })}
          </div>
        </StaggerReveal>
      </section>

      {/* 引言墙 */}
      <section className="container-x py-24">
        <StaggerReveal className="grid gap-6 md:grid-cols-3">
          {QUOTES.slice(0, 3).map((q, i) => (
            <StaggerItem key={i}>
              <figure className="flex h-full flex-col justify-between rounded-4xl border border-border-c/60 p-8">
                <blockquote className="font-serif text-xl leading-relaxed text-fg">
                  “{q.zh}”
                </blockquote>
                <figcaption className="mt-4 font-display text-sm italic text-fg-soft">
                  {q.en}
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </section>

      <Footer />
    </div>
  )
}
