const crypto = require('crypto')
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
const ALLOWED_CONTACT_TYPES = new Set(['邮箱', '微信号', '小红书号'])

function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function anonymousUserKey(openid) {
  return crypto.createHash('sha256').update(openid).digest('hex').slice(0, 32)
}

exports.main = async (event) => {
  const context = cloud.getWXContext()
  if (!context.OPENID) return { ok: false, error: 'missing_identity' }

  const feedbackType = cleanText(event && event.feedbackType, 20)
  const content = cleanText(event && event.content, 800)
  const contactType = cleanText(event && event.contactType, 20)
  const contact = cleanText(event && event.contact, 100)

  if (!ALLOWED_TYPES.has(feedbackType)) return { ok: false, error: 'invalid_type' }
  if (content.length < 5) return { ok: false, error: 'content_too_short' }
  if (contact && !ALLOWED_CONTACT_TYPES.has(contactType)) return { ok: false, error: 'invalid_contact_type' }

  try {
    const result = await db.collection(COLLECTION).add({
      data: {
        feedback_type: feedbackType,
        content,
        contact_type: contact ? contactType : '',
        contact,
        source: cleanText(event && event.source, 30),
        event_id: Number.isFinite(Number(event && event.eventId)) ? Number(event.eventId) : 0,
        event_title: cleanText(event && event.eventTitle, 80),
        choice_label: cleanText(event && event.choiceLabel, 120),
        app_version: cleanText(event && event.appVersion, 30),
        user_key: anonymousUserKey(context.OPENID),
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
