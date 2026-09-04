/**
 * 血糖小课堂发布前检查：
 * - 58 个场景、116 个选项必须全部有独立文案；
 * - 每条明确解释血糖关系，不能只停留在“健康/搭配完整”；
 * - 每条主动分成两段，并控制在小程序卡片约五行以内。
 *
 * 运行：npm run audit:science-copy
 */
import { EVENT_POOL } from "../lib/game-data.ts"

const MAX_COPY_LENGTH = 58
const GLUCOSE_TERMS = /(血糖|葡萄糖|补糖|升糖)/
const groups = Object.values(EVENT_POOL)
const events = groups.flat()
const choices = events.flatMap((event) =>
  event.choices.map((choice) => ({ eventId: event.id, choice }))
)

const failures: string[] = []
const seenTips = new Map<string, string>()

if (events.length !== 58) failures.push(`场景应为 58 个，当前为 ${events.length} 个`)
if (choices.length !== 116) failures.push(`选项应为 116 个，当前为 ${choices.length} 个`)

for (const { eventId, choice } of choices) {
  const key = `${eventId}${choice.id}`
  const tip = choice.scienceTip.trim()
  const copyLength = [...tip.replace(/\n/g, "")].length
  const paragraphs = tip.split("\n").filter(Boolean)

  if (!GLUCOSE_TERMS.test(tip)) failures.push(`${key} 没有明确说明血糖关系`)
  if (paragraphs.length !== 2) failures.push(`${key} 应恰好分成两段`)
  if (copyLength > MAX_COPY_LENGTH) {
    failures.push(`${key} 共 ${copyLength} 字，超过 ${MAX_COPY_LENGTH} 字上限`)
  }

  const duplicateKey = seenTips.get(tip)
  if (duplicateKey) failures.push(`${key} 与 ${duplicateKey} 的文案完全重复`)
  seenTips.set(tip, key)
}

if (failures.length > 0) {
  console.error(`血糖小课堂检查失败（${failures.length} 项）：`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

const lengths = choices.map(({ choice }) => [...choice.scienceTip.replace(/\n/g, "")].length)
const average = lengths.reduce((sum, length) => sum + length, 0) / lengths.length

console.log(`血糖小课堂检查通过：${events.length} 个场景 / ${choices.length} 个选项`)
console.log(`平均 ${average.toFixed(1)} 字，最长 ${Math.max(...lengths)} 字，每条均为两段且包含明确血糖关系`)
