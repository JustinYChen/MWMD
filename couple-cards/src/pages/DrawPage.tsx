import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronDown, Hand, Sparkles, ArrowLeft, Library, BookLock, BookOpen } from 'lucide-react'
import { TopControls } from '@/components/layout/TopControls'
import { useDrawEngine } from '@/hooks/useDrawEngine'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useQuestionBankStore } from '@/store/useQuestionBankStore'
import { TarotCanvas } from '@/components/scene3d/TarotCanvas'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { CustomSelect, type SelectOption } from '@/components/ui/CustomSelect'
import { DrawModeSelector } from '@/components/draw/DrawModeSelector'
import { FilterPanel } from '@/components/draw/FilterPanel'
import { DrawButton } from '@/components/draw/DrawButton'
import { DeckResetButton } from '@/components/draw/DeckResetButton'
import { CardRevealOverlay } from '@/components/draw/CardRevealOverlay'
import { CardDetailModal } from '@/components/draw/CardDetailModal'
import { SparkleFall } from '@/components/draw/SparkleFall'
import { MODE_COUNT, ALL_QUESTIONS } from '@/lib/shuffle'
import { audioEngine } from '@/lib/audioEngine'
import { cn } from '@/lib/utils'
import { SPREAD_LABELS } from '@/three/layouts'
import type { Question } from '@/types/question'

export default function DrawPage() {
  const engine = useDrawEngine()
  const theme = useSettingsStore((s) => s.theme)
  const soundEnabled = useSettingsStore((s) => s.soundEnabled)
  const [panelOpen, setPanelOpen] = useState(true)
  const [hint, setHint] = useState(false)
  const [sparkleTrigger, setSparkleTrigger] = useState(0)
  const [detailQuestion, setDetailQuestion] = useState<Question | null>(null)

  const hasCards = engine.currentDraw.length > 0
  const need = MODE_COUNT[engine.mode]

  // 抽牌后自动收起控制面板,避免遮挡 3D 牌面点击;用户可手动展开
  useEffect(() => {
    if (hasCards && engine.phase !== 'idle') {
      setPanelOpen(false)
    }
  }, [hasCards, engine.phase])

  // 抽牌后展示翻牌提示
  useEffect(() => {
    if (engine.phase === 'spreading') {
      const t = setTimeout(() => setHint(true), 1400)
      return () => clearTimeout(t)
    }
    if (engine.phase === 'flipping' || engine.phase === 'revealed') setHint(false)
  }, [engine.phase])

  const handleDraw = () => {
    audioEngine.init()
    if (soundEnabled) audioEngine.playFlip()
    const picked = engine.draw()
    if (picked.length === 0) return
  }

  const handleReveal = (q: Question) => {
    engine.handleReveal(q)
    setSparkleTrigger((t) => t + 1) // 触发金粉洒落(动效3)
  }

  // 点击已翻开的3D卡片 -> 查看详情
  const handleDetail = (q: Question) => {
    setDetailQuestion(q)
  }

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden">
      {/* 3D 舞台 */}
      <div className="absolute inset-0">
        {hasCards ? (
          <ErrorBoundary>
            <TarotCanvas
              cards={engine.currentDraw}
              mode={engine.mode}
              theme={theme}
              soundEnabled={soundEnabled}
              onReveal={handleReveal}
              onDetail={handleDetail}
            />
          </ErrorBoundary>
        ) : (
          <EmptyStage />
        )}
      </div>

      {/* 金粉洒落(动效3):翻牌时从顶部洒落粒子 */}
      <SparkleFall trigger={sparkleTrigger} />

      {/* 顶部信息条 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-5 md:p-8">
        <div className="pointer-events-auto flex items-center gap-3">
          <Link
            to="/"
            className="flex h-9 w-9 items-center justify-center rounded-full glass text-fg-soft transition-colors hover:text-fg"
            aria-label="返回首页"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-semibold text-fg md:text-3xl">
              抽 · 牌
            </h1>
            <p className="font-display text-sm italic text-fg-soft">Draw your cards</p>
          </div>
        </div>
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <TopControls />
          <div className="flex items-center gap-3 text-right text-xs text-fg-soft">
            <span>已抽 {engine.drawnIds.length} 题</span>
            <DeckResetButton onReset={engine.resetDeck} />
          </div>
        </div>
      </div>

      {/* 翻牌提示 */}
      <AnimatePresence>
        {hint && engine.phase !== 'revealed' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 translate-y-[120px] text-center"
          >
            <p className="inline-flex items-center gap-2 rounded-full glass px-5 py-2 text-sm text-fg-soft">
              <Hand size={15} className="text-rose" />
              点击牌面翻开 · 翻开后可再次点击查看详情
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部抽牌按钮 */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-3 p-6 md:p-10">
        <AnimatePresence mode="wait">
          {engine.phase === 'revealed' ? (
            <motion.div
              key="revealed-actions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DrawButton
                onDraw={handleDraw}
                onRedraw={engine.redraw}
                remaining={engine.remaining}
                need={need}
                phase={engine.phase}
              />
            </motion.div>
          ) : !hasCards || engine.phase === 'flipping' ? (
            <motion.div
              key="draw-cta"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DrawButton
                onDraw={handleDraw}
                onRedraw={engine.redraw}
                remaining={engine.remaining}
                need={need}
                phase={engine.phase}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* 控制面板折叠按钮 */}
        <button
          onClick={() => setPanelOpen((v) => !v)}
          className="inline-flex items-center gap-1 rounded-full glass px-4 py-1.5 text-xs text-fg-soft transition-colors hover:text-fg"
        >
          <ChevronDown
            size={14}
            className={cn('transition-transform', panelOpen ? '' : 'rotate-180')}
          />
          {panelOpen ? '收起设置' : '展开设置'}
        </button>
      </div>

      {/* 控制面板(左下/底部抽屉)。
          收起时立即 pointer-events-none,避免退出动画期间透明区域拦截 3D 点击。 */}
      <AnimatePresence>
        {panelOpen && (
          <motion.aside
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0, pointerEvents: 'auto' }}
            exit={{ opacity: 0, y: 40, pointerEvents: 'none' }}
            transition={{ type: 'spring', stiffness: 240, damping: 28 }}
            data-lenis-prevent
            className="absolute bottom-28 left-4 right-4 z-20 mx-auto max-h-[70dvh] max-w-md overflow-y-auto rounded-4xl glass p-5 shadow-card md:left-8 md:right-auto md:bottom-8 md:w-96"
          >
            <DrawModeSelector
              mode={engine.mode}
              onChange={engine.setMode}
              disabled={engine.phase === 'spreading'}
            />
            <div className="my-4 h-px bg-border-c" />
            <BankSelector />
            <div className="my-4 h-px bg-border-c" />
            <FilterPanel
              filters={engine.filters}
              remaining={engine.remaining}
              onToggleLevel={engine.toggleLevel}
              onToggleCategory={engine.toggleCategory}
              onIntimacyMax={engine.setIntimacyMax}
              onReset={engine.resetFilters}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 揭示层 */}
      <CardRevealOverlay
        open={engine.phase === 'revealed'}
        cards={engine.currentDraw}
        mode={engine.mode}
        favorited={engine.isFavorited}
        onToggleFavorite={engine.toggleFavorite}
        onRedraw={engine.redraw}
        onClose={() => engine.setPhase('flipping')}
      />

      {/* 单卡片详情弹窗:点击已翻开的3D卡片时弹出 */}
      <CardDetailModal
        question={detailQuestion}
        open={!!detailQuestion}
        onClose={() => setDetailQuestion(null)}
        onToggleFavorite={engine.toggleFavorite}
        positionLabel={
          detailQuestion
            ? SPREAD_LABELS[engine.mode][
                engine.currentDraw.findIndex((q) => q.id === detailQuestion.id)
              ]
            : undefined
        }
      />
    </div>
  )
}

function EmptyStage() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="flex flex-col items-center gap-3 text-fg-soft"
      >
        <div className="relative">
          <div
            className="h-40 w-28 rounded-2xl border-2 border-gold/40"
            style={{
              background:
                'linear-gradient(135deg, color-mix(in srgb, var(--accent-rose) 20%, var(--card)), var(--card))',
              boxShadow: 'var(--shadow-card)',
            }}
          />
          <div className="absolute -right-4 top-4 h-40 w-28 rotate-6 rounded-2xl border-2 border-gold/30 bg-card opacity-70" />
          <Sparkles className="absolute -left-5 -top-3 text-gold" size={22} />
        </div>
        <p className="font-display text-lg italic">选择模式与筛选，开始抽牌</p>
      </motion.div>
    </div>
  )
}

/** 题库选择器:在抽牌控制面板中快速切换题库 */
function BankSelector() {
  const banks = useQuestionBankStore((s) => s.banks)
  const activeBankId = useQuestionBankStore((s) => s.activeBankId)
  const setActiveBank = useQuestionBankStore((s) => s.setActiveBank)
  const resetDeck = useDrawEngine().resetDeck

  const handleSelect = (id: string | 'default') => {
    setActiveBank(id)
    resetDeck()
  }

  const activeName =
    activeBankId === 'default'
      ? '默认题库'
      : banks.find((b) => b.id === activeBankId)?.name ?? '默认题库'
  const activeCount =
    activeBankId === 'default'
      ? ALL_QUESTIONS.length
      : banks.find((b) => b.id === activeBankId)?.questions.length ?? 0

  // 自定义下拉框选项
  const options: SelectOption[] = [
    {
      value: 'default',
      label: '默认题库',
      hint: `${ALL_QUESTIONS.length}题`,
      icon: <BookLock size={13} className="text-gold" />,
    },
    ...banks.map((b) => ({
      value: b.id,
      label: b.name,
      hint: `${b.questions.length}题`,
      icon: <BookOpen size={13} className="text-rose" />,
    })),
  ]

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-fg-soft">
          <Library size={12} /> 题库 · Bank
        </span>
        <Link
          to="/banks"
          className="text-xs text-rose/70 underline-offset-2 hover:text-rose hover:underline"
        >
          管理
        </Link>
      </div>
      <CustomSelect
        options={options}
        value={activeBankId}
        onChange={(v) => handleSelect(v as string | 'default')}
      />
      <p className="text-[10px] text-fg-soft">
        当前: {activeName} · {activeCount} 题
      </p>
    </div>
  )
}
