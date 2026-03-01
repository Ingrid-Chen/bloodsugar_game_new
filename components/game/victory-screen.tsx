"use client"

import Image from "next/image"
import type { GameStats, GameTrackers } from "@/lib/game-data"

interface VictoryScreenProps {
  characterName: string
  stats: GameStats
  trackers: GameTrackers
  onRestart: () => void
  onGoHome?: () => void
}

export function VictoryScreen({ characterName, stats, trackers, onRestart, onGoHome }: VictoryScreenProps) {
  // S/A/B/C grading based on peakBsCount
  const grade =
    trackers.peakBsCount === 0 ? "S" :
    trackers.peakBsCount <= 3 ? "A" :
    trackers.peakBsCount <= 6 ? "B" : "C"

  const gradeConfig: Record<string, { color: string; bg: string; border: string; icon: string; label: string; msg: string }> = {
    S: { color: "#5a9a6e", bg: "#e0f0e4", border: "#5a9a6e", icon: "\u{1F3C6}", label: "生酮勇士", msg: "完美控糖! 0次血糖破峰!" },
    A: { color: "#3b82f6", bg: "#dbeafe", border: "#3b82f6", icon: "\u{2728}", label: "控糖达人", msg: "不错的表现，仅有少数几次破峰!" },
    B: { color: "#f5c542", bg: "#fef6d4", border: "#f5c542", icon: "\u{1F605}", label: "普通社畜", msg: "虽然不太理想，但活下来就是胜利!" },
    C: { color: "#e05a5a", bg: "#fde8e8", border: "#e05a5a", icon: "\u{1F36D}", label: "糖分游泳", msg: "你和糖分已经融为一体..." },
  }

  const g = gradeConfig[grade]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[#5a9a6e]/10 backdrop-blur-sm animate-in fade-in duration-300" aria-hidden />

      <div className="relative w-full max-w-xs flex flex-col items-center animate-in zoom-in-90 fade-in duration-500">
        {/* Victory illustration */}
        <div className="relative w-40 h-40 rounded-2xl border-2 border-slate-800 shadow-[4px_4px_0px_0px_#1e293b] overflow-hidden bg-white mb-4 animate-wiggle">
          <Image src="/images/s-victory.jpg" alt="Victory" fill className="object-cover" sizes="160px" />
        </div>

        {/* Content card */}
        <div className="w-full bg-white border-2 border-slate-800 rounded-2xl shadow-[4px_4px_0px_0px_#1e293b] text-center px-5 py-5 overflow-y-auto max-h-[60vh]">
          <h2 className="text-lg font-black text-slate-800 mb-1">{characterName + "活过了7天!"}</h2>
          <p className="text-xs text-slate-500 mb-3">{"Biohacker's Glucose Survival \u{2014} 通关!"}</p>

          {/* Grade badge card */}
          <div className="rounded-xl border-2 border-slate-800 shadow-[3px_3px_0px_0px_#1e293b] p-4 mb-4" style={{ backgroundColor: g.bg }}>
            <p className="text-xs font-bold text-slate-500 mb-2">{"代谢控制评级"}</p>
            <div className="flex items-center justify-center gap-3">
              <div
                className="w-16 h-16 rounded-full border-[3px] flex items-center justify-center shadow-[3px_3px_0px_0px] animate-bounce-pop"
                style={{ borderColor: g.border, boxShadow: `3px 3px 0px 0px ${g.border}40` }}
              >
                <span className="text-4xl font-black" style={{ color: g.color }}>{grade}</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-black" style={{ color: g.color }}>{g.icon}{" "}{g.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{g.msg}</p>
              </div>
            </div>
          </div>

          {/* Tracker stats */}
          <div className="space-y-2 mb-4 text-left">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">{"本次通关战报"}</p>

            <div className="flex items-center justify-between px-3 py-2 rounded-lg border-[1.5px] border-slate-800/20 bg-white">
              <span className="text-xs text-slate-600">{"\u{1F4C8} 血糖破峰次数"}</span>
              <span className="text-sm font-black text-slate-800">{trackers.peakBsCount}{"次"}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg border-[1.5px] border-slate-800/20 bg-white">
              <span className="text-xs text-slate-600">{"\u{1F922} 撑胀惩罚次数"}</span>
              <span className="text-sm font-black text-slate-800">{trackers.foodComaCount}{"次"}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg border-[1.5px] border-slate-800/20 bg-white">
              <span className="text-xs text-slate-600">{"\u{1F6E1}\u{FE0F} 无糖宿醉天数"}</span>
              <span className="text-sm font-black text-slate-800">{trackers.hangoverFreeDays}{" / 7 天"}</span>
            </div>
          </div>

          {/* Grade reference table */}
          <div className="rounded-lg border-[1.5px] border-dashed border-slate-300 bg-[#FDFBF7] p-3 mb-4">
            <p className="text-[10px] font-bold text-slate-400 mb-2">{"评级对照表"}</p>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center gap-2"><span className="font-bold text-[#5a9a6e]">{"S"}</span><span className="text-slate-500">{"0次破峰 - 生酮勇士"}</span></div>
              <div className="flex items-center gap-2"><span className="font-bold text-[#3b82f6]">{"A"}</span><span className="text-slate-500">{"1-3次 - 控糖达人"}</span></div>
              <div className="flex items-center gap-2"><span className="font-bold text-[#f5c542]">{"B"}</span><span className="text-slate-500">{"4-6次 - 普通社畜"}</span></div>
              <div className="flex items-center gap-2"><span className="font-bold text-[#e05a5a]">{"C"}</span><span className="text-slate-500">{"7次+ - 糖分游泳"}</span></div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={onRestart}
              className="w-full py-3 rounded-xl border-2 border-slate-800 shadow-[4px_4px_0px_0px_#1e293b] bg-[#5a9a6e] text-white text-base font-black transition-all duration-100 active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_#1e293b]"
            >
              {"再挑战一次"}
            </button>
            {onGoHome && (
              <button
                onClick={onGoHome}
                className="w-full py-2.5 rounded-xl border-2 border-slate-800 shadow-[3px_3px_0px_0px_#1e293b] bg-white text-slate-700 text-sm font-black"
              >
                {"返回首页"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
