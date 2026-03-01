"use client"

import Image from "next/image"
import { useState } from "react"
import { STAT_CONFIG } from "@/lib/game-data"

interface StartScreenProps {
  characterName: string
  onStart: () => void
}

export function StartScreen({ characterName, onStart }: StartScreenProps) {
  const [pressed, setPressed] = useState(false)

  return (
    <div className="min-h-svh flex flex-col items-center paper-bg relative overflow-hidden">
      {/* Top decorative banner */}
      <div className="w-full pt-safe relative">
        {/* Floating doodle elements */}
        <svg className="absolute top-8 left-4 opacity-20 animate-float-slow" width="60" height="35" viewBox="0 0 60 35" fill="none">
          <path d="M8 28c-4 0-7-3-6-7s5-6 8-5c1-5 5-9 10-9s9 4 10 8c3-2 7-1 8 2s1 8-2 9H8z" stroke="#1e293b" strokeWidth="2" fill="#FFFDF7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <svg className="absolute top-12 right-8 opacity-15 animate-float-slow" style={{ animationDelay: "1.8s" }} width="45" height="26" viewBox="0 0 45 26" fill="none">
          <path d="M6 20c-3 0-5-3-4-5s4-5 6-4c1-4 4-7 8-7s7 3 8 6c2-1 5 0 6 2s0 6-2 7H6z" stroke="#1e293b" strokeWidth="1.5" fill="#FFFDF7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        {/* Small doodle stars */}
        <div className="absolute top-20 left-[20%] text-[#f5c542] opacity-40 animate-wiggle text-lg">{"*"}</div>
        <div className="absolute top-14 right-[25%] text-[#e8824a] opacity-35 animate-wiggle text-sm" style={{ animationDelay: "0.6s" }}>{"*"}</div>
        <div className="absolute top-28 right-[15%] text-[#5a9a6e] opacity-30 animate-wiggle text-base" style={{ animationDelay: "1.2s" }}>{"*"}</div>
      </div>

      {/* Main hero illustration - large & prominent */}
      <div className="mt-12 relative">
        <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-[1.5rem] border-[3px] border-slate-800 shadow-[6px_6px_0px_0px_#1e293b] overflow-hidden bg-white animate-bounce-pop">
          <Image
            src="/images/s-start.jpg"
            alt={`${characterName} - 控糖生存指南主角`}
            fill
            className="object-cover"
            priority
            sizes="320px"
          />
        </div>
        {/* Decorative corner badges */}
        <div className="absolute -top-3 -right-3 bg-[#f5c542] border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] rounded-full w-10 h-10 flex items-center justify-center text-base animate-wiggle">
          {"!"}
        </div>
        <div className="absolute -bottom-2 -left-2 bg-[#5a9a6e] border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] rounded-full w-8 h-8 flex items-center justify-center text-sm text-white font-bold">
          {"GO"}
        </div>
      </div>

      {/* Title block */}
      <div className="mt-6 flex flex-col items-center gap-1">
        <h1 className="text-[2rem] font-black tracking-wide text-slate-800 leading-tight text-balance text-center">
          {"控糖生存指南"}
        </h1>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="h-[3px] w-8 rounded-full bg-[#e05a5a]" />
          <div className="h-[3px] w-8 rounded-full bg-[#f5c542]" />
          <div className="h-[3px] w-8 rounded-full bg-[#5a9a6e]" />
          <div className="h-[3px] w-8 rounded-full bg-[#e8824a]" />
        </div>
      </div>

      {/* Character introduction card */}
      <div className="mt-5 mx-6 speech-bubble px-5 py-4 max-w-xs">
        <p className="text-sm text-slate-600 text-center leading-relaxed">
          {"帮助 "}
          <span className="font-black text-slate-800 underline decoration-wavy decoration-[#f5c542] underline-offset-4 decoration-2">{characterName}</span>
          {" 做出正确的饮食选择"}
          <br />
          {"健康地活过7天吧!"}
        </p>
      </div>

      {/* Stat preview - 2x2 grid */}
      <div className="mt-5 grid grid-cols-2 gap-2 px-6 max-w-xs w-full">
        {STAT_CONFIG.map((s) => (
          <div
            key={s.key}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] text-xs font-bold text-slate-700"
            style={{ backgroundColor: s.bg }}
          >
            <span className="text-base">{s.emoji}</span>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Start button - large and prominent */}
      <button
        onClick={onStart}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        className={`mt-6 mb-4 w-64 py-4 rounded-2xl border-[3px] border-slate-800 bg-[#5a9a6e] text-white text-xl font-black tracking-widest transition-all duration-100 ${
          pressed
            ? "translate-x-1 translate-y-1 shadow-[0px_0px_0px_0px_#1e293b]"
            : "shadow-[5px_5px_0px_0px_#1e293b] hover:brightness-105"
        }`}
      >
        {"开始冒险!"}
      </button>

      {/* Swipe hint */}
      <p className="text-xs text-slate-400 tracking-wider mb-8 flex items-center gap-1.5">
        <span className="inline-block animate-wiggle">{"<"}</span>
        {" 滑动卡片做选择 "}
        <span className="inline-block animate-wiggle" style={{ animationDelay: "0.5s" }}>{">"}</span>
      </p>

      {/* Bottom grass */}
      <svg className="absolute bottom-0 left-0 right-0 opacity-20 pointer-events-none" width="100%" height="32" viewBox="0 0 400 32" preserveAspectRatio="none" fill="none">
        <path d="M0 32 Q8 16 16 28 Q24 8 32 24 Q40 12 48 28 Q56 4 64 24 Q72 14 80 28 Q88 6 96 24 Q104 14 112 28 Q120 4 128 24 Q136 12 144 28 Q152 6 160 26 Q168 14 176 28 Q184 8 192 24 Q200 12 208 28 Q216 4 224 24 Q232 14 240 28 Q248 6 256 24 Q264 12 272 28 Q280 4 288 24 Q296 14 304 28 Q312 6 320 24 Q328 12 336 28 Q344 4 352 24 Q360 14 368 28 Q376 8 384 24 Q392 14 400 28 V32 Z" fill="#5a9a6e"/>
      </svg>
    </div>
  )
}
