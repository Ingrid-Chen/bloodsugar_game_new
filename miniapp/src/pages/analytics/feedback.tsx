import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, ScrollView, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './feedback.scss'

type FeedbackStatus = 'new' | 'processing' | 'done'

interface FeedbackItem {
  _id: string
  feedback_type: string
  content: string
  contact_type?: string
  contact?: string
  source?: string
  event_id?: number
  event_title?: string
  choice_label?: string
  app_version?: string
  status: FeedbackStatus
  created_at?: string | number | Date
}

interface FeedbackPayload {
  ok?: boolean
  error?: string
  viewer_key?: string
  items?: FeedbackItem[]
}

const STATUS_META: Record<FeedbackStatus, { label: string; next?: FeedbackStatus }> = {
  new: { label: '待处理', next: 'processing' },
  processing: { label: '处理中', next: 'done' },
  done: { label: '已完成' },
}

function canViewDashboard(): boolean {
  try {
    return Taro.getAccountInfoSync()?.miniProgram?.envVersion === 'develop'
  } catch {
    return false
  }
}

function formatDate(value?: string | number | Date): string {
  if (!value) return '时间未知'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '时间未知' : date.toLocaleString()
}

export default function FeedbackAdminPage() {
  const canView = useMemo(canViewDashboard, [])
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [filter, setFilter] = useState<'all' | FeedbackStatus>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewerKey, setViewerKey] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await Taro.cloud.callFunction({
        name: 'manageFeedback',
        data: { action: 'list', status: filter === 'all' ? '' : filter },
      })
      const payload = response.result as FeedbackPayload
      if (!payload?.ok) {
        if (payload?.error === 'admin_not_configured') {
          setViewerKey(payload.viewer_key || '')
          setError('反馈后台还差最后一步管理员绑定。复制下方识别码，填入云函数的 ADMIN_USER_KEYS 后即可使用。')
          return
        }
        if (payload?.error === 'forbidden') {
          setError('当前微信账号不是管理员，无法查看玩家反馈。')
          return
        }
        throw new Error(payload?.error || 'unknown_error')
      }
      setItems(payload.items || [])
    } catch (loadError) {
      console.error('[feedback-admin] load failed', loadError)
      setError('暂时没有读到反馈，请确认反馈云函数和数据库集合已经部署。')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    if (!canView) {
      void Taro.reLaunch({ url: '/pages/index/index' })
      return
    }
    void load()
  }, [canView, load])

  const updateStatus = async (item: FeedbackItem) => {
    const next = STATUS_META[item.status].next
    if (!next) return
    try {
      const response = await Taro.cloud.callFunction({
        name: 'manageFeedback',
        data: { action: 'update', id: item._id, status: next },
      })
      const payload = response.result as FeedbackPayload
      if (!payload?.ok) throw new Error(payload?.error || 'update_failed')
      setItems((current) => current.map((value) => value._id === item._id ? { ...value, status: next } : value))
      void Taro.showToast({ title: `已改为${STATUS_META[next].label}`, icon: 'success' })
    } catch (updateError) {
      console.error('[feedback-admin] update failed', updateError)
      void Taro.showToast({ title: '更新失败，请稍后再试', icon: 'none' })
    }
  }

  if (!canView) return <View />

  return (
    <ScrollView className='feedback-admin-scroll' scrollY>
      <View className='feedback-admin'>
        <View className='feedback-admin__head'>
          <Text className='feedback-admin__kicker'>仅开发预览可见</Text>
          <Text className='feedback-admin__title'>玩家反馈</Text>
          <Text className='feedback-admin__subtitle'>联系方式只用于回复对应反馈，请勿另作他用。</Text>
        </View>

        <View className='feedback-admin__tabs'>
          {(['all', 'new', 'processing', 'done'] as const).map((status) => (
            <Button
              key={status}
              className={`feedback-admin__tab ${filter === status ? 'feedback-admin__tab--active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status === 'all' ? '全部' : STATUS_META[status].label}
            </Button>
          ))}
        </View>

        {loading && <View className='feedback-admin__state'>正在读取反馈……</View>}
        {!loading && error && (
          <View className='feedback-admin__state feedback-admin__state--error'>
            <Text>{error}</Text>
            {viewerKey && (
              <Button onClick={() => void Taro.setClipboardData({ data: viewerKey })}>
                复制管理员识别码
              </Button>
            )}
          </View>
        )}
        {!loading && !error && items.length === 0 && (
          <View className='feedback-admin__state'>这个分类暂时没有反馈。</View>
        )}

        <View className='feedback-admin__list'>
          {items.map((item) => (
            <View className='feedback-admin-card' key={item._id}>
              <View className='feedback-admin-card__head'>
                <Text className='feedback-admin-card__type'>{item.feedback_type}</Text>
                <Text className={`feedback-admin-card__status feedback-admin-card__status--${item.status}`}>
                  {STATUS_META[item.status]?.label || item.status}
                </Text>
              </View>
              <Text className='feedback-admin-card__content'>{item.content}</Text>
              {(item.event_title || item.choice_label) && (
                <View className='feedback-admin-card__context'>
                  {item.event_title && <Text>情境：{item.event_title}</Text>}
                  {item.choice_label && <Text>选择：{item.choice_label}</Text>}
                </View>
              )}
              {item.contact && (
                <Button
                  className='feedback-admin-card__contact'
                  onClick={() => void Taro.setClipboardData({ data: item.contact || '' })}
                >
                  {item.contact_type || '联系方式'}：{item.contact} · 复制
                </Button>
              )}
              <View className='feedback-admin-card__foot'>
                <Text>{formatDate(item.created_at)}</Text>
                <Text>{item.source || 'unknown'} · v{item.app_version || '-'}</Text>
              </View>
              {STATUS_META[item.status]?.next && (
                <Button className='feedback-admin-card__action' onClick={() => void updateStatus(item)}>
                  标记为{STATUS_META[STATUS_META[item.status].next!].label}
                </Button>
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}
