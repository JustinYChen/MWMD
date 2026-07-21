import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSettingsStore } from '@/store/useSettingsStore'

export function ThemeToggle() {
  const theme = useSettingsStore((s) => s.theme)
  const toggleTheme = useSettingsStore((s) => s.toggleTheme)
  const isDark = theme === 'dark'
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? '切换浅色' : '切换深色'}
      className="relative flex h-9 w-9 items-center justify-center rounded-full glass text-fg-soft transition-colors hover:text-fg"
    >
      <motion.span
        key={theme}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? <Moon size={16} /> : <Sun size={16} />}
      </motion.span>
    </button>
  )
}
