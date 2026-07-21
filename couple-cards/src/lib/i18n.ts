import type { Bilingual, Lang } from '@/types/question'

/** 简易双语选择:卡面固定中文主+英文辅,此函数用于全局 UI 文案按语言取值 */
export function t(text: Bilingual, lang: Lang): string {
  return lang === 'en' ? text.en : text.zh
}

/** 时段问候语 */
export function greeting(lang: Lang, name?: string): string {
  const h = new Date().getHours()
  let base: string
  if (lang === 'en') {
    if (h < 6) base = 'Still up'
    else if (h < 12) base = 'Good morning'
    else if (h < 14) base = 'Good noon'
    else if (h < 18) base = 'Good afternoon'
    else if (h < 22) base = 'Good evening'
    else base = 'Good night'
    return name ? `${base}, ${name}` : base
  }
  if (h < 6) base = '夜深了'
  else if (h < 12) base = '早安'
  else if (h < 14) base = '午安'
  else if (h < 18) base = '下午好'
  else if (h < 22) base = '晚上好'
  else base = '夜安'
  return name ? `${base}，${name}` : base
}
