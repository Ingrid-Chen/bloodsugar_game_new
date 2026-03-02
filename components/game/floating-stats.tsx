"use client"

import { useEffect, useRef, useState } from "react"
import type { GameStats } from "@/lib/game-data"
import { STAT_CONFIG } from "@/lib/game-data"
import { cn } from "@/lib/utils"

interface FloatingStatsProps {
  stats: GameStats
  prevStats?: GameStats
}

function CapsuleStat({
  value,
  label,
  emoji,
  color,
  bg,
  changed,
  diff,
  statKey,
}: {
  value: number
  label: string
  emoji: string
  color: string
  bg: string
  changed: boolean
  diff: number
  statKey: string
}) {
  const pct = Math.max(0, Math.min(100, value))

  let barColor = color
  let borderClass = "border-slate-800"
  let containerExtra = ""
  let barExtra = ""
  let labelClass = "text-slate-600"
  let statusText = ""
  let statusClass = "text-slate-500"

  // 强感知分区 & 文案
  if (statKey === "bloodSugar") {
    if (value >= 40 && value <= 60) {
      // 绿色：血糖平稳
      barColor = "#5a9a6e"
      statusText = "血糖平稳"
      statusClass = "text-[#2d6a3e]"
      labelClass = statusClass
    } else if (value >= 11 && value <= 39) {
      // 黄色 + 晃动：低糖边缘
      barColor = "#f5c542"
      borderClass = "border-[#f5c542]"
      containerExtra = "animate-low-sugar-shake"
      statusText = "低糖边缘"
      statusClass = "text-[#d4a017]"
      labelClass = statusClass
    } else if (value >= 61 && value <= 79) {
      // 橙色：血糖攀升
      barColor = "#e8824a"
      statusText = "血糖攀升"
      statusClass = "text-[#e26a2c]"
      labelClass = statusClass
    } else if (value >= 80) {
      // 红色 + 呼吸闪烁：高糖危机
      barColor = "#e05a5a"
      borderClass = "border-[#e05a5a]"
      containerExtra = "animate-danger-pulse"
      statusText = "高糖危机"
      statusClass = "text-[#e05a5a]"
      labelClass = statusClass
    } else if (value > 0 && value < 11) {
      // 极低血糖：也视作危机
      barColor = "#e05a5a"
      borderClass = "border-[#e05a5a]"
      containerExtra = "animate-danger-pulse"
      statusText = "严重低糖"
      statusClass = "text-[#e05a5a]"
      labelClass = statusClass
    }
  } else if (statKey === "satiety") {
    if (value >= 40 && value <= 75) {
      // 绿色：恰到好处
      barColor = "#5a9a6e"
      statusText = "恰到好处"
      statusClass = "text-[#2d6a3e]"
      labelClass = statusClass
    } else if (value >= 21 && value <= 39) {
      // 黄色：肚子空空
      barColor = "#f5c542"
      borderClass = "border-[#f5c542]"
      statusText = "肚子空空"
      statusClass = "text-[#d4a017]"
      labelClass = statusClass
    } else if (value >= 76 && value <= 89) {
      // 橙色：消化超载
      barColor = "#e8824a"
      statusText = "消化超载"
      statusClass = "text-[#e26a2c]"
      labelClass = statusClass
    } else if (value >= 90) {
      // 红色 + 膨胀动画：撑到缺氧
      barColor = "#e05a5a"
      borderClass = "border-[#e05a5a]"
      barExtra = "animate-satiety-bloat"
      statusText = "撑到缺氧"
      statusClass = "text-[#e05a5a]"
      labelClass = statusClass
    } else if (value >= 1 && value <= 20) {
      // 红色：极度饥饿
      barColor = "#e05a5a"
      borderClass = "border-[#e05a5a]"
      barExtra = "animate-energy-breath"
      statusText = "极度饥饿"
      statusClass = "text-[#e05a5a]"
      labelClass = statusClass
    }
  } else if (statKey === "energy") {
    if (value >= 40) {
      // 绿色：活力充沛
      barColor = "#5a9a6e"
      statusText = "活力充沛"
      statusClass = "text-[#2d6a3e]"
      labelClass = statusClass
    } else if (value >= 21 && value <= 39) {
      // 黄色：陷入疲惫
      barColor = "#f5c542"
      borderClass = "border-[#f5c542]"
      statusText = "陷入疲惫"
      statusClass = "text-[#d4a017]"
      labelClass = statusClass
    } else if (value >= 1 && value <= 20) {
      // 红色 + 缓慢呼吸：极度透支
      barColor = "#e05a5a"
      borderClass = "border-[#e05a5a]"
      barExtra = "animate-energy-breath"
      statusText = "极度透支"
      statusClass = "text-[#e05a5a]"
      labelClass = statusClass
    }
  } else if (statKey === "mood") {
    if (value >= 40) {
      // 绿色：情绪稳定
      barColor = "#5a9a6e"
      statusText = "情绪稳定"
      statusClass = "text-[#2d6a3e]"
      labelClass = statusClass
    } else if (value >= 21 && value <= 39) {
      // 黄色：压抑暴躁
      barColor = "#f5c542"
      borderClass = "border-[#f5c542]"
      statusText = "压抑暴躁"
      statusClass = "text-[#d4a017]"
      labelClass = statusClass
    } else if (value >= 1 && value <= 20) {
      // 红色 + 剧烈震动：崩溃边缘
      barColor = "#e05a5a"
      borderClass = "border-[#e05a5a]"
      containerExtra = "animate-mood-shiver"
      statusText = "崩溃边缘"
      statusClass = "text-[#e05a5a]"
      labelClass = statusClass
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-1.5 relative", changed && "animate-stat-pop", containerExtra)}>
      {/* Diff number flying up */}
      {changed && diff !== 0 && (() => {
        const isGood = statKey === "bloodSugar" ? diff < 0 : diff > 0
        return (
          <span
            className={cn(
              "absolute -top-4 left-1/2 -translate-x-1/2 text-[11px] font-black animate-diff-fly z-10",
              isGood ? "text-[#2d6a3e]" : "text-[#e05a5a]"
            )}
          >
            {diff > 0 ? `+${diff}` : diff}
          </span>
        )
      })()}

      {/* Emoji + label */}
      <div className="flex items-center gap-0.5">
        <span className="text-xs">{emoji}</span>
        <span className={cn("text-[10px] font-bold", labelClass)}>{label}</span>
      </div>

      {/* Capsule bar */}
      <div
        className={cn(
          "relative w-12 h-3 rounded-full border-[1.5px] shadow-[1.5px_1.5px_0px_0px_#1e293b] overflow-hidden",
          borderClass
        )}
        style={{ backgroundColor: bg }}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out",
            barExtra
          )}
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>

      {/* Value + 强感知文案 */}
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "text-[10px] font-bold tabular-nums",
            statusClass
          )}
        >
          {value}
        </span>
        {statusText && (
          <span className={cn("text-[8px] font-bold leading-tight mt-0.5", statusClass)}>
            {statusText}
          </span>
        )}
      </div>
    </div>
  )
}

export function FloatingStats({ stats, prevStats }: FloatingStatsProps) {
  const [changedKeys, setChangedKeys] = useState<Set<string>>(new Set())
  const [diffs, setDiffs] = useState<Record<string, number>>({})
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!prevStats) return
    const changed = new Set<string>()
    const newDiffs: Record<string, number> = {}
    for (const s of STAT_CONFIG) {
      const d = stats[s.key] - prevStats[s.key]
      if (d !== 0) {
        changed.add(s.key)
        newDiffs[s.key] = d
      }
    }
    if (changed.size > 0) {
      setChangedKeys(changed)
      setDiffs(newDiffs)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        setChangedKeys(new Set())
        setDiffs({})
      }, 1500)
    }
  }, [stats, prevStats])

  return (
    <div className="flex items-center justify-around px-2 sm:px-3 py-1.5 sm:py-2.5">
      {STAT_CONFIG.map((s) => (
        <CapsuleStat
          key={s.key}
          statKey={s.key}
          value={stats[s.key]}
          label={s.label}
          emoji={s.emoji}
          color={s.color}
          bg={s.bg}
          changed={changedKeys.has(s.key)}
          diff={diffs[s.key] ?? 0}
        />
      ))}
    </div>
  )
}
