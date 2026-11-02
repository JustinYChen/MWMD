/**
 * 云端同步模块:基于 Supabase 实现跨设备数据同步。
 * - 数据存 app_data 表单行 JSONB(id='main'),RLS 仅允许共享账号读写
 * - 登录态(session)由 supabase-js 持久化在 localStorage
 * - 冲突策略:条目级合并(按 id + updatedAt 取新),辅以删除墓碑防复活
 */
import { supabase, APP_EMAIL } from './supabase'
import type { Plan, PlanCategory, Tombstone } from '@/types/plan'
import { timeOf, mergeTombstones, pruneTombstones } from '@/lib/tombstone'

/** 云端数据结构(仅含需要同步的数据字段,不含 store 方法) */
export interface CloudData {
  version: number
  settings: {
    theme: 'light' | 'dark'
    soundEnabled: boolean
    bgmEnabled: boolean
    volume: number
    language: 'zh' | 'en'
    /** 设置最后修改时间 ISO */
    updatedAt?: string
  }
  favorites: {
    items: unknown[]
    /** 取消收藏墓碑 */
    removed?: Tombstone[]
  }
  history: {
    records: unknown[]
    /** 清空历史的时间点 ISO */
    clearedAt?: string
  }
  questionBanks: {
    banks: unknown[]
    activeBankId: string
    /** 删除题库墓碑 */
    deleted?: Tombstone[]
  }
  deck: {
    drawnIds: string[]
    mode: string
  }
  plans: {
    plans: Plan[]
    categories: PlanCategory[]
    /** 已删除计划的墓碑(跨设备共享,防止旧设备把删掉的计划推回来) */
    deleted?: Tombstone[]
    /** 分类最后修改时间 */
    categoriesUpdatedAt?: string
  }
  updatedAt: string
}

/** 登录共享账号(成功返回 null,失败返回错误信息) */
export async function signInCloud(password: string): Promise<string | null> {
  const { error } = await supabase.auth.signInWithPassword({
    email: APP_EMAIL,
    password,
  })
  return error ? error.message : null
}

/** 退出登录 */
export async function signOutCloud(): Promise<void> {
  await supabase.auth.signOut()
}

/**
 * 确保登录态有效(过期时 supabase-js 会自动用 refresh token 续期)。
 * 失效(如 refresh token 过期)时返回 false——此时任何读写都会以匿名身份
 * 到达数据库,被 RLS 拒绝且错误信息只有误导性的 RLS 文案,应提前拦截。
 */
export async function ensureSession(): Promise<boolean> {
  const { data } = await supabase.auth.getSession()
  return !!data.session
}

/** 从云端拉取数据(云端无记录返回 null) */
export async function pullFromCloud(): Promise<CloudData | null> {
  const { data, error } = await supabase
    .from('app_data')
    .select('data')
    .eq('id', 'main')
    .maybeSingle()
  if (error) throw new Error(`Pull failed: ${error.message}`)
  return (data?.data as CloudData | undefined) ?? null
}

/** 推送数据到云端(upsert 覆盖) */
export async function pushToCloud(data: CloudData): Promise<void> {
  const { error } = await supabase.from('app_data').upsert({
    id: 'main',
    data,
    updated_at: new Date().toISOString(),
  })
  if (error) throw new Error(`Push failed: ${error.message}`)
}

/* ---------- 合并逻辑 ---------- */

/** 计划最后修改时间:优先 updatedAt,旧数据回退 createdAt */
function planTime(p: Plan): number {
  return timeOf(p.updatedAt) || timeOf(p.createdAt)
}

/** 合并计划:按 id 取较新的一份;墓碑晚于计划修改时间的视为已删除 */
function mergePlans(local: Plan[], cloud: Plan[], tombstones: Tombstone[]): Plan[] {
  const tomb = new Map(tombstones.map((t) => [t.id, timeOf(t.at)]))
  const cloudMap = new Map(cloud.map((p) => [p.id, p]))
  const seen = new Set<string>()
  const out: Plan[] = []

  const keep = (p: Plan) => {
    const deletedAt = tomb.get(p.id)
    return !deletedAt || planTime(p) > deletedAt
  }

  // 保持本地顺序,再追加仅云端存在的条目
  for (const l of local) {
    if (!l?.id || seen.has(l.id)) continue
    seen.add(l.id)
    const c = cloudMap.get(l.id)
    const winner = c && planTime(c) > planTime(l) ? c : l
    if (keep(winner)) out.push(winner)
  }
  for (const c of cloud) {
    if (!c?.id || seen.has(c.id)) continue
    seen.add(c.id)
    if (keep(c)) out.push(c)
  }
  return out
}

function entityKey(x: unknown): string {
  if (x && typeof x === 'object') {
    const id = (x as { id?: string }).id
    if (id) return `id:${id}`
  }
  return `json:${JSON.stringify(x)}`
}

/** 通用列表合并:本地在前,云端独有的追加(按 id 或内容去重) */
function mergeList(local: unknown[], cloud: unknown[]): unknown[] {
  const out: unknown[] = []
  const seen = new Set<string>()
  for (const x of [...local, ...cloud]) {
    const k = entityKey(x)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(x)
  }
  return out
}

/** 收藏合并:并集,但被墓碑标记(取消收藏/清空)的条目不再回来 */
function mergeFavorites(
  local: CloudData['favorites'] | undefined,
  cloud: CloudData['favorites'] | undefined
): CloudData['favorites'] {
  const removed = pruneTombstones([...(local?.removed ?? []), ...(cloud?.removed ?? [])])
  const gone = new Set(removed.map((r) => r.id))
  const items = mergeList(local?.items ?? [], cloud?.items ?? []).filter((x) => {
    const id = (x as { id?: string } | null)?.id
    return !id || !gone.has(id)
  })
  return { items, removed }
}

/** 历史合并:并集,但清空时间之前的记录不再回来 */
function mergeHistory(
  local: CloudData['history'] | undefined,
  cloud: CloudData['history'] | undefined
): CloudData['history'] {
  const localAt = timeOf(local?.clearedAt)
  const cloudAt = timeOf(cloud?.clearedAt)
  const cutoff = Math.max(localAt, cloudAt)
  const clearedAt = localAt >= cloudAt ? local?.clearedAt : cloud?.clearedAt
  const records = mergeList(local?.records ?? [], cloud?.records ?? []).filter((r) => {
    return !cutoff || timeOf((r as { drawnAt?: number } | null)?.drawnAt) > cutoff
  })
  return { records, clearedAt }
}

/** 题库合并:同 id 取 updatedAt 较新的一份;墓碑晚于其修改时间则删除 */
function mergeBanks(local: unknown[], cloud: unknown[], deleted: Tombstone[]): unknown[] {
  const out = [...local]
  const index = new Map<string, number>()
  out.forEach((b, i) => {
    const id = (b as { id?: string }).id
    if (id) index.set(id, i)
  })
  for (const c of cloud) {
    const id = (c as { id?: string }).id
    if (!id) continue
    const i = index.get(id)
    if (i === undefined) {
      index.set(id, out.length)
      out.push(c)
      continue
    }
    const prev = out[i] as { updatedAt?: number }
    if (timeOf((c as { updatedAt?: number }).updatedAt) > timeOf(prev.updatedAt)) out[i] = c
  }
  const tomb = new Map(deleted.map((t) => [t.id, timeOf(t.at)]))
  return out.filter((b) => {
    const id = (b as { id?: string }).id
    const at = id ? tomb.get(id) : undefined
    return !at || timeOf((b as { updatedAt?: number }).updatedAt) > at
  })
}

/** 分类合并:整份列表取 `categoriesUpdatedAt` 较新的一份;无时间戳时退化为并集 */
function mergeCategories(
  local: PlanCategory[],
  cloud: PlanCategory[],
  localAt?: string,
  cloudAt?: string
): PlanCategory[] {
  const lt = timeOf(localAt)
  const ct = timeOf(cloudAt)
  if (!lt && !ct) return mergeList(local, cloud) as PlanCategory[]
  return lt >= ct ? local : cloud
}

/** 设置合并:取 `settings.updatedAt` 较新的一份(两端都没有时本地优先) */
function mergeSettings(
  local: CloudData['settings'] | undefined,
  cloud: CloudData['settings'] | undefined
): CloudData['settings'] {
  if (!local) return cloud as CloudData['settings']
  if (!cloud) return local
  return timeOf(cloud.updatedAt) > timeOf(local.updatedAt) ? cloud : local
}

/**
 * 合并本地与云端数据(用于"本地有未推送变更"时)。
 * 原则:逐条目取新、增删不互相覆盖——本地新增保留、云端独有保留、
 * 同一计划的编辑按 updatedAt 取较新、删除由墓碑统一裁决。
 */
export function mergeCloudData(local: CloudData, cloud: CloudData): CloudData {
  const deleted = mergeTombstones(local.plans?.deleted ?? [], cloud.plans?.deleted ?? [])
  const plans = mergePlans(local.plans?.plans ?? [], cloud.plans?.plans ?? [], deleted)
  const deletedBanks = mergeTombstones(
    local.questionBanks?.deleted ?? [],
    cloud.questionBanks?.deleted ?? []
  )
  const banks = mergeBanks(
    local.questionBanks?.banks ?? [],
    cloud.questionBanks?.banks ?? [],
    deletedBanks
  )
  const localActive = local.questionBanks?.activeBankId
  const categories = mergeCategories(
    local.plans?.categories ?? [],
    cloud.plans?.categories ?? [],
    local.plans?.categoriesUpdatedAt,
    cloud.plans?.categoriesUpdatedAt
  )
  const categoriesUpdatedAt =
    timeOf(local.plans?.categoriesUpdatedAt) >= timeOf(cloud.plans?.categoriesUpdatedAt)
      ? local.plans?.categoriesUpdatedAt
      : cloud.plans?.categoriesUpdatedAt

  return {
    version: 2,
    settings: mergeSettings(local.settings, cloud.settings),
    favorites: mergeFavorites(local.favorites, cloud.favorites),
    history: mergeHistory(local.history, cloud.history),
    questionBanks: {
      banks,
      deleted: deletedBanks,
      // 本地选中的题库仍存在则保留,否则回退云端的选择
      activeBankId:
        localActive === 'default' || banks.some((b) => (b as { id?: string }).id === localActive)
          ? localActive
          : (cloud.questionBanks?.activeBankId ?? 'default'),
    },
    deck: {
      drawnIds: [
        ...new Set([...(local.deck?.drawnIds ?? []), ...(cloud.deck?.drawnIds ?? [])]),
      ],
      mode: local.deck?.mode ?? cloud.deck?.mode ?? 'single',
    },
    plans: {
      plans,
      categories,
      deleted,
      categoriesUpdatedAt,
    },
    updatedAt: new Date().toISOString(),
  }
}
