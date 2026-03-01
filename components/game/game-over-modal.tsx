"use client"

import Image from "next/image"
import { GAME_OVER_MESSAGES } from "@/lib/game-data"

interface GameOverModalProps {
  characterName: string
  reason: string
  onRestart: () => void
  onGoHome?: () => void
}

export function GameOverModal({ characterName, reason, onRestart, onGoHome }: GameOverModalProps) {
  const entry = GAME_OVER_MESSAGES[reason]
  const title = entry?.title ?? "Game Over"
  const subtitle = entry?.subtitle ?? ""

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-800/40 backdrop-blur-sm animate-in fade-in duration-300" aria-hidden />

      <div className="relative w-full max-w-xs flex flex-col items-center animate-in zoom-in-90 fade-in duration-500">
        {/* Illustration */}
        <div className="relative w-40 h-40 rounded-2xl border-2 border-slate-800 shadow-[4px_4px_0px_0px_#1e293b] overflow-hidden bg-white mb-4">
          <Image src="/images/s-gameover.jpg" alt="Game Over" fill className="object-cover" sizes="160px" />
        </div>

        {/* Content card */}
        <div className="w-full bg-white border-2 border-slate-800 rounded-2xl shadow-[4px_4px_0px_0px_#1e293b] text-center px-5 py-5">
          {/* Bubble tail pointing up */}
          <div className="absolute top-[152px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white" style={{ filter: "drop-shadow(0 -2px 0 #1e293b)" }} />

          <h2 className="text-xl font-black text-[#e05a5a] mb-2">{characterName + "倒下了..."}</h2>
          <p className="text-sm font-bold text-slate-800 mb-1">{title}</p>
          <p className="text-sm leading-relaxed text-slate-600 mb-4">{subtitle}</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={onRestart}
              className="w-full py-3 rounded-xl border-2 border-slate-800 shadow-[4px_4px_0px_0px_#1e293b] bg-[#5a9a6e] text-white text-base font-black transition-all duration-100 active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_#1e293b]"
            >
              {"再来一次!"}
            </button>
            {onGoHome && (
              <button
                onClick={onGoHome}
                className="w-full py-2.5 rounded-xl border-2 border-slate-800 shadow-[3px_3px_0px_0px_#1e293b] bg-white text-slate-700 text-sm font-black"
              >
                {"返回首页"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
