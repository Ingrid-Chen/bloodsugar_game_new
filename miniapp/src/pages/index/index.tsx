import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Button, Image, Input, ScrollView, Text, View } from '@tarojs/components'
import type { BaseEventOrig, ITouchEvent } from '@tarojs/components/types/common'
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
  type PostChoicePenalty,
} from '../../lib/game-data'
import {
  NICKNAME_MAX_LEN,
  clearSave,
  getNickname,
  getSave,
  hasSeenIntro,
  markIntroSeen,
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

type ChangeTone = 'good' | 'bad' | 'neutral'

function distanceToRange(value: number, min: number, max: number): number {
  if (value < min) return min - value
  if (value > max) return value - max
  return 0
}

function getStatDistance(key: keyof GameStats, value: number): number {
  if (key === 'bloodSugar') return distanceToRange(value, 40, 60)
  if (key === 'satiety') return distanceToRange(value, 40, 75)
  return Math.max(0, 50 - value)
}

function getChangeTone(key: keyof GameStats, before: number, after: number): ChangeTone {
  const beforeDistance = getStatDistance(key, before)
  const afterDistance = getStatDistance(key, after)
  if (afterDistance < beforeDistance) return 'good'
  if (afterDistance > beforeDistance) return 'bad'
  return 'neutral'
}

function getImpactLabel(key: keyof GameStats, diff: number): string {
  const labels: Record<keyof GameStats, [string, string]> = {
    bloodSugar: ['明显回落', '快速上升'],
    mood: ['心情受挫', '心情上扬'],
    energy: ['精力下降', '精力提升'],
    satiety: ['饥饿感增加', '更有饱腹感'],
  }
  return diff < 0 ? labels[key][0] : labels[key][1]
}

function PaperTexture() {
  return (
    <View className='paper-texture'>
      <View className='paper-texture__wash paper-texture__wash--one' />
      <View className='paper-texture__wash paper-texture__wash--two' />
      <View className='paper-texture__wash paper-texture__wash--three' />
      <View className='paper-texture__speckles paper-texture__speckles--one' />
      <View className='paper-texture__speckles paper-texture__speckles--two' />
    </View>
  )
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

function StatGrid({
  stats,
  previousStats,
  animateChanges = false,
}: {
  stats: GameStats
  previousStats?: GameStats
  animateChanges?: boolean
}) {
  return (
    <View className='stats-grid'>
      {STAT_CONFIG.map((item) => {
        const value = stats[item.key]
        const previousValue = previousStats?.[item.key] ?? value
        const diff = value - previousValue
        const changed = animateChanges && diff !== 0
        const tone = getChangeTone(item.key, previousValue, value)
        return (
          <View
            className={`stat-card ${changed ? `stat-card--changed stat-card--${tone}` : ''}`}
            key={`${item.key}-${animateChanges ? value : 'steady'}`}
            style={{ backgroundColor: item.bg }}
          >
            {changed && (
              <Text
                className='stat-card__delta'
                style={{ backgroundColor: item.bg, color: item.color }}
              >
                {diff > 0 ? `+${diff}` : diff}
              </Text>
            )}
            <View className='stat-card__top'>
              <Text className='stat-card__emoji'>{item.emoji}</Text>
              <Text className='stat-card__label'>{item.label}</Text>
              <Text className={`stat-card__value ${changed ? 'stat-card__value--changed' : ''}`}>{value}</Text>
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

function OnboardingScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <ScrollView className='page-scroll paper-bg' scrollY>
      <View className='onboarding'>
        <View className='onboarding__kicker'>先从你的一天开始</View>
        <Text className='onboarding__title'>你也经历过这些吗？</Text>
        <View className='onboarding__moments'>
          <View className='moment-chip moment-chip--green'>
            <Text className='moment-chip__emoji'>🥱</Text>
            <Text>午饭后困得睁不开眼</Text>
          </View>
          <View className='moment-chip moment-chip--yellow'>
            <Text className='moment-chip__emoji'>🥤</Text>
            <Text>下午突然很馋</Text>
          </View>
          <View className='moment-chip moment-chip--orange'>
            <Text className='moment-chip__emoji'>🍞</Text>
            <Text>明明吃过，却很快又饿</Text>
          </View>
        </View>
        <View className='onboarding__story doodle-card'>
          <Text className='onboarding__lead'>这些感受的原因不只一个。</Text>
          <Text className='onboarding__body'>血糖变化，是理解身体如何处理一顿饭的一扇窗口。早餐、奶茶、加班餐、饭后活动——一次选择未必说明什么，但每天重复的模式，值得你早点看懂。</Text>
        </View>
        <View className='onboarding__mission'>
          <Text className='onboarding__mission-badge'>7 天生活模拟</Text>
          <Text className='onboarding__mission-text'>做选择，看反馈，找到更稳的日常节奏。</Text>
        </View>
        <Text className='onboarding__note'>这不是健康测试，也不要求你监测血糖。</Text>
        <DoodleButton onClick={onContinue}>开始看看我的一天</DoodleButton>
      </View>
    </ScrollView>
  )
}

function GameHeader({
  day,
  stats,
  previousStats,
  animateStats = false,
  onRules,
  onMenu,
}: {
  day: number
  stats: GameStats
  previousStats?: GameStats
  animateStats?: boolean
  onRules: () => void
  onMenu: () => void
}) {
  return (
    <View className='game-header'>
      <View className='game-header__line'>
        <Text className='day-label'>第 {day} 天 · {DAY_NAMES[day - 1]}</Text>
        <View className='header-actions'>
          <Button className='rules-button rules-button--inline' onClick={onRules}>规则</Button>
          <Button className='rules-button rules-button--inline menu-button' onClick={onMenu}>菜单</Button>
        </View>
      </View>
      <StatGrid stats={stats} previousStats={previousStats} animateChanges={animateStats} />
    </View>
  )
}

function GameMenuOverlay({
  onClose,
  onIntro,
  onHome,
  onRestart,
  onEnd,
}: {
  onClose: () => void
  onIntro: () => void
  onHome: () => void
  onRestart: () => void
  onEnd: () => void
}) {
  return (
    <View className='overlay'>
      <View className='overlay__mask' onClick={onClose} />
      <View className='game-menu doodle-card'>
        <View className='game-menu__handle' />
        <Text className='game-menu__title'>游戏菜单</Text>
        <Text className='game-menu__subtitle'>想换个操作？当前进度会按照你的选择保存。</Text>
        <View className='game-menu__actions'>
          <DoodleButton onClick={onClose}>继续游戏</DoodleButton>
          <DoodleButton tone='yellow' onClick={onIntro}>查看新手引导</DoodleButton>
          <DoodleButton tone='cream' onClick={onHome}>返回首页 · 保留进度</DoodleButton>
          <DoodleButton tone='cream' onClick={onRestart}>重新开始本局</DoodleButton>
          <Button className='game-menu__end' onClick={onEnd}>结束本局并清除进度</Button>
        </View>
      </View>
    </View>
  )
}

function RulesOverlay({ onClose }: { onClose: () => void }) {
  return (
    <View className='overlay'>
      <View className='overlay__mask' onClick={onClose} />
      <ScrollView className='modal doodle-card' scrollY>
        <View className='modal__content'>
          <Text className='modal__title'>活动规则</Text>
          <Text className='modal__paragraph'>目标：在七天生活情境中做出饮食与生活选择，让血糖、心情、精力和饱腹保持在安全范围。</Text>
          <Text className='modal__paragraph'>操作：每个情境从左右两个选项中选择一个，随后查看数值影响和科普说明。</Text>
          <Text className='modal__paragraph'>说明：游戏中的数值均为模拟分数，不是真实血糖或医学检测结果。</Text>
          <View className='notice-box'>
            <Text>本小程序仅用于一般健康科普，不构成疾病诊断、治疗或个体化医疗建议。</Text>
          </View>
          <DoodleButton onClick={onClose}>我知道了</DoodleButton>
        </View>
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
  onMenu,
}: {
  day: number
  stats: GameStats
  event: NonNullable<ReturnType<typeof useGameLoop>['currentEvent']>
  eventIndex: number
  queueLength: number
  onChoose: (effect: Effect, index: number) => void
  onRules: () => void
  onMenu: () => void
}) {
  const slot = TIME_SLOT_META[event.group]
  const isFirstScenario = day === 1 && eventIndex === 1
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null)
  const touchStart = useRef({ x: 0, y: 0 })
  const dragXRef = useRef(0)
  const chooseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const swipeThreshold = 78

  useEffect(() => () => {
    if (chooseTimer.current) clearTimeout(chooseTimer.current)
  }, [])

  const choose = useCallback((index: number) => {
    if (exitDirection || chooseTimer.current) return
    const direction = index === 0 ? 'left' : 'right'
    setExitDirection(direction)
    void Taro.vibrateShort({ type: 'medium' }).catch(() => undefined)
    chooseTimer.current = setTimeout(() => onChoose(event.choices[index].effect, index), 330)
  }, [event.choices, exitDirection, onChoose])

  const handleTouchStart = (touchEvent: BaseEventOrig) => {
    const point = (touchEvent as ITouchEvent).touches[0]
    if (!point || exitDirection) return
    touchStart.current = { x: point.pageX, y: point.pageY }
    setIsDragging(true)
  }

  const handleTouchMove = (touchEvent: BaseEventOrig) => {
    const point = (touchEvent as ITouchEvent).touches[0]
    if (!point || !isDragging || exitDirection) return
    const deltaX = point.pageX - touchStart.current.x
    const deltaY = point.pageY - touchStart.current.y
    if (Math.abs(deltaX) < Math.abs(deltaY) + 8) return
    const nextDragX = Math.max(-240, Math.min(240, deltaX))
    dragXRef.current = nextDragX
    setDragX(nextDragX)
  }

  const handleTouchEnd = () => {
    if (!isDragging || exitDirection) return
    setIsDragging(false)
    const finalDragX = dragXRef.current
    if (finalDragX <= -swipeThreshold) {
      choose(0)
    } else if (finalDragX >= swipeThreshold) {
      choose(1)
    } else {
      dragXRef.current = 0
      setDragX(0)
    }
  }

  const leftActive = dragX < -30
  const rightActive = dragX > 30
  const dragOpacity = Math.max(0.58, 1 - Math.abs(dragX) / 420)
  const cardClassName = [
    'event-card',
    'doodle-card',
    'event-card--swipeable',
    isDragging ? 'event-card--dragging' : '',
    exitDirection ? `event-card--exit-${exitDirection}` : '',
  ].filter(Boolean).join(' ')

  return (
    <View className='game paper-bg'>
      <GameHeader day={day} stats={stats} onRules={onRules} onMenu={onMenu} />

      <ScrollView className='game-body' scrollY>
        <View className='game-body__content'>
          <View className='scene-meta'>
            <Text className='scene-meta__eyebrow'>当前场景</Text>
            <Text className='slot-label' style={{ backgroundColor: slot.bg, color: slot.color }}>
              {slot.emoji} {slot.label} · {slot.time}
            </Text>
            <Text className='event-progress'>情境 {eventIndex} / {queueLength}</Text>
          </View>
          {isFirstScenario && (
            <View className='gesture-guide'>
              <View className='gesture-guide__copy'>
                <Text className='gesture-guide__badge'>第 1 步</Text>
                <View>
                  <Text className='gesture-guide__title'>试着左右滑动卡片</Text>
                  <Text className='gesture-guide__subtitle'>向左选左边 · 向右选右边</Text>
                </View>
              </View>
              <View className='gesture-guide__track'>
                <Text className='gesture-guide__arrow'>←</Text>
                <Text className='gesture-guide__hand'>☝️</Text>
                <Text className='gesture-guide__arrow'>→</Text>
              </View>
            </View>
          )}
          <View className='swipe-hints'>
            <View className={`swipe-hint swipe-hint--left ${leftActive ? 'swipe-hint--active' : ''}`}>
              <Text className='swipe-hint__arrow'>←</Text>
              <Text className='swipe-hint__label'>{event.choices[0].label}</Text>
            </View>
            <View className={`swipe-hint swipe-hint--right ${rightActive ? 'swipe-hint--active' : ''}`}>
              <Text className='swipe-hint__label'>{event.choices[1].label}</Text>
              <Text className='swipe-hint__arrow'>→</Text>
            </View>
          </View>
          <View
            className={cardClassName}
            style={{
              transform: `translate3d(${dragX}px, 0, 0) rotate(${dragX * 0.035}deg)`,
              opacity: dragOpacity,
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            <Image
              className='event-card__image'
              src={getImage(event.image)}
              mode='aspectFill'
              lazyLoad={false}
              fadeIn={false}
            />
            <View className='event-card__content'>
              <Text className='event-card__title'>{event.title}</Text>
              <Text className='event-card__description'>{event.description}</Text>
            </View>
            <View className='choices'>
              {event.choices.map((choice, index) => (
                <Button
                  className={`choice-button choice-button--${index === 0 ? 'green' : 'yellow'}`}
                  key={`${event.id}-${index}`}
                  onClick={(clickEvent) => {
                    clickEvent.stopPropagation()
                    choose(index)
                  }}
                >
                  {choice.label}
                </Button>
              ))}
            </View>
          </View>
          <Text className='game-hint'>{isFirstScenario ? '也可以直接点击一个选项' : '左右滑动卡片，或点击一个选项'}</Text>
        </View>
      </ScrollView>
    </View>
  )
}

function ImpactStage({
  stats,
  previousStats,
  canExplain,
  transitioning,
  onExplain,
}: {
  stats: GameStats
  previousStats: GameStats
  canExplain: boolean
  transitioning: boolean
  onExplain: () => void
}) {
  const changes = STAT_CONFIG.flatMap((item) => {
    const before = previousStats[item.key]
    const after = stats[item.key]
    const diff = after - before
    if (!diff) return []
    return [{ ...item, before, after, diff }]
  })

  const hasCriticalState = stats.bloodSugar >= 80
    || stats.bloodSugar < 40
    || stats.satiety >= 90
    || stats.satiety <= 20
    || stats.energy <= 20
    || stats.mood <= 20

  return (
    <View className={`impact-stage ${transitioning ? 'impact-stage--leaving' : ''}`}>
      <Text className='impact-stage__eyebrow'>选择已生效</Text>
      <Text className='impact-stage__title'>这一选，身体状态变了</Text>
      <View className='impact-grid'>
        {changes.map((item, index) => (
          <View
            className='impact-card'
            key={item.key}
            style={{
              animationDelay: `${index * 120}ms`,
              backgroundColor: item.bg,
              borderColor: item.color,
            }}
          >
            <View className='impact-card__accent' style={{ backgroundColor: item.color }} />
            <Text className='impact-card__emoji'>{item.emoji}</Text>
            <Text className='impact-card__label'>{getImpactLabel(item.key, item.diff)}</Text>
            <Text className='impact-card__stat'>{item.label}</Text>
            <View className='impact-card__value-row'>
              <Text className='impact-card__direction' style={{ color: item.color }}>
                {item.diff > 0 ? '↑' : '↓'}
              </Text>
              <Text className='impact-card__value'>{item.diff > 0 ? '+' : ''}{item.diff}</Text>
            </View>
            <Text className='impact-card__before-after'>{item.before} → {item.after}</Text>
          </View>
        ))}
      </View>
      {hasCriticalState && (
        <View className='impact-alert'>
          <Text className='impact-alert__icon'>!</Text>
          <View>
            <Text className='impact-alert__title'>状态进入警戒区</Text>
            <Text className='impact-alert__text'>留意顶部数值，接下来的选择要更谨慎。</Text>
          </View>
        </View>
      )}
      {canExplain ? (
        <View className='impact-stage__bridge'>
          <Text className='impact-stage__bridge-text'>数值是结果，原因才能帮你做下一次选择。</Text>
          <DoodleButton tone='yellow' onClick={onExplain}>看看为什么会这样 →</DoodleButton>
          <View className='impact-stage__auto'>
            <View className='impact-stage__auto-fill' />
          </View>
          <Text className='impact-stage__auto-text'>即将自动展开解释</Text>
        </View>
      ) : (
        <View className='impact-stage__loading'>
          <View />
          <Text>先看清这次变化…</Text>
        </View>
      )}
    </View>
  )
}

function TipScreen({
  day,
  stats,
  previousStats,
  event,
  choiceLabel,
  scienceTip,
  penalty,
  onContinue,
  onRules,
  onMenu,
  showLearningGoal,
}: {
  day: number
  stats: GameStats
  previousStats: GameStats
  event: NonNullable<ReturnType<typeof useGameLoop>['currentEvent']>
  choiceLabel: string
  scienceTip: string
  penalty: PostChoicePenalty
  onContinue: () => void
  onRules: () => void
  onMenu: () => void
  showLearningGoal: boolean
}) {
  const slot = TIME_SLOT_META[event.group]
  const [showExplanation, setShowExplanation] = useState(false)
  const [canExplain, setCanExplain] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const transitionStarted = useRef(false)

  const revealExplanation = useCallback(() => {
    if (transitionStarted.current) return
    transitionStarted.current = true
    setTransitioning(true)
    transitionTimer.current = setTimeout(() => setShowExplanation(true), 420)
  }, [])

  useEffect(() => {
    const revealTimer = setTimeout(() => setCanExplain(true), 1600)
    const autoTimer = setTimeout(revealExplanation, 4200)
    return () => {
      clearTimeout(revealTimer)
      clearTimeout(autoTimer)
      if (transitionTimer.current) clearTimeout(transitionTimer.current)
    }
  }, [revealExplanation])

  const changes = STAT_CONFIG.flatMap((item) => {
    const value = stats[item.key] - previousStats[item.key]
    return value ? [{ ...item, value }] : []
  })

  return (
    <View className='game paper-bg'>
      <GameHeader
        day={day}
        stats={stats}
        previousStats={previousStats}
        animateStats
        onRules={onRules}
        onMenu={onMenu}
      />
      <ScrollView className='game-body game-body--tip' scrollY>
        <View className='game-body__content game-body__content--tip'>
          <View className='scene-meta scene-meta--tip'>
            <Text className='scene-meta__eyebrow'>刚刚的场景</Text>
            <Text className='slot-label' style={{ backgroundColor: slot.bg, color: slot.color }}>
              {slot.emoji} {slot.label} · {slot.time}
            </Text>
            <Text className='event-progress'>刚刚的情境</Text>
          </View>
          {!showExplanation ? (
            <ImpactStage
              stats={stats}
              previousStats={previousStats}
              canExplain={canExplain}
              transitioning={transitioning}
              onExplain={revealExplanation}
            />
          ) : <View className='tip-card doodle-card tip-card--enter'>
            <View className='tip-card__header'>
              <View className='tip-icon'>!</View>
              <View>
                <Text className='tip-card__eyebrow'>你选择了</Text>
                <Text className='tip-card__choice'>{choiceLabel}</Text>
              </View>
            </View>
            <View className='change-list'>
              {changes.map((item, index) => (
                <View
                  className='change-pill change-pill--enter'
                  key={item.key}
                  style={{ backgroundColor: item.bg, animationDelay: `${index * 110}ms` }}
                >
                  <Text>{item.emoji} {item.label}</Text>
                  <Text className={`change-pill__value ${item.value > 0 ? 'change-positive' : 'change-negative'}`}>
                    {item.value > 0 ? '+' : ''}{item.value}
                  </Text>
                </View>
              ))}
            </View>
            {penalty.foodComa && (
              <View className='penalty-box penalty-box--danger'>
                <Text className='penalty-box__title'>🤢 撑得大脑缺氧！</Text>
                <Text className='penalty-box__text'>饱腹感溢出，额外扣除：精力 -15、心情 -10</Text>
              </View>
            )}
            {penalty.starvation && (
              <View className='penalty-box penalty-box--warning'>
                <Text className='penalty-box__title'>😵 饿得眼冒金星！</Text>
                <Text className='penalty-box__text'>饱腹感归零，额外扣除：血糖 -10、心情 -10</Text>
              </View>
            )}
            <View className='science-box'>
              <Text className='science-box__title'>💡 为什么会这样？</Text>
              <Text className='science-box__text'>{scienceTip}</Text>
            </View>
            {showLearningGoal && (
              <View className='learning-goal'>
                <Text className='learning-goal__badge'>你已经抓住核心</Text>
                <Text className='learning-goal__title'>控糖，不是把血糖压得越低越好</Text>
                <Text className='learning-goal__text'>也不是戒掉所有碳水。目标是尽量减少大起大落，同时兼顾精力、心情和饱腹。</Text>
              </View>
            )}
            <Text className='simulation-note'>以上为游戏化模拟效果，不代表真实个体的血糖变化。</Text>
            <DoodleButton onClick={onContinue}>继续</DoodleButton>
          </View>}
        </View>
      </ScrollView>
    </View>
  )
}

function DaySummaryScreen({
  day,
  stats,
  report,
  totalDays,
  onContinue,
  onHome,
}: {
  day: number
  stats: GameStats
  report: NightlyReport | null
  totalDays: number
  onContinue: () => void
  onHome: () => void
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
          <DoodleButton tone='cream' onClick={onHome}>返回首页 · 保留进度</DoodleButton>
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
  const [showIntro, setShowIntro] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [showGameMenu, setShowGameMenu] = useState(false)
  const [hasSave, setHasSave] = useState(false)

  useEffect(() => {
    setNickname(getNickname())
    setHasSave(Boolean(getSave()))
  }, [])

  useEffect(() => {
    if (showHome || showIntro || game.phase === 'start' || !nickname.trim()) return
    setSave({ nickname: nickname.trim(), ...game.saveState() })
    setHasSave(true)
  }, [showHome, showIntro, nickname, game.phase, game.stats, game.currentDay, game.eventIndexInDay, game.saveState])

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
    setShowIntro(!hasSeenIntro())
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
    setShowIntro(false)
  }

  const restart = () => {
    if (!validateNickname()) return
    clearSave()
    game.restart()
    setShowHome(false)
    setShowIntro(false)
  }

  const endAndGoHome = () => {
    clearSave()
    setHasSave(false)
    setShowIntro(false)
    setShowGameMenu(false)
    setShowHome(true)
  }

  const returnHome = () => {
    if (nickname.trim() && game.phase !== 'start') {
      setSave({ nickname: nickname.trim(), ...game.saveState() })
      setHasSave(true)
    }
    setShowGameMenu(false)
    setShowHome(true)
  }

  const confirmRestart = async () => {
    const result = await Taro.showModal({
      title: '重新开始本局？',
      content: '当前进度会被清除，从第 1 天重新开始。',
      confirmText: '重新开始',
    })
    if (!result.confirm) return
    setShowGameMenu(false)
    restart()
  }

  const confirmEnd = async () => {
    const result = await Taro.showModal({
      title: '结束当前游戏？',
      content: '当前进度会被清除。如果只是想暂时离开，请选择「返回首页 · 保留进度」。',
      confirmText: '结束本局',
      confirmColor: '#e05a5a',
    })
    if (result.confirm) endAndGoHome()
  }

  const openIntroFromMenu = () => {
    setShowGameMenu(false)
    setShowIntro(true)
  }

  const finishIntro = () => {
    markIntroSeen()
    setShowIntro(false)
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
  } else if (showIntro) {
    content = <OnboardingScreen onContinue={finishIntro} />
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
        onMenu={() => setShowGameMenu(true)}
      />
    )
  } else if (game.phase === 'tip' && game.pendingTip && game.currentEvent) {
    content = (
      <TipScreen
        day={game.currentDay}
        stats={game.stats}
        previousStats={game.prevStats}
        event={game.currentEvent}
        choiceLabel={game.pendingTip.choiceLabel}
        scienceTip={game.pendingTip.scienceTip}
        penalty={game.pendingTip.penalty}
        onContinue={game.handleDismissTip}
        onRules={() => setShowRules(true)}
        onMenu={() => setShowGameMenu(true)}
        showLearningGoal={game.currentDay === 1 && visibleEventIndex === 1}
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
        onHome={returnHome}
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
        onHome={endAndGoHome}
      />
    )
  } else {
    content = <View className='loading paper-bg'>正在准备今天的情境……</View>
  }

  return (
    <View className='app-shell'>
      <PaperTexture />
      {content}
      {showRules && <RulesOverlay onClose={() => setShowRules(false)} />}
      {showGameMenu && (
        <GameMenuOverlay
          onClose={() => setShowGameMenu(false)}
          onIntro={openIntroFromMenu}
          onHome={returnHome}
          onRestart={confirmRestart}
          onEnd={confirmEnd}
        />
      )}
    </View>
  )
}
