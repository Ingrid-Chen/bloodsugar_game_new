"use client"

import { useState, useEffect } from "react"
import { getNicknameCache, setNicknameCache, getSave, getHistory, NICKNAME_MAX_LEN } from "@/lib/storage"

export type WelcomeAction = "new" | "continue" | "history"

interface WelcomeScreenProps {
  defaultNickname?: string
  onAction: (action: WelcomeAction, nickname: string) => void
}

export function WelcomeScreen({ defaultNickname = "", onAction }: WelcomeScreenProps) {
  const [nickname, setNickname] = useState("")
  const [pressed, setPressed] = useState<string | null>(null)

  const [hasSave, setHasSave] = useState(false)
  const [hasHistory, setHasHistory] = useState(false)

  useEffect(() => {
    const cached = defaultNickname || getNicknameCache()
    setNickname(cached)
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

  const handleSubmit = (action: WelcomeAction) => {
    if (!valid) return
    const name = trimmed
    setNicknameCache(name)
    onAction(action, name)
  }

  return (
    <div className="min-h-svh flex flex-col items-center paper-bg relative overflow-hidden px-4">
      <div className="w-full pt-safe" />

      <h1 className="mt-10 text-xl font-black text-slate-800">{"控糖生存指南"}</h1>
      <p className="mt-2 text-sm text-slate-500">{"输入你的昵称，开始或继续游戏"}</p>

      <div className="mt-6 w-full max-w-xs">
        <label className="block text-xs font-bold text-slate-600 mb-1.5">{"我是谁（昵称）"}</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value.slice(0, NICKNAME_MAX_LEN))}
          placeholder={"中英文或符号，最多 " + NICKNAME_MAX_LEN + " 字"}
          maxLength={NICKNAME_MAX_LEN}
          className="w-full px-4 py-3 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5a9a6e]"
        />
        <p className="mt-1 text-[10px] text-slate-400">{trimmed.length + " / " + NICKNAME_MAX_LEN}</p>
      </div>

      <div className="mt-8 w-full max-w-xs flex flex-col gap-3">
        {hasSave && (
          <button
            onClick={() => handleSubmit("continue")}
            onPointerDown={() => setPressed("continue")}
            onPointerUp={() => setPressed(null)}
            onPointerLeave={() => setPressed(null)}
            className={`w-full py-3 rounded-xl border-2 border-slate-800 text-base font-black transition-all ${
              pressed === "continue" ? "translate-x-1 translate-y-1 shadow-none" : "shadow-[4px_4px_0px_0px_#1e293b]"
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
          className={`w-full py-3 rounded-xl border-2 border-slate-800 text-base font-black transition-all ${
            !valid ? "opacity-50 cursor-not-allowed" : ""
          } ${pressed === "new" ? "translate-x-1 translate-y-1 shadow-none" : "shadow-[4px_4px_0px_0px_#1e293b]"} bg-[#f5c542] text-slate-800`}
        >
          {hasSave ? "重新开始" : "开始游戏"}
        </button>
        {hasHistory && (
          <button
            onClick={() => handleSubmit("history")}
            onPointerDown={() => setPressed("history")}
            onPointerUp={() => setPressed(null)}
            onPointerLeave={() => setPressed(null)}
            className={`w-full py-3 rounded-xl border-2 border-slate-800 text-base font-black transition-all ${
              pressed === "history" ? "translate-x-1 translate-y-1 shadow-none" : "shadow-[4px_4px_0px_0px_#1e293b]"
            } bg-white text-slate-700`}
          >
            {"参与历史与复盘"}
          </button>
        )}
      </div>

      <svg
        className="absolute bottom-0 left-0 right-0 opacity-20 pointer-events-none"
        width="100%"
        height="32"
        viewBox="0 0 400 32"
        preserveAspectRatio="none"
        fill="none"
      >
        <path d="M0 32 Q8 16 16 28 Q24 8 32 24 Q40 12 48 28 Q56 4 64 24 Q72 14 80 28 Q88 6 96 24 Q104 14 112 28 Q120 4 128 24 Q136 12 144 28 Q152 6 160 26 Q168 14 176 28 Q184 8 192 24 Q200 12 208 28 Q216 4 224 24 Q232 14 240 28 Q248 6 256 24 Q264 12 272 28 Q280 4 288 24 Q296 14 304 28 Q312 6 320 24 Q328 12 336 28 Q344 4 352 24 Q360 14 368 28 Q376 8 384 24 Q392 14 400 28 V32 Z" fill="#5a9a6e" />
      </svg>
    </div>
  )
}
