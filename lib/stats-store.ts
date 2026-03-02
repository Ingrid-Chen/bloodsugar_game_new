/**
 * 统计存储：访问次数（历史累计）+ 参与人数（昵称去重）
 * 生产环境请配置 Upstash Redis：UPSTASH_REDIS_REST_URL、UPSTASH_REDIS_REST_TOKEN
 * 未配置时使用内存 fallback（仅本地开发，进程重启后归零）
 */

const VISIT_COUNT_KEY = "bloodsugar_visit_count"
const PARTICIPANTS_SET_KEY = "bloodsugar_participants"

let memoryVisitCount = 0
const memoryParticipants = new Set<string>()

async function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  const { Redis } = await import("@upstash/redis")
  return new Redis({ url, token })
}

export async function incrementVisitCount(): Promise<number> {
  const redis = await getRedis()
  if (redis) {
    const n = await redis.incr(VISIT_COUNT_KEY)
    return n
  }
  memoryVisitCount += 1
  return memoryVisitCount
}

export async function addParticipant(nickname: string): Promise<void> {
  const name = String(nickname).trim().slice(0, 100)
  if (!name) return
  const redis = await getRedis()
  if (redis) {
    await redis.sadd(PARTICIPANTS_SET_KEY, name)
    return
  }
  memoryParticipants.add(name)
}

export async function getStats(): Promise<{ visitCount: number; participantCount: number }> {
  const redis = await getRedis()
  if (redis) {
    const [visitCount, participantCount] = await Promise.all([
      redis.get<number>(VISIT_COUNT_KEY).then((n) => (n ?? 0) as number),
      redis.scard(PARTICIPANTS_SET_KEY),
    ])
    return { visitCount: Number(visitCount), participantCount }
  }
  return {
    visitCount: memoryVisitCount,
    participantCount: memoryParticipants.size,
  }
}
