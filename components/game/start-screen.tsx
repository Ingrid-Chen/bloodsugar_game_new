"use client"

import Image from "next/image"
import { useState } from "react"
import { BookOpen } from "lucide-react"
import { STAT_CONFIG } from "@/lib/game-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface StartScreenProps {
  characterName: string
  onStart: () => void
}

export function StartScreen({ characterName, onStart }: StartScreenProps) {
  const [pressed, setPressed] = useState(false)

  return (
    <div className="min-h-svh flex flex-col items-center justify-center paper-bg relative overflow-hidden py-6 px-4">
      {/* 右上角：活动规则 */}
      <div className="absolute top-0 right-0 z-10 pt-safe pr-3">
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] bg-white/90 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              aria-label="活动规则"
            >
              <BookOpen className="size-4" />
              {"活动规则"}
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

      {/* 顶部留白与装饰（不占主要视觉重心） */}
      <div className="absolute top-0 left-0 w-full pt-safe h-16 pointer-events-none">
        <div className="absolute top-6 left-4 text-[#f5c542] opacity-30 animate-wiggle text-sm">{"*"}</div>
        <div className="absolute top-8 right-16 text-[#e8824a] opacity-25 animate-wiggle text-xs" style={{ animationDelay: "0.6s" }}>{"*"}</div>
      </div>

      {/* 主内容区：上下居中、紧凑协调 */}
      <div className="flex flex-col items-center w-full max-w-sm flex-1 justify-center gap-4 sm:gap-5">
        {/* 主图 - 适度缩小，与下方平衡 */}
        <div className="relative shrink-0">
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-[1.25rem] border-[3px] border-slate-800 shadow-[5px_5px_0px_0px_#1e293b] overflow-hidden bg-white animate-bounce-pop">
            <Image
              src="/images/s-start.jpg"
              alt={`${characterName} - 控糖生存指南主角`}
              fill
              className="object-cover"
              priority
              sizes="280px"
            />
          </div>
          <div className="absolute -top-2 -right-2 bg-[#f5c542] border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] rounded-full w-9 h-9 flex items-center justify-center text-sm animate-wiggle">{"!"}</div>
          <div className="absolute -bottom-1 -left-1 bg-[#5a9a6e] border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] rounded-full w-7 h-7 flex items-center justify-center text-xs text-white font-bold">{"GO"}</div>
        </div>

        {/* 标题 */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <h1 className="text-xl sm:text-2xl font-black tracking-wide text-slate-800 leading-tight text-center">
            {"控糖生存指南"}
          </h1>
          <div className="flex items-center gap-1.5">
            <div className="h-[3px] w-6 rounded-full bg-[#e05a5a]" />
            <div className="h-[3px] w-6 rounded-full bg-[#f5c542]" />
            <div className="h-[3px] w-6 rounded-full bg-[#5a9a6e]" />
            <div className="h-[3px] w-6 rounded-full bg-[#e8824a]" />
          </div>
        </div>

        {/* 气泡：两行文案 */}
        <div className="speech-bubble px-5 py-4 max-w-xs w-full shrink-0">
          <p className="text-sm text-slate-600 text-center leading-relaxed">
            <span className="font-black text-slate-800">{`我是 ${characterName}`}</span>
            <br />
            {"我要做出正确选择，才能活过七天。"}
          </p>
        </div>

        {/* 四项数值 + 提示：每个选择都会影响 */}
        <div className="w-full max-w-xs shrink-0">
          <p className="text-xs text-slate-500 text-center mb-2 px-1">
            {"你的每个选择都会影响下面四项 →"}
          </p>
          <div className="grid grid-cols-2 gap-2">
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
        </div>

        {/* 开始按钮 */}
        <button
          onClick={onStart}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onPointerLeave={() => setPressed(false)}
          className={`shrink-0 w-56 sm:w-64 py-3.5 rounded-2xl border-[3px] border-slate-800 bg-[#5a9a6e] text-white text-lg font-black tracking-widest transition-all duration-100 ${
            pressed
              ? "translate-x-1 translate-y-1 shadow-[0px_0px_0px_0px_#1e293b]"
              : "shadow-[5px_5px_0px_0px_#1e293b] hover:brightness-105"
          }`}
        >
          {"开始冒险!"}
        </button>

        {/* 滑动提示 */}
        <p className="text-xs text-slate-400 tracking-wider shrink-0 flex items-center gap-1.5">
          <span className="inline-block animate-wiggle">{"<"}</span>
          {" 滑动卡片做选择 "}
          <span className="inline-block animate-wiggle" style={{ animationDelay: "0.5s" }}>{">"}</span>
        </p>
      </div>

      {/* Bottom grass */}
      <svg className="absolute bottom-0 left-0 right-0 opacity-20 pointer-events-none" width="100%" height="32" viewBox="0 0 400 32" preserveAspectRatio="none" fill="none">
        <path d="M0 32 Q8 16 16 28 Q24 8 32 24 Q40 12 48 28 Q56 4 64 24 Q72 14 80 28 Q88 6 96 24 Q104 14 112 28 Q120 4 128 24 Q136 12 144 28 Q152 6 160 26 Q168 14 176 28 Q184 8 192 24 Q200 12 208 28 Q216 4 224 24 Q232 14 240 28 Q248 6 256 24 Q264 12 272 28 Q280 4 288 24 Q296 14 304 28 Q312 6 320 24 Q328 12 336 28 Q344 4 352 24 Q360 14 368 28 Q376 8 384 24 Q392 14 400 28 V32 Z" fill="#5a9a6e"/>
      </svg>
    </div>
  )
}
