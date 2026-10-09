/** 计划 tab 类型定义 */

export interface PlanCategory {
  id: string
  name: string
  /** 十六进制颜色,如 #5B8DB8 */
  color: string
}

export interface Plan {
  id: string
  title: string
  /** 备注/描述 */
  note: string
  /** 计划日期 YYYY-MM-DD;'' = 无日期(愿望池) */
  date: string
  categoryId: string
  /** 地点 */
  location: string
  /** 预算(元),null = 未填 */
  budget: number | null
  /** 实际花费(元),null = 未填 */
  actualCost: number | null
  completed: boolean
  /** 完成时间 ISO */
  completedAt: string
  /** 完成感想(文字) */
  reflection: string
  /** 是否有配图(图片本体只存本机 cc:plan-media,不云同步) */
  hasCover: boolean
  /** 是否有完成照片(同上) */
  hasReflectionPhoto: boolean
  createdAt: string
}

/** 预设分类(莫兰迪色系,可由用户改名/换色/增删) */
export const DEFAULT_CATEGORIES: PlanCategory[] = [
  { id: 'travel', name: '旅行', color: '#5B8DB8' },
  { id: 'food', name: '美食', color: '#D98E73' },
  { id: 'experience', name: '体验', color: '#9C7BB5' },
  { id: 'growth', name: '成长', color: '#7FA98C' },
  { id: 'home', name: '家居', color: '#C4A35A' },
  { id: 'anniversary', name: '纪念日', color: '#C76B7E' },
]
