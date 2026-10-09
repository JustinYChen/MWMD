import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { SmoothScroll } from '@/components/ui/SmoothScroll'
import { CustomCursor } from '@/components/ui/CustomCursor'
import { CoupleSetupModal } from '@/components/profile/CoupleSetupModal'
import { AnniversaryEasterEgg } from '@/components/profile/AnniversaryEasterEgg'
import { useSettingsStore } from '@/store/useSettingsStore'
import { audioEngine } from '@/lib/audioEngine'
import { useEffect, useRef } from 'react'

export default function App() {
  const theme = useSettingsStore((s) => s.theme)
  const bgmEnabled = useSettingsStore((s) => s.bgmEnabled)
  const autoPlayStarted = useRef(false)

  // 确保主题在首次挂载时应用(覆盖 index.html 默认值)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // 自动播放 BGM:浏览器不允许页面加载时直接播放音频,
  // 须在首次用户交互(click / keydown / touchstart)后才能 resume AudioContext。
  // bgmEnabled 默认 true,此处监听首次交互自动启动播放。
  useEffect(() => {
    if (!bgmEnabled || autoPlayStarted.current) return

    const tryStart = () => {
      if (autoPlayStarted.current) return
      autoPlayStarted.current = true
      audioEngine.init()
      audioEngine.resume()
      audioEngine.setBgmEnabled(true)
      // 清理监听器
      opts.forEach(({ type, handler }) =>
        document.removeEventListener(type, handler)
      )
    }

    const opts = [
      { type: 'click', handler: tryStart },
      { type: 'keydown', handler: tryStart },
      { type: 'touchstart', handler: tryStart },
    ]
    opts.forEach(({ type, handler }) =>
      document.addEventListener(type, handler, { once: false, passive: true })
    )

    return () => {
      opts.forEach(({ type, handler }) =>
        document.removeEventListener(type, handler)
      )
    }
  }, [bgmEnabled])

  return (
    <SmoothScroll>
      <CustomCursor />
      <RouterProvider router={router} />
      <CoupleSetupModal />
      <AnniversaryEasterEgg />
    </SmoothScroll>
  )
}
