const crypto = require('crypto')
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

const ALLOWED_EVENTS = new Set([
  'app_open',
  'game_start',
  'game_resume',
  'intro_complete',
  'scene_view',
  'choice_submit',
  'game_exit',
  'game_restart',
  'game_complete',
  'game_over',
])

const ALLOWED_PROPERTIES = new Set([
  'day',
  'event_id',
  'event_group',
  'choice_id',
  'choice_position',
  'phase',
  'exit_type',
  'has_save',
  'shows_intro',
  'duration_seconds',
  'grade',
  'game_over_reason',
  'peak_bs_count',
  'food_coma_count',
  'hangover_free_days',
])

function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.slice(0, maxLength) : ''
}

function cleanProperties(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {}

  const cleaned = {}
  Object.entries(input).forEach(([key, value]) => {
    if (!ALLOWED_PROPERTIES.has(key)) return
    if (typeof value === 'string') {
      cleaned[key] = value.slice(0, 100)
    } else if (typeof value === 'number' && Number.isFinite(value)) {
      cleaned[key] = value
    }
  })
  return cleaned
}

function toAnonymousUserKey(openid) {
  return crypto.createHash('sha256').update(openid).digest('hex').slice(0, 32)
}

exports.main = async (event) => {
  const eventName = cleanText(event && event.eventName, 40)
  if (!ALLOWED_EVENTS.has(eventName)) {
    return { ok: false, error: 'unsupported_event' }
  }

  const wxContext = cloud.getWXContext()
  if (!wxContext.OPENID) {
    return { ok: false, error: 'missing_identity' }
  }

  const document = {
    event_name: eventName,
    user_key: toAnonymousUserKey(wxContext.OPENID),
    session_id: cleanText(event && event.sessionId, 60),
    app_version: cleanText(event && event.appVersion, 30),
    properties: cleanProperties(event && event.properties),
    server_time: db.serverDate(),
  }

  try {
    await db.collection('analytics_events').add({ data: document })
    return { ok: true }
  } catch (error) {
    console.error('[trackEvent] database write failed', {
      eventName,
      message: error instanceof Error ? error.message : String(error),
    })
    return { ok: false, error: 'write_failed' }
  }
}

