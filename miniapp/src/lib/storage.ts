import Taro from '@tarojs/taro'
import type { GameEvent, GameStats, GameTrackers, NightlyReport } from './game-data'

export const NICKNAME_MAX_LEN = 8

const NICKNAME_KEY = 'bloodsugar:nickname'
const SAVE_KEY = 'bloodsugar:save:v1'

export interface SaveData {
  nickname: string
  phase: string
  stats: GameStats
  prevStats: GameStats
  currentDay: number
  dayQueue: (GameEvent | null)[]
  eventIndexInDay: number
  gameOverReason?: string
  pendingGameOverReason?: string | null
  cardKey?: number
  pendingTip?: unknown
  nightlyReport?: NightlyReport | null
  eveningSkipped?: boolean
  trackers: GameTrackers
  usedIds?: number[]
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
    return value && typeof value === 'object' ? (value as SaveData) : null
  } catch {
    return null
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
