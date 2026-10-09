/**
 * 计划图片存储:配图 + 完成照片,存 Supabase Storage 公开桶。
 * - 路径固定为 {planId}/{kind}.jpg,upsert 覆盖,跨设备通过公开 URL 访问
 * - 上传/删除需要已登录共享账号(RLS 保护)
 * - 兼容迁移:旧版本图片存本机 localStorage(cc:plan-media),登录后自动上传云端并清理
 */
import { supabase, STORAGE_BUCKET, planImageUrl } from './supabase'

/** 旧版本本机存储 key(仅迁移用) */
const LEGACY_KEY = 'cc:plan-media'

/** planId -> { cover?: dataUrl, reflection?: dataUrl } */
type LegacyMediaMap = Record<string, { cover?: string; reflection?: string }>

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

/** dataUrl → Blob */
function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return fetch(dataUrl).then((r) => r.blob())
}

/**
 * 上传计划图片到云端(kind: cover 配图 / reflection 完成照片)。
 * 成功返回公开 URL,失败(未登录/网络异常)返回 null。
 */
export async function uploadPlanImage(
  planId: string,
  kind: 'cover' | 'reflection',
  dataUrl: string
): Promise<string | null> {
  try {
    const blob = await dataUrlToBlob(dataUrl)
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(`${planId}/${kind}.jpg`, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      })
    if (error) throw error
    return planImageUrl(planId, kind)
  } catch {
    return null
  }
}

/** 计划图片公开 URL(同步函数,配合 hasCover/hasReflectionPhoto 标志使用) */
export function getPlanImageUrl(planId: string, kind: 'cover' | 'reflection'): string {
  return planImageUrl(planId, kind)
}

/** 删除云端计划图片(静默失败,不影响主流程) */
export async function removeCloudPlanImage(
  planId: string,
  kind: 'cover' | 'reflection'
): Promise<void> {
  try {
    await supabase.storage.from(STORAGE_BUCKET).remove([`${planId}/${kind}.jpg`])
  } catch {
    /* 静默 */
  }
}

/** 删除计划的全部云端图片(删除计划/取消完成时调用) */
export async function removeCloudPlanImages(planId: string): Promise<void> {
  try {
    await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([`${planId}/cover.jpg`, `${planId}/reflection.jpg`])
  } catch {
    /* 静默 */
  }
}

/**
 * 一次性迁移:把旧版本存本机的图片上传云端。
 * 全部成功后清掉本机存储;有失败则保留,下次登录重试。返回迁移张数。
 */
export async function migrateLocalImagesToCloud(): Promise<number> {
  let map: LegacyMediaMap = {}
  try {
    map = JSON.parse(localStorage.getItem(LEGACY_KEY) ?? '{}') as LegacyMediaMap
  } catch {
    return 0
  }
  const ids = Object.keys(map)
  if (ids.length === 0) return 0

  let migrated = 0
  let allOk = true
  for (const id of ids) {
    for (const kind of ['cover', 'reflection'] as const) {
      const dataUrl = map[id]?.[kind]
      if (!dataUrl) continue
      const url = await uploadPlanImage(id, kind, dataUrl)
      if (url) migrated++
      else allOk = false
    }
  }
  if (allOk) localStorage.removeItem(LEGACY_KEY)
  return migrated
}
