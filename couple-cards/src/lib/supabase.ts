/**
 * Supabase 客户端:云同步 + 图片存储统一后端。
 * - publishable key 设计上就是公开的,数据安全由 RLS 保证(仅共享账号可读写)
 * - 共享账号由后端预建,密码不写入代码,在设置页登录
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://kcwiyyfshajnyhwldqxz.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xfeE_GP8b7X6jHADnOhacw_YRUnvrAu'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

/** 应用专属共享账号(情侣二人共用;密码在设置页输入,session 由 supabase-js 持久化) */
export const APP_EMAIL = 'mwmd@justinychen.app'

/** 对用户展示的账号名(内部以 APP_EMAIL 登录) */
export const APP_ACCOUNT = 'cjy&zl.app'

/** 计划图片存储桶(公开读,仅登录账号可写) */
export const STORAGE_BUCKET = 'plan-images'

/** 计划图片的公开访问 URL(确定性路径,配合 hasCover/hasReflectionPhoto 标志使用) */
export function planImageUrl(planId: string, kind: 'cover' | 'reflection'): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${planId}/${kind}.jpg`
}
