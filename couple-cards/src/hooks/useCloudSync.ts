import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useSyncStore } from '@/store/useSyncStore'
import { useSettingsStore, applyTheme } from '@/store/useSettingsStore'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useQuestionBankStore } from '@/store/useQuestionBankStore'
import { useDeckStore } from '@/store/useDeckStore'
import { usePlansStore } from '@/store/usePlansStore'
import {
  signInCloud,
  signOutCloud,
  pullFromCloud,
  pushToCloud,
  ensureSession,
  mergeCloudData,
  type CloudData,
} from '@/lib/cloudSync'
import { APP_ACCOUNT } from '@/lib/supabase'
import { migrateLocalImagesToCloud } from '@/lib/planMedia'
import { audioEngine } from '@/lib/audioEngine'

/** 同步失败后的自动重试延迟 */
const RETRY_DELAY = 30_000
/** 页面重新可见时拉取的节流间隔 */
const VISIBILITY_PULL_THROTTLE = 30_000
/** 路由切换时拉取的节流间隔(连续切 tab 不重复请求) */
const ROUTE_PULL_THROTTLE = 10_000
/** 本地变更后自动推送的防抖延迟 */
const PUSH_DEBOUNCE = 3_000
/** 同步耗时超过该值才显示"同步中",避免状态文字闪烁 */
const SYNCING_INDICATOR_DELAY = 400
/** 同浏览器多标签协调频道 */
const SYNC_CHANNEL = 'cc:sync'

/** 串行化所有同步任务:push/pull 之间不会互相穿插,后到者排队 */
let syncChain: Promise<unknown> = Promise.resolve()
function runSerial<T>(fn: () => Promise<T>): Promise<T> {
  const next = syncChain.then(fn, fn)
  syncChain = next.then(
    () => undefined,
    () => undefined
  )
  return next
}

/**
 * 本地变更版本号:每次数据变化 +1。
 * push 前记录版本,push 成功时只有版本未变才清除 hasPending——
 * 否则在 push 在途期间产生的新变更会被误标记为"已同步"。
 */
let dirtyVersion = 0
/** 正在把云端数据写回 store,此时的 store 变化不代表用户操作 */
let isApplyingCloud = false

/** 上一次自动同步时间(用于路由/可见性节流) */
let lastAutoSyncAt = 0
let syncingTimer: ReturnType<typeof setTimeout> | undefined
let retryTimer: ReturnType<typeof setTimeout> | undefined
let channel: BroadcastChannel | null = null
const TAB_ID = Math.random().toString(36).slice(2)

/** 收集各 store 当前数据(仅数据字段,不含方法) */
function collectData(): CloudData {
  const settings = useSettingsStore.getState()
  const favorites = useFavoritesStore.getState()
  const history = useHistoryStore.getState()
  const banks = useQuestionBankStore.getState()
  const deck = useDeckStore.getState()
  const plans = usePlansStore.getState()

  return {
    version: 2,
    settings: {
      theme: settings.theme,
      soundEnabled: settings.soundEnabled,
      bgmEnabled: settings.bgmEnabled,
      volume: settings.volume,
      language: settings.language,
      updatedAt: settings.updatedAt,
    },
    favorites: {
      items: favorites.items,
      removed: favorites.removed,
    },
    history: {
      records: history.records,
      clearedAt: history.clearedAt,
    },
    questionBanks: {
      banks: banks.banks,
      activeBankId: banks.activeBankId,
      deleted: banks.deletedBanks,
    },
    deck: {
      drawnIds: deck.drawnIds,
      mode: deck.mode,
    },
    plans: {
      plans: plans.plans,
      categories: plans.categories,
      deleted: plans.deleted,
      categoriesUpdatedAt: plans.categoriesUpdatedAt,
    },
    updatedAt: new Date().toISOString(),
  }
}

/** 本地是否有值得播种到云端的数据(首次登录、云端为空时用) */
function hasLocalData(data: CloudData): boolean {
  return (
    data.plans.plans.length > 0 ||
    data.favorites.items.length > 0 ||
    data.history.records.length > 0 ||
    data.questionBanks.banks.length > 0 ||
    data.deck.drawnIds.length > 0
  )
}

function sameJSON(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

function sameRefs<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i])
}

/**
 * 将云端数据应用到各 store(只设置数据字段,保留方法)。
 * - 只在数据真正有差异时 setState,避免每次拉取都触发全量重渲染
 * - 未变化的计划复用旧对象引用,让 PlanCard 的 memo 继续生效
 */
function applyCloudData(data: CloudData) {
  isApplyingCloud = true
  try {
    const settings = useSettingsStore.getState()
    const nextSettings = {
      theme: data.settings?.theme ?? settings.theme,
      soundEnabled: data.settings?.soundEnabled ?? settings.soundEnabled,
      bgmEnabled: data.settings?.bgmEnabled ?? settings.bgmEnabled,
      volume: data.settings?.volume ?? settings.volume,
      language: data.settings?.language ?? settings.language,
      updatedAt: data.settings?.updatedAt ?? settings.updatedAt,
    }
    const curSettings = {
      theme: settings.theme,
      soundEnabled: settings.soundEnabled,
      bgmEnabled: settings.bgmEnabled,
      volume: settings.volume,
      language: settings.language,
      updatedAt: settings.updatedAt,
    }
    if (!sameJSON(curSettings, nextSettings)) {
      // 设置变化需要同步副作用,否则主题/音量只改了 store 不生效
      if (nextSettings.theme !== settings.theme) applyTheme(nextSettings.theme)
      if (nextSettings.soundEnabled !== settings.soundEnabled) {
        audioEngine.setSoundEnabled(nextSettings.soundEnabled)
      }
      if (nextSettings.bgmEnabled !== settings.bgmEnabled) {
        audioEngine.setBgmEnabled(nextSettings.bgmEnabled)
      }
      if (nextSettings.volume !== settings.volume) {
        audioEngine.setVolume(nextSettings.volume)
      }
      useSettingsStore.setState(nextSettings)
    }

    const favorites = useFavoritesStore.getState()
    const nextFavorites = (data.favorites?.items ?? favorites.items) as typeof favorites.items
    const nextRemoved = (data.favorites?.removed ?? favorites.removed) as typeof favorites.removed
    if (!sameJSON(favorites.items, nextFavorites) || !sameJSON(favorites.removed, nextRemoved)) {
      useFavoritesStore.setState({ items: nextFavorites, removed: nextRemoved })
    }

    const history = useHistoryStore.getState()
    const nextHistory = (data.history?.records ?? history.records) as typeof history.records
    const nextClearedAt = data.history?.clearedAt ?? history.clearedAt
    if (!sameJSON(history.records, nextHistory) || history.clearedAt !== nextClearedAt) {
      useHistoryStore.setState({ records: nextHistory, clearedAt: nextClearedAt })
    }

    const banks = useQuestionBankStore.getState()
    const nextBanks = (data.questionBanks?.banks ?? banks.banks) as typeof banks.banks
    const nextActive = (data.questionBanks?.activeBankId ??
      banks.activeBankId) as typeof banks.activeBankId
    const nextDeletedBanks = (data.questionBanks?.deleted ??
      banks.deletedBanks) as typeof banks.deletedBanks
    if (
      !sameJSON(banks.banks, nextBanks) ||
      banks.activeBankId !== nextActive ||
      !sameJSON(banks.deletedBanks, nextDeletedBanks)
    ) {
      useQuestionBankStore.setState({
        banks: nextBanks,
        activeBankId: nextActive,
        deletedBanks: nextDeletedBanks,
      })
    }

    const deck = useDeckStore.getState()
    const nextDrawn = data.deck?.drawnIds ?? deck.drawnIds
    const nextMode = (data.deck?.mode ?? deck.mode) as typeof deck.mode
    if (!sameJSON(deck.drawnIds, nextDrawn) || deck.mode !== nextMode) {
      useDeckStore.setState({ drawnIds: nextDrawn, mode: nextMode })
    }

    const plans = usePlansStore.getState()
    const prevMap = new Map(plans.plans.map((p) => [p.id, p]))
    const incoming = data.plans?.plans ?? plans.plans
    const stablePlans = incoming.map((p) => {
      const old = prevMap.get(p.id)
      return old && sameJSON(old, p) ? old : p
    })
    const nextDeleted = data.plans?.deleted ?? plans.deleted
    const nextCategories = data.plans?.categories ?? plans.categories
    const nextCategoriesAt = data.plans?.categoriesUpdatedAt ?? plans.categoriesUpdatedAt

    if (
      !sameRefs(plans.plans, stablePlans) ||
      !sameJSON(plans.deleted, nextDeleted) ||
      !sameJSON(plans.categories, nextCategories) ||
      plans.categoriesUpdatedAt !== nextCategoriesAt
    ) {
      usePlansStore.setState({
        plans: stablePlans,
        categories: nextCategories,
        deleted: nextDeleted,
        categoriesUpdatedAt: nextCategoriesAt,
      })
    }
  } finally {
    isApplyingCloud = false
  }
}

function markSyncing() {
  clearTimeout(syncingTimer)
  syncingTimer = setTimeout(() => {
    useSyncStore.getState().setStatus('syncing')
  }, SYNCING_INDICATOR_DELAY)
}

function markSuccess() {
  clearTimeout(syncingTimer)
  useSyncStore.getState().setStatus('success')
}

function markError(message: string) {
  clearTimeout(syncingTimer)
  useSyncStore.getState().setStatus('error', message)
}

function scheduleRetry() {
  clearTimeout(retryTimer)
  retryTimer = setTimeout(() => {
    // 关掉自动同步后不再后台重试(变更仍保留 pending,下次开启/启动时补推)
    const { hasPending, autoSync } = useSyncStore.getState()
    if (hasPending && autoSync) void runSerial(() => syncOnce())
  }, RETRY_DELAY)
}

function broadcastPushed() {
  channel?.postMessage({ type: 'pushed', tab: TAB_ID })
}

/**
 * 一次完整同步:
 * 1. 拉取云端
 * 2. 本地有变更(含拉取期间刚发生的变更)→ 与云端合并后推送
 * 3. 本地无变更 → 直接把云端数据应用到本地
 * 4. 云端无数据且本地有数据 → 把本地播种到云端
 *
 * 合并而不是"先推后拉",避免旧设备用全量旧数据覆盖另一台设备的新改动。
 */
async function syncOnce(forcePush = false): Promise<boolean> {
  const { account } = useSyncStore.getState()
  if (!account) return false
  if (!(await ensureSession())) {
    markError('登录已过期,请在设置页重新登录后再同步')
    return false
  }

  lastAutoSyncAt = Date.now()
  markSyncing()
  const pullVersion = dirtyVersion
  const pendingBefore = useSyncStore.getState().hasPending
  let phase: 'pull' | 'push' = 'pull'

  try {
    const cloud = await pullFromCloud()
    const local = collectData()
    const hasLocalChanges =
      forcePush ||
      pendingBefore ||
      useSyncStore.getState().hasPending ||
      dirtyVersion !== pullVersion

    if (hasLocalChanges) {
      phase = 'push'
      const merged = cloud ? mergeCloudData(local, cloud) : local
      // 快照已包含拉取期间发生的改动;从这一刻起再发生的改动才留待下一轮
      const pushVersion = dirtyVersion
      await pushToCloud(merged)
      if (dirtyVersion === pushVersion) {
        applyCloudData(merged)
        useSyncStore.getState().setHasPending(false)
      }
      // 版本已变化:推送期间又有新改动,保留 pending,由防抖/重试继续推
      broadcastPushed()
    } else if (cloud) {
      applyCloudData(cloud)
    } else if (hasLocalData(local)) {
      // 首次登录且云端为空:把本地已有数据播种上去
      phase = 'push'
      await pushToCloud(local)
      broadcastPushed()
    }

    useSyncStore.getState().setLastSyncAt(new Date().toISOString())
    markSuccess()
    if (useSyncStore.getState().hasPending) scheduleRetry()
    return true
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    markError(`${phase === 'push' ? '推送失败' : '拉取失败'}: ${message}`)
    if (useSyncStore.getState().hasPending) scheduleRetry()
    return false
  }
}

/** 自动同步入口:按最小间隔节流,避免连续切页产生请求风暴 */
function requestSync(minInterval = ROUTE_PULL_THROTTLE) {
  const { account, autoSync } = useSyncStore.getState()
  if (!account || !autoSync) return
  if (Date.now() - lastAutoSyncAt < minInterval) return
  lastAutoSyncAt = Date.now()
  void runSerial(() => syncOnce())
}

function ensureChannel() {
  if (channel || typeof BroadcastChannel === 'undefined') return
  channel = new BroadcastChannel(SYNC_CHANNEL)
  channel.onmessage = (e: MessageEvent) => {
    // 其他标签推送成功是明确的"云端有变"信号,立即排队拉取;
    // 不能按时间节流丢弃——两个标签同时推送时后到的广播会被刚结束的同步挡掉,
    // 导致本标签一直停留在旧数据上(实测复现)。请求量由串行队列天然收敛。
    if (e.data?.type === 'pushed' && e.data.tab !== TAB_ID) requestSync(0)
  }
}

/** 登录共享账号(设置页调用);成功后由 hook 自动做启动同步 */
export async function loginCloud(password: string): Promise<string | null> {
  const err = await signInCloud(password)
  if (!err) {
    // store 中存展示账号名(登录态标志)
    useSyncStore.getState().setAccount(APP_ACCOUNT)
  }
  return err
}

/** 退出登录(本地数据保留,仅停止云同步) */
export async function logoutCloud(): Promise<void> {
  await signOutCloud()
  useSyncStore.getState().setAccount('')
  useSyncStore.getState().setStatus('idle')
  clearTimeout(retryTimer)
}

/** 手动拉取(忽略节流):本地有变更会先合并推送,再应用云端 */
export async function manualPull() {
  if (!useSyncStore.getState().account) return
  await runSerial(() => syncOnce())
}

/** 手动推送(忽略 pending 判定,强制把本地数据合并后写入云端) */
export async function manualPush() {
  if (!useSyncStore.getState().account) return
  await runSerial(() => syncOnce(true))
}

/**
 * 云端同步 hook(须挂载在 Router 内的常驻布局,如 RootLayout):
 *
 * 同步时机——
 * 1. 启动/刷新/登录:一次完整同步(有本地变更先合并推送,否则拉取)
 * 2. 本地数据变更:立即标脏,3s 防抖同步;失败 30s 重试
 * 3. 路由切换:同步一次,10s 节流
 * 4. 页面重新可见:同步一次,30s 节流
 * 5. 网络恢复:立即同步一次(push + pull 合并完成)
 * 6. 其他标签推送成功:立即拉取一次
 * 7. 设置页手动推送/拉取按钮
 *
 * 渲染原则——
 * - 用户操作先改本地 store,界面立即响应(乐观更新)
 * - 拉取结果只在有差异时写回,未变化的条目复用旧对象引用
 */
export function useCloudSync() {
  const account = useSyncStore((s) => s.account)
  const autoSync = useSyncStore((s) => s.autoSync)
  const location = useLocation()
  const pushTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const hasInitialized = useRef(false)

  // 多标签协调频道(仅创建一次)
  useEffect(() => {
    ensureChannel()
    return () => {
      channel?.close()
      channel = null
    }
  }, [])

  // 1. 登录态变化:登出时复位启动标记;登录后做启动同步(仅每个登录周期一次)
  useEffect(() => {
    if (!account) {
      hasInitialized.current = false
      clearTimeout(retryTimer)
      return
    }
    if (hasInitialized.current) return
    hasInitialized.current = true
    // 占用节流时间戳:挂载时的路由 effect 不应再额外发起一次重复同步
    lastAutoSyncAt = Date.now()
    void runSerial(() => syncOnce()).then(() => {
      // 迁移旧版本存本机的图片上云(一次性,失败下次登录重试)
      void migrateLocalImagesToCloud()
    })
  }, [account])

  // 2. 数据变更后标脏 + 防抖同步
  useEffect(() => {
    if (!account) return

    const onChange = () => {
      // 云端数据写回本地造成的 store 变化,不算用户变更
      if (isApplyingCloud) return
      dirtyVersion++
      useSyncStore.getState().setHasPending(true)
      if (!autoSync) return
      clearTimeout(pushTimer.current)
      pushTimer.current = setTimeout(() => {
        if (!useSyncStore.getState().hasPending) return
        void runSerial(() => syncOnce())
      }, PUSH_DEBOUNCE)
    }

    // 订阅各 store 的数据变更
    const unsubs = [
      useSettingsStore.subscribe(onChange),
      useFavoritesStore.subscribe(onChange),
      useHistoryStore.subscribe(onChange),
      useQuestionBankStore.subscribe(onChange),
      // 抽卡页的 currentDraw/phase/revealedIds 不进云端,变化不应触发同步
      useDeckStore.subscribe((s, prev) => {
        if (s.drawnIds !== prev.drawnIds || s.mode !== prev.mode) onChange()
      }),
      usePlansStore.subscribe(onChange),
    ]

    return () => {
      unsubs.forEach((fn) => fn())
      clearTimeout(pushTimer.current)
    }
  }, [account, autoSync])

  // 3. 路由切换(切 tab)→ 拉取最新,10s 节流
  const pathname = location.pathname
  useEffect(() => {
    if (!hasInitialized.current) return // 启动同步进行中,不抢
    requestSync(ROUTE_PULL_THROTTLE)
  }, [pathname])

  // 4. 页面重新可见(切回标签页/窗口)→ 拉取,30s 节流
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      requestSync(VISIBILITY_PULL_THROTTLE)
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  // 5. 网络恢复 → 立即同步(有本地变更则合并推送,同时拉取对方改动)
  useEffect(() => {
    const onOnline = () => requestSync(0)
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [])
}
