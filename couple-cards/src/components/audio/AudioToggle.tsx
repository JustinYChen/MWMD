import { motion } from 'framer-motion'
import { Volume2, VolumeX, Music } from 'lucide-react'
import { useSettingsStore } from '@/store/useSettingsStore'
import { audioEngine } from '@/lib/audioEngine'

/**
 * 音频控制:两个按钮。
 * - 左:音乐播放/暂停(Volume2 / VolumeX 图标)
 * - 右:切歌(Music 图标,玫瑰色高亮表示播放中)
 *
 * 不再显示曲名和单独的"下一首"按钮。
 * 播放/暂停与 useSettingsStore.bgmEnabled 同步。
 */
export function AudioToggle() {
  const bgmEnabled = useSettingsStore((s) => s.bgmEnabled)
  const setBgm = useSettingsStore((s) => s.setBgm)

  const togglePlay = () => {
    audioEngine.init()
    audioEngine.resume()
    setBgm(!bgmEnabled)
  }

  const skipTrack = () => {
    audioEngine.init()
    audioEngine.resume()
    audioEngine.nextTrack()
  }

  return (
    <div className="flex items-center gap-2">
      {/* 音乐播放/暂停 */}
      <button
        onClick={togglePlay}
        aria-label={bgmEnabled ? '暂停音乐' : '播放音乐'}
        className="flex h-9 w-9 items-center justify-center rounded-full glass text-fg-soft transition-colors hover:text-fg"
      >
        <motion.span
          key={bgmEnabled ? 'playing' : 'paused'}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {bgmEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </motion.span>
      </button>
      {/* 切歌 */}
      <button
        onClick={skipTrack}
        aria-label="切歌"
        className="flex h-9 w-9 items-center justify-center rounded-full glass text-fg-soft transition-colors hover:text-rose"
      >
        <motion.span
          key={bgmEnabled ? 'on' : 'off'}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Music size={16} className={bgmEnabled ? 'text-rose' : ''} />
        </motion.span>
      </button>
    </div>
  )
}
