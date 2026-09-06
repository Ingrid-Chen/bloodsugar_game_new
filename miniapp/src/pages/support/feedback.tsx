import { Button, Input, ScrollView, Text, Textarea, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useMemo, useState } from 'react'
import { trackEvent } from '../../lib/analytics'
import './feedback.scss'

const FEEDBACK_TYPES = [
  '知识有疑问',
  '文案看不懂',
  '数值不合理',
  '功能问题',
  '产品建议',
  '其他',
] as const

const CONTACT_TYPES = ['邮箱', '微信号', '小红书号'] as const

function decode(value?: string): string {
  if (!value) return ''
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export default function FeedbackPage() {
  const router = useRouter()
  const [feedbackType, setFeedbackType] = useState<(typeof FEEDBACK_TYPES)[number]>('产品建议')
  const [content, setContent] = useState('')
  const [contactType, setContactType] = useState<(typeof CONTACT_TYPES)[number]>('邮箱')
  const [contact, setContact] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submittedId, setSubmittedId] = useState('')

  const context = useMemo(() => ({
    source: decode(router.params.source) || 'menu',
    eventId: Number(router.params.eventId) || 0,
    eventTitle: decode(router.params.eventTitle),
    choiceLabel: decode(router.params.choiceLabel),
  }), [router.params.choiceLabel, router.params.eventId, router.params.eventTitle, router.params.source])

  const submit = async () => {
    const cleanContent = content.trim()
    if (cleanContent.length < 5) {
      void Taro.showToast({ title: '请再多写一点具体情况', icon: 'none' })
      return
    }
    if (submitting) return
    setSubmitting(true)
    try {
      const accountInfo = Taro.getAccountInfoSync()
      const result = await Taro.cloud.callFunction({
        name: 'submitFeedback',
        data: {
          feedbackType,
          content: cleanContent,
          contactType: contact.trim() ? contactType : '',
          contact: contact.trim(),
          source: context.source,
          eventId: context.eventId || undefined,
          eventTitle: context.eventTitle,
          choiceLabel: context.choiceLabel,
          appVersion: accountInfo?.miniProgram?.version || 'development',
        },
      })
      const payload = result.result as { ok?: boolean; id?: string; error?: string }
      if (!payload?.ok) throw new Error(payload?.error || 'submit_failed')
      trackEvent('feedback_submit', {
        feedback_type: feedbackType,
        source: context.source,
      })
      setSubmittedId(payload.id || '已记录')
    } catch (error) {
      console.error('[feedback] submit failed', error)
      void Taro.showToast({ title: '暂时提交失败，请稍后重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  if (submittedId) {
    return (
      <View className='feedback-success'>
        <View className='feedback-success__icon'>✓</View>
        <Text className='feedback-success__title'>收到了，谢谢你</Text>
        <Text className='feedback-success__text'>反馈编号：{submittedId}</Text>
        <Text className='feedback-success__note'>如果留了联系方式，作者可能会就这次反馈与你联系。</Text>
        <Button className='feedback-primary' onClick={() => void Taro.navigateBack()}>返回小程序</Button>
      </View>
    )
  }

  return (
    <ScrollView className='feedback-scroll' scrollY>
      <View className='feedback-page'>
        <View className='feedback-head'>
          <View className='feedback-kicker'>帮我把它做得更好</View>
          <Text className='feedback-title'>意见与反馈</Text>
          <Text className='feedback-subtitle'>哪道题让你犹豫、哪句话没说清楚，都可以直接告诉我。</Text>
        </View>

        {(context.eventTitle || context.choiceLabel) && (
          <View className='feedback-context'>
            <Text className='feedback-section-title'>已带上当前情境</Text>
            {context.eventTitle && <Text className='feedback-context__line'>情境：{context.eventTitle}</Text>}
            {context.choiceLabel && <Text className='feedback-context__line'>选择：{context.choiceLabel}</Text>}
          </View>
        )}

        <View className='feedback-card'>
          <Text className='feedback-section-title'>你想反馈什么？</Text>
          <View className='feedback-type-grid'>
            {FEEDBACK_TYPES.map((item) => (
              <Button
                className={`feedback-type ${feedbackType === item ? 'feedback-type--active' : ''}`}
                key={item}
                onClick={() => setFeedbackType(item)}
              >
                {item}
              </Button>
            ))}
          </View>

          <Text className='feedback-label'>具体内容</Text>
          <Textarea
            className='feedback-textarea'
            value={content}
            maxlength={800}
            placeholder='例如：哪个情境不好理解，你期待看到什么……'
            onInput={(event) => setContent(String(event.detail.value).slice(0, 800))}
          />
          <Text className='feedback-count'>{content.length}/800</Text>
        </View>

        <View className='feedback-card'>
          <Text className='feedback-section-title'>联系方式（选填）</Text>
          <Text className='feedback-help'>不填也可以匿名提交。填写后仅用于回复本次反馈。</Text>
          <View className='contact-tabs'>
            {CONTACT_TYPES.map((item) => (
              <Button
                className={`contact-tab ${contactType === item ? 'contact-tab--active' : ''}`}
                key={item}
                onClick={() => setContactType(item)}
              >
                {item}
              </Button>
            ))}
          </View>
          <Input
            className='feedback-input'
            value={contact}
            maxlength={100}
            placeholder={`请输入${contactType}（选填）`}
            onInput={(event) => setContact(String(event.detail.value).slice(0, 100))}
          />
        </View>

        <Text className='feedback-privacy'>点击提交表示你同意将上述内容用于产品改进和本次反馈回复。请不要填写身份证、病历或真实健康数据。</Text>
        <Button className='feedback-primary' loading={submitting} disabled={submitting} onClick={() => void submit()}>
          {submitting ? '正在提交……' : '提交反馈'}
        </Button>
        <Button className='feedback-secondary' onClick={() => void Taro.navigateBack()}>暂时不填</Button>
      </View>
    </ScrollView>
  )
}
