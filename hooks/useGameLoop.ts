"use client"

import { useCallback, useRef, useState } from "react"
import {
  GAME_DATA_VERSION,
  INITIAL_STATS,
  applyInterMealMetabolism,
  applyDayEndDecay,
  computeNightlyReport,
  computeChoiceResult,
  generateDayQueue,
  checkGameOver,
  getEventById,
  isLowSugarFocusDay,
  createSpecialLowSugarDay,
  canTriggerLowSugarDeath,
  rescueFromBoundary,
  type ChoiceRecord,
  type GameStats,
  type GameEvent,
  type GameTrackers,
  type NightlyReport,
  type PostChoicePenalty,
  type Effect,
  type GameOverReason,
} from "@/lib/game-data"
import type { SaveData } from "@/lib/storage"

const TOTAL_DAYS = 7

export type Phase = "start" | "playing" | "tip" | "day-summary" | "gameover" | "victory"

export interface PendingTip {
  choiceLabel: string
  scienceTip: string
  effect: Effect
  penalty: PostChoicePenalty
  boundaryWarning?: string
}

function createRunId(): string {
  return `run_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function useGameLoop() {
  const [phase, setPhase] = useState<Phase>("start")
  const [stats, setStats] = useState<GameStats>({ ...INITIAL_STATS })
  const [prevStats, setPrevStats] = useState<GameStats>({ ...INITIAL_STATS })
  const [currentDay, setCurrentDay] = useState(1)
  const [dayQueue, setDayQueue] = useState<(GameEvent | null)[]>([])
  const [eveningSkipped, setEveningSkipped] = useState(false)
  const [eventIndexInDay, setEventIndexInDay] = useState(0)
  const [gameOverReason, setGameOverReason] = useState<GameOverReason | "">("")
  const [cardKey, setCardKey] = useState(0)
  const [pendingTip, setPendingTip] = useState<PendingTip | null>(null)
  const [pendingGameOverReason, setPendingGameOverReason] = useState<GameOverReason | null>(null)
  const [nightlyReport, setNightlyReport] = useState<NightlyReport | null>(null)
  const [specialLowSugarDay, setSpecialLowSugarDay] = useState(2)
  const [lowSugarRiskChoicesToday, setLowSugarRiskChoicesToday] = useState<string[]>([])
  const [firstDayGraceAvailable, setFirstDayGraceAvailable] = useState(true)
  const [choiceHistory, setChoiceHistory] = useState<ChoiceRecord[]>([])
  const [runId, setRunId] = useState("")
  const [trackers, setTrackers] = useState<GameTrackers>({
    peakBsCount: 0,
    foodComaCount: 0,
    hangoverFreeDays: 0,
  })
  const usedIdsRef = useRef<Set<number>>(new Set())

  const startNewDay = useCallback((day: number, lowSugarDay = specialLowSugarDay) => {
    const { queue, eveningSkipped: evSkipped } = generateDayQueue(usedIdsRef.current, day, lowSugarDay)
    setDayQueue(queue)
    setEveningSkipped(evSkipped)
    setEventIndexInDay(0)
    setCurrentDay(day)
    setLowSugarRiskChoicesToday([])
    setCardKey((key) => key + 1)
    setPhase("playing")
  }, [specialLowSugarDay])

  const beginRun = useCallback(() => {
    const lowSugarDay = createSpecialLowSugarDay()
    setStats({ ...INITIAL_STATS })
    setPrevStats({ ...INITIAL_STATS })
    setGameOverReason("")
    setPendingGameOverReason(null)
    setPendingTip(null)
    setNightlyReport(null)
    setSpecialLowSugarDay(lowSugarDay)
    setLowSugarRiskChoicesToday([])
    setFirstDayGraceAvailable(true)
    setChoiceHistory([])
    setRunId(createRunId())
    setTrackers({ peakBsCount: 0, foodComaCount: 0, hangoverFreeDays: 0 })
    usedIdsRef.current = new Set()
    startNewDay(1, lowSugarDay)
  }, [startNewDay])

  const restart = useCallback(() => beginRun(), [beginRun])
  const handleStart = useCallback(() => beginRun(), [beginRun])

  const handleChoose = useCallback(
    (_choiceEffect: Effect, choiceIndex: number) => {
      const currentEvent = dayQueue[eventIndexInDay]
      if (!currentEvent || typeof currentEvent !== "object") return
      const choice = currentEvent.choices[choiceIndex]
      if (!choice) return

      const isLowSugar = isLowSugarFocusDay(currentDay, specialLowSugarDay)
      const riskKey = `${currentEvent.id}${choice.id}`
      const nextRiskChoices = isLowSugar && choice.lowSugarRisk
        ? [...lowSugarRiskChoicesToday, riskKey]
        : lowSugarRiskChoicesToday
      if (nextRiskChoices !== lowSugarRiskChoicesToday) setLowSugarRiskChoicesToday(nextRiskChoices)

      setChoiceHistory((records) => [...records, {
        day: currentDay,
        eventId: currentEvent.id,
        eventTitle: currentEvent.title,
        choiceId: choice.id,
        choiceLabel: choice.label,
        isPreferred: choice.isPreferred,
        knowledgeTags: choice.knowledgeTags,
      }])

      const result = computeChoiceResult(
        stats,
        trackers,
        choice,
        currentEvent.preEffect,
        { isLowSugarFocusDay: isLowSugar }
      )

      if ("deathReason" in result) {
        const lowDeathBlocked = result.deathReason === "bloodSugarLow"
          && !canTriggerLowSugarDeath(nextRiskChoices.length)
        const firstDayProtected = !lowDeathBlocked && currentDay === 1 && firstDayGraceAvailable

        if (lowDeathBlocked || firstDayProtected) {
          const rescued = rescueFromBoundary(
            result.rawStats,
            result.deathReason,
            firstDayProtected ? "firstDay" : "nonRiskLow"
          )
          if (firstDayProtected) setFirstDayGraceAvailable(false)
          setPrevStats(stats)
          setStats(rescued)
          setPendingTip({
            choiceLabel: choice.label,
            scienceTip: choice.scienceTip,
            effect: choice.effect,
            penalty: { foodComa: false, starvation: false },
            boundaryWarning: firstDayProtected
              ? "第一次越界触发新手保护，状态已拉回警戒线；当天再次越界会结束游戏。"
              : "这次还没有形成连续低糖风险，状态已拉回警戒线；接下来仍要及时补能。",
          })
          setPhase("tip")
          return
        }

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
    [
      dayQueue,
      eventIndexInDay,
      stats,
      trackers,
      currentDay,
      specialLowSugarDay,
      lowSugarRiskChoicesToday,
      firstDayGraceAvailable,
    ]
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
    const isLowSugar = isLowSugarFocusDay(currentDay, specialLowSugarDay)
    let nextStats = stats
    let nextIndex = eventIndexInDay + 1

    nextStats = applyInterMealMetabolism(nextStats, { isLowSugarFocusDay: isLowSugar })
    while (nextIndex < 5 && dayQueue[nextIndex] === null) {
      nextStats = applyInterMealMetabolism(nextStats, { isLowSugarFocusDay: isLowSugar })
      nextIndex += 1
    }

    if (nextIndex >= 5) {
      if (eveningSkipped) nextStats = applyInterMealMetabolism(nextStats, { isLowSugarFocusDay: isLowSugar })
      const nextTrackers = {
        ...trackers,
        hangoverFreeDays: trackers.hangoverFreeDays
          + (nextStats.bloodSugar >= 40 && nextStats.bloodSugar < 80 ? 1 : 0),
      }
      setTrackers(nextTrackers)
      setNightlyReport(computeNightlyReport(nextStats))
      let decayed = applyDayEndDecay(nextStats)
      const death = checkGameOver(decayed, { isLowSugarFocusDay: isLowSugar })
      if (death?.reason === "bloodSugarLow" && !canTriggerLowSugarDeath(lowSugarRiskChoicesToday.length)) {
        decayed = rescueFromBoundary(decayed, death.reason, "nonRiskLow")
      } else if (death) {
        setPrevStats(nextStats)
        setStats(decayed)
        setGameOverReason(death.reason)
        setPhase("gameover")
        return
      }
      setPrevStats(nextStats)
      setStats(decayed)
      if (currentDay >= TOTAL_DAYS) {
        setPhase("victory")
        return
      }
      startNewDay(currentDay + 1)
      return
    }

    setPrevStats(stats)
    setStats(nextStats)
    setEventIndexInDay(nextIndex)
    setCardKey((key) => key + 1)
    setPhase("playing")
  }, [
    stats,
    trackers,
    eventIndexInDay,
    dayQueue,
    eveningSkipped,
    pendingGameOverReason,
    currentDay,
    specialLowSugarDay,
    lowSugarRiskChoicesToday,
    startNewDay,
  ])

  // 兼容旧的网页流程；小程序目前会自动完成日结，不会停留在这个阶段。
  const handleDaySummaryDone = useCallback(() => undefined, [])

  const currentEvent = dayQueue[eventIndexInDay] ?? null
  const isPlayingEvent = currentEvent && typeof currentEvent === "object"

  const saveState = useCallback((): Omit<SaveData, "nickname"> => ({
    dataVersion: GAME_DATA_VERSION,
    runId,
    phase,
    stats,
    prevStats,
    currentDay,
    dayQueue,
    eventIndexInDay,
    gameOverReason,
    pendingGameOverReason,
    cardKey,
    pendingTip: pendingTip ?? undefined,
    nightlyReport,
    eveningSkipped,
    trackers,
    usedIds: Array.from(usedIdsRef.current),
    specialLowSugarDay,
    lowSugarRiskChoicesToday,
    firstDayGraceAvailable,
    choiceHistory,
  }), [
    runId,
    phase,
    stats,
    prevStats,
    currentDay,
    dayQueue,
    eventIndexInDay,
    gameOverReason,
    pendingGameOverReason,
    cardKey,
    pendingTip,
    nightlyReport,
    eveningSkipped,
    trackers,
    specialLowSugarDay,
    lowSugarRiskChoicesToday,
    firstDayGraceAvailable,
    choiceHistory,
  ])

  const restoreSave = useCallback((data: SaveData) => {
    setPhase(data.phase as Phase)
    setStats(data.stats)
    setPrevStats(data.prevStats)
    setCurrentDay(data.currentDay)
    setDayQueue(data.dayQueue.map((savedEvent) => {
      if (savedEvent == null) return null
      const current = getEventById(savedEvent.id)
      if (!current) return savedEvent
      const choices = savedEvent.choices.map((savedChoice) => (
        current.choices.find((choice) => choice.id === savedChoice.id) ?? savedChoice
      )) as [typeof current.choices[0], typeof current.choices[1]]
      return { ...current, choices }
    }))
    setEventIndexInDay(data.eventIndexInDay)
    setGameOverReason(data.gameOverReason ?? "")
    setPendingGameOverReason(data.pendingGameOverReason ?? null)
    setCardKey(data.cardKey ?? 0)
    setPendingTip((data.pendingTip as PendingTip) ?? null)
    setNightlyReport(data.nightlyReport ?? null)
    setEveningSkipped(data.eveningSkipped ?? false)
    setTrackers(data.trackers)
    setSpecialLowSugarDay(data.specialLowSugarDay)
    setLowSugarRiskChoicesToday(data.lowSugarRiskChoicesToday ?? [])
    setFirstDayGraceAvailable(data.firstDayGraceAvailable ?? false)
    setChoiceHistory(data.choiceHistory ?? [])
    setRunId(data.runId)
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
    runId,
    choiceHistory,
    specialLowSugarDay,
    lowSugarRiskCount: lowSugarRiskChoicesToday.length,
    firstDayGraceAvailable,
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
