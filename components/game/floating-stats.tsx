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
  // Blood sugar zones: 40-60 safe; 11-39 yellow shake; 61-100 red pulse
  const isBloodHighDanger = statKey === "bloodSugar" && value >= 61 && value <= 100
  const isBloodLowWarning = statKey === "bloodSugar" && value >= 11 && value <= 39

  // General danger for other stats
  const isOtherDanger = statKey !== "bloodSugar" && value <= 15
  const isDanger = isBloodHighDanger || isOtherDanger

  const pct = Math.max(0, Math.min(100, value))

  // Determine bar color override for blood sugar zones
  let barColor = color
  if (isBloodHighDanger) barColor = "#e05a5a"
  else if (isBloodLowWarning) barColor = "#f5c542"

  return (
    <div className={cn("flex flex-col items-center gap-1 relative", changed && "animate-stat-pop")}>
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
        <span className={cn(
          "text-[10px] font-bold",
          isBloodLowWarning ? "text-[#d4a017]" : "text-slate-600"
        )}>{label}</span>
      </div>

      {/* Capsule bar */}
      <div
        className={cn(
          "relative w-12 h-3 rounded-full border-[1.5px] shadow-[1.5px_1.5px_0px_0px_#1e293b] overflow-hidden",
          isBloodHighDanger ? "animate-danger-pulse" : isBloodLowWarning ? "animate-low-sugar-shake border-[#f5c542]" : "border-slate-800"
        )}
        style={{ backgroundColor: bg }}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out",
            isDanger && "animate-pulse"
          )}
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>

      {/* Value + optional warning text */}
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "text-[10px] font-bold tabular-nums",
            isBloodHighDanger ? "text-[#e05a5a]" :
            isBloodLowWarning ? "text-[#d4a017]" :
            isDanger ? "text-[#e05a5a]" : "text-slate-500"
          )}
        >
          {value}
        </span>
        {isBloodLowWarning && (
          <span className="text-[8px] font-bold text-[#d4a017] animate-pulse leading-none mt-0.5">{"低血糖"}</span>
        )}
        {isBloodHighDanger && (
          <span className="text-[8px] font-bold text-[#e05a5a] animate-pulse leading-none mt-0.5">{"危险"}</span>
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
      }, 900)
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
