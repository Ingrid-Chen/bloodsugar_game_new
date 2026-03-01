"use client"

import { useCallback, useRef, useState } from "react"
import Image from "next/image"
import type { GameEvent, Effect } from "@/lib/game-data"
import { TIME_SLOT_META } from "@/lib/game-data"
import { cn } from "@/lib/utils"

interface SwipeCardProps {
  event: GameEvent
  eventIndex: number
  totalEvents: number
  dayName: string
  isWeekend: boolean
  onChoose: (effect: Effect, choiceIndex: number) => void
}

export function SwipeCard({ event, eventIndex, totalEvents, dayName, isWeekend, onChoose }: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null)
  const startX = useRef(0)

  const THRESHOLD = 80
  const rotation = dragX * 0.06
  const opacity = Math.max(0.5, 1 - Math.abs(dragX) / 350)
  const leftActive = dragX < -30
  const rightActive = dragX > 30

  const slotMeta = TIME_SLOT_META[event.group]

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true)
    startX.current = e.clientX
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return
      setDragX(e.clientX - startX.current)
    },
    [isDragging]
  )

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    if (dragX < -THRESHOLD) {
      setExitDir("left")
      setTimeout(() => onChoose(event.choices[0].effect, 0), 400)
    } else if (dragX > THRESHOLD) {
      setExitDir("right")
      setTimeout(() => onChoose(event.choices[1].effect, 1), 400)
    } else {
      setDragX(0)
    }
  }, [isDragging, dragX, event.choices, onChoose])

  const handleTap = useCallback(
    (idx: 0 | 1) => {
      setExitDir(idx === 0 ? "left" : "right")
      setTimeout(() => onChoose(event.choices[idx].effect, idx), 400)
    },
    [event.choices, onChoose]
  )

  return (
    <div className="relative flex flex-col items-center w-full max-w-sm mx-auto">
      {/* Scene context bar - 移动端更紧凑 */}
      <div className="flex items-center justify-between w-full px-1 mb-1 sm:mb-2 shrink-0">
        <div className="flex items-center gap-2">
          {/* Day badge */}
          <div
            className="px-2 py-0.5 rounded-md border-[1.5px] border-slate-800 shadow-[1.5px_1.5px_0px_0px_#1e293b] text-[10px] font-black"
            style={{ backgroundColor: isWeekend ? "#fef6d4" : "#e0f0e4", color: isWeekend ? "#e8824a" : "#5a9a6e" }}
          >
            {dayName}
          </div>
          {/* Time slot pill */}
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-md border-[1.5px] border-slate-800 shadow-[1.5px_1.5px_0px_0px_#1e293b] text-[10px] font-bold"
            style={{ backgroundColor: slotMeta.bg, color: slotMeta.color }}
          >
            <span>{slotMeta.emoji}</span>
            <span>{slotMeta.label}</span>
            <span className="text-slate-400 font-normal">{slotMeta.time}</span>
          </div>
        </div>
        {/* Event progress dots */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalEvents }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "rounded-full border-[1.5px] border-slate-800 transition-all duration-300",
                i === eventIndex
                  ? "w-5 h-2.5 shadow-[1px_1px_0px_0px_#1e293b]"
                  : "w-2.5 h-2.5 shadow-[0.5px_0.5px_0px_0px_#1e293b]"
              )}
              style={{
                backgroundColor: i < eventIndex ? slotMeta.color : i === eventIndex ? slotMeta.color : "white",
                opacity: i < eventIndex ? 0.4 : 1,
              }}
            />
          ))}
        </div>
      </div>

      {/* Swipe hint labels - 移动端缩小、可截断 */}
      <div className="flex items-center justify-between w-full px-0.5 sm:px-1 mb-1.5 sm:mb-3 gap-1 shrink-0">
        <div
          className={cn(
            "flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-bold rounded-lg border-[1.5px] border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] transition-all duration-150 min-w-0 flex-1 truncate",
            leftActive ? "bg-[#e0f0e4] text-slate-800 scale-[1.02]" : "bg-white text-slate-400"
          )}
        >
          <svg className="shrink-0 w-2 h-2 sm:w-2.5 sm:h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          <span className="truncate">{event.choices[0].label}</span>
        </div>
        <div
          className={cn(
            "flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-bold rounded-lg border-[1.5px] border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] transition-all duration-150 min-w-0 flex-1 truncate justify-end",
            rightActive ? "bg-[#fef6d4] text-slate-800 scale-[1.02]" : "bg-white text-slate-400"
          )}
        >
          <span className="truncate">{event.choices[1].label}</span>
          <svg className="shrink-0 w-2 h-2 sm:w-2.5 sm:h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </div>
      </div>

      {/* Main card - 移动端整体缩小，避免遮挡 */}
      <div
        ref={cardRef}
        className={cn(
          "swipe-card relative w-full rounded-xl sm:rounded-2xl border-2 border-slate-800 shadow-[4px_4px_0px_0px_#1e293b] overflow-hidden bg-white shrink-0",
          exitDir === "left" && "animate-swipe-left",
          exitDir === "right" && "animate-swipe-right",
          !exitDir && "animate-card-enter"
        )}
        style={
          !exitDir
            ? {
                transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
                opacity,
                transition: isDragging ? "none" : "transform 0.3s ease, opacity 0.3s ease",
              }
            : undefined
        }
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Scene illustration - 移动端缩小高度，减少遮挡 */}
        <div className="relative w-full aspect-[3/2] sm:aspect-[4/3] overflow-hidden border-b-2 border-slate-800">
          <Image src={event.image} alt={event.title} fill className="object-cover" priority sizes="(max-width:640px) 100vw, 400px" />
          {/* Scene + location badge */}
          <div className="absolute bottom-0 left-0 right-0 px-2 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)" }}>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="text-white text-xs sm:text-sm">{slotMeta.emoji}</span>
              <span className="text-white text-[10px] sm:text-xs font-bold">{slotMeta.label}</span>
              <span className="text-white/60 text-[9px] sm:text-[10px] hidden sm:inline">{slotMeta.scene}</span>
            </div>
            <div className="text-white/70 text-[9px] sm:text-[10px] font-bold">{slotMeta.time}</div>
          </div>
        </div>

        {/* Speech bubble content - 移动端缩小内边距和字号 */}
        <div className="px-2 sm:px-4 pt-2 sm:pt-4 pb-1 sm:pb-2">
          <div className="relative bg-[#FFFDF7] border-2 border-slate-800 rounded-lg sm:rounded-xl shadow-[3px_3px_0px_0px_#1e293b] px-3 sm:px-4 py-2 sm:py-3">
            <h2 className="text-base sm:text-lg font-black text-slate-800 mb-0.5">{event.title}</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{event.description}</p>
            {/* Bubble tail */}
            <div className="absolute -top-[9px] left-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-[#FFFDF7]" style={{ filter: "drop-shadow(0 -2px 0 #1e293b)" }} />
          </div>
        </div>

        {/* Pre-effect warning */}
        {event.preEffect && (
          <div className="mx-2 sm:mx-4 mt-1 sm:mt-2 flex flex-wrap gap-1 sm:gap-1.5">
            {Object.entries(event.preEffect).filter(([, v]) => v !== 0 && v !== undefined).map(([key, val]) => {
              const cfg = { bloodSugar: {e:"\u{1FA78}",n:"\u8840\u7CD6"}, mood: {e:"\u{1F60A}",n:"\u5FC3\u60C5"}, energy: {e:"\u{26A1}",n:"\u7CBE\u529B"}, satiety: {e:"\u{1F34A}",n:"\u9971\u8179"} }[key]
              if (!cfg) return null
              return (
                <div key={key} className="px-2.5 py-1 rounded-lg border-2 border-[#e05a5a] shadow-[2px_2px_0px_0px_#e05a5a] bg-[#fde8e8] inline-flex items-center gap-1">
                  <span className="text-xs">{cfg.e}</span>
                  <span className="text-xs font-bold text-[#e05a5a]">{cfg.n} {(val as number) > 0 ? `+${val}` : val}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Choice buttons - 移动端更紧凑 */}
        <div className="px-2 sm:px-4 py-2 sm:py-4 flex gap-2 sm:gap-3">
          {event.choices.map((choice, idx) => (
            <button
              key={idx}
              onClick={() => handleTap(idx as 0 | 1)}
              className={cn(
                "flex-1 py-2 sm:py-3 px-1.5 sm:px-2 rounded-lg sm:rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] sm:shadow-[3px_3px_0px_0px_#1e293b] font-bold text-[11px] sm:text-sm text-slate-800 transition-all duration-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0px_0px_0px_0px_#1e293b]",
                idx === 0 ? "bg-[#e0f0e4] hover:bg-[#d0e8d4]" : "bg-[#fef6d4] hover:bg-[#fef0b8]"
              )}
            >
              <span className="block line-clamp-2 sm:line-clamp-none">{choice.label}</span>
              {choice.tip && (
                <span className="hidden sm:block text-[10px] font-normal text-slate-500 mt-0.5">{choice.tip}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Instruction - 移动端更小 */}
      <p className="mt-2 sm:mt-4 text-[10px] sm:text-[11px] text-slate-400 tracking-wide shrink-0">{"左右滑动 或 点击按钮"}</p>
    </div>
  )
}
