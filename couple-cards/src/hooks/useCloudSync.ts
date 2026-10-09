import { useEffect, useRef } from 'react'
import { useSyncStore } from '@/store/useSyncStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useQuestionBankStore } from '@/store/useQuestionBankStore'
import { useDeckStore } from '@/store/useDeckStore'
import { usePlansStore } from '@/store/usePlansStore'
import { pullFromCloud, pushToCloud, type CloudData } from '@/lib/cloudSync'

/** push 失败后的自动重试延迟 */
const RETRY_DELAY = 30_000

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
  // 场景:旧版本云端没有 plans 字段 / push 失败期间 pull,pull 会把空数组覆盖上来导致本地计划丢失
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

/** 推送本地数据(成功返回 true) */
async function doPush(token: string): Promise<boolean> {
  useSyncStore.getState().setStatus('syncing')
  try {
    await pushToCloud(token, collectData())
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
async function doPull(token: string): Promise<boolean> {
  useSyncStore.getState().setStatus('syncing')
  try {
    const data = await pullFromCloud(token)
    if (data) applyCloudData(data)
    useSyncStore.getState().setLastSyncAt(new Date().toISOString())
    useSyncStore.getState().setStatus('success')
    // pull 应用了云端数据、但本地有云端没有的内容(受保护的计划),补推上去
    if (useSyncStore.getState().hasPending) {
      await doPush(token)
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

/** 手动拉取云端数据(用户主动操作,若本地有未推送变更先推再拉,避免覆盖丢数据) */
export async function manualPull() {
  const { token, hasPending } = useSyncStore.getState()
  if (!token) return
  if (hasPending) {
    const pushed = await doPush(token)
    if (!pushed) return // 本地有未推送数据且推送失败,放弃本次拉取
  }
  await doPull(token)
}

/** 手动推送本地数据到云端 */
export async function manualPush() {
  const { token } = useSyncStore.getState()
  if (!token) return
  await doPush(token)
}

/**
 * 云端同步 hook:
 * - App 启动时若有 token:本地无未推送变更 → pull;
 *   有未推送变更(上次 push 失败) → 先 push 成功再 pull,失败则不 pull(防止云端旧数据覆盖本地新数据)
 * - 各 store 数据变更后,防抖 3s 自动推送(push)
 * - push 失败自动标记 pending 并在 30s 后重试
 * - pull 期间暂停 push,避免循环
 */
export function useCloudSync() {
  const token = useSyncStore((s) => s.token)
  const autoSync = useSyncStore((s) => s.autoSync)
  const pushTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const retryTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const isPulling = useRef(false)
  const hasInitialized = useRef(false)

  // 启动同步(仅一次):pending 保护 + pull
  useEffect(() => {
    if (!token || hasInitialized.current) return
    hasInitialized.current = true
    isPulling.current = true
    ;(async () => {
      const { hasPending } = useSyncStore.getState()
      if (hasPending) {
        // 上次有未推送的变更:先推上去,成功后再拉,失败绝不让云端覆盖本地
        const pushed = await doPush(token)
        if (!pushed) {
          isPulling.current = false
          return
        }
      }
      await doPull(token)
      isPulling.current = false
    })()
  }, [token])

  // 数据变更后防抖 push(失败 30s 重试)
  useEffect(() => {
    if (!token || !autoSync) return

    const schedulePush = () => {
      if (isPulling.current) return // pull 期间的数据变更来自 applyCloudData,不标记不推送
      // 本地数据发生变更,标记待推送(立即,不等防抖结束——防止 3s 内关页面丢标记)
      useSyncStore.getState().setHasPending(true)
      clearTimeout(pushTimer.current)
      pushTimer.current = setTimeout(async () => {
        const ok = await doPush(token)
        if (!ok) {
          // 推送失败(如网络中断):30s 后自动重试一次
          clearTimeout(retryTimer.current)
          retryTimer.current = setTimeout(() => {
            doPush(token)
          }, RETRY_DELAY)
        }
      }, 3000)
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
  }, [token, autoSync])
}
