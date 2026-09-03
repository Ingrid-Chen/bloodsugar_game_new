"use client"

import type { HistoryEntry } from "@/lib/storage"

interface RecapScreenProps {
  nickname: string
  history: HistoryEntry[]
  onBack: () => void
}

const DEATH_LABELS: Record<string, string> = {
  bloodSugarHigh: "高糖危机（状态失控）",
  bloodSugarLow: "低糖危机",
  moodZero: "精神崩溃",
  energyZero: "过劳晕倒",
}

function getResultLabel(entry: HistoryEntry): string {
  if (entry.result === "victory") return "通关"
  const reason = entry.reason ? (DEATH_LABELS[entry.reason] ?? entry.reason) : "未知"
  return `第 ${entry.dayReached} 天 · ${reason}`
}

/** 根据全部历史生成：每盘记录 + 总结（常见死因、控糖误区） */
function getRecapContent(history: HistoryEntry[]) {
  const perGame = history.map((entry, index) => ({
    index: history.length - index,
    label: getResultLabel(entry),
    result: entry.result,
    dayReached: entry.dayReached,
    reason: entry.reason,
    trackers: entry.trackers,
    correct: entry.choices.filter((choice) => choice.isPreferred).length,
    total: entry.choices.length,
  }))

  const gameovers = history.filter((e) => e.result === "gameover")
  const byReason: Record<string, number> = {}
  const byDay: Record<number, number> = {}
  gameovers.forEach((e) => {
    const r = e.reason ?? "unknown"
    byReason[r] = (byReason[r] ?? 0) + 1
    byDay[e.dayReached] = (byDay[e.dayReached] ?? 0) + 1
  })

  const topReason = Object.entries(byReason).sort((a, b) => b[1] - a[1])[0]
  const topDay = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0]
  const summaryLines: string[] = []
  if (gameovers.length > 0) {
    if (topReason) {
      const reasonLabel = DEATH_LABELS[topReason[0]] ?? topReason[0]
      summaryLines.push(`你最常在「${reasonLabel}」上翻车（${topReason[1]} 次）。`)
    }
    if (topDay) {
      summaryLines.push(`死亡多发生在第 ${topDay[0]} 天（${topDay[1]} 次）。`)
    }
  }

  const gapMap = new Map<string, { count: number; events: string[] }>()
  history.flatMap((entry) => entry.choices).filter((choice) => !choice.isPreferred).forEach((choice) => {
    choice.knowledgeTags.forEach((tag) => {
      const value = gapMap.get(tag) ?? { count: 0, events: [] }
      value.count += 1
      if (!value.events.includes(choice.eventTitle)) value.events.push(choice.eventTitle)
      gapMap.set(tag, value)
    })
  })
  const knowledgeGaps = [...gapMap.entries()]
    .map(([tag, value]) => ({ tag, ...value }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, 3)

  return { perGame, summaryLines, knowledgeGaps }
}

export function RecapScreen({ nickname, history, onBack }: RecapScreenProps) {
  const { perGame, summaryLines, knowledgeGaps } = getRecapContent(history)

  return (
    <div className="min-h-svh flex flex-col paper-bg px-4 pb-8 overflow-x-hidden">
      <div className="pt-safe" />
      <h1 className="mt-6 text-lg font-black text-slate-800">{"参与历史与复盘"}</h1>
      <p className="mt-1 text-sm text-slate-500">{"昵称：" + nickname}</p>

      {/* 参与次数 */}
      <div className="mt-4 px-4 py-3 rounded-xl border-2 border-slate-800 shadow-[3px_3px_0px_0px_#1e293b] bg-[#FFFDF7]">
        <p className="text-sm font-black text-slate-800">{"共参与 " + history.length + " 盘"}</p>
      </div>

      {/* 全部历史：每盘记录 */}
      <div className="mt-5">
        <h2 className="text-sm font-black text-slate-800 mb-2">{"每盘记录"}</h2>
        {history.length === 0 ? (
          <p className="text-[13px] text-slate-500">暂无记录，完成一局后这里会显示每盘的结果。</p>
        ) : (
          <ul className="space-y-2">
            {perGame.map((item, i) => (
              <li
                key={history[i]?.id ?? i}
                className="flex items-center justify-between px-3 py-2 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] text-[13px]"
                style={{
                  backgroundColor: item.result === "victory" ? "#e0f0e4" : "#fde8e8",
                }}
              >
                <span className="font-bold text-slate-800">{"第 " + item.index + " 盘"}</span>
                <span className="text-slate-700">{item.label}</span>
                {item.total > 0 && <span className="text-slate-500">答对 {item.correct}/{item.total}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 总结：常见死因 */}
      {summaryLines.length > 0 && (
        <div className="mt-5">
          <h2 className="text-sm font-black text-slate-800 mb-2">{"你的翻车总结"}</h2>
          <div className="px-4 py-3 rounded-xl border-2 border-slate-800 shadow-[3px_3px_0px_0px_#1e293b] bg-[#fef6d4] space-y-1.5">
            {summaryLines.map((line, i) => (
              <p key={i} className="text-[13px] text-slate-700 leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* 根据实际选择生成知识薄弱点 */}
      <div className="mt-5">
        <h2 className="text-sm font-black text-slate-800 mb-2">{"最值得复习的血糖知识"}</h2>
        <div className="px-4 py-4 rounded-xl border-2 border-slate-800 shadow-[3px_3px_0px_0px_#1e293b] bg-[#fef6d4] space-y-2">
          {history.length === 0 ? (
            <p className="text-[13px] text-slate-500">完成一局后，这里会根据你的真实选择生成复盘。</p>
          ) : knowledgeGaps.length === 0 ? (
            <p className="text-[13px] text-slate-700">目前没有明显薄弱项，你的选择很稳。</p>
          ) : knowledgeGaps.map((item, index) => (
            <p key={item.tag} className="text-[13px] text-slate-700 leading-relaxed">
              {index + 1}. {item.tag}（出现 {item.count} 次）· 相关场景：{item.events.slice(0, 2).join("、")}
            </p>
          ))}
        </div>
      </div>

      <button
        onClick={onBack}
        className="mt-8 w-full max-w-xs mx-auto py-3 rounded-xl border-2 border-slate-800 shadow-[4px_4px_0px_0px_#1e293b] bg-[#5a9a6e] text-white font-black"
      >
        {"返回"}
      </button>
    </div>
  )
}
