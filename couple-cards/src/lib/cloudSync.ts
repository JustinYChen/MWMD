/**
 * 云端同步模块:基于 GitHub Gist 实现跨设备数据同步。
 * - GIST_ID 不是敏感信息(访问 secret Gist 仍需 token)
 * - Token 由用户在设置页输入,存在 localStorage(cc:sync),不硬编码在代码中
 * - 单人使用,采用"最后写入胜出"策略,不处理冲突
 */

const GIST_ID = 'f3e1ccca2b3abd7293f5f3e3db031dba'
const GIST_FILENAME = 'sync.json'
const API_BASE = 'https://api.github.com/gists'

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
  updatedAt: string
}

/** 从云端拉取数据 */
export async function pullFromCloud(token: string): Promise<CloudData | null> {
  const res = await fetch(`${API_BASE}/${GIST_ID}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  })
  if (!res.ok) {
    throw new Error(`Pull failed: ${res.status} ${res.statusText}`)
  }
  const gist = await res.json()
  const content = gist.files?.[GIST_FILENAME]?.content
  if (!content) return null
  return JSON.parse(content) as CloudData
}

/** 推送数据到云端 */
export async function pushToCloud(
  token: string,
  data: CloudData
): Promise<void> {
  const res = await fetch(`${API_BASE}/${GIST_ID}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: {
        [GIST_FILENAME]: { content: JSON.stringify(data, null, 2) },
      },
    }),
  })
  if (!res.ok) {
    throw new Error(`Push failed: ${res.status} ${res.statusText}`)
  }
}

/** 验证 token 是否有效(通过读取 Gist 测试) */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/${GIST_ID}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    })
    return res.ok
  } catch {
    return false
  }
}
