/**
 * Web Audio API 单例音频引擎。
 * - 音效程序化合成(无外部依赖)
 * - 背景音乐:从 public/audio/playlist.json 读取播放列表,随机播放 + 自动连播
 *
 * AudioContext 必须在用户首次交互后 resume(),故在交互回调内调 init()。
 *
 * BGM 使用 HTMLAudioElement + createMediaElementSource 方案。
 * 原因:AudioContext.decodeAudioData() 在 Chrome 中不支持 flac 格式,
 * 而 <audio> 元素原生支持 flac/mp3/wav/aac 等所有浏览器可播放的格式。
 * 通过 createMediaElementSource() 将 <audio> 连接到 Web Audio API 的 GainNode,
 * 可统一控制音量,且切歌时只需更换 src + play(),不涉及网络请求中止。
 */

const BASE = import.meta.env.BASE_URL

interface Playlist {
  tracks: string[]
}

class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private bgmGain: GainNode | null = null
  private soundEnabled = true
  private bgmEnabled = false
  private volume = 0.6

  // BGM 播放状态
  private tracks: string[] = []
  private order: number[] = [] // 当前随机顺序的索引
  private cursor = 0
  private loading = false

  // HTMLAudioElement 方案
  private audioEl: HTMLAudioElement | null = null
  private currentFile: string | null = null
  private isAudioReady = false // <audio> 是否已 canplay

  /** 初始化(惰性),须在用户交互后调用 */
  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume()
      return
    }
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    if (!AC) return
    this.ctx = new AC()
    this.master = this.ctx.createGain()
    this.master.gain.value = this.volume
    this.master.connect(this.ctx.destination)
  }

  /** 显式 resume AudioContext(浏览器自动播放策略要求用户交互后才能发声) */
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume()
    }
  }

  setSoundEnabled(v: boolean) {
    this.soundEnabled = v
  }
  setBgmEnabled(v: boolean) {
    this.bgmEnabled = v
    if (v) void this.startBgm()
    else this.stopBgm()
  }
  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v))
    if (this.master) this.master.gain.value = this.volume
    if (this.bgmGain) this.bgmGain.gain.value = 0.45
  }

  private now() {
    return this.ctx ? this.ctx.currentTime : 0
  }

  /** 翻牌"啪"声 */
  playFlip() {
    if (!this.ctx || !this.master || !this.soundEnabled) return
    const t = this.now()
    const dur = 0.15
    const buf = this.ctx.createBuffer(
      1,
      Math.floor(this.ctx.sampleRate * dur),
      this.ctx.sampleRate
    )
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-(i / data.length) * 5)
    }
    const src = this.ctx.createBufferSource()
    src.buffer = buf
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 2200
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0.35, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + dur)
    src.connect(filter).connect(g).connect(this.master)
    src.start(t)
  }

  /** 悬停"叮"声 */
  playHover() {
    if (!this.ctx || !this.master || !this.soundEnabled) return
    const t = this.now()
    const osc = this.ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 880
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.07, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12)
    osc.connect(g).connect(this.master)
    osc.start(t)
    osc.stop(t + 0.13)
  }

  /** 揭示和弦:C-E-G 上扬 */
  playReveal() {
    if (!this.ctx || !this.master || !this.soundEnabled) return
    const t = this.now()
    const freqs = [523.25, 659.25, 783.99]
    freqs.forEach((f, i) => {
      const osc = this.ctx!.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = f
      const g = this.ctx!.createGain()
      const start = t + i * 0.08
      g.gain.setValueAtTime(0.0001, start)
      g.gain.exponentialRampToValueAtTime(0.09, start + 0.03)
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.9)
      osc.connect(g).connect(this.master!)
      osc.start(start)
      osc.stop(start + 1)
    })
  }

  /** 收藏"叮咚" */
  playFavorite() {
    if (!this.ctx || !this.master || !this.soundEnabled) return
    const t = this.now()
    ;[659.25, 880].forEach((f, i) => {
      const osc = this.ctx!.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = f
      const g = this.ctx!.createGain()
      const start = t + i * 0.09
      g.gain.setValueAtTime(0.0001, start)
      g.gain.exponentialRampToValueAtTime(0.08, start + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.4)
      osc.connect(g).connect(this.master!)
      osc.start(start)
      osc.stop(start + 0.45)
    })
  }

  /** Fisher-Yates 洗牌 */
  private shuffle<T>(arr: T[]): T[] {
    const a = arr.slice()
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  /** 加载播放列表 manifest */
  private async loadPlaylist(): Promise<string[]> {
    try {
      const res = await fetch(`${BASE}audio/playlist.json`, { cache: 'no-cache' })
      if (!res.ok) return []
      const data: Playlist = await res.json()
      const tracks = Array.isArray(data.tracks) ? data.tracks : []
      // 过滤掉占位项与非字符串
      return tracks.filter(
        (t) => typeof t === 'string' && t && !t.startsWith('_')
      )
    } catch {
      return []
    }
  }

  /** 当前播放的曲目名(供 UI 显示) */
  currentTrackName(): string {
    if (!this.order.length || !this.tracks.length) return ''
    const idx = this.order[this.cursor]
    const file = this.tracks[idx]
    return file ? file.replace(/\.[^.]+$/, '') : ''
  }

  /** 确保 bgmGain 已创建 */
  private ensureBgmGain() {
    if (!this.ctx || !this.master) return
    if (!this.bgmGain) {
      this.bgmGain = this.ctx.createGain()
      this.bgmGain.gain.value = 0.45
      this.bgmGain.connect(this.master)
    }
  }

  /** 确保 <audio> 元素已创建 */
  private ensureAudioElement() {
    if (this.audioEl) return
    this.ensureBgmGain()

    this.audioEl = new Audio()
    this.audioEl.preload = 'auto'
    this.audioEl.volume = 0.45

    // 自然播放结束 → 自动连播下一曲
    this.audioEl.addEventListener('ended', () => {
      if (this.bgmEnabled) {
        this.cursor++
        if (this.cursor >= this.order.length) {
          this.order = this.shuffle(this.tracks.map((_, i) => i))
          this.cursor = 0
        }
        void this.playCurrentTrack()
      }
    })

    this.audioEl.addEventListener('canplay', () => {
      this.isAudioReady = true
    })
  }

  /** 加载并播放当前曲目 */
  private async playCurrentTrack() {
    if (!this.bgmEnabled || !this.tracks.length) return
    if (!this.order.length) {
      this.order = this.shuffle(this.tracks.map((_, i) => i))
      this.cursor = 0
    }
    const idx = this.order[this.cursor]
    const file = this.tracks[idx]
    if (!file) return

    this.ensureAudioElement()
    if (!this.audioEl) return

    this.isAudioReady = false
    this.currentFile = file
    this.audioEl.src = `${BASE}audio/${encodeURIComponent(file)}`
    try {
      await this.audioEl.play()
    } catch {
      // play() 可能因浏览器策略被拒绝(如未交互),
      // 下次用户交互时会重试
    }
  }

  /** 开始播放背景音乐:随机播放 + 自动连播 */
  async startBgm() {
    if (!this.ctx) this.init()
    if (!this.ctx || !this.master || !this.bgmEnabled) return

    // 暂停后恢复:<audio> 已有 src,直接 play
    if (this.audioEl && this.currentFile && this.audioEl.paused) {
      try {
        await this.audioEl.play()
      } catch {
        /* noop */
      }
      return
    }
    // 已在播放
    if (this.audioEl && !this.audioEl.paused) return
    if (this.loading) return
    this.loading = true

    // 首次或曲目列表为空时加载 manifest
    if (this.tracks.length === 0) {
      this.tracks = await this.loadPlaylist()
    }
    if (this.tracks.length === 0) {
      this.loading = false
      // 无可用曲目时降级为程序化 ambient pad
      this.startAmbientPad()
      return
    }

    // 生成随机顺序(若未生成或已播完一轮)
    if (this.order.length === 0 || this.cursor >= this.order.length) {
      this.order = this.shuffle(this.tracks.map((_, i) => i))
      this.cursor = 0
    }

    this.loading = false
    void this.playCurrentTrack()
  }

  /** 停止背景音乐(暂停,保留位置以便恢复) */
  stopBgm() {
    if (this.audioEl && !this.audioEl.paused) {
      this.audioEl.pause()
    }
    this.stopAmbientPad()
  }

  /** 下一首(手动跳转) */
  nextTrack() {
    if (!this.tracks.length) {
      // tracks 为空时尝试加载(首次切歌)
      if (this.bgmEnabled) void this.startBgm()
      return
    }
    this.cursor++
    if (this.cursor >= this.order.length) {
      this.order = this.shuffle(this.tracks.map((_, i) => i))
      this.cursor = 0
    }
    this.currentFile = null
    if (this.bgmEnabled) {
      void this.playCurrentTrack()
    }
  }

  // ---- 程序化 ambient pad 降级方案(无曲目时) ----
  private padNodes: { osc: OscillatorNode; gain: GainNode }[] = []
  private startAmbientPad() {
    if (!this.ctx || !this.master) return
    if (this.padNodes.length) return
    if (!this.bgmGain) {
      this.bgmGain = this.ctx.createGain()
      this.bgmGain.gain.value = 0.2
      this.bgmGain.connect(this.master)
    }
    // 低频温柔和弦(C2-G2-C3-E3),营造 ambient 氛围
    const freqs = [65.41, 98.0, 130.81, 164.81]
    freqs.forEach((f) => {
      const osc = this.ctx!.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = f
      const g = this.ctx!.createGain()
      g.gain.value = 0.12
      // 缓慢 LFO 颤音
      const lfo = this.ctx!.createOscillator()
      lfo.frequency.value = 0.1 + Math.random() * 0.15
      const lfoGain = this.ctx!.createGain()
      lfoGain.gain.value = 0.04
      lfo.connect(lfoGain).connect(g.gain)
      osc.connect(g).connect(this.bgmGain!)
      osc.start()
      lfo.start()
      this.padNodes.push({ osc, gain: g })
    })
  }
  private stopAmbientPad() {
    this.padNodes.forEach(({ osc, gain }) => {
      try {
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + 0.4)
        osc.stop(this.ctx!.currentTime + 0.5)
      } catch {
        /* noop */
      }
    })
    this.padNodes = []
  }
}

export const audioEngine = new AudioEngine()
