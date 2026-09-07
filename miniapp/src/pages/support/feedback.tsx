import { Button, ScrollView, Text, Textarea, View } from '@tarojs/components'
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

const AUTHOR_EMAIL = 'ktsczn@163.com'

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
        <Text className='feedback-success__note'>反馈已匿名记录。如希望收到回复，可以通过作者邮箱主动联系。</Text>
        <Button
          className='feedback-email-button'
          onClick={() => void Taro.setClipboardData({ data: AUTHOR_EMAIL })}
        >
          复制作者邮箱：{AUTHOR_EMAIL}
        </Button>
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

        <View className='feedback-card feedback-contact-card'>
          <Text className='feedback-section-title'>希望收到回复？</Text>
          <Text className='feedback-help'>本页面只接收匿名反馈，不会收集你的联系方式。如需回复，请主动发送邮件联系作者。</Text>
          <Button
            className='feedback-email-button'
            onClick={() => void Taro.setClipboardData({ data: AUTHOR_EMAIL })}
          >
            复制作者邮箱：{AUTHOR_EMAIL}
          </Button>
        </View>

        <Text className='feedback-privacy'>反馈将匿名提交，仅用于产品改进。请勿填写姓名、微信号、手机号、邮箱、病历或真实健康数据。</Text>
        <Button className='feedback-primary' loading={submitting} disabled={submitting} onClick={() => void submit()}>
          {submitting ? '正在提交……' : '提交反馈'}
        </Button>
        <Button className='feedback-secondary' onClick={() => void Taro.navigateBack()}>暂时不填</Button>
      </View>
    </ScrollView>
  )
}
