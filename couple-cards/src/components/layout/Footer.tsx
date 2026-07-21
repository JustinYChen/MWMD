import { Link } from 'react-router-dom'
import { QUOTES } from '@/data/quotes'

export function Footer() {
  const q = QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length]
  return (
    <footer className="border-t border-border-c/60 px-6 py-10 text-center md:px-10">
      <p className="mx-auto max-w-xl font-display text-lg italic text-fg-soft">
        “{q.zh}”
      </p>
      <p className="mt-1 font-display text-sm italic text-fg-soft/70">{q.en}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-fg-soft/70">
        <Link to="/draw" className="hover:text-rose">
          开始抽牌
        </Link>
        <span>·</span>
        <span>© {new Date().getFullYear()} "慢"问"慢"答</span>
      </div>
    </footer>
  )
}
