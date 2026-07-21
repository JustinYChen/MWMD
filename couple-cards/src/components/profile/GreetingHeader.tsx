import { useProfileStore } from '@/store/useProfileStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { greeting } from '@/lib/i18n'
import { daysTogether, daysToNextAnniversary } from '@/lib/date'

/** 个性化问候头部 */
export function GreetingHeader({ compact = false }: { compact?: boolean }) {
  const { nameA, nameB, anniversary } = useProfileStore()
  const lang = useSettingsStore((s) => s.language)

  const names = [nameA, nameB].filter(Boolean).join(' & ')
  const days = daysTogether(anniversary)
  const next = daysToNextAnniversary(anniversary)

  return (
    <div className={compact ? '' : 'text-center'}>
      <p className="font-display text-lg italic text-fg-soft md:text-xl">
        {greeting(lang, names || undefined)}
      </p>
      {anniversary && days > 0 && (
        <p className="mt-1 font-serif text-sm text-fg-soft">
          实习情侣的第 <span className="text-rose">{days}</span> 天
          {next > 0 && next <= 30 && (
            <span className="text-fg-soft/70"> · 距下一个纪念日 {next} 天</span>
          )}
        </p>
      )}
    </div>
  )
}
