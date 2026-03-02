"use client"

import { useState, useEffect, useRef } from "react"
import { useGameLoop } from "@/hooks/useGameLoop"
import { DAY_NAMES, TIME_SLOT_META } from "@/lib/game-data"
import { getNicknameCache, getSave, setSave, clearSave, appendHistory, getHistory } from "@/lib/storage"
import { FloatingStats } from "@/components/game/floating-stats"
import { SwipeCard } from "@/components/game/swipe-card"
import { StartScreen } from "@/components/game/start-screen"
import { HomeScreen } from "@/components/game/home-screen"
import { GameOverModal } from "@/components/game/game-over-modal"
import { VictoryScreen } from "@/components/game/victory-screen"
import { InlineTipCard } from "@/components/game/inline-tip-card"
import { DaySummary } from "@/components/game/day-summary"
import { RecapScreen } from "@/components/game/recap-screen"

const CHARACTER_NAME_FALLBACK = "小糖"

export default function Page() {
  const [view, setView] = useState<"welcome" | "game" | "recap">("welcome")
  const [nickname, setNickname] = useState("")
  const prevPhaseRef = useRef<string>("")

  const {
    phase,
    stats,
    prevStats,
    currentDay,
    dayQueue,
    eventIndexInDay,
    currentEvent,
    gameOverReason,
    cardKey,
    pendingTip,
    nightlyReport,
    trackers,
    TOTAL_DAYS,
    restart,
    handleStart,
    handleChoose,
    handleDismissTip,
    handleDaySummaryDone,
    saveState,
    restoreSave,
  } = useGameLoop()

  const characterName = nickname.trim() || CHARACTER_NAME_FALLBACK

  useEffect(() => {
    if (view !== "game" || !nickname.trim()) return
    if (phase === "gameover" || phase === "victory") {
      if (prevPhaseRef.current !== "gameover" && prevPhaseRef.current !== "victory") {
        appendHistory(nickname.trim(), {
          result: phase === "victory" ? "victory" : "gameover",
          reason: phase === "gameover" ? gameOverReason : undefined,
          trackers,
          dayReached: currentDay,
          stats,
        })
        clearSave(nickname.trim())
      }
      prevPhaseRef.current = phase
      return
    }
    prevPhaseRef.current = phase
    if (phase === "start" || phase === "playing" || phase === "tip" || phase === "day-summary") {
      const payload = { ...saveState(), nickname: nickname.trim() }
      setSave(nickname.trim(), payload)
    }
  }, [view, nickname, phase, currentDay, trackers, stats, gameOverReason, saveState])

  const handleWelcomeAction = (action: "new" | "continue" | "history", name: string) => {
    const trimmed = name.trim()
    setNickname(trimmed)
    if (action === "history") {
      setView("recap")
      return
    }
    if (trimmed) {
      fetch("/api/participate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: trimmed }),
      }).catch(() => {})
    }
    setView("game")
    if (action === "continue") {
      const save = getSave(trimmed)
      if (save) restoreSave(save)
    } else {
      clearSave(trimmed)
      handleStart()
    }
  }

  const goHome = () => setView("welcome")

  if (view === "welcome") {
    return (
      <HomeScreen defaultNickname={getNicknameCache()} onAction={handleWelcomeAction} />
    )
  }

  if (view === "recap") {
    return (
      <RecapScreen
        nickname={characterName}
        history={getHistory(nickname.trim())}
        onBack={goHome}
      />
    )
  }

  if (phase === "start") {
    return (
      <StartScreen characterName={characterName} onStart={handleStart} />
    )
  }

  const dayName = DAY_NAMES[currentDay - 1] ?? `Day ${currentDay}`
  const isWeekend = currentDay >= 6
  const slotEvent = phase === "tip" ? dayQueue[eventIndexInDay] : currentEvent
  const currentSlot =
    slotEvent && typeof slotEvent === "object" ? TIME_SLOT_META[slotEvent.group] : null
  const totalSlots = 5

  const hasDanger =
    stats.bloodSugar > 100 ||
    stats.bloodSugar <= 10 ||
    stats.mood <= 0 ||
    stats.energy <= 0

  return (
    <main
      className={`h-svh max-h-[100dvh] min-h-0 paper-bg flex flex-col overflow-hidden ${hasDanger ? "animate-global-danger" : ""}`}
    >
      <div
        className="sticky top-0 z-30 shrink-0 border-b-2 border-slate-800/10 pt-safe"
        style={{ backgroundColor: "#FDFBF7ee", backdropFilter: "blur(8px)" }}
      >
        <div className="mx-auto max-w-sm">
          <div className="flex items-center justify-between px-3 sm:px-4 pt-1.5 sm:pt-2 pb-0">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: TOTAL_DAYS }).map((_, i) => {
                const dn = DAY_NAMES[i]
                const isWe = i >= 5
                return (
                  <div
                    key={i}
                    className={`flex flex-col items-center gap-0.5 transition-all ${i + 1 === currentDay ? "scale-110" : ""}`}
                  >
                    <span
                      className={`text-[8px] font-bold ${
                        i + 1 === currentDay ? (isWe ? "text-[#e8824a]" : "text-slate-800") : "text-slate-300"
                      }`}
                    >
                      {dn}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-md border-[1.5px] border-slate-800 text-[9px] font-black flex items-center justify-center transition-all ${
                        i + 1 === currentDay
                          ? "bg-[#f5c542] shadow-[1.5px_1.5px_0px_0px_#1e293b]"
                          : i + 1 < currentDay
                            ? "bg-[#5a9a6e] text-white"
                            : "bg-white text-slate-300"
                      }`}
                    >
                      {i + 1}
                    </div>
                  </div>
                )
              })}
            </div>
            {currentSlot && phase === "playing" && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-[1.5px] border-slate-800 shadow-[1.5px_1.5px_0px_0px_#1e293b] text-[10px] font-bold"
                style={{ backgroundColor: currentSlot.bg, color: currentSlot.color }}
              >
                <span>{currentSlot.emoji}</span>
                <span>{currentSlot.label}</span>
                <span className="text-slate-400 font-normal">{currentSlot.time}</span>
              </div>
            )}
            {currentSlot && phase === "tip" && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-[1.5px] border-slate-800 shadow-[1.5px_1.5px_0px_0px_#1e293b] text-[10px] font-bold"
                style={{ backgroundColor: currentSlot.bg, color: currentSlot.color }}
              >
                <span>{currentSlot.emoji}</span>
                <span>{currentSlot.label}</span>
                <span className="text-slate-400 font-normal">{currentSlot.time}</span>
              </div>
            )}
          </div>
          <FloatingStats stats={stats} prevStats={prevStats} />
        </div>
      </div>

      {phase === "playing" && currentEvent && (
        <div className="flex-1 min-h-0 flex items-center justify-center px-3 sm:px-4 py-2 sm:py-4 overflow-auto">
          <SwipeCard
            key={cardKey}
            event={currentEvent}
            eventIndex={eventIndexInDay}
            totalEvents={totalSlots}
            dayName={dayName}
            isWeekend={isWeekend}
            onChoose={handleChoose}
          />
        </div>
      )}

      {phase === "tip" && pendingTip && (
        <div className="flex-1 min-h-0 flex items-center justify-center px-3 sm:px-4 py-2 sm:py-4 overflow-auto">
          <InlineTipCard
            choiceLabel={pendingTip.choiceLabel}
            scienceTip={pendingTip.scienceTip}
            effect={pendingTip.effect}
            penalty={pendingTip.penalty}
            onContinue={handleDismissTip}
          />
        </div>
      )}

      <svg
        className="fixed bottom-0 left-0 right-0 pointer-events-none opacity-15 z-10"
        width="100%"
        height="28"
        viewBox="0 0 400 28"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 28 Q8 14 16 24 Q24 8 32 22 Q40 12 48 24 Q56 4 64 22 Q72 14 80 24 Q88 6 96 24 Q104 12 112 24 Q120 4 128 22 Q136 10 144 24 Q152 6 160 22 Q168 14 176 24 Q184 8 192 22 Q200 12 208 24 Q216 4 224 22 Q232 14 240 24 Q248 6 256 22 Q264 12 272 24 Q280 4 288 22 Q296 14 304 24 Q312 6 320 22 Q328 12 336 24 Q344 4 352 22 Q360 14 368 24 Q376 8 384 22 Q392 14 400 24 V28 Z"
          fill="#5a9a6e"
        />
      </svg>

      {phase === "day-summary" && (
        <DaySummary
          characterName={characterName}
          day={currentDay}
          totalDays={TOTAL_DAYS}
          stats={stats}
          nightlyReport={nightlyReport}
          onContinue={handleDaySummaryDone}
        />
      )}

      {phase === "gameover" && (
        <GameOverModal
          characterName={characterName}
          reason={gameOverReason}
          onRestart={restart}
          onGoHome={goHome}
        />
      )}
      {phase === "victory" && (
        <VictoryScreen
          characterName={characterName}
          stats={stats}
          trackers={trackers}
          onRestart={restart}
          onGoHome={goHome}
        />
      )}
    </main>
  )
}
