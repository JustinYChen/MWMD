/**
 * 计划图片存储:配图 + 完成照片。
 * - 存在独立 localStorage key `cc:plan-media`,与云同步隔离(图片不上 Gist)
 * - 图片自动压缩(canvas 缩放 + jpeg),单张约 30-60KB
 * - localStorage 总限额约 5MB,超限时抛错并提示
 */

const KEY = 'cc:plan-media'

/** planId -> { cover?: dataUrl, reflection?: dataUrl } */
type MediaMap = Record<string, { cover?: string; reflection?: string }>

function load(): MediaMap {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as MediaMap
  } catch {
    return {}
  }
}

function save(map: MediaMap) {
  localStorage.setItem(KEY, JSON.stringify(map))
}

/** 压缩图片文件为 jpeg dataUrl */
export function compressImage(file: File, maxSize = 640, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('canvas 不可用'))
        return
      }
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片加载失败'))
    }
    img.src = url
  })
}

/** 保存计划图片(kind: cover 配图 / reflection 完成照片),失败时提示 */
export function setPlanImage(planId: string, kind: 'cover' | 'reflection', dataUrl: string): boolean {
  const map = load()
  map[planId] ??= {}
  map[planId][kind] = dataUrl
  try {
    save(map)
    return true
  } catch {
    alert('本机图片存储已满,请删除一些旧图片后再试')
    return false
  }
}

/** 读取计划图片(可能为 undefined,如换设备后图片丢失) */
export function getPlanImage(planId: string, kind: 'cover' | 'reflection'): string | undefined {
  return load()[planId]?.[kind]
}

/** 删除计划的一张图片 */
export function removePlanImage(planId: string, kind: 'cover' | 'reflection') {
  const map = load()
  if (map[planId]) {
    delete map[planId][kind]
    if (!map[planId].cover && !map[planId].reflection) delete map[planId]
    save(map)
  }
}

/** 删除计划的全部图片(删除计划时调用) */
export function removePlanImages(planId: string) {
  const map = load()
  if (map[planId]) {
    delete map[planId]
    save(map)
  }
}
