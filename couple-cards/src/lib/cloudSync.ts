/**
 * 云端同步模块:基于 Supabase 实现跨设备数据同步。
 * - 数据存 app_data 表单行 JSONB(id='main'),RLS 仅允许共享账号读写
 * - 登录态(session)由 supabase-js 持久化在 localStorage
 * - 单人使用,采用"最后写入胜出"策略,不处理冲突
 */
import { supabase, APP_EMAIL } from './supabase'

/** 云端数据结构(仅含需要同步的数据字段,不含 store 方法) */
export interface CloudData {
  version: number
  settings: {
    theme: 'light' | 'dark'
    soundEnabled: boolean
    bgmEnabled: boolean
    volume: number
    language: 'zh' | 'en'
  }
  favorites: {
    items: unknown[]
  }
  history: {
    records: unknown[]
  }
  questionBanks: {
    banks: unknown[]
    activeBankId: string
  }
  deck: {
    drawnIds: string[]
    mode: string
  }
  plans: {
    plans: unknown[]
    categories: unknown[]
  }
  updatedAt: string
}

/** 登录共享账号(成功返回 null,失败返回错误信息) */
export async function signInCloud(password: string): Promise<string | null> {
  const { error } = await supabase.auth.signInWithPassword({
    email: APP_EMAIL,
    password,
  })
  return error ? error.message : null
}

/** 退出登录 */
export async function signOutCloud(): Promise<void> {
  await supabase.auth.signOut()
}

/**
 * 确保登录态有效(过期时 supabase-js 会自动用 refresh token 续期)。
 * 失效(如 refresh token 过期)时返回 false——此时任何读写都会以匿名身份
 * 到达数据库,被 RLS 拒绝且错误信息只有误导性的 RLS 文案,应提前拦截。
 */
export async function ensureSession(): Promise<boolean> {
  const { data } = await supabase.auth.getSession()
  return !!data.session
}

/** 从云端拉取数据(云端为空返回 null) */
export async function pullFromCloud(): Promise<CloudData | null> {
  const { data, error } = await supabase
    .from('app_data')
    .select('data')
    .eq('id', 'main')
    .maybeSingle()
  if (error) throw new Error(`Pull failed: ${error.message}`)
  return (data?.data as CloudData | undefined) ?? null
}

/** 推送数据到云端(upsert 覆盖) */
export async function pushToCloud(data: CloudData): Promise<void> {
  const { error } = await supabase.from('app_data').upsert({
    id: 'main',
    data,
    updated_at: new Date().toISOString(),
  })
  if (error) throw new Error(`Push failed: ${error.message}`)
}
