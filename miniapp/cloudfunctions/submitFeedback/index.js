const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const COLLECTION = 'feedback_items'
const ALLOWED_TYPES = new Set([
  '知识有疑问',
  '文案看不懂',
  '数值不合理',
  '功能问题',
  '产品建议',
  '其他',
])

function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

exports.main = async (event) => {
  const feedbackType = cleanText(event && event.feedbackType, 20)
  const content = cleanText(event && event.content, 800)

  if (!ALLOWED_TYPES.has(feedbackType)) return { ok: false, error: 'invalid_type' }
  if (content.length < 5) return { ok: false, error: 'content_too_short' }

  try {
    const result = await db.collection(COLLECTION).add({
      data: {
        feedback_type: feedbackType,
        content,
        source: cleanText(event && event.source, 30),
        event_id: Number.isFinite(Number(event && event.eventId)) ? Number(event.eventId) : 0,
        event_title: cleanText(event && event.eventTitle, 80),
        choice_label: cleanText(event && event.choiceLabel, 120),
        app_version: cleanText(event && event.appVersion, 30),
        status: 'new',
        created_at: db.serverDate(),
        updated_at: db.serverDate(),
      },
    })
    return { ok: true, id: String(result._id || '').slice(-8) }
  } catch (error) {
    console.error('[submitFeedback] database write failed', {
      message: error instanceof Error ? error.message : String(error),
    })
    return { ok: false, error: 'write_failed' }
  }
}
