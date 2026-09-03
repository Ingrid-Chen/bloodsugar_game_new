/**
 * 用与线上游戏相同的数据和边界保护规则做可重现的大样本模拟。
 *
 * 运行：npm run simulate:balance
 */
import {
  GAME_DATA_VERSION,
  EVENT_POOL,
  INITIAL_STATS,
  applyDayEndDecay,
  applyInterMealMetabolism,
  canTriggerLowSugarDeath,
  checkGameOver,
  computeChoiceResult,
  createSpecialLowSugarDay,
  generateDayQueue,
  isLowSugarFocusDay,
  rescueFromBoundary,
  type Choice,
  type GameOverReason,
  type GameStats,
  type GameTrackers,
} from "../lib/game-data.ts"

const TOTAL_DAYS = 7
const DEFAULT_GAMES_PER_STRATEGY = 300_000

type Strategy = {
  name: string
  preferredProbability: number
}

type Outcome =
  | { result: "victory" }
  | { result: "death"; reason: GameOverReason; day: number; lowSugarRiskCount: number }

const STRATEGIES: Strategy[] = [
  { name: "随机选择", preferredProbability: 0.5 },
  { name: "60% 选更优项", preferredProbability: 0.6 },
  { name: "70% 选更优项", preferredProbability: 0.7 },
  { name: "80% 选更优项", preferredProbability: 0.8 },
  { name: "100% 选更优项", preferredProbability: 1 },
]

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function chooseForStrategy(choices: [Choice, Choice], preferredProbability: number): Choice {
  const preferred = choices.find((choice) => choice.isPreferred)
  const other = choices.find((choice) => !choice.isPreferred)
  if (!preferred || !other) throw new Error("每个场景必须有且只有一个更优项")
  return Math.random() < preferredProbability ? preferred : other
}

function runOneGame(strategy: Strategy): Outcome {
  const usedIds = new Set<number>()
  const specialLowSugarDay = createSpecialLowSugarDay()
  let stats: GameStats = { ...INITIAL_STATS }
  let trackers: GameTrackers = { peakBsCount: 0, foodComaCount: 0, hangoverFreeDays: 0 }
  let firstDayGraceAvailable = true

  for (let day = 1; day <= TOTAL_DAYS; day += 1) {
    const isLowSugar = isLowSugarFocusDay(day, specialLowSugarDay)
    const { queue, eveningSkipped } = generateDayQueue(usedIds, day, specialLowSugarDay)
    let riskCountToday = 0
    let eventIndex = 0

    while (eventIndex < queue.length) {
      const event = queue[eventIndex]
      if (event == null) {
        stats = applyInterMealMetabolism(stats, { isLowSugarFocusDay: isLowSugar })
        eventIndex += 1
        continue
      }

      const choice = chooseForStrategy(event.choices, strategy.preferredProbability)
      if (isLowSugar && choice.lowSugarRisk) riskCountToday += 1
      const result = computeChoiceResult(
        stats,
        trackers,
        choice,
        event.preEffect,
        { isLowSugarFocusDay: isLowSugar }
      )

      if ("deathReason" in result) {
        const lowDeathBlocked = result.deathReason === "bloodSugarLow"
          && !canTriggerLowSugarDeath(riskCountToday)
        const firstDayProtected = !lowDeathBlocked && day === 1 && firstDayGraceAvailable

        if (lowDeathBlocked || firstDayProtected) {
          stats = rescueFromBoundary(
            result.rawStats,
            result.deathReason,
            firstDayProtected ? "firstDay" : "nonRiskLow"
          )
          if (firstDayProtected) firstDayGraceAvailable = false
        } else {
          return { result: "death", reason: result.deathReason, day, lowSugarRiskCount: riskCountToday }
        }
      } else {
        stats = result.nextStats
        trackers = result.nextTrackers
      }

      stats = applyInterMealMetabolism(stats, { isLowSugarFocusDay: isLowSugar })
      eventIndex += 1
      while (eventIndex < queue.length && queue[eventIndex] == null) {
        stats = applyInterMealMetabolism(stats, { isLowSugarFocusDay: isLowSugar })
        eventIndex += 1
      }
      if (eventIndex >= queue.length && eveningSkipped) {
        stats = applyInterMealMetabolism(stats, { isLowSugarFocusDay: isLowSugar })
      }
    }

    let decayed = applyDayEndDecay(stats)
    const death = checkGameOver(decayed, { isLowSugarFocusDay: isLowSugar })
    if (death?.reason === "bloodSugarLow" && !canTriggerLowSugarDeath(riskCountToday)) {
      decayed = rescueFromBoundary(decayed, death.reason, "nonRiskLow")
    } else if (death) {
      return { result: "death", reason: death.reason, day, lowSugarRiskCount: riskCountToday }
    }

    stats = decayed
    if (day === TOTAL_DAYS) return { result: "victory" }
  }

  return { result: "victory" }
}

function percent(value: number, total: number): string {
  return total ? `${(value / total * 100).toFixed(1)}%` : "0.0%"
}

function validateData(): void {
  const events = Object.values(EVENT_POOL).flat()
  const choices = events.flatMap((event) => event.choices)
  const errors: string[] = []

  if (events.length !== 58) errors.push(`场景数应为 58，实际为 ${events.length}`)
  if (choices.length !== 116) errors.push(`选项数应为 116，实际为 ${choices.length}`)
  for (const event of events) {
    const preferredCount = event.choices.filter((choice) => choice.isPreferred).length
    if (preferredCount !== 1) errors.push(`场景 ${event.id} 的更优项数为 ${preferredCount}`)
    if (new Set(event.choices.map((choice) => choice.id)).size !== 2) {
      errors.push(`场景 ${event.id} 的选项 ID 不唯一`)
    }
    if (event.choices.some((choice) => choice.knowledgeTags.length === 0)) {
      errors.push(`场景 ${event.id} 存在缺少知识标签的选项`)
    }
  }

  const lowRiskCount = choices.filter((choice) => choice.lowSugarRisk).length
  if (lowRiskCount !== 9) errors.push(`低糖风险选项应为 9，实际为 ${lowRiskCount}`)
  if (errors.length) throw new Error(errors.join("\n"))
}

function runStrategy(strategy: Strategy, games: number, seed: number) {
  Math.random = createSeededRandom(seed)
  const outcomes = Array.from({ length: games }, () => runOneGame(strategy))
  const deaths = outcomes.filter((outcome): outcome is Extract<Outcome, { result: "death" }> => outcome.result === "death")
  const byReason = new Map<GameOverReason, number>()
  const byDay = new Map<number, number>()
  deaths.forEach((death) => {
    byReason.set(death.reason, (byReason.get(death.reason) ?? 0) + 1)
    byDay.set(death.day, (byDay.get(death.day) ?? 0) + 1)
  })
  const lowDeaths = byReason.get("bloodSugarLow") ?? 0
  const invalidLowDeaths = deaths.filter(
    (death) => death.reason === "bloodSugarLow" && death.lowSugarRiskCount < 2
  ).length

  return {
    strategy: strategy.name,
    games,
    deaths: deaths.length,
    mortality: percent(deaths.length, games),
    victories: games - deaths.length,
    firstDayDeaths: byDay.get(1) ?? 0,
    firstDayMortality: percent(byDay.get(1) ?? 0, games),
    lowDeaths,
    lowShareOfDeaths: percent(lowDeaths, deaths.length),
    invalidLowDeaths,
    byReason: Object.fromEntries(byReason),
    byDay: Object.fromEntries(byDay),
  }
}

validateData()
const requestedGames = Number(process.argv[2])
const games = Number.isFinite(requestedGames) && requestedGames > 0
  ? Math.floor(requestedGames)
  : DEFAULT_GAMES_PER_STRATEGY

console.log(`数据版本: ${GAME_DATA_VERSION}`)
console.log(`每种策略模拟: ${games.toLocaleString("zh-CN")} 局`)
for (const [index, strategy] of STRATEGIES.entries()) {
  console.log(JSON.stringify(runStrategy(strategy, games, 20260903 + index), null, 2))
}
