"use client"

import Image from "next/image"
import Link from "next/link"

const IMAGES = [
  "event-1-morning.jpg",
  "event-2-breakfast.jpg",
  "event-3-lunch.jpg",
  "event-4-tea.jpg",
  "event-5-exercise.jpg",
  "game-over.jpg",
  "gameover-doodle.jpg",
  "hero-start.jpg",
  "s-bedtime.jpg",
  "s-breakfast.jpg",
  "s-breakfast-2.jpg",
  "s-dinner.jpg",
  "s-dinner-2.jpg",
  "s-dinner-party.jpg",
  "s-exercise.jpg",
  "s-gameover.jpg",
  "s-light-meal.jpg",
  "s-light-meal-2.jpg",
  "s-lunch.jpg",
  "s-lunch-2.jpg",
  "s-low-sugar.jpg",
  "s-low-sugar-2.jpg",
  "s-low-sugar-3.jpg",
  "s-midnight-snack.jpg",
  "s-morning.jpg",
  "s-tea-2.jpg",
  "s-tea-3.jpg",
  "s-start.jpg",
  "s-tea.jpg",
  "s-victory.jpg",
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

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] p-4 pb-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-stone-800">图库 · 共 {IMAGES.length} 张</h1>
          <Link
            href="/"
            className="rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-200"
          >
            返回游戏
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {IMAGES.map((name) => (
            <a
              key={name}
              href={`/images/${name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-[4/3] bg-stone-100">
                <Image
                  src={`/images/${name}`}
                  alt={name}
                  fill
                  className="object-cover transition group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                />
              </div>
              <p className="truncate px-2 py-2 text-center text-xs text-stone-500" title={name}>
                {name}
              </p>
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}
