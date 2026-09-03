"use client"

import { GAME_DATA_VERSION } from "@/lib/game-data"
import type { ChoiceRecord, GameEvent, GameOverReason, GameStats, GameTrackers, NightlyReport } from "@/lib/game-data"

const NICKNAME_CACHE_KEY = "bloodsugar_nickname"
// v3 更新了全部选项、数值与死亡规则；旧存档不能安全续玩。
const SAVE_PREFIX = "bloodsugar_save_v3_"
const HISTORY_PREFIX = "bloodsugar_history_"

const NICKNAME_MAX_LEN = 20

export function getNicknameCache(): string {
  if (typeof window === "undefined") return ""
  try {
    const s = localStorage.getItem(NICKNAME_CACHE_KEY)
    return s ? String(s).slice(0, NICKNAME_MAX_LEN) : ""
  } catch {
    return ""
  }
}

export function setNicknameCache(nickname: string): void {
  if (typeof window === "undefined") return
  try {
    const trimmed = String(nickname).trim().slice(0, NICKNAME_MAX_LEN)
    localStorage.setItem(NICKNAME_CACHE_KEY, trimmed)
  } catch {}
}

function safeKey(prefix: string, nickname: string): string {
  return prefix + encodeURIComponent(String(nickname).trim().slice(0, NICKNAME_MAX_LEN))
}

// ----- Save (in-progress game) -----

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
  gameOverReason: GameOverReason | ""
  pendingGameOverReason?: GameOverReason | null
  cardKey: number
  pendingTip: unknown
  nightlyReport: NightlyReport | null
  eveningSkipped: boolean
  trackers: GameTrackers
  usedIds: number[]
  specialLowSugarDay: number
  lowSugarRiskChoicesToday: string[]
  firstDayGraceAvailable: boolean
  choiceHistory: ChoiceRecord[]
}

export function getSave(nickname: string): SaveData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(safeKey(SAVE_PREFIX, nickname))
    if (!raw) return null
    const parsed = JSON.parse(raw) as SaveData
    return parsed.dataVersion === GAME_DATA_VERSION && parsed.runId ? parsed : null
  } catch {
    return null
  }
}

export function setSave(nickname: string, data: SaveData): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(safeKey(SAVE_PREFIX, nickname), JSON.stringify(data))
  } catch {}
}

export function clearSave(nickname: string): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(safeKey(SAVE_PREFIX, nickname))
  } catch {}
}

// ----- History (past games for recap) -----

export interface HistoryEntry {
  id: string
  timestamp: number
  result: "victory" | "gameover"
  reason?: GameOverReason
  trackers: GameTrackers
  dayReached: number
  stats: GameStats
  choices: ChoiceRecord[]
  dataVersion: string
}

export function getHistory(nickname: string): HistoryEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(safeKey(HISTORY_PREFIX, nickname))
    if (!raw) return []
    const arr = JSON.parse(raw) as HistoryEntry[]
    return Array.isArray(arr)
      ? arr.map((entry) => ({ ...entry, choices: entry.choices ?? [], dataVersion: entry.dataVersion ?? "legacy" }))
      : []
  } catch {
    return []
  }
}

export function appendHistory(nickname: string, entry: HistoryEntry): void {
  if (typeof window === "undefined") return
  try {
    const list = getHistory(nickname).filter((item) => item.id !== entry.id)
    const trimmed = [entry, ...list].slice(0, 50)
    localStorage.setItem(safeKey(HISTORY_PREFIX, nickname), JSON.stringify(trimmed))
  } catch {}
}

export { NICKNAME_MAX_LEN }
