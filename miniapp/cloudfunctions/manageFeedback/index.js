const crypto = require('crypto')
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const COLLECTION = 'feedback_items'
const ALLOWED_STATUSES = new Set(['new', 'processing', 'done'])

function anonymousUserKey(openid) {
  return crypto.createHash('sha256').update(openid).digest('hex').slice(0, 32)
}

function getAdminKeys() {
  return new Set(
    String(process.env.ADMIN_USER_KEYS || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  )
}

exports.main = async (event) => {
  const context = cloud.getWXContext()
  if (!context.OPENID) return { ok: false, error: 'missing_identity' }

  const viewerKey = anonymousUserKey(context.OPENID)
  const adminKeys = getAdminKeys()
  if (adminKeys.size === 0) {
    return { ok: false, error: 'admin_not_configured', viewer_key: viewerKey }
  }
  if (!adminKeys.has(viewerKey)) {
    return { ok: false, error: 'forbidden' }
  }

  try {
    const action = event && event.action === 'update' ? 'update' : 'list'
    if (action === 'update') {
      const id = typeof event.id === 'string' ? event.id : ''
      const status = typeof event.status === 'string' ? event.status : ''
      if (!id || !ALLOWED_STATUSES.has(status)) return { ok: false, error: 'invalid_update' }
      await db.collection(COLLECTION).doc(id).update({
        data: {
          status,
          updated_at: db.serverDate(),
          updated_by: viewerKey,
        },
      })
      return { ok: true }
    }

    const requestedStatus = typeof event.status === 'string' ? event.status : ''
    let query = db.collection(COLLECTION)
    if (ALLOWED_STATUSES.has(requestedStatus)) query = query.where({ status: requestedStatus })
    const response = await query.orderBy('created_at', 'desc').limit(100).get()
    return { ok: true, items: response.data || [], viewer_key: viewerKey }
  } catch (error) {
    console.error('[manageFeedback] request failed', {
      message: error instanceof Error ? error.message : String(error),
    })
    return { ok: false, error: 'query_failed' }
  }
}
