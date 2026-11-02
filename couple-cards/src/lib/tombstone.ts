/**
 * 删除墓碑公共逻辑:跨设备同步时用来表达"这个条目是被删掉的",
 * 避免另一台设备把它当作"没见过的新数据"重新推回来。
 */
import type { Tombstone } from '@/types/plan'

/** 墓碑保留 30 天,足够覆盖设备离线/久未打开的情况 */
export const TOMBSTONE_TTL = 30 * 24 * 60 * 60 * 1000

/** 把 ISO 字符串或毫秒数统一成毫秒时间戳(无法解析时返回 0) */
export function timeOf(v: unknown): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string') return new Date(v).getTime() || 0
  return 0
}

/** 同 id 只保留最晚的删除时间,并丢弃超过 30 天的墓碑 */
export function pruneTombstones(list: Tombstone[]): Tombstone[] {
  const cutoff = Date.now() - TOMBSTONE_TTL
  const map = new Map<string, Tombstone>()
  for (const t of list ?? []) {
    if (!t?.id) continue
    const prev = map.get(t.id)
    if (!prev || timeOf(t.at) > timeOf(prev.at)) map.set(t.id, t)
  }
  return [...map.values()]
    .filter((t) => timeOf(t.at) >= cutoff)
    .sort((x, y) => timeOf(y.at) - timeOf(x.at))
}

/** 合并两侧墓碑(并集,同 id 保留更晚的删除时间) */
export function mergeTombstones(a: Tombstone[], b: Tombstone[]): Tombstone[] {
  return pruneTombstones([...(a ?? []), ...(b ?? [])])
}
