import { useState } from 'react'
import { Settings as SettingsIcon, Moon, Sun, Volume2, Music, RotateCcw, Cloud, RefreshCw, Check, AlertCircle, Loader2, Upload, Download, LogIn, LogOut } from 'lucide-react'
import { useProfileStore } from '@/store/useProfileStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useDeckStore } from '@/store/useDeckStore'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { useSyncStore } from '@/store/useSyncStore'
import { audioEngine } from '@/lib/audioEngine'
import { Footer } from '@/components/layout/Footer'
import { Modal } from '@/components/ui/Modal'
import { DatePicker } from '@/components/ui/DatePicker'
import { manualPull, manualPush, loginCloud, logoutCloud } from '@/hooks/useCloudSync'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { nameA, nameB, anniversary, setProfile } = useProfileStore()
  const {
    theme,
    soundEnabled,
    bgmEnabled,
    volume,
    language,
    setTheme,
    setSound,
    setBgm,
    setVolume,
    setLanguage,
  } = useSettingsStore()
  const resetDeck = useDeckStore((s) => s.resetDeck)
  const clearHistory = useHistoryStore((s) => s.clearHistory)
  const clearFavorites = useFavoritesStore((s) => s.clear)
  const [resetOpen, setResetOpen] = useState(false)

  return (
    <div className="min-h-[100dvh] pt-24 md:pt-28">
      <div className="container-x max-w-2xl">
        <header className="mb-8 flex items-center gap-2">
          <SettingsIcon className="text-gold" size={22} />
          <h1 className="font-serif text-3xl font-semibold text-fg">设置</h1>
        </header>

        <div className="flex flex-col gap-6">
          {/* 情侣信息 */}
          <Section title="你们俩 · Couple" className="z-20">
            <div className="grid grid-cols-2 gap-3">
              <Field label="你的名字">
                <input
                  className="setting-input"
                  value={nameA}
                  onChange={(e) => setProfile({ nameA: e.target.value })}
                />
              </Field>
              <Field label="TA 的名字">
                <input
                  className="setting-input"
                  value={nameB}
                  onChange={(e) => setProfile({ nameB: e.target.value })}
                />
              </Field>
            </div>
            <Field label="在一起的日子">
              <DatePicker
                value={anniversary}
                onChange={(v) => setProfile({ anniversary: v })}
              />
            </Field>
          </Section>

          {/* 外观 */}
          <Section title="外观 · Appearance">
            <Row label="主题">
              <div className="flex gap-2">
                <ToggleBtn active={theme === 'light'} onClick={() => setTheme('light')}>
                  <Sun size={14} /> 浅色
                </ToggleBtn>
                <ToggleBtn active={theme === 'dark'} onClick={() => setTheme('dark')}>
                  <Moon size={14} /> 深色
                </ToggleBtn>
              </div>
            </Row>
            <Row label="界面语言">
              <div className="flex gap-2">
                <ToggleBtn active={language === 'zh'} onClick={() => setLanguage('zh')}>
                  中文
                </ToggleBtn>
                <ToggleBtn active={language === 'en'} onClick={() => setLanguage('en')}>
                  EN
                </ToggleBtn>
              </div>
            </Row>
          </Section>

          {/* 声音 */}
          <Section title="声音 · Sound">
            <Row label="翻牌音效">
              <Switch
                checked={soundEnabled}
                onChange={(b) => {
                  audioEngine.init()
                  audioEngine.resume()
                  setSound(b)
                }}
              />
            </Row>
            <Row label="背景音乐">
              <Switch
                checked={bgmEnabled}
                onChange={(b) => {
                  audioEngine.init()
                  audioEngine.resume()
                  setBgm(b)
                }}
              />
            </Row>
            <Row label={`音量 ${Math.round(volume * 100)}%`}>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-40 accent-[var(--accent-rose)]"
              />
            </Row>
            <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-fg-soft">
              <Volume2 size={12} /> 音效程序化合成 · 背景音乐把文件放进
              <code className="rounded bg-card px-1">public/audio/</code>
              并在
              <code className="rounded bg-card px-1">playlist.json</code>
              列出文件名,支持 mp3/flac/wav/aac/m4a/ogg,随机连播
            </p>
          </Section>

          {/* 云同步 */}
          <CloudSyncSection />

          {/* 数据 */}
          <Section title="数据 · Data">
            <button
              onClick={() => setResetOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-rose/50 px-5 py-2.5 text-sm text-rose transition-colors hover:bg-rose/10"
            >
              <RotateCcw size={14} /> 重置所有数据
            </button>
            <p className="mt-2 text-xs text-fg-soft">
              清空牌堆记录、收藏夹与历史记录，情侣信息也会清空。
            </p>
          </Section>
        </div>
      </div>

      <div className="container-x max-w-2xl mt-16">
        <Footer />
      </div>

      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="重置所有数据？">
        <p className="mb-6 text-sm text-fg-soft">
          此操作不可恢复，将清空：已抽记录、收藏夹、历史、情侣信息与设置偏好。
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setResetOpen(false)}
            className="rounded-full border border-border-c px-5 py-2 text-sm text-fg-soft hover:text-fg"
          >
            取消
          </button>
          <button
            onClick={() => {
              resetDeck()
              clearHistory()
              clearFavorites()
              useProfileStore.getState().reset()
              useSettingsStore.getState().setTheme('light')
              setResetOpen(false)
            }}
            className="rounded-full px-5 py-2 text-sm text-bg"
            style={{ background: 'var(--accent-rose)' }}
          >
            确认重置
          </button>
        </div>
      </Modal>
    </div>
  )
}

function Section({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('relative rounded-4xl glass p-6', className)}>
      <h2 className="mb-4 font-display text-sm uppercase tracking-widest text-fg-soft">
        {title}
      </h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-fg-soft">{label}</span>
      {children}
    </label>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-fg">{label}</span>
      {children}
    </div>
  )
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition-all',
        active
          ? 'border-transparent text-bg'
          : 'border-border-c text-fg-soft hover:text-fg'
      )}
      style={active ? { background: 'var(--accent-rose)' } : undefined}
    >
      {children}
    </button>
  )
}

function Switch({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (b: boolean) => void
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 rounded-full transition-colors',
        checked ? 'bg-rose' : 'bg-border-c'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-bg transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5'
        )}
      />
    </button>
  )
}

/** 云同步设置区:登录共享账号(密码登录),管理跨设备同步 */
function CloudSyncSection() {
  const { account, autoSync, hasPending, status, lastSyncAt, error } = useSyncStore()
  const { setAutoSync } = useSyncStore()
  const [password, setPassword] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [loginMsg, setLoginMsg] = useState('')

  const handleLogin = async () => {
    if (!password.trim() || loggingIn) return
    setLoggingIn(true)
    setLoginMsg('')
    const err = await loginCloud(password.trim())
    setLoggingIn(false)
    if (err) {
      setLoginMsg('登录失败,密码不正确')
    } else {
      setPassword('')
    }
  }

  const handleLogout = () => {
    void logoutCloud()
  }

  const fmtTime = (iso: string) => {
    if (!iso) return '未同步'
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <Section title="云同步 · Cloud Sync" className="z-10">
      <div className="flex items-start gap-2 text-xs text-fg-soft">
        <Cloud size={14} className="mt-0.5 shrink-0 text-gold" />
        <p>
          登录后,题库、收藏、历史、计划和图片会自动同步到云端,所有设备保持一致。
          情侣二人共用同一个账号,输入共享密码即可。
        </p>
      </div>

      {account ? (
        <>
          <Row label={`已登录 · ${account}`}>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full border border-border-c px-4 py-1.5 text-xs text-fg-soft transition-colors hover:text-rose"
            >
              <LogOut size={13} /> 退出登录
            </button>
          </Row>

          <Row label="自动同步">
            <Switch checked={autoSync} onChange={setAutoSync} />
          </Row>

          <div className="flex items-center gap-2 text-xs text-fg-soft">
            {status === 'syncing' && <Loader2 size={12} className="animate-spin text-gold" />}
            {status === 'success' && !hasPending && <Check size={12} className="text-emerald-500" />}
            {status === 'error' && <AlertCircle size={12} className="text-rose" />}
            <span>
              {status === 'syncing' ? '同步中...' : `上次同步: ${fmtTime(lastSyncAt)}`}
            </span>
            {error && <span className="text-rose">· {error}</span>}
            {hasPending && status !== 'syncing' && (
              <span className="text-gold">· 有变更未同步到云端</span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => manualPull()}
              disabled={status === 'syncing'}
              className="inline-flex items-center gap-1.5 rounded-full border border-border-c px-4 py-2 text-xs text-fg-soft transition-colors hover:text-fg disabled:opacity-50"
            >
              <Download size={13} /> 从云端拉取
            </button>
            <button
              onClick={() => manualPush()}
              disabled={status === 'syncing'}
              className="inline-flex items-center gap-1.5 rounded-full border border-border-c px-4 py-2 text-xs text-fg-soft transition-colors hover:text-fg disabled:opacity-50"
            >
              <Upload size={13} /> 推送到云端
            </button>
          </div>
        </>
      ) : (
        <>
          <Field label="同步密码">
            <div className="flex gap-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleLogin()
                }}
                placeholder="输入两人共用的同步密码"
                className="setting-input"
              />
              <button
                onClick={() => void handleLogin()}
                disabled={loggingIn || !password.trim()}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2 text-sm text-bg shadow-card transition-transform hover:scale-105 disabled:opacity-50"
                style={{ background: 'linear-gradient(120deg, var(--accent-rose), var(--accent-gold))' }}
              >
                {loggingIn ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
                登录
              </button>
            </div>
          </Field>

          {loginMsg && (
            <p className="flex items-center gap-1.5 text-xs text-rose">
              <AlertCircle size={12} /> {loginMsg}
            </p>
          )}
        </>
      )}
    </Section>
  )
}
