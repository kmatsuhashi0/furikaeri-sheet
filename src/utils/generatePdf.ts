import type { ReactElement } from 'react'
import { createRoot } from 'react-dom/client'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import UPNG from 'upng-js'

const CAPTURE_SCALE = 2
const TARGET_DPI = 170
const PNG_COLORS = 256
// 1通あたりの目標サイズ。サーバーの受付上限(約4.5MB)に余裕を持たせる
const PART_TARGET_BYTES = 3_600_000
const PART_HARD_LIMIT_BYTES = 4_200_000

interface PageImage {
  png: Uint8Array
  widthPt: number
  heightPt: number
}

async function renderSectionToCanvas(element: ReactElement): Promise<HTMLCanvasElement> {
  const host = document.createElement('div')
  host.className = 'pdf-offscreen-host'
  document.body.appendChild(host)

  const capture = document.createElement('div')
  capture.className = 'pdf-capture'
  host.appendChild(capture)

  const root = createRoot(capture)
  await new Promise<void>((resolve) => {
    root.render(element)
    setTimeout(resolve, 50)
  })

  try {
    return await html2canvas(capture, {
      scale: CAPTURE_SCALE,
      backgroundColor: '#ffffff',
      useCORS: true,
    })
  } finally {
    root.unmount()
    document.body.removeChild(host)
  }
}

function canvasToPageImage(canvas: HTMLCanvasElement, pageWidthPt: number, pageHeightPt: number): PageImage {
  // 1セクション = 1ページに収まるよう、幅・高さの両方に合わせて縮小する
  const scale = Math.min(pageWidthPt / canvas.width, pageHeightPt / canvas.height)
  const widthPt = canvas.width * scale
  const heightPt = canvas.height * scale

  const targetWidth = Math.min(canvas.width, Math.round((widthPt / 72) * TARGET_DPI))
  const targetHeight = Math.max(1, Math.round((targetWidth * canvas.height) / canvas.width))
  const pageCanvas = document.createElement('canvas')
  pageCanvas.width = targetWidth
  pageCanvas.height = targetHeight
  const ctx = pageCanvas.getContext('2d')
  if (!ctx) throw new Error('canvas unavailable')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, targetWidth, targetHeight)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight)

  // 文字や罫線は色数が少ないため、256色のPNGにすると、にじまずに軽くできる
  const { data } = ctx.getImageData(0, 0, targetWidth, targetHeight)
  const png = new Uint8Array(UPNG.encode([data.buffer as ArrayBuffer], targetWidth, targetHeight, PNG_COLORS))
  return { png, widthPt, heightPt }
}

function buildPdf(pages: PageImage[]): Blob {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', compress: true })
  pages.forEach((page, index) => {
    if (index > 0) pdf.addPage()
    pdf.addImage(page.png, 'PNG', 0, 0, page.widthPt, page.heightPt)
  })
  return pdf.output('blob')
}

function packPages(pages: PageImage[], targetBytes: number): PageImage[][] {
  const groups: PageImage[][] = []
  let current: PageImage[] = []
  let currentBytes = 0
  for (const page of pages) {
    const pageBytes = page.png.length + 2_000
    if (current.length > 0 && currentBytes + pageBytes > targetBytes) {
      groups.push(current)
      current = []
      currentBytes = 0
    }
    current.push(page)
    currentBytes += pageBytes
  }
  if (current.length > 0) groups.push(current)
  return groups
}

export interface GeneratedPdf {
  /** 回答者がダウンロードする、全ページ入りの1つのPDF */
  full: Blob
  /** メールで送る単位。サイズが大きい場合は複数に分割される */
  parts: Blob[]
}

export async function generateSectionedPdf(sections: ReactElement[]): Promise<GeneratedPdf> {
  const probe = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = probe.internal.pageSize.getWidth()
  const pageHeight = probe.internal.pageSize.getHeight()

  const pages: PageImage[] = []
  for (const section of sections) {
    const canvas = await renderSectionToCanvas(section)
    pages.push(canvasToPageImage(canvas, pageWidth, pageHeight))
  }

  const full = buildPdf(pages)
  if (full.size <= PART_TARGET_BYTES) return { full, parts: [full] }

  let target = PART_TARGET_BYTES
  let parts: Blob[] = []
  for (let attempt = 0; attempt < 4; attempt++) {
    parts = packPages(pages, target).map(buildPdf)
    if (parts.every((part) => part.size <= PART_HARD_LIMIT_BYTES)) break
    target *= 0.7
  }
  return { full, parts }
}
