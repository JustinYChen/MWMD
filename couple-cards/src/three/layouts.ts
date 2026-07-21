import type { DrawMode } from '@/types/question'

export interface CardLayout {
  position: [number, number, number]
  rotation: [number, number, number]
}

/** 各模式的牌阵位置/旋转 */
export const SPREAD_LAYOUTS: Record<DrawMode, CardLayout[]> = {
  single: [
    { position: [0, 0, 0.5], rotation: [0, 0, 0] },
  ],
  // 3 张叙事:过去 - 现在 - 未来(横排,中张略前)
  triple: [
    { position: [-2.3, 0, 0.2], rotation: [0, -0.12, 0.02] },
    { position: [0, 0, 0.6], rotation: [0, 0, 0] },
    { position: [2.3, 0, 0.2], rotation: [0, 0.12, -0.02] },
  ],
  // 5 张十字:中心(现在) 上(挑战) 下(根因) 左(过去) 右(未来)
  cross: [
    { position: [0, 0, 0.6], rotation: [0, 0, 0] },
    { position: [0, 2.6, 0.2], rotation: [0, 0, 0.03] },
    { position: [0, -2.6, 0.2], rotation: [0, 0, -0.03] },
    { position: [-2.4, 0, 0.2], rotation: [0, -0.1, 0] },
    { position: [2.4, 0, 0.2], rotation: [0, 0.1, 0] },
  ],
}

/** 牌阵叙事标签(3张/5张时用于揭示层) */
export const SPREAD_LABELS: Record<DrawMode, { zh: string; en: string }[]> = {
  single: [{ zh: '此刻', en: 'This moment' }],
  triple: [
    { zh: '过去', en: 'Past' },
    { zh: '现在', en: 'Present' },
    { zh: '未来', en: 'Future' },
  ],
  cross: [
    { zh: '当下', en: 'Now' },
    { zh: '挑战', en: 'Challenge' },
    { zh: '根因', en: 'Root' },
    { zh: '过去', en: 'Past' },
    { zh: '未来', en: 'Future' },
  ],
}

/** 牌的入场起始位置(从天而降 + 随机偏移) */
export function entryOrigin(index: number): CardLayout {
  const seed = (index + 1) * 1.7
  return {
    position: [
      Math.sin(seed) * 1.5,
      7 + index * 0.4,
      Math.cos(seed) * 1.5 - 2,
    ],
    rotation: [0, Math.PI, (Math.sin(seed) - 0.5) * 0.5],
  }
}
