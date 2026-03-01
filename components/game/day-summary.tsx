"use client"

import { useState } from "react"
import Image from "next/image"
import type { GameStats, NightlyReport } from "@/lib/game-data"
import { STAT_CONFIG, DAY_NAMES } from "@/lib/game-data"

interface DaySummaryProps {
  characterName: string
  day: number
  totalDays: number
  stats: GameStats
  nightlyReport: NightlyReport | null
  onContinue: () => void
}

export function DaySummary({ characterName, day, totalDays, stats, nightlyReport, onContinue }: DaySummaryProps) {
  const dayName = DAY_NAMES[day - 1] ?? ""
  const [pressed, setPressed] = useState(false)
  const isLastDay = day >= totalDays

  // Blood sugar color coding per spec: 40-60 green, 61-79 yellow, >=80 red
  const bsVal = stats.bloodSugar
  const bsColor = bsVal >= 40 && bsVal <= 60 ? "#5a9a6e" : bsVal >= 80 ? "#e05a5a" : bsVal >= 61 ? "#f5c542" : "#e05a5a"
  const bsLabel = bsVal >= 40 && bsVal <= 60 ? "安全区" : bsVal >= 80 ? "偏高" : bsVal >= 61 ? "轻微偏高" : "偏低"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-slate-800/30 backdrop-blur-[2px] animate-in fade-in duration-200" aria-hidden />

      <div className="relative w-full max-w-xs animate-tip-enter">
        <div className="bg-[#FFFDF7] border-[2.5px] border-slate-800 rounded-2xl shadow-[5px_5px_0px_0px_#1e293b] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b-2 border-slate-800 bg-[#fef6d4] flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] overflow-hidden bg-white shrink-0">
              <Image src="/images/s-start.jpg" alt={characterName} fill className="object-cover" sizes="48px" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">
                {dayName}{" (Day "}{day}{") "}{"结束!"}
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                {"睡前血糖: "}
                <span className="font-black" style={{ color: bsColor }}>{bsVal}</span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: bsColor }}>{bsLabel}</span>
              </p>
            </div>
          </div>

          {/* Nightly settlement notes */}
          {nightlyReport && (
            <div className="px-4 pt-3 pb-1 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{"今晚判定"}</p>

              {nightlyReport.notes.map((note, i) => {
                // Color based on tier
                const isPerfect = note.includes("完美")
                const isHangover = note.includes("糖宿醉")
                const isHunger = note.includes("饥饿")

                const bg = isPerfect ? "#e0f0e4" : isHangover ? "#fde8e8" : isHunger ? "#fdecd8" : "#f1f5f9"
                const border = isPerfect ? "#5a9a6e" : isHangover ? "#e05a5a" : isHunger ? "#e8824a" : "#94a3b8"
                const icon = isPerfect ? "\u{2728}" : isHangover ? "\u{1F974}" : isHunger ? "\u{1F62B}" : "\u{1F634}"

                return (
                  <div key={i} className="flex items-start gap-2 rounded-lg border-[1.5px] px-3 py-2" style={{ backgroundColor: bg, borderColor: `${border}40` }}>
                    <span className="text-sm mt-0.5 shrink-0">{icon}</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{note}</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Sleep attribute preview */}
          {nightlyReport && (
            <div className="px-4 pt-3 pb-1 space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{"睡眠后属性预览"}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {/* Energy change */}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-[1.5px] border-slate-800/20 bg-white text-xs">
                  <span>{"⚡"}</span>
                  <span className="text-slate-600">{"精力"}</span>
                  <span className={`ml-auto font-bold ${nightlyReport.energyDelta >= 0 ? "text-[#5a9a6e]" : "text-[#e05a5a]"}`}>
                    {nightlyReport.energyDelta >= 0 ? `+${nightlyReport.energyDelta}` : nightlyReport.energyDelta}
                  </span>
                </div>
                {/* Mood change */}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-[1.5px] border-slate-800/20 bg-white text-xs">
                  <span>{"\u{1F60A}"}</span>
                  <span className="text-slate-600">{"心情"}</span>
                  <span className={`ml-auto font-bold ${nightlyReport.moodDelta >= 0 ? "text-[#5a9a6e]" : "text-[#e05a5a]"}`}>
                    {nightlyReport.moodDelta >= 0 ? `+${nightlyReport.moodDelta}` : nightlyReport.moodDelta}
                  </span>
                </div>
                {/* Blood sugar reset */}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-[1.5px] border-slate-800/20 bg-white text-xs">
                  <span>{"\u{1FA78}"}</span>
                  <span className="text-slate-600">{"血糖"}</span>
                  <span className="ml-auto font-bold text-[#5a9a6e]">{"\u{2192} 45"}</span>
                </div>
                {/* Satiety reset */}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-[1.5px] border-slate-800/20 bg-white text-xs">
                  <span>{"\u{1F34A}"}</span>
                  <span className="text-slate-600">{"饱腹"}</span>
                  <span className="ml-auto font-bold text-[#e8824a]">{"\u{2192} 20"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div className="px-4 pt-3">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
              <span>{"生存进度"}</span>
              <span>{day}/{totalDays}{"天"}</span>
            </div>
            <div className="w-full h-4 rounded-full border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] bg-white overflow-hidden">
              <div
                className="h-full rounded-full bg-[#5a9a6e] transition-all duration-700"
                style={{ width: `${(day / totalDays) * 100}%` }}
              />
            </div>
          </div>

          {/* Button */}
          <div className="px-4 pt-4 pb-4">
            <button
              onClick={onContinue}
              onPointerDown={() => setPressed(true)}
              onPointerUp={() => setPressed(false)}
              onPointerLeave={() => setPressed(false)}
              className={`w-full py-3 rounded-xl border-2 border-slate-800 text-base font-black text-white transition-all duration-100 ${
                pressed
                  ? "translate-x-1 translate-y-1 shadow-[0px_0px_0px_0px_#1e293b]"
                  : "shadow-[4px_4px_0px_0px_#1e293b]"
              }`}
              style={{ backgroundColor: isLastDay ? "#f5c542" : "#5a9a6e" }}
            >
              {isLastDay ? "查看战报!" : `进入第 ${day + 1} 天`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
