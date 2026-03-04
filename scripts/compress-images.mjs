/**
 * 压缩 public/images 下的 jpg/png，缩小体积以加快加载。
 * 策略：最大边 1024px，轻度锐化提升观感清晰度，JPEG 质量 88 + mozjpeg。
 */
import sharp from "sharp"
import { readdir, stat } from "fs/promises"
import { join, extname } from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const IMAGES_DIR = join(__dirname, "..", "public", "images")

const MAX_SIZE = 1024
const JPEG_QUALITY = 88
/** 锐化强度：sigma 越大锐化越强，1–1.5 较自然 */
const SHARPEN_SIGMA = 1.2
const EXT = [".jpg", ".jpeg", ".png"]

async function compressImages() {
  const files = await readdir(IMAGES_DIR)
  let totalBefore = 0
  let totalAfter = 0

  for (const name of files) {
    if (!EXT.includes(extname(name).toLowerCase())) continue
    const inputPath = join(IMAGES_DIR, name)
    const st = await stat(inputPath)
    totalBefore += st.size

    const isPng = name.toLowerCase().endsWith(".png")
    let pipeline = sharp(inputPath)
      .resize(MAX_SIZE, MAX_SIZE, { fit: "inside", withoutEnlargement: true })
      .sharpen({ sigma: SHARPEN_SIGMA })

    if (isPng) {
      await pipeline.png({ compressionLevel: 8 }).toFile(inputPath + ".tmp")
    } else {
      await pipeline
        .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
        .toFile(inputPath + ".tmp")
    }

    const afterSt = await stat(inputPath + ".tmp")
    totalAfter += afterSt.size
    await import("fs").then((fs) =>
      fs.promises.rename(inputPath + ".tmp", inputPath)
    )
    const pct = ((1 - afterSt.size / st.size) * 100).toFixed(0)
    console.log(`${name}: ${(st.size / 1024).toFixed(0)}KB → ${(afterSt.size / 1024).toFixed(0)}KB (-${pct}%)`)
  }

  console.log(`\nTotal: ${(totalBefore / 1024 / 1024).toFixed(2)}MB → ${(totalAfter / 1024 / 1024).toFixed(2)}MB`)
}

compressImages().catch((err) => {
  console.error(err)
  process.exit(1)
})
