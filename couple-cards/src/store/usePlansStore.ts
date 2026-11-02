import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Plan, PlanCategory, Tombstone } from '@/types/plan'
import { DEFAULT_CATEGORIES } from '@/types/plan'
import { pruneTombstones } from '@/lib/tombstone'

interface PlansState {
  plans: Plan[]
  categories: PlanCategory[]
  /** 计划删除墓碑(随云端同步,防止其他设备复活已删除计划) */
  deleted: Tombstone[]
  /** 分类最后修改时间,用于合并时决定本地/云端哪份分类更新 */
  categoriesUpdatedAt?: string
  /** 新建计划(至少要 title) */
  addPlan: (p: Partial<Plan> & { title: string }) => void
  updatePlan: (id: string, p: Partial<Plan>) => void
  removePlan: (id: string) => void
  /** 完成计划:记录时间+感想 */
  completePlan: (id: string, reflection: string) => void
  /** 取消完成(重新变成待办) */
  uncompletePlan: (id: string) => void
  addCategory: (c: Omit<PlanCategory, 'id'>) => void
  updateCategory: (id: string, c: Partial<PlanCategory>) => void
  removeCategory: (id: string) => void
}

function makeId(): string {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export const usePlansStore = create<PlansState>()(
  persist(
    (set) => ({
      plans: [],
      categories: DEFAULT_CATEGORIES,
      deleted: [],
      addPlan: (p) =>
        set((s) => ({
          plans: [
            {
              id: makeId(),
              title: p.title,
              note: p.note ?? '',
              date: p.date ?? '',
              categoryId: p.categoryId ?? '',
              location: p.location ?? '',
              budget: p.budget ?? null,
              actualCost: p.actualCost ?? null,
              completed: false,
              completedAt: '',
              reflection: '',
              hasCover: p.hasCover ?? false,
              hasReflectionPhoto: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            ...s.plans,
          ],
        })),
      updatePlan: (id, p) =>
        set((s) => ({
          plans: s.plans.map((x) =>
            x.id === id ? { ...x, ...p, updatedAt: new Date().toISOString() } : x
          ),
        })),
      removePlan: (id) =>
        set((s) => ({
          plans: s.plans.filter((x) => x.id !== id),
          deleted: pruneTombstones([...s.deleted, { id, at: new Date().toISOString() }]),
        })),
      completePlan: (id, reflection) =>
        set((s) => ({
          plans: s.plans.map((x) =>
            x.id === id
              ? {
                  ...x,
                  completed: true,
                  completedAt: new Date().toISOString(),
                  reflection,
                  updatedAt: new Date().toISOString(),
                }
              : x
          ),
        })),
      uncompletePlan: (id) =>
        set((s) => ({
          plans: s.plans.map((x) =>
            x.id === id
              ? {
                  ...x,
                  completed: false,
                  completedAt: '',
                  reflection: '',
                  updatedAt: new Date().toISOString(),
                }
              : x
          ),
        })),
      addCategory: (c) =>
        set((s) => ({
          categories: [...s.categories, { ...c, id: makeId() }],
          categoriesUpdatedAt: new Date().toISOString(),
        })),
      updateCategory: (id, c) =>
        set((s) => ({
          categories: s.categories.map((x) => (x.id === id ? { ...x, ...c } : x)),
          categoriesUpdatedAt: new Date().toISOString(),
        })),
      removeCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((x) => x.id !== id),
          categoriesUpdatedAt: new Date().toISOString(),
          // 引用该分类的计划置空分类
          plans: s.plans.map((x) =>
            x.categoryId === id ? { ...x, categoryId: '', updatedAt: new Date().toISOString() } : x
          ),
        })),
    }),
    { name: 'cc:plans', version: 1 }
  )
)
