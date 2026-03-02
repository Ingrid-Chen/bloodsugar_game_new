"use client"

import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { BookOpen } from "lucide-react"
import { STAT_CONFIG } from "@/lib/game-data"
import { getNicknameCache, setNicknameCache, getSave, getHistory, NICKNAME_MAX_LEN } from "@/lib/storage"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export type HomeAction = "new" | "continue" | "history"

interface HomeScreenProps {
  defaultNickname?: string
  onAction: (action: HomeAction, nickname: string) => void
}

export function HomeScreen({ defaultNickname = "", onAction }: HomeScreenProps) {
  const [nickname, setNickname] = useState("")
  const [pressed, setPressed] = useState<string | null>(null)
  const [hasSave, setHasSave] = useState(false)
  const [hasHistory, setHasHistory] = useState(false)
  const [showNicknameHint, setShowNicknameHint] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)
  const [stats, setStats] = useState<{ visitCount: number; participantCount: number } | null>(null)
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setNickname(defaultNickname || getNicknameCache())
  }, [defaultNickname])

  useEffect(() => {
    const run = async () => {
      try {
        await fetch("/api/visit", { method: "POST" })
        const res = await fetch("/api/stats")
        const data = await res.json()
        setStats({
          visitCount: Number(data.visitCount) || 0,
          participantCount: Number(data.participantCount) || 0,
        })
      } catch {
        setStats({ visitCount: 0, participantCount: 0 })
      }
    }
    run()
  }, [])

  useEffect(() => {
    const t = nickname.trim().slice(0, NICKNAME_MAX_LEN)
    if (t.length === 0) {
      setHasSave(false)
      setHasHistory(false)
      return
    }
    setHasSave(getSave(t) != null)
    setHasHistory(getHistory(t).length > 0)
  }, [nickname])

  const trimmed = nickname.trim().slice(0, NICKNAME_MAX_LEN)
  const valid = trimmed.length > 0
  const displayName = trimmed || "小糖"

  const handleSubmit = (action: HomeAction) => {
    if (action === "history") {
      const name = trimmed || getNicknameCache()
      if (name) {
        setNicknameCache(name)
        onAction(action, name)
      }
      return
    }
    if (action === "new" && !valid) {
      setShowNicknameHint(true)
      setShakeKey((k) => k + 1)
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current)
      hintTimeoutRef.current = setTimeout(() => setShowNicknameHint(false), 2000)
      return
    }
    if (!valid) return
    setNicknameCache(trimmed)
    onAction(action, trimmed)
  }

  useEffect(() => () => {
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current)
  }, [])

  return (
    <div className="min-h-svh flex flex-col items-center paper-bg relative overflow-x-hidden overflow-y-auto pt-safe pb-safe">
      {/* 右上角：缩小活动规则按钮，并为主内容预留顶部空间避免压盖 */}
      <div className="absolute top-3 right-0 z-10 pt-safe pr-2">
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 px-2 py-1 rounded-md border-[1.5px] border-slate-800 shadow-[1.5px_1.5px_0px_0px_#1e293b] bg-white/95 text-slate-700 text-[10px] font-bold hover:bg-slate-50 transition-colors"
              aria-label="活动规则"
            >
              <BookOpen className="size-3" />
              {"规则"}
            </button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto bg-[#FFFDF7] border-slate-800 shadow-[6px_6px_0px_0px_#1e293b]">
            <DialogHeader>
              <DialogTitle className="text-slate-800 text-lg font-black">活动规则说明</DialogTitle>
            </DialogHeader>
            <div className="text-sm text-slate-600 space-y-3 pr-6">
              <p><strong className="text-slate-800">目标：</strong>在 7 天内通过每天的饮食与生活选择，维持血糖、心情、精力、饱腹四项数值在健康范围内，活过七天即胜利。</p>
              <p><strong className="text-slate-800">每日流程：</strong>每天会经历多个时段（晨间、午间、下午、晚间、深夜），每个时段会出现一张情境卡片，你需要从两个选项中做出选择。你的选择会即时影响下方四项数值。</p>
              <p><strong className="text-slate-800">四项数值：</strong>血糖、心情、精力、饱腹任一崩盘（过高或过低）都会导致游戏结束。合理搭配饮食与作息，才能稳定过关。</p>
              <p><strong className="text-slate-800">操作方式：</strong>左右滑动卡片选择选项，或点击左右按钮。选择后可查看科普小贴士，了解选择背后的原理。</p>
              <p><strong className="text-slate-800">复盘：</strong>游戏结束后可查看当日复盘与历史记录，帮助你在下次玩时做出更好的选择。</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 主内容区：预留顶部空间避免与活动规则按钮压盖，头图 -> 标题 -> 气泡 -> 四项 -> 按钮 */}
      <div className="flex-1 flex flex-col items-center justify-center w-full px-4 pt-12 pb-6 sm:pt-14 sm:pb-8 gap-4 sm:gap-5 max-w-sm min-h-0">
        {/* 头图 - 加大 */}
        <div className="shrink-0 relative">
          <div className="relative w-48 h-48 sm:w-52 sm:h-52 rounded-2xl border-[2.5px] border-slate-800 shadow-[4px_4px_0px_0px_#1e293b] overflow-hidden bg-white animate-bounce-pop">
            <Image
              src="/images/s-start.jpg"
              alt={`${displayName} - 控糖生存指南主角`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 640px) 192px, 208px"
            />
          </div>
          <div className="absolute -top-1.5 -right-1.5 bg-[#f5c542] border-2 border-slate-800 shadow-[1.5px_1.5px_0px_0px_#1e293b] rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs animate-wiggle">
            {"!"}
          </div>
          <div className="absolute -bottom-1 -left-1 bg-[#5a9a6e] border-2 border-slate-800 shadow-[1.5px_1.5px_0px_0px_#1e293b] rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-[10px] sm:text-xs text-white font-bold">
            {"GO"}
          </div>
        </div>

        {/* 游戏标题：控糖生存指南，居中 */}
        <div className="shrink-0 flex flex-col items-center gap-1">
          <h1 className="text-xl sm:text-2xl font-black tracking-wide text-slate-800 text-center">
            {"控糖生存指南"}
          </h1>
          <div className="flex items-center gap-1.5">
            <div className="h-[3px] w-6 rounded-full bg-[#e05a5a]" />
            <div className="h-[3px] w-6 rounded-full bg-[#f5c542]" />
            <div className="h-[3px] w-6 rounded-full bg-[#5a9a6e]" />
            <div className="h-[3px] w-6 rounded-full bg-[#e8824a]" />
          </div>
        </div>

        {/* 气泡：两行文案整体在气泡内。第一行我是XX，第二行我要做出正确的饮食选择，健康生活七天 */}
        <div key={shakeKey} className={`shrink-0 w-full ${showNicknameHint ? "animate-shake" : ""}`}>
          <div className="speech-bubble px-4 py-3.5">
            <p className="text-sm text-slate-600 text-center leading-relaxed">
              <span className="inline-flex flex-wrap items-baseline justify-center gap-0.5">
                <span className="text-slate-600">{"我是 "}</span>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value.slice(0, NICKNAME_MAX_LEN))}
                  placeholder="小糖"
                  maxLength={NICKNAME_MAX_LEN}
                  className={`text-sm font-black text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none min-w-[2.5em] max-w-[4em] w-auto text-center border-b border-slate-300 focus:border-[#5a9a6e] pb-0.5 ${showNicknameHint ? "border-[#e05a5a]" : ""}`}
                />
              </span>
              <br />
              {"我要做出正确的饮食选择，健康生活七天"}
            </p>
          </div>
          {showNicknameHint && (
            <p className="text-xs text-[#e05a5a] font-bold text-center mt-1.5">{"请先填写昵称再开始"}</p>
          )}
        </div>

        {/* 四项数值 + 提示 */}
        <div className="shrink-0 w-full">
          <p className="text-[10px] sm:text-xs text-slate-500 text-center mb-1.5">
            {"你的每个选择都会影响下面四项 →"}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {STAT_CONFIG.map((s) => (
              <div
                key={s.key}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border-[1.5px] border-slate-800 shadow-[1px_1px_0px_0px_#1e293b] text-[10px] sm:text-xs font-bold text-slate-700"
                style={{ backgroundColor: s.bg }}
              >
                <span className="text-sm">{s.emoji}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 按钮区 */}
        <div className="shrink-0 w-full flex flex-col gap-2 max-w-[260px]">
          {hasSave && (
            <button
              onClick={() => handleSubmit("continue")}
              onPointerDown={() => setPressed("continue")}
              onPointerUp={() => setPressed(null)}
              onPointerLeave={() => setPressed(null)}
              className={`w-full py-2.5 rounded-xl border-2 border-slate-800 text-sm font-black transition-all duration-100 ${
                pressed === "continue" ? "translate-x-1 translate-y-1 shadow-[0px_0px_0px_0px_#1e293b]" : "shadow-[3px_3px_0px_0px_#1e293b]"
              } bg-[#5a9a6e] text-white`}
            >
              {"继续游戏"}
            </button>
          )}
          <button
            onClick={() => handleSubmit("new")}
            onPointerDown={() => setPressed("new")}
            onPointerUp={() => setPressed(null)}
            onPointerLeave={() => setPressed(null)}
            className={`w-full py-3 rounded-xl border-[2.5px] border-slate-800 text-base font-black transition-all duration-100 ${
              pressed === "new" ? "translate-x-1 translate-y-1 shadow-[0px_0px_0px_0px_#1e293b]" : "shadow-[4px_4px_0px_0px_#1e293b]"
            } bg-[#5a9a6e] text-white hover:brightness-105`}
          >
            {hasSave ? "重新开始" : "开始冒险!"}
          </button>
          {hasHistory && (
            <button
              onClick={() => handleSubmit("history")}
              onPointerDown={() => setPressed("history")}
              onPointerUp={() => setPressed(null)}
              onPointerLeave={() => setPressed(null)}
              className={`w-full py-2 rounded-lg border-2 border-slate-800 text-xs font-black transition-all ${
                pressed === "history" ? "translate-x-1 translate-y-1 shadow-none" : "shadow-[2px_2px_0px_0px_#1e293b]"
              } bg-white text-slate-700`}
            >
              {"参与历史与复盘"}
            </button>
          )}
        </div>

        <p className="shrink-0 text-[10px] text-slate-400 flex items-center gap-1">
          <span className="animate-wiggle">{"<"}</span>
          {" 滑动卡片做选择 "}
          <span className="animate-wiggle" style={{ animationDelay: "0.5s" }}>{">"}</span>
        </p>
      </div>

      {/* 底部：历史累计统计（X人已进行Y次挑战） */}
      <div className="shrink-0 w-full py-3 flex justify-center">
        <p className="text-[11px] text-slate-500">
          {stats
            ? `${stats.participantCount}人已进行${stats.visitCount}次挑战`
            : "—人已进行—次挑战"}
        </p>
      </div>
      <svg className="absolute bottom-0 left-0 right-0 opacity-20 pointer-events-none h-6 sm:h-8" viewBox="0 0 400 32" preserveAspectRatio="none" fill="none">
        <path d="M0 32 Q8 16 16 28 Q24 8 32 24 Q40 12 48 28 Q56 4 64 24 Q72 14 80 28 Q88 6 96 24 Q104 14 112 28 Q120 4 128 24 Q136 12 144 28 Q152 6 160 26 Q168 14 176 28 Q184 8 192 24 Q200 12 208 28 Q216 4 224 24 Q232 14 240 28 Q248 6 256 24 Q264 12 272 28 Q280 4 288 24 Q296 14 304 28 Q312 6 320 24 Q328 12 336 28 Q344 4 352 24 Q360 14 368 28 Q376 8 384 24 Q392 14 400 28 V32 Z" fill="#5a9a6e"/>
      </svg>
    </div>
  )
}
