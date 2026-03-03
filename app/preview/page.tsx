"use client"

import Image from "next/image"
import Link from "next/link"

/** 事件场景图：文件名 → 场景说明 */
const SCENE_IMAGES: { file: string; name: string }[] = [
  { file: "s-morning.jpg", name: "早晨/起床/户外/路上" },
  { file: "s-breakfast.jpg", name: "早餐/餐桌早餐" },
  { file: "s-lunch.jpg", name: "午餐/外卖/食堂/简餐" },
  { file: "s-tea.jpg", name: "下午茶/办公室/零食/奶茶" },
  { file: "s-exercise.jpg", name: "运动/晨练/打球/练后" },
  { file: "s-light-meal.jpg", name: "轻食/减脂餐/沙拉" },
  { file: "s-bedtime.jpg", name: "睡前/卧室" },
  { file: "s-midnight-snack.jpg", name: "夜宵/深夜小食" },
  { file: "s-dinner.jpg", name: "晚饭/家常菜/厨房" },
  { file: "s-dinner-party.jpg", name: "火锅/饭局/社交/喝酒" },
  { file: "s-low-sugar.jpg", name: "低血糖/疲惫/急救" },
]

/** 界面用图 */
const UI_IMAGES: { file: string; name: string }[] = [
  { file: "s-start.jpg", name: "开始/角色展示" },
  { file: "s-victory.jpg", name: "通关/胜利" },
  { file: "s-gameover.jpg", name: "游戏结束" },
]

/** 其他素材（仅文件名） */
const OTHER_IMAGES = [
  "event-1-morning.jpg",
  "event-2-breakfast.jpg",
  "event-3-lunch.jpg",
  "event-4-tea.jpg",
  "event-5-exercise.jpg",
  "game-over.jpg",
  "gameover-doodle.jpg",
  "hero-start.jpg",
  "scene-breakfast-doodle.jpg",
  "scene-exercise-doodle.jpg",
  "scene-lunch-doodle.jpg",
  "scene-morning-doodle.jpg",
  "scene-morning.jpg",
  "scene-tea-doodle.jpg",
  "start-doodle.jpg",
  "start-hero.jpg",
  "victory-doodle.jpg",
  "victory.jpg",
]

function ImageCard({
  file,
  name,
  subLabel,
}: {
  file: string
  name: string
  subLabel?: string
}) {
  return (
    <a
      href={`/images/${file}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-square bg-stone-100">
        <Image
          src={`/images/${file}`}
          alt={name}
          fill
          className="object-cover transition group-hover:scale-[1.02]"
          sizes="240px"
        />
      </div>
      <div className="flex flex-col gap-0.5 px-3 py-2">
        <p className="font-medium text-stone-800" title={name}>
          {name}
        </p>
        {subLabel !== undefined && (
          <p className="text-xs text-stone-500" title={subLabel}>
            {subLabel}
          </p>
        )}
      </div>
    </a>
  )
}

export default function PreviewPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] p-4 pb-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-stone-800">图片与名称总览</h1>
          <div className="flex gap-2">
            <Link
              href="/gallery"
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100"
            >
              图库
            </Link>
            <Link
              href="/"
              className="rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-200"
            >
              返回游戏
            </Link>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-stone-700">
            事件场景图（{SCENE_IMAGES.length} 张）
          </h2>
          <p className="mb-4 text-sm text-stone-500">
            用于事件卡片的场景图，对应文档中的「可用图片一览」。
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {SCENE_IMAGES.map(({ file, name }) => (
              <ImageCard key={file} file={file} name={name} subLabel={file} />
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-stone-700">
            界面用图（{UI_IMAGES.length} 张）
          </h2>
          <p className="mb-4 text-sm text-stone-500">
            首页、胜利、游戏结束等界面使用。
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {UI_IMAGES.map(({ file, name }) => (
              <ImageCard key={file} file={file} name={name} subLabel={file} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-stone-700">
            其他素材（{OTHER_IMAGES.length} 张）
          </h2>
          <p className="mb-4 text-sm text-stone-500">
            未在事件中使用的备用或旧版素材，仅展示文件名。
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {OTHER_IMAGES.map((file) => (
              <ImageCard key={file} file={file} name={file} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
