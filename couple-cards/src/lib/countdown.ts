import dayjs from 'dayjs'

/**
 * 计划倒计时计算。
 * 规则(与用户确认的需求):
 * - 无日期:不显示倒计时(愿望池)
 * - > 3 天:「还有 X 天」
 * - ≤ 3 天:「还有 X 小时」(向上取整)
 * - 当天:「就是今天!」
 * - 已过期:「已过 X 天」(不做特殊分组,按日期自然排序)
 */

export type CountdownInfo =
  | { kind: 'none' }
  | { kind: 'past'; days: number }
  | { kind: 'today' }
  | { kind: 'hours'; hours: number }
  | { kind: 'days'; days: number }

export function getCountdown(date: string): CountdownInfo {
  if (!date) return { kind: 'none' }
  const target = dayjs(date).startOf('day')
  const today = dayjs().startOf('day')
  const diffDays = target.diff(today, 'day')
  if (diffDays < 0) return { kind: 'past', days: -diffDays }
  if (diffDays === 0) return { kind: 'today' }
  if (diffDays <= 3) {
    // 剩余小时 = 目标日 0 点距今的毫秒数 / 3600e3,向上取整
    const hours = Math.ceil((target.valueOf() - Date.now()) / 3_600_000)
    return { kind: 'hours', hours: Math.max(1, hours) }
  }
  return { kind: 'days', days: diffDays }
}

/** 倒计时文案 */
export function countdownText(info: CountdownInfo): string {
  switch (info.kind) {
    case 'past':
      return `已过 ${info.days} 天`
    case 'today':
      return '就是今天!'
    case 'hours':
      return `还有 ${info.hours} 小时`
    case 'days':
      return `还有 ${info.days} 天`
    default:
      return ''
  }
}

/** 倒计时对应的强调色(空 = 默认) */
export function countdownColor(info: CountdownInfo): string | undefined {
  switch (info.kind) {
    case 'past':
      return 'var(--fg-soft)'
    case 'today':
      return 'var(--accent-rose)'
    case 'hours':
      return 'var(--accent-gold)'
    default:
      return undefined
  }
}

/** 中文星期(dayjs 默认英文 locale,format('dddd') 会输出 Sunday) */
export function weekdayCN(date: string): string {
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dayjs(date).day()]
}

/**
 * 成就里程碑:第 10 / 50 / 100 件完成时触发庆祝。
 * 传入"这是第几件完成的计划"(1-based),返回里程碑数字或 null。
 */
export function milestoneOf(nth: number): number | null {
  if (nth === 10 || nth === 50 || nth === 100) return nth
  return null
}
