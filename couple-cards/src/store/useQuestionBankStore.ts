import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Question } from '@/types/question'
import { ALL_QUESTIONS } from '@/lib/shuffle'

/** 自定义题库 */
export interface CustomBank {
  id: string
  name: string
  questions: Question[]
  createdAt: number
  updatedAt: number
}

/** 活动题库 ID,'default' 表示内置默认题库 */
export type ActiveBankId = string | 'default'

interface QuestionBankState {
  /** 用户自建题库列表(默认题库不在此列,从 questions.json 加载) */
  banks: CustomBank[]
  /** 当前选中的题库 */
  activeBankId: ActiveBankId

  // ── 题库操作 ──
  addBank: (name: string) => string
  deleteBank: (id: string) => void
  renameBank: (id: string, name: string) => void
  setActiveBank: (id: ActiveBankId) => void

  // ── 题目操作(仅自建题库) ──
  addQuestion: (bankId: string, q: Question) => void
  updateQuestion: (bankId: string, qId: string, patch: Partial<Question>) => void
  deleteQuestion: (bankId: string, qId: string) => void

  // ── 读取 ──
  getActiveQuestions: () => Question[]
  getBankById: (id: ActiveBankId) => CustomBank | null
}

/** 生成唯一 ID */
function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

/** 生成题目 ID */
export function genQuestionId(): string {
  return genId('u')
}

export const useQuestionBankStore = create<QuestionBankState>()(
  persist(
    (set, get) => ({
      banks: [],
      activeBankId: 'default',

      addBank: (name) => {
        const id = genId('bank')
        const now = Date.now()
        const bank: CustomBank = {
          id,
          name: name.trim() || '未命名题库',
          questions: [],
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({ banks: [...s.banks, bank] }))
        return id
      },

      deleteBank: (id) => {
        set((s) => {
          const banks = s.banks.filter((b) => b.id !== id)
          // 删除的是当前活动题库 → 回退到默认
          const activeBankId =
            s.activeBankId === id ? 'default' : s.activeBankId
          return { banks, activeBankId }
        })
      },

      renameBank: (id, name) => {
        set((s) => ({
          banks: s.banks.map((b) =>
            b.id === id ? { ...b, name: name.trim() || b.name, updatedAt: Date.now() } : b
          ),
        }))
      },

      setActiveBank: (id) => {
        set({ activeBankId: id })
      },

      addQuestion: (bankId, q) => {
        set((s) => ({
          banks: s.banks.map((b) =>
            b.id === bankId
              ? { ...b, questions: [...b.questions, q], updatedAt: Date.now() }
              : b
          ),
        }))
      },

      updateQuestion: (bankId, qId, patch) => {
        set((s) => ({
          banks: s.banks.map((b) =>
            b.id === bankId
              ? {
                  ...b,
                  questions: b.questions.map((q) =>
                    q.id === qId ? { ...q, ...patch } : q
                  ),
                  updatedAt: Date.now(),
                }
              : b
          ),
        }))
      },

      deleteQuestion: (bankId, qId) => {
        set((s) => ({
          banks: s.banks.map((b) =>
            b.id === bankId
              ? {
                  ...b,
                  questions: b.questions.filter((q) => q.id !== qId),
                  updatedAt: Date.now(),
                }
              : b
          ),
        }))
      },

      getActiveQuestions: () => {
        const { activeBankId, banks } = get()
        if (activeBankId === 'default') return ALL_QUESTIONS
        return banks.find((b) => b.id === activeBankId)?.questions ?? ALL_QUESTIONS
      },

      getBankById: (id) => {
        if (id === 'default') return null
        return get().banks.find((b) => b.id === id) ?? null
      },
    }),
    {
      name: 'cc:question-banks',
      version: 1,
    }
  )
)
