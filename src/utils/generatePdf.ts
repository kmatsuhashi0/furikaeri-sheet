import type { ReactElement } from 'react'
import { createRoot } from 'react-dom/client'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

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
      scale: 1.5,
      backgroundColor: '#ffffff',
      useCORS: true,
    })
  } finally {
    root.unmount()
    document.body.removeChild(host)
  }
}

interface QualityTier {
  dpi: number
  jpeg: number
}

// 文章量が多くてもサーバーの受付上限（約4.5MB）を超えないよう、大きすぎる場合は段階的に画質を下げる
const QUALITY_TIERS: QualityTier[] = [
  { dpi: 130, jpeg: 0.7 },
  { dpi: 100, jpeg: 0.55 },
  { dpi: 80, jpeg: 0.45 },
]
const MAX_PDF_BYTES = 2_800_000

async function buildPdf(sections: ReactElement[], tier: QualityTier): Promise<Blob> {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', compress: true })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  let isFirstPage = true

  for (const section of sections) {
    const canvas = await renderSectionToCanvas(section)
    // 1セクション = 1ページに収まるよう、幅・高さの両方に合わせて縮小する
    const scale = Math.min(pageWidth / canvas.width, pageHeight / canvas.height)
    const imgWidth = canvas.width * scale
    const imgHeight = canvas.height * scale

    const targetWidth = Math.min(canvas.width, Math.round((imgWidth / 72) * tier.dpi))
    const targetHeight = Math.max(1, Math.round((targetWidth * canvas.height) / canvas.width))
    const pageCanvas = document.createElement('canvas')
    pageCanvas.width = targetWidth
    pageCanvas.height = targetHeight
    const ctx = pageCanvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, targetWidth, targetHeight)
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight)
    }

    if (!isFirstPage) pdf.addPage()
    pdf.addImage(pageCanvas.toDataURL('image/jpeg', tier.jpeg), 'JPEG', 0, 0, imgWidth, imgHeight)
    isFirstPage = false
  }

  return pdf.output('blob')
}

export async function generateSectionedPdf(sections: ReactElement[]): Promise<Blob> {
  let blob: Blob | null = null
  for (const tier of QUALITY_TIERS) {
    blob = await buildPdf(sections, tier)
    if (blob.size <= MAX_PDF_BYTES) return blob
  }
  return blob as Blob
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      resolve(result.split(',')[1] ?? '')
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}
