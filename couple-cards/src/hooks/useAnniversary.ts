import { useEffect, useState } from 'react'
import { useProfileStore } from '@/store/useProfileStore'
import {
  daysTogether,
  isAnniversaryToday,
  yearsTogether,
  isMilestone,
} from '@/lib/date'

export type EggType =
  | { kind: 'anniversary'; years: number }
  | { kind: 'milestone'; days: number }
  | null

/** 检测纪念日 / 里程碑天数彩蛋 */
export function useAnniversary(): EggType {
  const anniversary = useProfileStore((s) => s.anniversary)
  const [egg, setEgg] = useState<EggType>(null)

  useEffect(() => {
    if (!anniversary) {
      setEgg(null)
      return
    }
    if (isAnniversaryToday(anniversary)) {
      setEgg({ kind: 'anniversary', years: yearsTogether(anniversary) })
      return
    }
    const days = daysTogether(anniversary)
    if (isMilestone(days)) {
      setEgg({ kind: 'milestone', days })
      return
    }
    setEgg(null)
  }, [anniversary])

  return egg
}
