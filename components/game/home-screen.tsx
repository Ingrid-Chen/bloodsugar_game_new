"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { STAT_CONFIG } from "@/lib/game-data"
import { getNicknameCache, setNicknameCache, getSave, getHistory, NICKNAME_MAX_LEN } from "@/lib/storage"

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

  useEffect(() => {
    setNickname(defaultNickname || getNicknameCache())
  }, [defaultNickname])

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
    if (!valid) return
    setNicknameCache(trimmed)
    onAction(action, trimmed)
  }

  return (
    <div className="h-svh max-h-[100dvh] flex flex-col items-center paper-bg relative overflow-hidden pt-safe">
      {/* Top decorative - minimal */}
      <div className="shrink-0 w-full relative h-2" />

      {/* Main hero - 手机端放大一些，减少空白感 */}
      <div className="shrink-0 mt-0 relative">
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-xl sm:rounded-2xl border-[2.5px] border-slate-800 shadow-[4px_4px_0px_0px_#1e293b] overflow-hidden bg-white animate-bounce-pop">
          <Image
            src="/images/s-start.jpg"
            alt={`${displayName} - 控糖生存指南主角`}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 640px) 160px, 224px"
          />
        </div>
        <div className="absolute -top-1.5 -right-1.5 bg-[#f5c542] border-2 border-slate-800 shadow-[1.5px_1.5px_0px_0px_#1e293b] rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-base animate-wiggle">
          {"!"}
        </div>
        <div className="absolute -bottom-1 -left-1 bg-[#5a9a6e] border-2 border-slate-800 shadow-[1.5px_1.5px_0px_0px_#1e293b] rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-[10px] sm:text-xs text-white font-bold">
          {"GO"}
        </div>
      </div>

      {/* Title - 手机端字号略大 */}
      <div className="shrink-0 mt-1.5 sm:mt-3 flex flex-col items-center gap-0.5">
        <h1 className="text-2xl sm:text-2xl font-black tracking-wide text-slate-800 leading-tight text-center">
          {"控糖生存指南"}
        </h1>
        <div className="flex items-center gap-1">
          <div className="h-[2px] w-5 rounded-full bg-[#e05a5a]" />
          <div className="h-[2px] w-5 rounded-full bg-[#f5c542]" />
          <div className="h-[2px] w-5 rounded-full bg-[#5a9a6e]" />
          <div className="h-[2px] w-5 rounded-full bg-[#e8824a]" />
        </div>
      </div>

      {/* 昵称直接合并进气泡：在「帮助 XX 做出…」的 XX 处输入 */}
      <div className="shrink-0 mt-1.5 sm:mt-2 mx-4 w-full max-w-sm">
        <div className="speech-bubble px-3 py-2.5 sm:py-3">
          <p className="text-xs sm:text-sm text-slate-600 text-center leading-snug flex flex-wrap items-center justify-center gap-0.5">
            {"帮助 "}
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value.slice(0, NICKNAME_MAX_LEN))}
              placeholder="小糖"
              maxLength={NICKNAME_MAX_LEN}
              className="inline-block w-[4.5em] min-w-[3em] max-w-[6em] text-center font-black text-slate-800 placeholder:text-slate-400 bg-transparent border-b-2 border-dashed border-slate-400 focus:border-[#5a9a6e] focus:outline-none py-0"
            />
            {" 做出正确饮食选择，活过 7 天!"}
          </p>
        </div>
      </div>

      {/* Stat pills - 手机端略大 */}
      <div className="shrink-0 mt-2 sm:mt-2.5 grid grid-cols-2 gap-1.5 px-4 max-w-xs w-full">
        {STAT_CONFIG.map((s) => (
          <div
            key={s.key}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border-[1.5px] border-slate-800 shadow-[1px_1px_0px_0px_#1e293b] text-[10px] sm:text-[9px] font-bold text-slate-700"
            style={{ backgroundColor: s.bg }}
          >
            <span className="text-xs">{s.emoji}</span>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Buttons - 手机端略大、间距收紧 */}
      <div className="shrink-0 mt-2.5 sm:mt-3 flex flex-col gap-1.5 w-full max-w-[280px] px-2">
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
          onClick={() => valid && handleSubmit("new")}
          onPointerDown={() => setPressed("new")}
          onPointerUp={() => setPressed(null)}
          onPointerLeave={() => setPressed(null)}
          disabled={!valid}
          className={`w-full py-3 rounded-xl border-[2.5px] border-slate-800 text-base sm:text-lg font-black transition-all duration-100 ${
            !valid ? "opacity-60 cursor-not-allowed" : "hover:brightness-105"
          } ${pressed === "new" ? "translate-x-1 translate-y-1 shadow-[0px_0px_0px_0px_#1e293b]" : "shadow-[4px_4px_0px_0px_#1e293b]"} bg-[#5a9a6e] text-white`}
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

      {/* Swipe hint - 仅游戏内需要，首页可弱化 */}
      <p className="shrink-0 mt-1.5 text-[10px] text-slate-400 mb-2 sm:mb-2 flex items-center justify-center gap-1">
        <span className="animate-wiggle">{"<"}</span>
        {" 滑动卡片做选择 "}
        <span className="animate-wiggle" style={{ animationDelay: "0.5s" }}>{">"}</span>
      </p>

      {/* Bottom grass */}
      <svg className="absolute bottom-0 left-0 right-0 opacity-20 pointer-events-none h-6 sm:h-8" viewBox="0 0 400 32" preserveAspectRatio="none" fill="none">
        <path d="M0 32 Q8 16 16 28 Q24 8 32 24 Q40 12 48 28 Q56 4 64 24 Q72 14 80 28 Q88 6 96 24 Q104 14 112 28 Q120 4 128 24 Q136 12 144 28 Q152 6 160 26 Q168 14 176 28 Q184 8 192 24 Q200 12 208 28 Q216 4 224 24 Q232 14 240 28 Q248 6 256 24 Q264 12 272 28 Q280 4 288 24 Q296 14 304 28 Q312 6 320 24 Q328 12 336 28 Q344 4 352 24 Q360 14 368 28 Q376 8 384 24 Q392 14 400 28 V32 Z" fill="#5a9a6e"/>
      </svg>
    </div>
  )
}
