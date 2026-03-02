"use client"

import { useCallback, useRef, useState } from "react"
import {
  INITIAL_STATS,
  applyInterMealMetabolism,
  applyDayEndDecay,
  computeNightlyReport,
  computeChoiceResult,
  generateDayQueue,
  checkGameOver,
  type GameStats,
  type GameEvent,
  type GameTrackers,
  type NightlyReport,
  type PostChoicePenalty,
  type Effect,
} from "@/lib/game-data"
import type { SaveData } from "@/lib/storage"

const TOTAL_DAYS = 7

export type Phase = "start" | "playing" | "tip" | "day-summary" | "gameover" | "victory"

export interface PendingTip {
  choiceLabel: string
  scienceTip: string
  effect: Effect
  penalty: PostChoicePenalty
}

export function useGameLoop() {
  const [phase, setPhase] = useState<Phase>("start")
  const [stats, setStats] = useState<GameStats>({ ...INITIAL_STATS })
  const [prevStats, setPrevStats] = useState<GameStats>({ ...INITIAL_STATS })
  const [currentDay, setCurrentDay] = useState(1)
  const [dayQueue, setDayQueue] = useState<(GameEvent | null)[]>([])
  const [eveningSkipped, setEveningSkipped] = useState(false)
  const [eventIndexInDay, setEventIndexInDay] = useState(0)
  const [gameOverReason, setGameOverReason] = useState("")
  const [cardKey, setCardKey] = useState(0)
  const [pendingTip, setPendingTip] = useState<PendingTip | null>(null)
  const [pendingGameOverReason, setPendingGameOverReason] = useState<string | null>(null)
  const [nightlyReport, setNightlyReport] = useState<NightlyReport | null>(null)
  const [trackers, setTrackers] = useState<GameTrackers>({
    peakBsCount: 0,
    foodComaCount: 0,
    hangoverFreeDays: 0,
  })
  const usedIdsRef = useRef<Set<number>>(new Set())

  const startNewDay = useCallback((day: number) => {
    const { queue, eveningSkipped: evSkipped } = generateDayQueue(usedIdsRef.current, day)
    setDayQueue(queue)
    setEveningSkipped(evSkipped)
    setEventIndexInDay(0)
    setCurrentDay(day)
    setCardKey((k) => k + 1)
    setPhase("playing")
  }, [])

  const restart = useCallback(() => {
    setStats({ ...INITIAL_STATS })
    setPrevStats({ ...INITIAL_STATS })
    setGameOverReason("")
    setPendingTip(null)
    setNightlyReport(null)
    setTrackers({ peakBsCount: 0, foodComaCount: 0, hangoverFreeDays: 0 })
    usedIdsRef.current = new Set()
    startNewDay(1)
  }, [startNewDay])

  const handleStart = useCallback(() => {
    setStats({ ...INITIAL_STATS })
    setPrevStats({ ...INITIAL_STATS })
    setTrackers({ peakBsCount: 0, foodComaCount: 0, hangoverFreeDays: 0 })
    usedIdsRef.current = new Set()
    startNewDay(1)
  }, [startNewDay])

  const handleChoose = useCallback(
    (choiceEffect: Effect, choiceIndex: number) => {
      const queue = dayQueue
      const idx = eventIndexInDay
      const currentEvent = queue[idx]
      if (!currentEvent || typeof currentEvent !== "object") return
      const choice = currentEvent.choices[choiceIndex]
      if (!choice) return

      const result = computeChoiceResult(
        stats,
        trackers,
        { label: choice.label, effect: choice.effect, scienceTip: choice.scienceTip },
        currentEvent.preEffect
      )

      if ("deathReason" in result) {
        setGameOverReason(result.deathReason)
        setPendingGameOverReason(result.deathReason)
        setPendingTip({
          choiceLabel: choice.label,
          scienceTip: choice.scienceTip,
          effect: choice.effect,
          penalty: { foodComa: false, starvation: false },
        })
        setPhase("tip")
        return
      }

      setPrevStats(stats)
      setStats(result.nextStats)
      setTrackers(result.nextTrackers)
      setPendingTip(result.pendingTip)
      setPhase("tip")
    },
    [dayQueue, eventIndexInDay, stats, trackers]
  )

  const handleDismissTip = useCallback(() => {
    if (pendingGameOverReason) {
      setGameOverReason(pendingGameOverReason)
      setPendingGameOverReason(null)
      setPendingTip(null)
      setPhase("gameover")
      return
    }
    setPendingTip(null)
    let s = stats
    let nextIdx = eventIndexInDay + 1

    s = applyInterMealMetabolism(s)
    while (nextIdx < 5 && dayQueue[nextIdx] === null) {
      s = applyInterMealMetabolism(s)
      nextIdx++
    }

    if (nextIdx >= 5) {
      if (eveningSkipped) s = applyInterMealMetabolism(s)
      const sleepBs = s.bloodSugar
      setTrackers((prev) => ({
        ...prev,
        hangoverFreeDays: prev.hangoverFreeDays + (sleepBs >= 40 && sleepBs < 80 ? 1 : 0),
      }))
      setStats(s)
      setNightlyReport(computeNightlyReport(s))
      setPhase("day-summary")
      return
    }

    setPrevStats(stats)
    setStats(s)
    setEventIndexInDay(nextIdx)
    setCardKey((k) => k + 1)
    setPhase("playing")
  }, [stats, eventIndexInDay, dayQueue, eveningSkipped, pendingGameOverReason])

  const handleDaySummaryDone = useCallback(() => {
    const decayed = applyDayEndDecay(stats)
    setPrevStats(stats)
    setStats(decayed)

    const death = checkGameOver(decayed)
    if (death) {
      setGameOverReason(death.reason)
      setPhase("gameover")
      return
    }
    if (currentDay >= TOTAL_DAYS) {
      setPhase("victory")
      return
    }
    startNewDay(currentDay + 1)
  }, [stats, currentDay, startNewDay])

  const currentEvent = dayQueue[eventIndexInDay] ?? null
  const isPlayingEvent = currentEvent && typeof currentEvent === "object"

  const saveState = useCallback((): Omit<SaveData, "nickname"> => {
    return {
      phase,
      stats,
      prevStats,
      currentDay,
      dayQueue,
      eventIndexInDay,
      gameOverReason,
      cardKey,
      pendingTip: pendingTip ?? undefined,
      nightlyReport,
      eveningSkipped,
      trackers,
      usedIds: Array.from(usedIdsRef.current),
    }
  }, [phase, stats, prevStats, currentDay, dayQueue, eventIndexInDay, gameOverReason, cardKey, pendingTip, nightlyReport, eveningSkipped, trackers])

  const restoreSave = useCallback((data: SaveData) => {
    setPhase(data.phase as Phase)
    setStats(data.stats)
    setPrevStats(data.prevStats)
    setCurrentDay(data.currentDay)
    setDayQueue(data.dayQueue)
    setEventIndexInDay(data.eventIndexInDay)
    setGameOverReason(data.gameOverReason ?? "")
    setCardKey(data.cardKey ?? 0)
    setPendingTip((data.pendingTip as PendingTip) ?? null)
    setNightlyReport(data.nightlyReport ?? null)
    setEveningSkipped(data.eveningSkipped ?? false)
    setTrackers(data.trackers)
    usedIdsRef.current = new Set(data.usedIds ?? [])
  }, [])

  return {
    phase,
    stats,
    prevStats,
    currentDay,
    dayQueue,
    eventIndexInDay,
    currentEvent: isPlayingEvent ? currentEvent : null,
    gameOverReason,
    cardKey,
    pendingTip,
    nightlyReport,
    trackers,
    TOTAL_DAYS,
    startNewDay,
    restart,
    handleStart,
    handleChoose,
    handleDismissTip,
    handleDaySummaryDone,
    saveState,
    restoreSave,
  }
}
