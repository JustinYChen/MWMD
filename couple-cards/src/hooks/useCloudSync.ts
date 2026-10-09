import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useSyncStore } from '@/store/useSyncStore'
import { useSettingsStore } from '@/store/useSettingsStore'
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
  type CloudData,
} from '@/lib/cloudSync'
import { APP_ACCOUNT } from '@/lib/supabase'
import { migrateLocalImagesToCloud } from '@/lib/planMedia'

/** push 失败后的自动重试延迟 */
const RETRY_DELAY = 30_000
/** 页面重新可见时的 pull 节流间隔(防止频繁切窗口狂打数据库) */
const VISIBILITY_PULL_THROTTLE = 30_000
/** 本地变更后自动推送的防抖延迟 */
const PUSH_DEBOUNCE = 3_000

/** pull 全局锁:同一时刻只允许一个 pull 流程(路由切换/启动/手动共用) */
let isPulling = false

/** 收集各 store 当前数据(仅数据字段,不含方法) */
function collectData(): CloudData {
  const settings = useSettingsStore.getState()
  const favorites = useFavoritesStore.getState()
  const history = useHistoryStore.getState()
  const banks = useQuestionBankStore.getState()
  const deck = useDeckStore.getState()
  const plans = usePlansStore.getState()

  return {
    version: 1,
    settings: {
      theme: settings.theme,
      soundEnabled: settings.soundEnabled,
      bgmEnabled: settings.bgmEnabled,
      volume: settings.volume,
      language: settings.language,
    },
    favorites: {
      items: favorites.items,
    },
    history: {
      records: history.records,
    },
    questionBanks: {
      banks: banks.banks,
      activeBankId: banks.activeBankId,
    },
    deck: {
      drawnIds: deck.drawnIds,
      mode: deck.mode,
    },
    plans: {
      plans: plans.plans,
      categories: plans.categories,
    },
    updatedAt: new Date().toISOString(),
  }
}

/** 将云端数据应用到各 store(只设置数据字段,保留方法) */
function applyCloudData(data: CloudData) {
  const settings = useSettingsStore.getState()
  useSettingsStore.setState({
    theme: data.settings?.theme ?? settings.theme,
    soundEnabled: data.settings?.soundEnabled ?? settings.soundEnabled,
    bgmEnabled: data.settings?.bgmEnabled ?? settings.bgmEnabled,
    volume: data.settings?.volume ?? settings.volume,
    language: data.settings?.language ?? settings.language,
  })

  const favorites = useFavoritesStore.getState()
  useFavoritesStore.setState({
    items: (data.favorites?.items ?? favorites.items) as typeof favorites.items,
  })

  const history = useHistoryStore.getState()
  useHistoryStore.setState({
    records: (data.history?.records ?? history.records) as typeof history.records,
  })

  const banks = useQuestionBankStore.getState()
  useQuestionBankStore.setState({
    banks: (data.questionBanks?.banks ?? banks.banks) as typeof banks.banks,
    activeBankId: (data.questionBanks?.activeBankId ?? banks.activeBankId) as typeof banks.activeBankId,
  })

  const deck = useDeckStore.getState()
  useDeckStore.setState({
    drawnIds: data.deck?.drawnIds ?? deck.drawnIds,
    mode: (data.deck?.mode ?? deck.mode) as typeof deck.mode,
  })

  const plans = usePlansStore.getState()
  // 保护:云端 plans 为空(或缺失)而本地非空时,保留本地
  // 场景:push 失败期间 pull,pull 会把空数组覆盖上来导致本地计划丢失
  const cloudPlansEmpty =
    !data.plans?.plans || (Array.isArray(data.plans.plans) && data.plans.plans.length === 0)
  const keepLocalPlans = cloudPlansEmpty && plans.plans.length > 0
  if (keepLocalPlans) {
    // 保留的本地计划尚未在云端,标记待推送(pull 结束后会补推)
    useSyncStore.getState().setHasPending(true)
  }
  usePlansStore.setState({
    plans: (keepLocalPlans ? plans.plans : (data.plans?.plans ?? plans.plans)) as typeof plans.plans,
    categories: (data.plans?.categories ?? plans.categories) as typeof plans.categories,
  })
}

/** 推送本地数据(成功返回 true);登录失效时给出明确提示而非误导性的 RLS 报错 */
async function doPush(): Promise<boolean> {
  if (!(await ensureSession())) {
    useSyncStore
      .getState()
      .setStatus('error', '登录已过期,请在设置页重新登录后再同步')
    return false
  }
  useSyncStore.getState().setStatus('syncing')
  try {
    await pushToCloud(collectData())
    useSyncStore.getState().setHasPending(false)
    useSyncStore.getState().setLastSyncAt(new Date().toISOString())
    useSyncStore.getState().setStatus('success')
    return true
  } catch (err) {
    useSyncStore.getState().setStatus(
      'error',
      `推送失败: ${err instanceof Error ? err.message : String(err)}`
    )
    return false
  }
}

/** 拉取云端数据并应用(成功返回 true);若应用后仍有待推送变更(如保留了本地计划)则补推一次 */
async function doPull(): Promise<boolean> {
  if (!(await ensureSession())) {
    useSyncStore
      .getState()
      .setStatus('error', '登录已过期,请在设置页重新登录后再同步')
    return false
  }
  useSyncStore.getState().setStatus('syncing')
  try {
    const data = await pullFromCloud()
    if (data) applyCloudData(data)
    useSyncStore.getState().setLastSyncAt(new Date().toISOString())
    useSyncStore.getState().setStatus('success')
    // pull 应用了云端数据、但本地有云端没有的内容(受保护的计划),补推上去
    if (useSyncStore.getState().hasPending) {
      await doPush()
    }
    return true
  } catch (err) {
    useSyncStore.getState().setStatus(
      'error',
      `拉取失败: ${err instanceof Error ? err.message : String(err)}`
    )
    return false
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
}

/**
 * 智能拉取(路由切换/页面可见/手动共用):
 * - 有未推送的本地变更 → 先推再拉,绝不让云端旧数据覆盖本地新数据
 * - 全局锁防并发,多个触发点同时到达只跑一次
 */
export async function manualPull() {
  const { account, hasPending } = useSyncStore.getState()
  if (!account || isPulling) return
  isPulling = true
  try {
    if (hasPending) {
      const pushed = await doPush()
      if (!pushed) return // 本地有未推送数据且推送失败,放弃本次拉取
    }
    await doPull()
  } finally {
    isPulling = false
  }
}

/** 手动推送本地数据到云端 */
export async function manualPush() {
  const { account } = useSyncStore.getState()
  if (!account) return
  await doPush()
}

/**
 * 云端同步 hook(须挂载在 Router 内的常驻布局,如 RootLayout):
 *
 * 触发时机——
 * 1. 启动/刷新/登录:有 pending 先推再拉,否则直接拉
 * 2. 本地数据变更:立即标 pending,3s 防抖推送;失败 30s 自动重试
 * 3. 路由切换(切 tab):自动拉取最新(多设备场景下切到页面即看到对方的改动)
 * 4. 页面重新可见(从别的窗口/标签切回):节流 30s 拉取
 * 5. 网络恢复:若有未推送变更立即补推
 * 6. 设置页手动推送/拉取按钮
 *
 * 数据安全——
 * - 任何 pull 前若本地有未推送变更,先推成功再拉(防覆盖丢数据)
 * - pull 期间的数据变更来自 applyCloudData,不会触发推送循环
 */
export function useCloudSync() {
  const account = useSyncStore((s) => s.account)
  const autoSync = useSyncStore((s) => s.autoSync)
  const location = useLocation()
  const pushTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const retryTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const hasInitialized = useRef(false)
  const lastVisiblePull = useRef(0)

  // 1. 登录态变化:登出时复位启动标记;登录后做启动同步(仅每个登录周期一次)
  useEffect(() => {
    if (!account) {
      hasInitialized.current = false
      return
    }
    if (hasInitialized.current) return
    hasInitialized.current = true
    isPulling = true
    ;(async () => {
      const { hasPending } = useSyncStore.getState()
      if (hasPending) {
        // 上次有未推送的变更:先推上去,成功后再拉,失败绝不让云端覆盖本地
        const pushed = await doPush()
        if (!pushed) {
          isPulling = false
          return
        }
      }
      await doPull()
      isPulling = false
      // 迁移旧版本存本机的图片上云(一次性,失败下次登录重试)
      void migrateLocalImagesToCloud()
    })()
  }, [account])

  // 2. 数据变更后防抖 push(失败 30s 重试)
  useEffect(() => {
    if (!account || !autoSync) return

    const schedulePush = () => {
      if (isPulling) return // pull 期间的数据变更来自 applyCloudData,不标记不推送
      // 本地数据发生变更,标记待推送(立即,不等防抖结束——防止 3s 内关页面丢标记)
      useSyncStore.getState().setHasPending(true)
      clearTimeout(pushTimer.current)
      pushTimer.current = setTimeout(async () => {
        // 路由切换/网络恢复等路径可能已推过,避免重复推送
        if (!useSyncStore.getState().hasPending) return
        const ok = await doPush()
        if (!ok) {
          // 推送失败(如网络中断):30s 后自动重试一次
          clearTimeout(retryTimer.current)
          retryTimer.current = setTimeout(() => {
            if (useSyncStore.getState().hasPending) doPush()
          }, RETRY_DELAY)
        }
      }, PUSH_DEBOUNCE)
    }

    // 订阅各 store 的数据变更
    const unsubs = [
      useSettingsStore.subscribe(schedulePush),
      useFavoritesStore.subscribe(schedulePush),
      useHistoryStore.subscribe(schedulePush),
      useQuestionBankStore.subscribe(schedulePush),
      useDeckStore.subscribe(schedulePush),
      usePlansStore.subscribe(schedulePush),
    ]

    return () => {
      unsubs.forEach((fn) => fn())
      clearTimeout(pushTimer.current)
      clearTimeout(retryTimer.current)
    }
  }, [account, autoSync])

  // 3. 路由切换(切 tab)→ 自动拉取最新
  //    依赖 pathname 单独声明:account/autoSync 变化时由其他 effect 处理
  const pathname = location.pathname
  useEffect(() => {
    const { account: acc, autoSync: auto } = useSyncStore.getState()
    if (!acc || !auto) return
    if (!hasInitialized.current) return // 启动同步进行中,不抢
    void manualPull()
  }, [pathname])

  // 4. 页面重新可见(切回标签页/窗口)→ 节流 30s 拉取
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      const { account: acc, autoSync: auto } = useSyncStore.getState()
      if (!acc || !auto) return
      if (Date.now() - lastVisiblePull.current < VISIBILITY_PULL_THROTTLE) return
      lastVisiblePull.current = Date.now()
      void manualPull()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  // 5. 网络恢复 → 有未推送变更立即补推
  useEffect(() => {
    const onOnline = () => {
      const { account: acc, hasPending } = useSyncStore.getState()
      if (acc && hasPending) void doPush()
    }
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [])
}
