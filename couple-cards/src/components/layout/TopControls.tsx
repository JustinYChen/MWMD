import { ThemeToggle } from './ThemeToggle'
import { AudioToggle } from '@/components/audio/AudioToggle'

/** 右上角控件簇:主题 + 音频 */
export function TopControls() {
  return (
    <div className="flex items-center gap-2">
      <AudioToggle />
      <ThemeToggle />
    </div>
  )
}
