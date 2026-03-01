"use client"

import { useState } from "react"
import type { Effect, PostChoicePenalty } from "@/lib/game-data"
import { STAT_CONFIG } from "@/lib/game-data"

interface ScienceTipPopupProps {
  choiceLabel: string
  scienceTip: string
  effect: Effect
  penalty: PostChoicePenalty
  onDismiss: () => void
}

export function ScienceTipPopup({ choiceLabel, scienceTip, effect, penalty, onDismiss }: ScienceTipPopupProps) {
  const [pressed, setPressed] = useState(false)

  const bloodDelta = effect.bloodSugar ?? 0
  const isGoodChoice = bloodDelta <= 15

  const effectEntries = STAT_CONFIG
    .map((s) => {
      const val = effect[s.key]
      if (!val || val === 0) return null
      const isPositive = s.key === "bloodSugar" ? val <= 0 : val > 0
      return { label: s.label, emoji: s.emoji, value: val, isPositive }
    })
    .filter(Boolean) as { label: string; emoji: string; value: number; isPositive: boolean }[]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-8">
      <div className="absolute inset-0 bg-slate-800/30 backdrop-blur-[2px] animate-in fade-in duration-200" aria-hidden onClick={onDismiss} />

      <div className="relative w-full max-w-sm animate-tip-enter">
        <div className="bg-[#FFFDF7] border-[2.5px] border-slate-800 rounded-2xl shadow-[5px_5px_0px_0px_#1e293b] overflow-hidden">
          {/* Header */}
          <div
            className="px-4 py-2.5 border-b-2 border-slate-800 flex items-center gap-2"
            style={{ backgroundColor: isGoodChoice ? "#e0f0e4" : "#fde8e8" }}
          >
            <div
              className="w-7 h-7 rounded-full border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] flex items-center justify-center text-sm font-black"
              style={{ backgroundColor: isGoodChoice ? "#5a9a6e" : "#e05a5a", color: "white" }}
            >
              {isGoodChoice ? "!" : "?"}
            </div>
            <span className="text-sm font-black text-slate-800 flex-1 truncate">
              {"你选择了: "}
              {choiceLabel}
            </span>
          </div>

          {/* Stat change pills */}
          <div className="px-4 pt-3 flex flex-wrap gap-2">
            {effectEntries.map((e, i) => (
              <div
                key={e.label}
                className="animate-float-number flex items-center gap-1 px-2.5 py-1 rounded-full border-[1.5px] border-slate-800 shadow-[1.5px_1.5px_0px_0px_#1e293b] text-xs font-black"
                style={{
                  backgroundColor: e.isPositive ? "#e0f0e4" : "#fde8e8",
                  color: e.isPositive ? "#2d6a3e" : "#c0392b",
                  animationDelay: `${i * 120}ms`,
                }}
              >
                <span>{e.emoji}</span>
                <span>{e.label}</span>
                <span>{e.value > 0 ? `+${e.value}` : e.value}</span>
              </div>
            ))}
          </div>

          {/* Food Coma warning */}
          {penalty.foodComa && (
            <div className="mx-4 mt-3 px-3 py-2 rounded-xl border-2 border-[#e05a5a] bg-[#fde8e8] shadow-[2px_2px_0px_0px_#e05a5a]">
              <p className="text-xs font-black text-[#e05a5a] mb-0.5">{"太撑了, 大脑缺氧!"}</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {"饱腹感溢出! 额外扣除: 精力 -15, 心情 -10"}
              </p>
            </div>
          )}

          {/* Starvation warning */}
          {penalty.starvation && (
            <div className="mx-4 mt-3 px-3 py-2 rounded-xl border-2 border-[#e8824a] bg-[#fdecd8] shadow-[2px_2px_0px_0px_#e8824a]">
              <p className="text-xs font-black text-[#e8824a] mb-0.5">{"极度饥饿, 身体在分解自己!"}</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {"饱腹归零! 额外扣除: 血糖 -10, 心情 -10"}
              </p>
            </div>
          )}

          {/* Science tip */}
          <div className="px-4 pt-3 pb-1">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 shrink-0 w-6 h-6 rounded-full border-[1.5px] border-slate-800 shadow-[1px_1px_0px_0px_#1e293b] bg-[#f5c542] flex items-center justify-center text-[11px]">
                {"i"}
              </div>
              <p className="text-[13px] leading-relaxed text-slate-600">{scienceTip}</p>
            </div>
          </div>

          {/* Dismiss */}
          <div className="px-4 pt-3 pb-4">
            <button
              onClick={onDismiss}
              onPointerDown={() => setPressed(true)}
              onPointerUp={() => setPressed(false)}
              onPointerLeave={() => setPressed(false)}
              className={`w-full py-3 rounded-xl border-2 border-slate-800 text-base font-black transition-all duration-100 ${
                pressed
                  ? "translate-x-1 translate-y-1 shadow-[0px_0px_0px_0px_#1e293b]"
                  : "shadow-[4px_4px_0px_0px_#1e293b]"
              }`}
              style={{
                backgroundColor: isGoodChoice ? "#5a9a6e" : "#e8824a",
                color: "white",
              }}
            >
              {"明白了!"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
