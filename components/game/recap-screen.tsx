"use client"

import type { HistoryEntry } from "@/lib/storage"

interface RecapScreenProps {
  nickname: string
  history: HistoryEntry[]
  onBack: () => void
}

const DEATH_LABELS: Record<string, string> = {
  bloodSugarHigh: "高渗昏迷（血糖爆表）",
  bloodSugarLow: "低血糖休克",
  moodZero: "精神崩溃",
  energyZero: "过劳晕倒",
}

function generateRecapText(history: HistoryEntry[]): string[] {
  const lines: string[] = []
  if (history.length === 0) return ["暂无历史对局，完成一局后这里会生成你的控糖复盘。"]
  const last = history[0]
  lines.push(`最近一局：${last.result === "victory" ? "通关" : "在第" + last.dayReached + "天结束"}。`)
  if (last.result === "gameover" && last.reason) {
    const label = DEATH_LABELS[last.reason] ?? last.reason
    lines.push("结束原因：" + label + "。")
  }
  lines.push("该局血糖峰值 " + last.trackers.peakBsCount + " 次，食困 " + last.trackers.foodComaCount + " 次，无糖宿醉夜晚 " + last.trackers.hangoverFreeDays + " 天。")
  if (last.trackers.peakBsCount >= 4) {
    lines.push("建议：尽量选择升糖平缓的选项，避免空腹大量碳水与甜饮。")
  }
  if (last.trackers.foodComaCount > 0) {
    lines.push("建议：饱腹接近满值时选低饱腹选项，避免「撑到食困」触发惩罚。")
  }
  if (last.result === "gameover" && last.reason === "bloodSugarHigh") {
    lines.push("建议：高血糖多由精制碳水与糖饮引起，优先选蛋白质与蔬菜、控制主食量。")
  }
  if (last.result === "gameover" && last.reason === "bloodSugarLow") {
    lines.push("建议：低血糖时适当补糖（如少量水果或淀粉），避免长时间空腹与过度断食。")
  }
  if (last.result === "gameover" && (last.reason === "energyZero" || last.reason === "moodZero")) {
    lines.push("建议：注意精力与心情的平衡，不要为控糖过度牺牲睡眠与情绪。")
  }
  return lines
}

export function RecapScreen({ nickname, history, onBack }: RecapScreenProps) {
  const recapLines = generateRecapText(history)

  return (
    <div className="min-h-svh flex flex-col paper-bg px-4 pb-8">
      <div className="pt-safe" />
      <h1 className="mt-8 text-lg font-black text-slate-800">{"参与历史与复盘"}</h1>
      <p className="mt-1 text-sm text-slate-500">{"昵称：" + nickname}</p>
      <div className="mt-6 px-4 py-4 rounded-2xl border-2 border-slate-800 shadow-[3px_3px_0px_0px_#1e293b] bg-[#FFFDF7]">
        <p className="text-sm font-black text-slate-800">{"您已参与 " + history.length + " 次游戏"}</p>
      </div>
      <div className="mt-6">
        <h2 className="text-sm font-black text-slate-800 mb-2">{"控糖复盘小课堂"}</h2>
        <div className="px-4 py-4 rounded-2xl border-2 border-slate-800 shadow-[3px_3px_0px_0px_#1e293b] bg-[#fef6d4] space-y-2">
          {recapLines.map((line, i) => (
            <p key={i} className="text-[13px] text-slate-700 leading-relaxed">
              {line}
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
