import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Button, Image, Input, ScrollView, Text, View } from '@tarojs/components'
import type { BaseEventOrig, ITouchEvent } from '@tarojs/components/types/common'
import Taro from '@tarojs/taro'
import { useGameLoop } from '../../hooks/useGameLoop'
import {
  DAY_NAMES,
  GAME_DATA_VERSION,
  GAME_OVER_MESSAGES,
  STAT_CONFIG,
  TIME_SLOT_META,
  type Effect,
  type GameStats,
  type GameOverReason,
  type PostChoicePenalty,
} from '../../lib/game-data'
import { trackEvent } from '../../lib/analytics'
import {
  NICKNAME_MAX_LEN,
  clearSave,
  appendHistory,
  getHistory,
  getNickname,
  getSeenScienceTerms,
  getSave,
  markIntroSeen,
  markScienceTermsSeen,
  setNickname as cacheNickname,
  setSave,
} from '../../lib/storage'
import {
  SCIENCE_TERMS,
  SCIENCE_TERM_ORDER,
  findScienceTerms,
  getFirstEncounterCopy,
  getFirstEncounterTerms,
  type ScienceTermId,
} from '../../lib/science-glossary'
import { RecapScreen } from './recap'
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

function OnboardingScreen({
  onContinue,
  continueLabel = '我明白了，开始挑战',
}: {
  onContinue: () => void
  continueLabel?: string
}) {
  return (
    <ScrollView className='page-scroll paper-bg' scrollY>
      <View className='onboarding'>
        <View className='onboarding__kicker'>开局前 · 30 秒</View>
        <Text className='onboarding__title'>为什么要关注血糖？</Text>
        <Text className='onboarding__subtitle'>困、馋、饿的原因不只一个；血糖变化，是理解日常精力与食欲的一条重要线索。</Text>
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

        <View className='onboarding__lesson doodle-card'>
          <Text className='onboarding__lesson-number'>01</Text>
          <View className='onboarding__lesson-copy'>
            <Text className='onboarding__lead'>吃完一顿饭，身体在做什么？</Text>
            <Text className='onboarding__body'>米饭、面包和水果里的碳水会被分解成葡萄糖进入血液，血糖上升本来就是正常反应。更值得留意的，是它是否反复升得太快、太高，或因为长时间不吃和错误补救而降得过低。</Text>
          </View>
        </View>

        <View className='onboarding__lesson doodle-card'>
          <Text className='onboarding__lesson-number'>02</Text>
          <View className='onboarding__lesson-copy'>
            <Text className='onboarding__lead'>没得糖尿病，也值得了解吗？</Text>
            <Text className='onboarding__body'>当然值得。食物种类、份量、搭配、进食顺序、睡眠和运动，都会影响一整天的血糖节奏。读懂这些选择，不需要等到生病以后才开始。</Text>
          </View>
        </View>

        <View className='onboarding__mission'>
          <Text className='onboarding__mission-badge'>这次挑战</Text>
          <View className='onboarding__mission-copy'>
            <Text className='onboarding__mission-title'>不是把血糖压得越低越好，也不是戒掉所有碳水</Text>
            <Text className='onboarding__mission-text'>你会经历七天生活情境：做选择、看反馈，找到兼顾血糖、精力、心情和饱腹的稳定节奏。</Text>
          </View>
        </View>
        <View className='onboarding__footer'>
          <Text className='onboarding__note'>这不是健康测试，也不要求你监测血糖。</Text>
          <DoodleButton onClick={onContinue}>{continueLabel}</DoodleButton>
        </View>
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
          <Button
            className='rules-button rules-button--inline header-action-button header-action-button--rules'
            onClick={(event) => {
              event.stopPropagation()
              onRules()
            }}
          >
            规则
          </Button>
          <Button
            className='rules-button rules-button--inline header-action-button header-action-button--menu'
            onClick={(event) => {
              event.stopPropagation()
              onMenu()
            }}
          >
            菜单
          </Button>
        </View>
      </View>
      <StatGrid stats={stats} previousStats={previousStats} animateChanges={animateStats} />
    </View>
  )
}

function GameMenuOverlay({
  onClose,
  onIntro,
  onGlossary,
  onHome,
  onRestart,
  onEnd,
}: {
  onClose: () => void
  onIntro: () => void
  onGlossary: () => void
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
          <DoodleButton tone='cream' onClick={onGlossary}>血糖小词典</DoodleButton>
          <DoodleButton tone='cream' onClick={onHome}>返回首页 · 保留进度</DoodleButton>
          <DoodleButton tone='cream' onClick={onRestart}>重新开始本局</DoodleButton>
          <Button className='game-menu__end' onClick={onEnd}>结束本局并清除进度</Button>
        </View>
      </View>
    </View>
  )
}

function GlossaryOverlay({ onClose }: { onClose: () => void }) {
  return (
    <View className='overlay'>
      <View className='overlay__mask' onClick={onClose} />
      <ScrollView className='modal glossary-modal doodle-card' scrollY>
        <View className='modal__content'>
          <Text className='modal__title'>📖 血糖小词典</Text>
          <Text className='glossary-modal__intro'>游戏里遇到这些词时，可以随时回来复习。</Text>
          <View className='glossary-list'>
            {SCIENCE_TERM_ORDER.map((termId) => {
              const term = SCIENCE_TERMS[termId]
              return (
                <View className='glossary-item' key={termId}>
                  <Text className='glossary-item__title'>{term.title}</Text>
                  <Text className='glossary-item__definition'>{term.definition}</Text>
                </View>
              )
            })}
          </View>
          <DoodleButton onClick={onClose}>返回游戏</DoodleButton>
        </View>
      </ScrollView>
    </View>
  )
}

function RulesOverlay({ onClose }: { onClose: () => void }) {
  return (
    <View className='overlay'>
      <View className='overlay__mask' onClick={onClose} />
      <ScrollView className='modal rules-modal doodle-card' scrollY>
        <View className='modal__content'>
          <Text className='modal__title'>游戏规则</Text>
          <Text className='rules-modal__summary'>目标很简单：在 7 天生活情境中做选择，别让四项状态失控。</Text>

          <View className='rules-modal__section'>
            <Text className='rules-modal__heading'>怎么玩？</Text>
            <Text className='rules-modal__step'>1. 每个情境会出现两个选项，可左右滑动卡片，也可直接点击。</Text>
            <Text className='rules-modal__step'>2. 选择后先看四项数值变化，再阅读“血糖小课堂”。</Text>
            <Text className='rules-modal__step'>3. 一天结束后状态会结算；坚持完成第 7 天即可通关。</Text>
          </View>

          <View className='rules-modal__section'>
            <Text className='rules-modal__heading'>四项数值要追求什么？</Text>
            <View className='rules-stat rules-stat--blood'>
              <Text className='rules-stat__title'>🩸 血糖：追求平稳，不是越低越好</Text>
              <Text className='rules-stat__body'>40–60 是游戏中的理想区间；低于 40 或达到 80 会进入警戒。份量过大、精制碳水集中，容易升得太高；长时间不吃、空腹高强度运动等连续行为，则可能降得过低。</Text>
            </View>
            <View className='rules-stat rules-stat--mood'>
              <Text className='rules-stat__title'>😊 心情：代表选择能不能舒服地坚持</Text>
              <Text className='rules-stat__body'>过度克制、压力和糟糕体验会消耗心情。尽量保持较高，降到 0 会结束本局。</Text>
            </View>
            <View className='rules-stat rules-stat--energy'>
              <Text className='rules-stat__title'>⚡ 精力：代表当下的体力与清醒程度</Text>
              <Text className='rules-stat__body'>空腹、熬夜和过度运动会消耗精力。尽量保持较高，降到 0 会结束本局。</Text>
            </View>
            <View className='rules-stat rules-stat--satiety'>
              <Text className='rules-stat__title'>🍊 饱腹：追求舒服，不是越满越好</Text>
              <Text className='rules-stat__body'>40–75 较舒服；过低会挨饿，过高会吃撑，并连带影响心情和精力。</Text>
            </View>
          </View>

          <View className='rules-modal__section rules-modal__section--danger'>
            <Text className='rules-modal__heading'>什么情况会结束游戏？</Text>
            <Text className='rules-modal__step'>• 血糖模拟分超过 100，触发“高糖危机”</Text>
            <Text className='rules-modal__step'>• 连续做出至少 2 次低糖风险行为，又跌破当日危险线，触发“低糖危机”</Text>
            <Text className='rules-modal__step'>• 心情或精力降到 0</Text>
            <Text className='rules-modal__aside'>第 1 天首次越界有一次新手保护；之后再越界，本局就会结束。</Text>
          </View>

          <View className='rules-modal__tip'>
            <Text className='rules-modal__tip-title'>别只找“看起来最健康”的答案</Text>
            <Text className='rules-modal__tip-body'>同一种食物，份量、搭配、加工方式和当时的身体状态都可能改变结果。选完认真看看小课堂，才是这局真正要带走的东西。</Text>
          </View>

          <View className='notice-box'>
            <Text>所有数值都是 0–100 的游戏模拟分数，不是真实血糖或医学检测结果。本小程序仅用于一般健康科普，不构成疾病诊断、治疗或个体化医疗建议。</Text>
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
  hasHistory,
  onHistory,
  showAnalytics,
  onAnalytics,
}: {
  nickname: string
  setNickname: (value: string) => void
  hasSave: boolean
  onStart: () => void
  onContinue: () => void
  hasHistory: boolean
  onHistory: () => void
  showAnalytics: boolean
  onAnalytics: () => void
}) {
  return (
    <ScrollView className='page-scroll paper-bg' scrollY>
      <View className='home'>
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
          {hasHistory && <DoodleButton tone='cream' onClick={onHistory}>参与历史与复盘</DoodleButton>}
          {showAnalytics && (
            <Button className='analytics-entry' onClick={onAnalytics}>📊 测试数据看板</Button>
          )}
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
            <View className='event-card__content'>
              <View className='event-card__context'>
                <Text
                  className='slot-label event-card__slot'
                  style={{ backgroundColor: slot.bg, color: slot.color }}
                >
                  {slot.emoji} {slot.label} · {slot.time}
                </Text>
                <Text className='event-card__progress'>情境 {eventIndex} / {queueLength}</Text>
              </View>
              <Text className='event-card__title'>{event.title}</Text>
              <Text className='event-card__description'>{event.description}</Text>
            </View>
            <Image
              className='event-card__image'
              src={getImage(event.image)}
              mode='aspectFill'
              lazyLoad={false}
              fadeIn={false}
            />
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

function TipScreen({
  day,
  stats,
  previousStats,
  event,
  choiceLabel,
  scienceTip,
  penalty,
  boundaryWarning,
  seenScienceTerms,
  onScienceTermsSeen,
  onContinue,
  onRules,
  onMenu,
}: {
  day: number
  stats: GameStats
  previousStats: GameStats
  event: NonNullable<ReturnType<typeof useGameLoop>['currentEvent']>
  choiceLabel: string
  scienceTip: string
  penalty: PostChoicePenalty
  boundaryWarning?: string
  seenScienceTerms: ScienceTermId[]
  onScienceTermsSeen: (termIds: ScienceTermId[]) => void
  onContinue: () => void
  onRules: () => void
  onMenu: () => void
}) {
  const [expandedTerm, setExpandedTerm] = useState<ScienceTermId | null>(null)
  const slot = TIME_SLOT_META[event.group]
  const changes = STAT_CONFIG.flatMap((item) => {
    const value = stats[item.key] - previousStats[item.key]
    return value ? [{ ...item, value }] : []
  })
  const hasCriticalState = stats.bloodSugar >= 80
    || stats.bloodSugar < 40
    || stats.satiety >= 90
    || stats.satiety <= 20
    || stats.energy <= 20
    || stats.mood <= 20
  const encounteredTerms = useMemo(
    () => findScienceTerms(`${choiceLabel}\n${scienceTip}`),
    [choiceLabel, scienceTip],
  )
  const firstEncounterTerms = useMemo(
    () => getFirstEncounterTerms(encounteredTerms, seenScienceTerms),
    [encounteredTerms, seenScienceTerms],
  )
  const firstEncounterCopy = useMemo(
    () => getFirstEncounterCopy(firstEncounterTerms),
    [firstEncounterTerms],
  )

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
          <View className='tip-card doodle-card tip-card--enter'>
            <View className='tip-card__header'>
              <Text className='tip-card__eyebrow'>选择生效</Text>
              <Text className='tip-card__choice'>{choiceLabel}</Text>
            </View>
            <View className='change-list'>
              {changes.map((item, index) => (
                <View
                  className='change-pill change-pill--enter'
                  key={item.key}
                  style={{
                    backgroundColor: item.bg,
                    borderColor: item.color,
                    animationDelay: `${index * 120}ms`,
                  }}
                >
                  <Text className='change-pill__label'>{item.emoji} {item.label}</Text>
                  <View className='change-pill__value-row' style={{ color: item.color }}>
                    <Text className='change-pill__direction'>{item.value > 0 ? '↑' : '↓'}</Text>
                    <Text className='change-pill__value'>{item.value > 0 ? '+' : ''}{item.value}</Text>
                  </View>
                </View>
              ))}
            </View>
            {hasCriticalState && (
              <View className='impact-alert impact-alert--compact'>
                <Text className='impact-alert__title'>⚠️ 状态进入警戒区，接下来的选择要更谨慎</Text>
              </View>
            )}
            {boundaryWarning && (
              <View className='penalty-box penalty-box--warning penalty-box--compact'>
                <Text className='penalty-box__title'>🛟 本次没有直接结束</Text>
                <Text className='penalty-box__text'>{boundaryWarning}</Text>
              </View>
            )}
            {penalty.foodComa && (
              <View className='penalty-box penalty-box--danger penalty-box--compact'>
                <Text className='penalty-box__title'>😮‍💨 吃得有点撑，状态打了折扣</Text>
                <Text className='penalty-box__text'>这次确实吃过量了，额外扣除：精力 -8、心情 -5</Text>
              </View>
            )}
            {penalty.starvation && (
              <View className='penalty-box penalty-box--warning penalty-box--compact'>
                <Text className='penalty-box__title'>😵 饿过头，状态开始失控！</Text>
                <Text className='penalty-box__text'>饱腹感归零，额外扣除：血糖 -5、精力 -10、心情 -8</Text>
              </View>
            )}
            <View className='science-box'>
              <View className='science-box__heading'>
                <Text className='science-box__title'>💡 血糖小课堂</Text>
                {encounteredTerms.length > 0 && firstEncounterTerms.length === 0 && (
                  <View className='science-term-chips'>
                    {encounteredTerms.map((termId) => (
                      <Button
                        className={`science-term-chip ${expandedTerm === termId ? 'science-term-chip--active' : ''}`}
                        key={termId}
                        onClick={() => setExpandedTerm((current) => current === termId ? null : termId)}
                      >
                        {SCIENCE_TERMS[termId].label} ⓘ
                      </Button>
                    ))}
                  </View>
                )}
              </View>
              <Text className='science-box__text'>{scienceTip}</Text>
              {firstEncounterTerms.length > 0 && (
                <View className='science-term-note science-term-note--first'>
                  <View className='science-term-note__copy'>
                    <Text className='science-term-note__title'>📖 新概念 · {firstEncounterCopy.title}</Text>
                    <Text className='science-term-note__definition'>{firstEncounterCopy.definition}</Text>
                  </View>
                  <Button
                    className='science-term-note__done'
                    onClick={() => onScienceTermsSeen(firstEncounterTerms)}
                  >
                    知道了
                  </Button>
                </View>
              )}
              {firstEncounterTerms.length === 0 && expandedTerm && (
                <View className='science-term-note'>
                  <View className='science-term-note__copy'>
                    <Text className='science-term-note__title'>{SCIENCE_TERMS[expandedTerm].title}</Text>
                    <Text className='science-term-note__definition'>{SCIENCE_TERMS[expandedTerm].definition}</Text>
                  </View>
                </View>
              )}
            </View>
            <Text className='simulation-note'>以上为游戏化模拟效果，不代表真实个体的血糖变化。</Text>
            <DoodleButton onClick={onContinue}>继续</DoodleButton>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

function DayTransitionScreen({ onContinue }: { onContinue: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onContinue, 300)
    return () => clearTimeout(timer)
  }, [onContinue])

  return (
    <View className='loading paper-bg'>正在进入下一天……</View>
  )
}

function EndScreen({
  victory,
  nickname,
  reason,
  trackers,
  onRestart,
  onHome,
  onRecap,
}: {
  victory: boolean
  nickname: string
  reason?: GameOverReason | ''
  trackers: { peakBsCount: number; foodComaCount: number; hangoverFreeDays: number }
  onRestart: () => void
  onHome: () => void
  onRecap: () => void
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
          <DoodleButton tone='yellow' onClick={onRecap}>查看本局复盘</DoodleButton>
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
  const [introMode, setIntroMode] = useState<'start' | 'review' | null>(null)
  const [showRecap, setShowRecap] = useState(false)
  const [activeOverlay, setActiveOverlay] = useState<'rules' | 'menu' | 'glossary' | null>(null)
  const [seenScienceTerms, setSeenScienceTerms] = useState<ScienceTermId[]>([])
  const [hasSave, setHasSave] = useState(false)
  const [hasHistory, setHasHistory] = useState(false)
  const gameSessionStartedAt = useRef<number | null>(null)
  const lastSceneKey = useRef('')
  const previousPhase = useRef(game.phase)
  const showAnalytics = useMemo(() => {
    try {
      return Taro.getAccountInfoSync()?.miniProgram?.envVersion === 'develop'
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    const cachedNickname = getNickname()
    setNickname(cachedNickname)
    setHasSave(Boolean(getSave()))
    setHasHistory(Boolean(cachedNickname && getHistory(cachedNickname).length))
    setSeenScienceTerms(getSeenScienceTerms())
  }, [])

  useEffect(() => {
    setHasHistory(Boolean(nickname.trim() && getHistory(nickname.trim()).length))
  }, [nickname])

  useEffect(() => {
    if (showHome || introMode || showRecap || game.phase === 'start' || !nickname.trim()) return
    setSave({ nickname: nickname.trim(), ...game.saveState() })
    setHasSave(true)
  }, [showHome, introMode, showRecap, nickname, game.phase, game.stats, game.currentDay, game.eventIndexInDay, game.saveState])

  useEffect(() => {
    if (showHome || introMode || game.phase !== 'playing' || !game.currentEvent) return
    const sceneKey = `${game.currentDay}:${game.eventIndexInDay}:${game.currentEvent.id}`
    if (lastSceneKey.current === sceneKey) return
    lastSceneKey.current = sceneKey
    trackEvent('scene_view', {
      day: game.currentDay,
      event_id: game.currentEvent.id,
      event_group: game.currentEvent.group,
    })
  }, [showHome, introMode, game.phase, game.currentDay, game.eventIndexInDay, game.currentEvent])

  useEffect(() => {
    const priorPhase = previousPhase.current
    previousPhase.current = game.phase
    if (priorPhase === game.phase) return

    const durationSeconds = gameSessionStartedAt.current
      ? Math.max(0, Math.round((Date.now() - gameSessionStartedAt.current) / 1000))
      : 0

    if (game.phase === 'victory') {
      const grade = game.trackers.peakBsCount === 0
        ? 'S'
        : game.trackers.peakBsCount <= 3
          ? 'A'
          : game.trackers.peakBsCount <= 6
            ? 'B'
            : 'C'
      trackEvent('game_complete', {
        duration_seconds: durationSeconds,
        grade,
        peak_bs_count: game.trackers.peakBsCount,
        food_coma_count: game.trackers.foodComaCount,
        hangover_free_days: game.trackers.hangoverFreeDays,
      })
      if (game.runId && nickname.trim()) {
        appendHistory(nickname.trim(), {
          id: game.runId,
          timestamp: Date.now(),
          result: 'victory',
          trackers: game.trackers,
          dayReached: game.currentDay,
          stats: game.stats,
          choices: game.choiceHistory,
          dataVersion: GAME_DATA_VERSION,
        })
        clearSave()
        setHasSave(false)
        setHasHistory(true)
      }
    } else if (game.phase === 'gameover') {
      trackEvent('game_over', {
        day: game.currentDay,
        duration_seconds: durationSeconds,
        game_over_reason: game.gameOverReason || 'unknown',
        peak_bs_count: game.trackers.peakBsCount,
        food_coma_count: game.trackers.foodComaCount,
        hangover_free_days: game.trackers.hangoverFreeDays,
      })
      if (game.runId && nickname.trim() && game.gameOverReason) {
        appendHistory(nickname.trim(), {
          id: game.runId,
          timestamp: Date.now(),
          result: 'gameover',
          reason: game.gameOverReason,
          trackers: game.trackers,
          dayReached: game.currentDay,
          stats: game.stats,
          choices: game.choiceHistory,
          dataVersion: GAME_DATA_VERSION,
        })
        clearSave()
        setHasSave(false)
        setHasHistory(true)
      }
    }
  }, [game.phase, game.currentDay, game.gameOverReason, game.trackers, game.runId, game.stats, game.choiceHistory, nickname])

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
    gameSessionStartedAt.current = Date.now()
    lastSceneKey.current = ''
    game.handleStart()
    setShowHome(false)
    setIntroMode('start')
    trackEvent('game_start', { shows_intro: true })
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
    gameSessionStartedAt.current = Date.now()
    lastSceneKey.current = ''
    setShowHome(false)
    setIntroMode(null)
    trackEvent('game_resume', {
      day: saved.currentDay,
      phase: saved.phase,
    })
  }

  const restart = () => {
    if (!validateNickname()) return
    clearSave()
    gameSessionStartedAt.current = Date.now()
    lastSceneKey.current = ''
    game.restart()
    setShowHome(false)
    setIntroMode(null)
    trackEvent('game_restart', {
      day: game.currentDay,
      phase: game.phase,
    })
  }

  const endAndGoHome = () => {
    clearSave()
    setHasSave(false)
    setIntroMode(null)
    setShowRecap(false)
    setActiveOverlay(null)
    setShowHome(true)
    gameSessionStartedAt.current = null
    lastSceneKey.current = ''
  }

  const returnHome = () => {
    if (nickname.trim() && game.phase !== 'start') {
      setSave({ nickname: nickname.trim(), ...game.saveState() })
      setHasSave(true)
      trackEvent('game_exit', {
        day: game.currentDay,
        event_id: game.currentEvent?.id,
        phase: game.phase,
        exit_type: 'save_and_home',
      })
    }
    setActiveOverlay(null)
    setShowHome(true)
  }

  const confirmRestart = async () => {
    const result = await Taro.showModal({
      title: '重新开始本局？',
      content: '当前进度会被清除，从第 1 天重新开始。',
      confirmText: '重新开始',
    })
    if (!result.confirm) return
    setActiveOverlay(null)
    restart()
  }

  const confirmEnd = async () => {
    const result = await Taro.showModal({
      title: '结束当前游戏？',
      content: '当前进度会被清除。如果只是想暂时离开，请选择「返回首页 · 保留进度」。',
      confirmText: '结束本局',
      confirmColor: '#e05a5a',
    })
    if (result.confirm) {
      trackEvent('game_exit', {
        day: game.currentDay,
        event_id: game.currentEvent?.id,
        phase: game.phase,
        exit_type: 'clear_progress',
      })
      endAndGoHome()
    }
  }

  const openIntroFromMenu = () => {
    setActiveOverlay(null)
    setIntroMode('review')
  }

  const openRecap = () => {
    setActiveOverlay(null)
    setIntroMode(null)
    setShowRecap(true)
  }

  const closeRecapToHome = () => {
    setShowRecap(false)
    setShowHome(true)
  }

  const finishIntro = () => {
    markIntroSeen()
    trackEvent('intro_complete', { source: introMode || 'unknown' })
    setIntroMode(null)
  }

  const openRules = () => setActiveOverlay('rules')
  const openGameMenu = () => setActiveOverlay('menu')

  const choose = (effect: Effect, index: number) => {
    const event = game.currentEvent
    if (!event) return
    const selectedChoice = event.choices[index]
    trackEvent('choice_submit', {
      day: game.currentDay,
      event_id: event.id,
      event_group: event.group,
      choice_id: selectedChoice.id.toLowerCase(),
      choice_position: index === 0 ? 'left' : 'right',
    })
    game.handleChoose(effect, index)
  }

  let content: ReactNode
  if (showRecap) {
    content = (
      <RecapScreen
        nickname={nickname || '小糖'}
        history={getHistory(nickname.trim())}
        onBack={closeRecapToHome}
      />
    )
  } else if (introMode) {
    content = (
      <OnboardingScreen
        onContinue={finishIntro}
        continueLabel={introMode === 'review' ? '返回游戏' : '我明白了，开始挑战'}
      />
    )
  } else if (showHome) {
    content = (
      <HomeScreen
        nickname={nickname}
        setNickname={setNickname}
        hasSave={hasSave}
        onStart={start}
        onContinue={resume}
        hasHistory={hasHistory}
        onHistory={openRecap}
        showAnalytics={showAnalytics}
        onAnalytics={() => void Taro.navigateTo({ url: '/pages/analytics/index' })}
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
        onChoose={choose}
        onRules={openRules}
        onMenu={openGameMenu}
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
        boundaryWarning={game.pendingTip.boundaryWarning}
        seenScienceTerms={seenScienceTerms}
        onScienceTermsSeen={(termIds) => setSeenScienceTerms(markScienceTermsSeen(termIds))}
        onContinue={game.handleDismissTip}
        onRules={openRules}
        onMenu={openGameMenu}
      />
    )
  } else if (game.phase === 'day-summary') {
    content = <DayTransitionScreen onContinue={game.handleDaySummaryDone} />
  } else if (game.phase === 'victory' || game.phase === 'gameover') {
    content = (
      <EndScreen
        victory={game.phase === 'victory'}
        nickname={nickname || '小糖'}
        reason={game.gameOverReason}
        trackers={game.trackers}
        onRestart={restart}
        onHome={endAndGoHome}
        onRecap={openRecap}
      />
    )
  } else {
    content = <View className='loading paper-bg'>正在准备今天的情境……</View>
  }

  return (
    <View className='app-shell'>
      <PaperTexture />
      {content}
      {activeOverlay === 'rules' && <RulesOverlay onClose={() => setActiveOverlay(null)} />}
      {activeOverlay === 'menu' && (
        <GameMenuOverlay
          onClose={() => setActiveOverlay(null)}
          onIntro={openIntroFromMenu}
          onGlossary={() => setActiveOverlay('glossary')}
          onHome={returnHome}
          onRestart={confirmRestart}
          onEnd={confirmEnd}
        />
      )}
      {activeOverlay === 'glossary' && <GlossaryOverlay onClose={() => setActiveOverlay(null)} />}
    </View>
  )
}
