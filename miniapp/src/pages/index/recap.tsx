import { Button, ScrollView, Text, View } from '@tarojs/components'
import { GAME_OVER_MESSAGES } from '../../lib/game-data'
import type { HistoryEntry } from '../../lib/storage'
import './recap.scss'

interface RecapScreenProps {
  nickname: string
  history: HistoryEntry[]
  onBack: () => void
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}/${day} ${hour}:${minute}`
}

function getResultLabel(entry: HistoryEntry): string {
  if (entry.result === 'victory') return '成功通关 7 天'
  const message = entry.reason ? GAME_OVER_MESSAGES[entry.reason] : null
  return `第 ${entry.dayReached} 天 · ${message?.title || '挑战结束'}`
}

function buildKnowledgeGaps(history: HistoryEntry[]) {
  const gaps = new Map<string, { count: number; events: string[] }>()
  history.forEach((entry) => {
    entry.choices.filter((choice) => !choice.isPreferred).forEach((choice) => {
      choice.knowledgeTags.forEach((tag) => {
        const value = gaps.get(tag) ?? { count: 0, events: [] }
        value.count += 1
        if (!value.events.includes(choice.eventTitle)) value.events.push(choice.eventTitle)
        gaps.set(tag, value)
      })
    })
  })
  return [...gaps.entries()]
    .map(([tag, value]) => ({ tag, ...value }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, 3)
}

export function RecapScreen({ nickname, history, onBack }: RecapScreenProps) {
  const knowledgeGaps = buildKnowledgeGaps(history)
  const failed = history.filter((entry) => entry.result === 'gameover')
  const reasonCounts = new Map<string, number>()
  failed.forEach((entry) => {
    const reason = entry.reason || 'unknown'
    reasonCounts.set(reason, (reasonCounts.get(reason) ?? 0) + 1)
  })
  const topReason = [...reasonCounts.entries()].sort((a, b) => b[1] - a[1])[0]

  return (
    <ScrollView className='recap-scroll paper-bg' scrollY>
      <View className='recap-page'>
        <View className='recap-head'>
          <Text className='recap-kicker'>{nickname || '小糖'}的记录</Text>
          <Text className='recap-title'>参与历史与复盘</Text>
          <Text className='recap-subtitle'>已结束 {history.length} 局；未结束的挑战仍可在首页继续。</Text>
        </View>

        {topReason && (
          <View className='recap-summary recap-card'>
            <Text className='recap-section-title'>最常见的翻车原因</Text>
            <Text className='recap-summary__value'>
              {GAME_OVER_MESSAGES[topReason[0] as keyof typeof GAME_OVER_MESSAGES]?.title || '挑战结束'} · {topReason[1]} 次
            </Text>
          </View>
        )}

        <View className='recap-card'>
          <Text className='recap-section-title'>最值得复习的血糖知识</Text>
          {history.length === 0 ? (
            <Text className='recap-empty'>完成一局后，这里会根据你的真实选择生成复盘。</Text>
          ) : knowledgeGaps.length === 0 ? (
            <Text className='recap-empty'>目前没有明显薄弱项，你的选择很稳。</Text>
          ) : (
            <View className='gap-list'>
              {knowledgeGaps.map((item, index) => (
                <View className='gap-item' key={item.tag}>
                  <Text className='gap-rank'>{index + 1}</Text>
                  <View className='gap-copy'>
                    <Text className='gap-name'>{item.tag}</Text>
                    <Text className='gap-note'>出现 {item.count} 次 · 相关场景：{item.events.slice(0, 2).join('、')}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className='recap-card'>
          <Text className='recap-section-title'>每局记录</Text>
          {history.length === 0 ? (
            <Text className='recap-empty'>还没有已结束的挑战。</Text>
          ) : (
            <View className='history-list'>
              {history.map((entry, index) => (
                <View className={`history-item history-item--${entry.result}`} key={entry.id}>
                  <View>
                    <Text className='history-item__title'>第 {history.length - index} 局 · {getResultLabel(entry)}</Text>
                    <Text className='history-item__date'>{formatDate(entry.timestamp)}</Text>
                  </View>
                  <Text className='history-item__score'>答对 {entry.choices.filter((choice) => choice.isPreferred).length}/{entry.choices.length}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <Button className='recap-back' onClick={onBack}>返回首页</Button>
        <Text className='recap-footnote'>复盘来自游戏内选择，仅用于健康科普，不是健康评估。</Text>
      </View>
    </ScrollView>
  )
}
