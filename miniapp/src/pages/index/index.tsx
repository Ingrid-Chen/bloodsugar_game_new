import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Button, Image, Input, ScrollView, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useGameLoop } from '../../hooks/useGameLoop'
import {
  DAY_NAMES,
  GAME_OVER_MESSAGES,
  STAT_CONFIG,
  TIME_SLOT_META,
  type Effect,
  type GameStats,
  type NightlyReport,
} from '../../lib/game-data'
import {
  NICKNAME_MAX_LEN,
  clearSave,
  getNickname,
  getSave,
  setNickname as cacheNickname,
  setSave,
} from '../../lib/storage'
import startImage from '../../assets/images/s-start.jpg'
import victoryImage from '../../assets/images/s-victory.jpg'
import gameOverImage from '../../assets/images/s-gameover.jpg'
import breakfastImage from '../../assets/images/s-breakfast.jpg'
import exerciseImage from '../../assets/images/s-exercise.jpg'
import dinnerImage from '../../assets/images/s-dinner.jpg'
import dinnerPartyImage from '../../assets/images/s-dinner-party.jpg'
import lunchImage from '../../assets/images/s-lunch.jpg'
import lunchThreeImage from '../../assets/images/s-lunch-3.jpg'
import lowSugarImage from '../../assets/images/s-low-sugar.jpg'
import morningImage from '../../assets/images/s-morning.jpg'
import outsideImage from '../../assets/images/s-outside.jpg'
import teaImage from '../../assets/images/s-tea.jpg'
import teaFourImage from '../../assets/images/s-tea-4.jpg'
import bedtimeImage from '../../assets/images/s-bedtime.jpg'
import './index.scss'

const IMAGE_MAP: Record<string, string> = {
  '/images/s-start.jpg': startImage,
  '/images/s-victory.jpg': victoryImage,
  '/images/s-gameover.jpg': gameOverImage,
  '/images/s-breakfast.jpg': breakfastImage,
  '/images/s-exercise.png': exerciseImage,
  '/images/s-dinner.png': dinnerImage,
  '/images/s-dinner-party.png': dinnerPartyImage,
  '/images/s-lunch.png': lunchImage,
  '/images/s-lunch-3.jpg': lunchThreeImage,
  '/images/s-low-sugar.png': lowSugarImage,
  '/images/s-morning.png': morningImage,
  '/images/s-outside.png': outsideImage,
  '/images/s-tea.png': teaImage,
  '/images/s-tea-4.jpg': teaFourImage,
  '/images/s-bedtime.png': bedtimeImage,
}

function getImage(path?: string): string {
  return (path && IMAGE_MAP[path]) || startImage
}

function DoodleButton({
  children,
  tone = 'green',
  className = '',
  onClick,
}: {
  children: ReactNode
  tone?: 'green' | 'yellow' | 'cream' | 'red'
  className?: string
  onClick: () => void
}) {
  return (
    <Button className={`doodle-button doodle-button--${tone} ${className}`} onClick={onClick}>
      {children}
    </Button>
  )
}

function StatGrid({ stats }: { stats: GameStats }) {
  return (
    <View className='stats-grid'>
      {STAT_CONFIG.map((item) => {
        const value = stats[item.key]
        return (
          <View className='stat-card' key={item.key} style={{ backgroundColor: item.bg }}>
            <View className='stat-card__top'>
              <Text className='stat-card__emoji'>{item.emoji}</Text>
              <Text className='stat-card__label'>{item.label}</Text>
              <Text className='stat-card__value'>{value}</Text>
            </View>
            <View className='stat-bar'>
              <View
                className='stat-bar__fill'
                style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: item.color }}
              />
            </View>
          </View>
        )
      })}
    </View>
  )
}

function RulesOverlay({ onClose }: { onClose: () => void }) {
  return (
    <View className='overlay'>
      <View className='overlay__mask' onClick={onClose} />
      <ScrollView className='modal doodle-card' scrollY>
        <Text className='modal__title'>活动规则</Text>
        <Text className='modal__paragraph'>目标：在七天生活情境中做出饮食与生活选择，让血糖、心情、精力和饱腹保持在安全范围。</Text>
        <Text className='modal__paragraph'>操作：每个情境从左右两个选项中选择一个，随后查看数值影响和科普说明。</Text>
        <Text className='modal__paragraph'>说明：游戏中的数值均为模拟分数，不是真实血糖或医学检测结果。</Text>
        <View className='notice-box'>
          <Text>本小程序仅用于一般健康科普，不构成疾病诊断、治疗或个体化医疗建议。</Text>
        </View>
        <DoodleButton onClick={onClose}>我知道了</DoodleButton>
      </ScrollView>
    </View>
  )
}

function HomeScreen({
  nickname,
  setNickname,
  hasSave,
  onStart,
  onContinue,
  onRules,
}: {
  nickname: string
  setNickname: (value: string) => void
  hasSave: boolean
  onStart: () => void
  onContinue: () => void
  onRules: () => void
}) {
  return (
    <ScrollView className='page-scroll paper-bg' scrollY>
      <View className='home'>
        <Button className='rules-button' onClick={onRules}>📖 规则</Button>

        <View className='hero-card'>
          <Image className='hero-card__image' src={startImage} mode='aspectFill' />
          <View className='hero-card__badge hero-card__badge--top'>!</View>
          <View className='hero-card__badge hero-card__badge--bottom'>GO</View>
        </View>

        <Text className='title'>控糖生存指南</Text>
        <View className='title-lines'>
          <View style={{ backgroundColor: '#e05a5a' }} />
          <View style={{ backgroundColor: '#f5c542' }} />
          <View style={{ backgroundColor: '#5a9a6e' }} />
          <View style={{ backgroundColor: '#e8824a' }} />
        </View>

        <View className='speech doodle-card'>
          <View className='nickname-row'>
            <Text>我是</Text>
            <Input
              className='nickname-input'
              value={nickname}
              maxlength={NICKNAME_MAX_LEN}
              placeholder='小糖'
              onInput={(event) => setNickname(String(event.detail.value).slice(0, NICKNAME_MAX_LEN))}
            />
          </View>
          <Text className='speech__line'>我要做出更明智的生活选择，健康生活七天</Text>
        </View>

        <View className='home-stats'>
          <Text className='home-stats__hint'>每个选择都会影响四项模拟状态</Text>
          <View className='home-stats__grid'>
            {STAT_CONFIG.map((item) => (
              <View className='home-stat' key={item.key} style={{ backgroundColor: item.bg }}>
                <Text>{item.emoji}</Text>
                <Text>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='home-actions'>
          {hasSave && <DoodleButton onClick={onContinue}>继续上次挑战</DoodleButton>}
          <DoodleButton tone={hasSave ? 'cream' : 'green'} onClick={onStart}>
            {hasSave ? '重新开始' : '开始冒险！'}
          </DoodleButton>
        </View>

        <Text className='disclaimer'>模拟游戏数值 · 仅供健康科普 · 不构成医疗建议</Text>
      </View>
    </ScrollView>
  )
}

function GameScreen({
  day,
  stats,
  event,
  eventIndex,
  queueLength,
  onChoose,
  onRules,
}: {
  day: number
  stats: GameStats
  event: NonNullable<ReturnType<typeof useGameLoop>['currentEvent']>
  eventIndex: number
  queueLength: number
  onChoose: (effect: Effect, index: number) => void
  onRules: () => void
}) {
  const slot = TIME_SLOT_META[event.group]
  return (
    <View className='game paper-bg'>
      <View className='game-header'>
        <View className='game-header__line'>
          <View>
            <Text className='day-label'>第 {day} 天 · {DAY_NAMES[day - 1]}</Text>
            <Text className='slot-label' style={{ backgroundColor: slot.bg, color: slot.color }}>
              {slot.emoji} {slot.label} {slot.time}
            </Text>
          </View>
          <Button className='rules-button rules-button--inline' onClick={onRules}>规则</Button>
        </View>
        <StatGrid stats={stats} />
      </View>

      <ScrollView className='game-body' scrollY>
        <View className='event-progress'>情境 {eventIndex} / {queueLength}</View>
        <View className='event-card doodle-card'>
          <Image className='event-card__image' src={getImage(event.image)} mode='aspectFill' />
          <View className='event-card__content'>
            <Text className='event-card__title'>{event.title}</Text>
            <Text className='event-card__description'>{event.description}</Text>
          </View>
          <View className='choices'>
            {event.choices.map((choice, index) => (
              <Button
                className={`choice-button choice-button--${index === 0 ? 'green' : 'yellow'}`}
                key={`${event.id}-${index}`}
                onClick={() => onChoose(choice.effect, index)}
              >
                {choice.label}
              </Button>
            ))}
          </View>
        </View>
        <Text className='game-hint'>点击一个选项，查看它带来的模拟影响</Text>
      </ScrollView>
    </View>
  )
}

function TipScreen({
  stats,
  choiceLabel,
  scienceTip,
  effect,
  onContinue,
}: {
  stats: GameStats
  choiceLabel: string
  scienceTip: string
  effect: Effect
  onContinue: () => void
}) {
  const changes = STAT_CONFIG.flatMap((item) => {
    const value = effect[item.key]
    return value ? [{ ...item, value }] : []
  })

  return (
    <ScrollView className='page-scroll paper-bg' scrollY>
      <View className='tip-page'>
        <StatGrid stats={stats} />
        <View className='tip-card doodle-card'>
          <View className='tip-card__header'>
            <View className='tip-icon'>!</View>
            <View>
              <Text className='tip-card__eyebrow'>你选择了</Text>
              <Text className='tip-card__choice'>{choiceLabel}</Text>
            </View>
          </View>
          <View className='change-list'>
            {changes.map((item) => (
              <View className='change-pill' key={item.key} style={{ backgroundColor: item.bg }}>
                <Text>{item.emoji} {item.label}</Text>
                <Text className={item.value > 0 ? 'change-positive' : 'change-negative'}>
                  {item.value > 0 ? '+' : ''}{item.value}
                </Text>
              </View>
            ))}
          </View>
          <View className='science-box'>
            <Text className='science-box__title'>💡 科普提示</Text>
            <Text className='science-box__text'>{scienceTip}</Text>
          </View>
          <Text className='simulation-note'>以上为游戏化模拟效果，不代表真实个体的血糖变化。</Text>
          <DoodleButton onClick={onContinue}>继续</DoodleButton>
        </View>
      </View>
    </ScrollView>
  )
}

function DaySummaryScreen({
  day,
  stats,
  report,
  totalDays,
  onContinue,
}: {
  day: number
  stats: GameStats
  report: NightlyReport | null
  totalDays: number
  onContinue: () => void
}) {
  return (
    <ScrollView className='page-scroll paper-bg' scrollY>
      <View className='summary-page'>
        <Image className='summary-image' src={startImage} mode='aspectFill' />
        <View className='summary-card doodle-card'>
          <Text className='summary-title'>{DAY_NAMES[day - 1]}结束！</Text>
          <Text className='summary-subtitle'>今天的睡前模拟血糖分数：{stats.bloodSugar}</Text>
          {report?.notes.map((note) => (
            <View className='report-note' key={note}>✨ {note}</View>
          ))}
          <View className='progress-row'>
            <Text>生存进度</Text>
            <Text>{day}/{totalDays} 天</Text>
          </View>
          <View className='survival-progress'>
            <View className='survival-progress__fill' style={{ width: `${(day / totalDays) * 100}%` }} />
          </View>
          <DoodleButton tone={day >= totalDays ? 'yellow' : 'green'} onClick={onContinue}>
            {day >= totalDays ? '查看最终战报' : `进入第 ${day + 1} 天`}
          </DoodleButton>
        </View>
      </View>
    </ScrollView>
  )
}

function EndScreen({
  victory,
  nickname,
  reason,
  trackers,
  onRestart,
  onHome,
}: {
  victory: boolean
  nickname: string
  reason?: string
  trackers: { peakBsCount: number; foodComaCount: number; hangoverFreeDays: number }
  onRestart: () => void
  onHome: () => void
}) {
  const message = reason ? GAME_OVER_MESSAGES[reason] : null
  const grade = trackers.peakBsCount === 0 ? 'S' : trackers.peakBsCount <= 3 ? 'A' : trackers.peakBsCount <= 6 ? 'B' : 'C'

  return (
    <ScrollView className='page-scroll paper-bg' scrollY>
      <View className='end-page'>
        <Image className='end-image' src={victory ? victoryImage : gameOverImage} mode='aspectFill' />
        <View className='end-card doodle-card'>
          <Text className={`end-title ${victory ? 'end-title--success' : 'end-title--danger'}`}>
            {victory ? `${nickname}活过了七天！` : `${nickname}倒下了……`}
          </Text>
          {victory ? (
            <>
              <View className='grade-badge'>{grade}</View>
              <Text className='end-subtitle'>本次模拟控糖评级</Text>
              <View className='battle-report'>
                <Text>血糖破峰：{trackers.peakBsCount} 次</Text>
                <Text>撑胀惩罚：{trackers.foodComaCount} 次</Text>
                <Text>无糖宿醉：{trackers.hangoverFreeDays} / 7 天</Text>
              </View>
            </>
          ) : (
            <>
              <Text className='end-subtitle'>{message?.title || '挑战失败'}</Text>
              <Text className='end-description'>{message?.subtitle || '再试一次，看看不同选择会发生什么。'}</Text>
            </>
          )}
          <DoodleButton onClick={onRestart}>再挑战一次</DoodleButton>
          <DoodleButton tone='cream' onClick={onHome}>返回首页</DoodleButton>
          <Text className='simulation-note'>游戏结果仅用于科普互动，不是健康评估或医疗结论。</Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default function IndexPage() {
  const game = useGameLoop()
  const [nickname, setNickname] = useState('')
  const [showHome, setShowHome] = useState(true)
  const [showRules, setShowRules] = useState(false)
  const [hasSave, setHasSave] = useState(false)

  useEffect(() => {
    setNickname(getNickname())
    setHasSave(Boolean(getSave()))
  }, [])

  useEffect(() => {
    if (showHome || game.phase === 'start' || !nickname.trim()) return
    setSave({ nickname: nickname.trim(), ...game.saveState() })
    setHasSave(true)
  }, [showHome, nickname, game.phase, game.stats, game.currentDay, game.eventIndexInDay, game.saveState])

  const queueLength = useMemo(() => game.dayQueue.filter(Boolean).length, [game.dayQueue])
  const visibleEventIndex = useMemo(
    () => game.dayQueue.slice(0, game.eventIndexInDay + 1).filter(Boolean).length,
    [game.dayQueue, game.eventIndexInDay]
  )

  const validateNickname = (): string | null => {
    const value = nickname.trim().slice(0, NICKNAME_MAX_LEN)
    if (!value) {
      Taro.showToast({ title: '请先填写昵称', icon: 'none' })
      return null
    }
    cacheNickname(value)
    setNickname(value)
    return value
  }

  const start = () => {
    if (!validateNickname()) return
    clearSave()
    game.handleStart()
    setShowHome(false)
  }

  const resume = () => {
    const saved = getSave()
    if (!saved) {
      setHasSave(false)
      return
    }
    setNickname(saved.nickname)
    cacheNickname(saved.nickname)
    game.restoreSave(saved)
    setShowHome(false)
  }

  const restart = () => {
    if (!validateNickname()) return
    clearSave()
    game.restart()
    setShowHome(false)
  }

  const goHome = () => {
    clearSave()
    setHasSave(false)
    setShowHome(true)
  }

  let content: ReactNode
  if (showHome) {
    content = (
      <HomeScreen
        nickname={nickname}
        setNickname={setNickname}
        hasSave={hasSave}
        onStart={start}
        onContinue={resume}
        onRules={() => setShowRules(true)}
      />
    )
  } else if (game.phase === 'playing' && game.currentEvent) {
    content = (
      <GameScreen
        day={game.currentDay}
        stats={game.stats}
        event={game.currentEvent}
        eventIndex={visibleEventIndex}
        queueLength={queueLength}
        onChoose={game.handleChoose}
        onRules={() => setShowRules(true)}
      />
    )
  } else if (game.phase === 'tip' && game.pendingTip) {
    content = (
      <TipScreen
        stats={game.stats}
        choiceLabel={game.pendingTip.choiceLabel}
        scienceTip={game.pendingTip.scienceTip}
        effect={game.pendingTip.effect}
        onContinue={game.handleDismissTip}
      />
    )
  } else if (game.phase === 'day-summary') {
    content = (
      <DaySummaryScreen
        day={game.currentDay}
        stats={game.stats}
        report={game.nightlyReport}
        totalDays={game.TOTAL_DAYS}
        onContinue={game.handleDaySummaryDone}
      />
    )
  } else if (game.phase === 'victory' || game.phase === 'gameover') {
    content = (
      <EndScreen
        victory={game.phase === 'victory'}
        nickname={nickname || '小糖'}
        reason={game.gameOverReason}
        trackers={game.trackers}
        onRestart={restart}
        onHome={goHome}
      />
    )
  } else {
    content = <View className='loading paper-bg'>正在准备今天的情境……</View>
  }

  return (
    <View className='app-shell'>
      {content}
      {showRules && <RulesOverlay onClose={() => setShowRules(false)} />}
    </View>
  )
}
