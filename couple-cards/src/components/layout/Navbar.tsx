import { useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { TopControls } from '@/components/layout/TopControls'

const NAV = [
  { to: '/', zh: '首页', en: 'Home' },
  { to: '/draw', zh: '抽牌', en: 'Draw' },
  { to: '/banks', zh: '题库', en: 'Banks' },
  { to: '/favorites', zh: '收藏', en: 'Saved' },
  { to: '/history', zh: '历史', en: 'History' },
  { to: '/settings', zh: '设置', en: 'Settings' },
]

export function Navbar() {
  const loc = useLocation()
  return (
    <header className="fixed inset-x-0 top-0 z-40">
      {/* 毛玻璃背景:覆盖整个 header 区域(nav + 移动端导航) */}
      <div
        className="absolute inset-0 border-b border-border-c/60 backdrop-blur-xl"
        style={{
          background: 'color-mix(in srgb, var(--bg) 55%, transparent)',
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 md:px-10">
        <nav className="flex items-center justify-between gap-3 py-3 md:py-4">
          <Link to="/" className="group flex shrink-0 items-center gap-2">
            <motion.span
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{
                background: 'linear-gradient(120deg, var(--accent-rose), var(--accent-gold))',
              }}
              whileHover={{ scale: 1.1, rotate: 8 }}
            >
              <span className="text-sm font-bold text-bg">慢</span>
            </motion.span>
            <span className="hidden font-serif text-lg font-semibold text-fg sm:inline">
              "慢"问"慢"答
              <span className="ml-1 font-display text-xs italic text-fg-soft">
                Slow Ask Slow Answer
              </span>
            </span>
          </Link>

          {/* 桌面端导航 */}
          <ul className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => {
              const active = loc.pathname === n.to
              return (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    className={cn(
                      'relative rounded-full px-4 py-2 text-sm transition-colors',
                      active ? 'text-fg' : 'text-fg-soft hover:text-fg'
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 -z-10 rounded-full glass"
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                      />
                    )}
                    {n.zh}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* 右侧控件(音效/主题) */}
          <div className="shrink-0">
            <TopControls />
          </div>
        </nav>

        {/* 移动端导航:同一 header 内,居中 */}
        <div className="flex justify-center pb-2 md:hidden">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => {
              const active = loc.pathname === n.to
              return (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs transition-colors',
                      active ? 'bg-card text-fg' : 'text-fg-soft'
                    )}
                  >
                    {n.zh}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </header>
  )
}
