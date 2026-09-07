import Taro from '@tarojs/taro'
import { GAME_DATA_VERSION } from './game-data'
import type { ChoiceRecord, GameEvent, GameOverReason, GameStats, GameTrackers, NightlyReport } from './game-data'
import type { ScienceTermId } from './science-glossary'

const PLAYER_NAME_MAX_LEN = 8

// 上线前隐私整改后统一换用新命名空间，避免测试期存档和参与历史带入新版本。
const SAVE_KEY = 'bloodsugar:save:v4'
const INTRO_SEEN_KEY = 'bloodsugar:intro-seen:v5'
const HISTORY_PREFIX = 'bloodsugar:history:v2:'
const SCIENCE_TERMS_SEEN_KEY = 'bloodsugar:science-terms-seen:v2'

export interface SaveData {
  nickname: string
  dataVersion: string
  runId: string
  phase: string
  stats: GameStats
  prevStats: GameStats
  currentDay: number
  dayQueue: (GameEvent | null)[]
  eventIndexInDay: number
  gameOverReason?: GameOverReason | ''
  pendingGameOverReason?: GameOverReason | null
  cardKey?: number
  pendingTip?: unknown
  nightlyReport?: NightlyReport | null
  eveningSkipped?: boolean
  trackers: GameTrackers
  usedIds?: number[]
  specialLowSugarDay: number
  lowSugarRiskChoicesToday: string[]
  firstDayGraceAvailable: boolean
  choiceHistory: ChoiceRecord[]
}

export interface HistoryEntry {
  id: string
  timestamp: number
  result: 'victory' | 'gameover'
  reason?: GameOverReason
  trackers: GameTrackers
  dayReached: number
  stats: GameStats
  choices: ChoiceRecord[]
  dataVersion: string
}

function historyKey(nickname: string): string {
  return `${HISTORY_PREFIX}${encodeURIComponent(nickname.trim().slice(0, PLAYER_NAME_MAX_LEN))}`
}

export function getSave(): SaveData | null {
  try {
    const value = Taro.getStorageSync(SAVE_KEY)
    if (!value || typeof value !== 'object') return null
    const save = value as SaveData
    return save.dataVersion === GAME_DATA_VERSION && save.runId ? save : null
  } catch {
    return null
  }
}

export function getHistory(nickname: string): HistoryEntry[] {
  if (!nickname.trim()) return []
  try {
    const value = Taro.getStorageSync(historyKey(nickname))
    return Array.isArray(value) ? value.filter((entry) => entry && typeof entry === 'object') : []
  } catch {
    return []
  }
}

export function appendHistory(nickname: string, entry: HistoryEntry): void {
  if (!nickname.trim() || !entry.id) return
  try {
    const history = getHistory(nickname).filter((item) => item.id !== entry.id)
    Taro.setStorageSync(historyKey(nickname), [entry, ...history].slice(0, 50))
  } catch {
    // 历史记录写入失败不应影响玩家查看结局。
  }
}

export function setSave(value: SaveData): void {
  try {
    Taro.setStorageSync(SAVE_KEY, value)
  } catch {
    // 存储空间异常不应中断当前游戏。
  }
}

export function clearSave(): void {
  try {
    Taro.removeStorageSync(SAVE_KEY)
  } catch {
    // 无存档或本地存储不可用时无需处理。
  }
}

export function hasSeenIntro(): boolean {
  try {
    return Boolean(Taro.getStorageSync(INTRO_SEEN_KEY))
  } catch {
    return false
  }
}

export function markIntroSeen(): void {
  try {
    Taro.setStorageSync(INTRO_SEEN_KEY, true)
  } catch {
    // 引导状态无法保存时，不影响开始游戏。
  }
}

export function getSeenScienceTerms(): ScienceTermId[] {
  try {
    const value = Taro.getStorageSync(SCIENCE_TERMS_SEEN_KEY)
    return Array.isArray(value)
      ? value.filter((term): term is ScienceTermId => ['GI', 'GL', 'CGM', '15-15'].includes(term))
      : []
  } catch {
    return []
  }
}

export function markScienceTermsSeen(termIds: ScienceTermId[]): ScienceTermId[] {
  const next = Array.from(new Set([...getSeenScienceTerms(), ...termIds]))
  try {
    Taro.setStorageSync(SCIENCE_TERMS_SEEN_KEY, next)
  } catch {
    // 术语学习记录无法保存时，不影响继续游戏。
  }
  return next
}
