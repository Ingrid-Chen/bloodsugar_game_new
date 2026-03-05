/**
 * 本地模拟：100 局游戏，每局选项随机，统计死亡原因与死亡天数分布。
 */
import {
  INITIAL_STATS,
  generateDayQueue,
  computeChoiceResult,
  applyInterMealMetabolism,
  applyDayEndDecay,
  checkGameOver,
  isLowSugarFocusDay,
  type GameStats,
  type GameTrackers,
} from "../lib/game-data"

const TOTAL_DAYS = 7

function runOneGame(): { result: "death"; reason: string; day: number } | { result: "victory" } {
  const usedIds = new Set<number>()
  let stats: GameStats = { ...INITIAL_STATS }
  let trackers: GameTrackers = { peakBsCount: 0, foodComaCount: 0, hangoverFreeDays: 0 }

  for (let day = 1; day <= TOTAL_DAYS; day++) {
    const isLowSugar = isLowSugarFocusDay(day)
    const { queue, eveningSkipped } = generateDayQueue(usedIds, day)
    let eventIndex = 0

    while (eventIndex < 5) {
      const event = queue[eventIndex]
      if (event == null) {
        stats = applyInterMealMetabolism(stats, { isLowSugarFocusDay: isLowSugar })
        eventIndex++
        continue
      }

      const choiceIndex = Math.random() < 0.5 ? 0 : 1
      const choice = event.choices[choiceIndex]
      const result = computeChoiceResult(stats, trackers, {
        label: choice.label,
        effect: choice.effect,
        scienceTip: choice.scienceTip,
      }, event.preEffect, { isLowSugarFocusDay: isLowSugar })

      if ("deathReason" in result) {
        return { result: "death", reason: result.deathReason, day }
      }

      stats = result.nextStats
      trackers = result.nextTrackers
      stats = applyInterMealMetabolism(stats, { isLowSugarFocusDay: isLowSugar })
      eventIndex++

      while (eventIndex < 5 && queue[eventIndex] == null) {
        stats = applyInterMealMetabolism(stats, { isLowSugarFocusDay: isLowSugar })
        eventIndex++
      }
      if (eventIndex >= 5 && eveningSkipped) {
        stats = applyInterMealMetabolism(stats, { isLowSugarFocusDay: isLowSugar })
      }
    }

    const decayed = applyDayEndDecay(stats)
    const death = checkGameOver(decayed, { isLowSugarFocusDay: isLowSugar })
    if (death) {
      return { result: "death", reason: death.reason, day }
    }
    if (day >= TOTAL_DAYS) {
      return { result: "victory" }
    }
    stats = decayed
  }

  return { result: "victory" }
}

const N = 100
const deaths: { reason: string; day: number }[] = []
let victories = 0

for (let i = 0; i < N; i++) {
  const outcome = runOneGame()
  if (outcome.result === "death") {
    deaths.push({ reason: outcome.reason, day: outcome.day })
  } else {
    victories++
  }
}

const byReason: Record<string, number> = {}
const byDay: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 }

for (const d of deaths) {
  byReason[d.reason] = (byReason[d.reason] ?? 0) + 1
  byDay[d.day] = (byDay[d.day] ?? 0) + 1
}

console.log("===== 100 局随机选择 统计结果 =====\n")
console.log("1. 死亡原因分布（占全部 100 局）")
const high = byReason.bloodSugarHigh ?? 0
const low = byReason.bloodSugarLow ?? 0
const mood = byReason.moodZero ?? 0
const energy = byReason.energyZero ?? 0
console.log("   高血糖死亡 (bloodSugarHigh):", high, "局", "(" + (high / N * 100).toFixed(1) + "%)")
console.log("   低血糖死亡 (bloodSugarLow): ", low, "局", "(" + (low / N * 100).toFixed(1) + "%)")
console.log("   心情归零 (moodZero):        ", mood, "局", "(" + (mood / N * 100).toFixed(1) + "%)")
console.log("   精力归零 (energyZero):      ", energy, "局", "(" + (energy / N * 100).toFixed(1) + "%)")
console.log("   通关 (victory):             ", victories, "局", "(" + (victories / N * 100).toFixed(1) + "%)")
console.log("")
console.log("2. 死亡天数分布（仅统计死亡局，共 " + deaths.length + " 局）")
for (let d = 1; d <= 7; d++) {
  const count = byDay[d] ?? 0
  const pct = deaths.length ? (count / deaths.length * 100).toFixed(1) : "0"
  console.log("   第 " + d + " 天: " + count + " 次 (" + pct + "%)")
}
console.log("")
console.log("汇总: 死亡 " + deaths.length + " 局, 通关 " + victories + " 局")
