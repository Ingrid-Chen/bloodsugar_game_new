const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const command = db.command
const COLLECTION = 'analytics_events'
const PAGE_SIZE = 1000
const MAX_EVENTS = 20000
const ALLOWED_WINDOWS = new Set([7, 30, 90])
const PLAY_EVENTS = new Set(['game_start', 'game_resume', 'game_restart'])
const CHINA_OFFSET_MS = 8 * 60 * 60 * 1000
const ACTIVE_GAME_DATA_VERSIONS = new Set(['2026-09-03-v8', '2026-09-04-v9'])

function clampRate(numerator, denominator) {
  if (!denominator) return 0
  return Math.min(100, Math.round((numerator / denominator) * 1000) / 10)
}

function toChinaDate(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Date(date.getTime() + CHINA_OFFSET_MS).toISOString().slice(0, 10)
}

function makeDay(date) {
  return {
    date,
    users: new Set(),
    players: new Set(),
    playCount: 0,
    completionCount: 0,
  }
}

async function readEvents(startAt) {
  const events = []

  for (let offset = 0; offset < MAX_EVENTS; offset += PAGE_SIZE) {
    const response = await db.collection(COLLECTION)
      .where({ server_time: command.gte(startAt) })
      .field({
        event_name: true,
        user_key: true,
        properties: true,
        server_time: true,
      })
      .orderBy('server_time', 'desc')
      .skip(offset)
      .limit(PAGE_SIZE)
      .get()

    const page = response.data || []
    events.push(...page)
    if (page.length < PAGE_SIZE) break
  }

  return {
    events,
    truncated: events.length >= MAX_EVENTS,
  }
}

exports.main = async (event) => {
  const requestedDays = Number(event && event.days)
  const days = ALLOWED_WINDOWS.has(requestedDays) ? requestedDays : 7
  const chinaStart = new Date(Date.now() + CHINA_OFFSET_MS)
  chinaStart.setUTCHours(0, 0, 0, 0)
  chinaStart.setUTCDate(chinaStart.getUTCDate() - (days - 1))
  const startAt = new Date(chinaStart.getTime() - CHINA_OFFSET_MS)

  try {
    const { events, truncated } = await readEvents(startAt)
    const dailyMap = new Map()
    const periodUsers = new Set()
    const periodPlayers = new Set()
    const choiceMap = new Map()
    let playCount = 0
    let completionCount = 0

    events.forEach((item) => {
      const date = toChinaDate(item.server_time)
      if (!date) return
      const userKey = typeof item.user_key === 'string' ? item.user_key : ''
      const eventName = typeof item.event_name === 'string' ? item.event_name : ''
      const properties = item.properties && typeof item.properties === 'object'
        ? item.properties
        : {}
      if (!ACTIVE_GAME_DATA_VERSIONS.has(properties.game_data_version)) return
      const day = dailyMap.get(date) || makeDay(date)
      dailyMap.set(date, day)

      if (userKey) {
        day.users.add(userKey)
        periodUsers.add(userKey)
      }

      if (PLAY_EVENTS.has(eventName)) {
        day.playCount += 1
        playCount += 1
        if (userKey) {
          day.players.add(userKey)
          periodPlayers.add(userKey)
        }
      }

      if (eventName === 'game_complete') {
        day.completionCount += 1
        completionCount += 1
      }

      if (eventName === 'choice_submit') {
        const eventId = Number(properties.event_id)
        const choiceId = properties.choice_id === 'b' ? 'b' : 'a'
        if (!Number.isFinite(eventId)) return
        const counts = choiceMap.get(eventId) || { event_id: eventId, a: 0, b: 0 }
        counts[choiceId] += 1
        choiceMap.set(eventId, counts)
      }
    })

    const daily = Array.from({ length: days }, (_, index) => {
      const date = new Date(chinaStart)
      date.setUTCDate(date.getUTCDate() + index)
      const dateKey = date.toISOString().slice(0, 10)
      return dailyMap.get(dateKey) || makeDay(dateKey)
    })
      .map((day) => ({
        date: day.date,
        users: day.users.size,
        start_rate: clampRate(day.players.size, day.users.size),
        completion_rate: clampRate(day.completionCount, day.playCount),
        plays: day.playCount,
        completions: day.completionCount,
      }))

    const choices = Array.from(choiceMap.values())
      .map((item) => ({ ...item, total: item.a + item.b }))
      .sort((a, b) => a.event_id - b.event_id)

    return {
      ok: true,
      days,
      generated_at: new Date().toISOString(),
      truncated,
      summary: {
        users: periodUsers.size,
        start_rate: clampRate(periodPlayers.size, periodUsers.size),
        completion_rate: clampRate(completionCount, playCount),
        plays: playCount,
        completions: completionCount,
      },
      daily,
      choices,
    }
  } catch (error) {
    console.error('[getAnalyticsSummary] query failed', {
      message: error instanceof Error ? error.message : String(error),
    })
    return { ok: false, error: 'query_failed' }
  }
}
