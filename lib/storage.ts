"use client"

import type { GameStats, GameTrackers, GameEvent, NightlyReport } from "@/lib/game-data"

const NICKNAME_CACHE_KEY = "bloodsugar_nickname"
const SAVE_PREFIX = "bloodsugar_save_"
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
  phase: string
  stats: GameStats
  prevStats: GameStats
  currentDay: number
  dayQueue: (GameEvent | null)[]
  eventIndexInDay: number
  gameOverReason: string
  cardKey: number
  pendingTip: unknown
  nightlyReport: NightlyReport | null
  eveningSkipped: boolean
  trackers: GameTrackers
  usedIds: number[]
}

export function getSave(nickname: string): SaveData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(safeKey(SAVE_PREFIX, nickname))
    if (!raw) return null
    return JSON.parse(raw) as SaveData
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
  reason?: string
  trackers: GameTrackers
  dayReached: number
  stats: GameStats
}

export function getHistory(nickname: string): HistoryEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(safeKey(HISTORY_PREFIX, nickname))
    if (!raw) return []
    const arr = JSON.parse(raw) as HistoryEntry[]
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function appendHistory(nickname: string, entry: Omit<HistoryEntry, "id" | "timestamp">): void {
  if (typeof window === "undefined") return
  try {
    const list = getHistory(nickname)
    const full: HistoryEntry = {
      ...entry,
      id: `run_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
    }
    list.unshift(full)
    const maxEntries = 50
    const trimmed = list.slice(0, maxEntries)
    localStorage.setItem(safeKey(HISTORY_PREFIX, nickname), JSON.stringify(trimmed))
  } catch {}
}

export { NICKNAME_MAX_LEN }
