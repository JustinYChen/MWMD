import dayjs from 'dayjs'

/** 计算在一起天数(纪念日次日起算 1 天) */
export function daysTogether(anniversary: string): number {
  if (!anniversary) return 0
  const start = dayjs(anniversary)
  if (!start.isValid()) return 0
  return dayjs().startOf('day').diff(start.startOf('day'), 'day')
}

/** 距下一个纪念日还有多少天 */
export function daysToNextAnniversary(anniversary: string): number {
  if (!anniversary) return -1
  const start = dayjs(anniversary)
  if (!start.isValid()) return -1
  const today = dayjs().startOf('day')
  const monthDay = start.format('MM-DD')
  let next = dayjs(`${today.year()}-${monthDay}`)
  if (next.isBefore(today)) next = next.add(1, 'year')
  return next.diff(today, 'day')
}

/** 是否正逢纪念日(月日相同) */
export function isAnniversaryToday(anniversary: string): boolean {
  if (!anniversary) return false
  const start = dayjs(anniversary)
  if (!start.isValid()) return false
  const today = dayjs()
  return start.month() === today.month() && start.date() === today.date()
}

/** 在一起第几年 */
export function yearsTogether(anniversary: string): number {
  if (!anniversary) return 0
  return dayjs().diff(dayjs(anniversary), 'year')
}

/** 是否为里程碑天数 */
export function isMilestone(days: number): boolean {
  return [100, 200, 365, 520, 666, 777, 888, 999, 1000, 1314, 2000].includes(
    days
  )
}
