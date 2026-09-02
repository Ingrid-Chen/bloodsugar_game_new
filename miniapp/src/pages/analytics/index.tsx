import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, ScrollView, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { TIME_SLOT_META, getEventById } from '../../lib/game-data'
import './index.scss'

type WindowDays = 7 | 30 | 90

interface DashboardSummary {
  users: number
  start_rate: number
  completion_rate: number
  plays: number
  completions: number
}

interface DailyMetric {
  date: string
  users: number
  start_rate: number
  completion_rate: number
  plays: number
  completions: number
}

interface ChoiceMetric {
  event_id: number
  a: number
  b: number
  total: number
}

interface DashboardPayload {
  ok: boolean
  error?: string
  days: WindowDays
  generated_at: string
  truncated: boolean
  summary: DashboardSummary
  daily: DailyMetric[]
  choices: ChoiceMetric[]
}

const WINDOWS: WindowDays[] = [7, 30, 90]

function canViewDashboard(): boolean {
  try {
    return Taro.getAccountInfoSync()?.miniProgram?.envVersion !== 'release'
  } catch {
    return true
  }
}

function formatDate(date: string): string {
  return date.slice(5).replace('-', '/')
}

function percent(value: number): string {
  return `${Number.isFinite(value) ? value : 0}%`
}

function MetricCard({
  label,
  value,
  note,
  tone,
}: {
  label: string
  value: string
  note: string
  tone: 'red' | 'yellow' | 'green' | 'orange'
}) {
  return (
    <View className={`metric-card metric-card--${tone}`}>
      <Text className='metric-card__label'>{label}</Text>
      <Text className='metric-card__value'>{value}</Text>
      <Text className='metric-card__note'>{note}</Text>
    </View>
  )
}

export default function AnalyticsPage() {
  const canView = useMemo(canViewDashboard, [])
  const [days, setDays] = useState<WindowDays>(7)
  const [data, setData] = useState<DashboardPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async (windowDays: WindowDays) => {
    setLoading(true)
    setError('')
    try {
      const response = await Taro.cloud.callFunction({
        name: 'getAnalyticsSummary',
        data: { days: windowDays },
      })
      const payload = response.result as DashboardPayload
      if (!payload?.ok) throw new Error(payload?.error || 'unknown_error')
      setData(payload)
    } catch (loadError) {
      console.error('[analytics-dashboard] load failed', loadError)
      setError('暂时没有读到统计数据，请确认汇总云函数已经部署。')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!canView) {
      void Taro.reLaunch({ url: '/pages/index/index' })
      return
    }
    void load(days)
  }, [canView, days, load])

  const maxDaily = useMemo(() => {
    if (!data?.daily.length) return 1
    return Math.max(1, ...data.daily.map((item) => Math.max(item.users, item.plays)))
  }, [data])

  const choiceRows = useMemo(() => data?.choices.filter((item) => item.total > 0) || [], [data])

  if (!canView) return <View />

  return (
    <ScrollView className='dashboard-scroll' scrollY>
      <View className='dashboard'>
        <View className='dashboard-head'>
          <View>
            <Text className='dashboard-kicker'>仅开发版 / 体验版可见</Text>
            <Text className='dashboard-title'>测试数据看板</Text>
          </View>
        </View>

        <View className='window-tabs'>
          {WINDOWS.map((item) => (
            <Button
              key={item}
              className={`window-tab ${days === item ? 'window-tab--active' : ''}`}
              onClick={() => setDays(item)}
            >
              {item} 天
            </Button>
          ))}
          <Button className='window-tab window-tab--refresh' onClick={() => void load(days)}>刷新</Button>
        </View>

        {loading && <View className='dashboard-state'>正在汇总数据……</View>}

        {!loading && error && (
          <View className='dashboard-state dashboard-state--error'>
            <Text>{error}</Text>
            <Button className='retry-button' onClick={() => void load(days)}>重新加载</Button>
          </View>
        )}

        {!loading && data && (
          <>
            <View className='metric-grid'>
              <MetricCard label={`${days} 天用户数`} value={`${data.summary.users}`} note='按微信用户去重；每日见下方' tone='red' />
              <MetricCard label='开始率' value={percent(data.summary.start_rate)} note='进入游戏用户 ÷ 使用用户' tone='yellow' />
              <MetricCard label='完成率' value={percent(data.summary.completion_rate)} note='通关次数 ÷ 游玩次数' tone='green' />
              <MetricCard label='玩的次数' value={`${data.summary.plays}`} note='开始、继续或重新挑战' tone='orange' />
            </View>

            <View className='dashboard-card'>
              <View className='section-heading'>
                <Text className='section-title'>每日用户数与游玩次数</Text>
                <Text className='section-note'>红色是用户数，绿色是游玩次数</Text>
              </View>
              {data.daily.length === 0 ? (
                <Text className='empty-text'>这个时间范围内还没有数据。</Text>
              ) : (
                <View className='daily-list'>
                  {data.daily.map((item) => (
                    <View className='daily-row' key={item.date}>
                      <Text className='daily-row__date'>{formatDate(item.date)}</Text>
                      <View className='daily-row__chart'>
                        <View className='daily-bar daily-bar--users' style={{ width: item.users ? `${Math.max(4, item.users / maxDaily * 100)}%` : '0%' }} />
                        <View className='daily-bar daily-bar--plays' style={{ width: item.plays ? `${Math.max(4, item.plays / maxDaily * 100)}%` : '0%' }} />
                      </View>
                      <View className='daily-row__values'>
                        <Text>{item.users} 人</Text>
                        <Text>{item.plays} 次</Text>
                      </View>
                      <View className='daily-row__rates'>
                        <Text>开始 {percent(item.start_rate)}</Text>
                        <Text>完成 {percent(item.completion_rate)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View className='dashboard-card'>
              <View className='section-heading'>
                <Text className='section-title'>各项选项分布</Text>
                <Text className='section-note'>按实际点击次数统计，只展示有数据的题目</Text>
              </View>
              {choiceRows.length === 0 ? (
                <Text className='empty-text'>完成至少一道题后，这里会出现选项分布。</Text>
              ) : (
                <View className='choice-list'>
                  {choiceRows.map((item) => {
                    const event = getEventById(item.event_id)
                    if (!event) return null
                    const aRate = item.total ? Math.round(item.a / item.total * 100) : 0
                    const bRate = 100 - aRate
                    const slot = TIME_SLOT_META[event.group]
                    return (
                      <View className='choice-card' key={item.event_id}>
                        <View className='choice-card__head'>
                          <Text className='choice-card__title'>{event.id}. {event.title}</Text>
                          <Text className='choice-card__slot'>{slot.emoji} {slot.label} · {item.total} 次</Text>
                        </View>
                        <View className='choice-option choice-option--a'>
                          <View className='choice-option__copy'>
                            <Text className='choice-option__name'>A · {event.choices[0].label}</Text>
                            <Text className='choice-option__count'>{item.a} 次 · {aRate}%</Text>
                          </View>
                          <View className='choice-track'><View style={{ width: `${aRate}%` }} /></View>
                        </View>
                        <View className='choice-option choice-option--b'>
                          <View className='choice-option__copy'>
                            <Text className='choice-option__name'>B · {event.choices[1].label}</Text>
                            <Text className='choice-option__count'>{item.b} 次 · {bRate}%</Text>
                          </View>
                          <View className='choice-track'><View style={{ width: `${bRate}%` }} /></View>
                        </View>
                      </View>
                    )
                  })}
                </View>
              )}
            </View>

            {data.truncated && <Text className='dashboard-warning'>数据超过 20,000 条，本页只汇总最近读取到的部分记录。</Text>}
            <Text className='dashboard-footnote'>
              数据为匿名游戏行为汇总，不包含昵称、头像、手机号或真实健康数据。最后刷新：{new Date(data.generated_at).toLocaleTimeString()}
            </Text>
          </>
        )}
      </View>
    </ScrollView>
  )
}
