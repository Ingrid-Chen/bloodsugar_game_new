import Taro from '@tarojs/taro'
import { GAME_DATA_VERSION } from './game-data'
import type { ChoiceRecord, GameEvent, GameOverReason, GameStats, GameTrackers, NightlyReport } from './game-data'

export const NICKNAME_MAX_LEN = 8

const NICKNAME_KEY = 'bloodsugar:nickname'
// v3 更新了全部选项、数值与死亡规则；旧存档不能安全续玩。
const SAVE_KEY = 'bloodsugar:save:v3'
// 引导文案和入口发生明显变化时升级版本，让老用户也能看到一次。
const INTRO_SEEN_KEY = 'bloodsugar:intro-seen:v3'
const HISTORY_PREFIX = 'bloodsugar:history:v1:'

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
  return `${HISTORY_PREFIX}${encodeURIComponent(nickname.trim().slice(0, NICKNAME_MAX_LEN))}`
}

export function getNickname(): string {
  try {
    return String(Taro.getStorageSync(NICKNAME_KEY) || '')
  } catch {
    return ''
  }
}

export function setNickname(value: string): void {
  try {
    Taro.setStorageSync(NICKNAME_KEY, value.trim().slice(0, NICKNAME_MAX_LEN))
  } catch {
    // 本地存储不可用时仍允许继续游戏，只是不保留昵称。
  }
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
