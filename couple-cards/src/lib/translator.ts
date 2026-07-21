import { detectLang } from './questionClassifier'

/**
 * 自动翻译服务。
 *
 * 使用 MyMemory 免费 API(无需 API Key,支持 CORS)。
 * 每日有一定免费额度,适合个人使用场景。
 * 翻译失败时返回空字符串,由调用方处理 fallback。
 */

type Lang = 'zh' | 'en'

/**
 * 翻译文本。自动检测源语言,翻译到目标语言。
 * @param text 待翻译文本
 * @param to 目标语言
 * @returns 翻译结果,失败时返回 null
 */
export async function translateText(
  text: string,
  to: Lang
): Promise<string | null> {
  const trimmed = text.trim()
  if (!trimmed) return null

  const from = detectLang(trimmed)
  if (from === to) return trimmed // 同语言无需翻译

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      trimmed
    )}&langpair=${from}|${to}`

    const resp = await fetch(url)
    if (!resp.ok) return null

    const data = await resp.json()
    const translated: string | undefined = data?.responseData?.translatedText

    if (!translated) return null

    // MyMemory 有时会返回错误信息(如 quota exceeded)
    // 正常翻译结果不应包含 "MYMEMORY WARNING" 或 "PLEASE SELECT TWO DISTINCT LANGUAGES"
    if (/MYMEMORY WARNING|INVALID|DISTINCT/i.test(translated)) {
      return null
    }

    return translated
  } catch {
    return null
  }
}

/**
 * 翻译中文到英文。
 */
export function translateToEn(zh: string): Promise<string | null> {
  return translateText(zh, 'en')
}

/**
 * 翻译英文到中文。
 */
export function translateToZh(en: string): Promise<string | null> {
  return translateText(en, 'zh')
}
