import { useEffect, useRef } from 'react'
import { useSyncStore } from '@/store/useSyncStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useQuestionBankStore } from '@/store/useQuestionBankStore'
import { useDeckStore } from '@/store/useDeckStore'
import { pullFromCloud, pushToCloud, type CloudData } from '@/lib/cloudSync'

/** 收集各 store 当前数据(仅数据字段,不含方法) */
function collectData(): CloudData {
  const settings = useSettingsStore.getState()
  const favorites = useFavoritesStore.getState()
  const history = useHistoryStore.getState()
  const banks = useQuestionBankStore.getState()
  const deck = useDeckStore.getState()

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
}

/** 手动拉取云端数据 */
export async function manualPull() {
  const { token, setStatus, setLastSyncAt } = useSyncStore.getState()
  if (!token) return
  setStatus('syncing')
  try {
    const data = await pullFromCloud(token)
    if (data) applyCloudData(data)
    setLastSyncAt(new Date().toISOString())
    setStatus('success')
  } catch (err) {
    setStatus('error', err instanceof Error ? err.message : String(err))
  }
}

/** 手动推送本地数据到云端 */
export async function manualPush() {
  const { token, setStatus, setLastSyncAt } = useSyncStore.getState()
  if (!token) return
  setStatus('syncing')
  try {
    await pushToCloud(token, collectData())
    setLastSyncAt(new Date().toISOString())
    setStatus('success')
  } catch (err) {
    setStatus('error', err instanceof Error ? err.message : String(err))
  }
}

/**
 * 云端同步 hook:
 * - App 启动时若有 token,自动从云端拉取(pull)
 * - 各 store 数据变更后,防抖 3s 自动推送(push)
 * - pull 期间暂停 push,避免循环
 */
export function useCloudSync() {
  const token = useSyncStore((s) => s.token)
  const autoSync = useSyncStore((s) => s.autoSync)
  const pushTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const isPulling = useRef(false)
  const hasInitialized = useRef(false)

  // 启动时 pull(仅一次)
  useEffect(() => {
    if (!token || hasInitialized.current) return
    hasInitialized.current = true
    isPulling.current = true
    pullFromCloud(token)
      .then((data) => {
        if (data) applyCloudData(data)
        useSyncStore.getState().setLastSyncAt(new Date().toISOString())
        useSyncStore.getState().setStatus('success')
      })
      .catch((err) => {
        useSyncStore.getState().setStatus(
          'error',
          err instanceof Error ? err.message : String(err)
        )
      })
      .finally(() => {
        isPulling.current = false
      })
  }, [token])

  // 数据变更后防抖 push
  useEffect(() => {
    if (!token || !autoSync) return

    const schedulePush = () => {
      if (isPulling.current) return // pull 期间不 push
      clearTimeout(pushTimer.current)
      pushTimer.current = setTimeout(async () => {
        useSyncStore.getState().setStatus('syncing')
        try {
          await pushToCloud(token, collectData())
          useSyncStore.getState().setLastSyncAt(new Date().toISOString())
          useSyncStore.getState().setStatus('success')
        } catch (err) {
          useSyncStore.getState().setStatus(
            'error',
            err instanceof Error ? err.message : String(err)
          )
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
    ]

    return () => {
      unsubs.forEach((fn) => fn())
      clearTimeout(pushTimer.current)
    }
  }, [token, autoSync])
}
