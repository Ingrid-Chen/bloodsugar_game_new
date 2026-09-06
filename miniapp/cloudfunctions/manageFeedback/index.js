const crypto = require('crypto')
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const COLLECTION = 'feedback_items'
const ADMIN_COLLECTION = 'feedback_admins'
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

async function getAdminAccess(viewerKey) {
  const environmentKeys = getAdminKeys()
  if (environmentKeys.has(viewerKey)) return { configured: true, allowed: true }

  try {
    const response = await db.collection(ADMIN_COLLECTION).doc(viewerKey).get()
    if (response.data && response.data.enabled !== false) {
      return { configured: true, allowed: true }
    }
  } catch (error) {
    // A missing document is expected for non-admin users.
  }

  if (environmentKeys.size > 0) return { configured: true, allowed: false }

  try {
    const response = await db.collection(ADMIN_COLLECTION).limit(1).get()
    return { configured: (response.data || []).length > 0, allowed: false }
  } catch (error) {
    return { configured: false, allowed: false }
  }
}

exports.main = async (event) => {
  const context = cloud.getWXContext()
  if (!context.OPENID) return { ok: false, error: 'missing_identity' }

  const viewerKey = anonymousUserKey(context.OPENID)
  const adminAccess = await getAdminAccess(viewerKey)
  if (!adminAccess.configured) {
    return { ok: false, error: 'admin_not_configured', viewer_key: viewerKey }
  }
  if (!adminAccess.allowed) {
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
