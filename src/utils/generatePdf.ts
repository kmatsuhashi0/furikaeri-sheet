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
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    })
  } finally {
    root.unmount()
    document.body.removeChild(host)
  }
}

export async function generateSectionedPdf(sections: ReactElement[]): Promise<Blob> {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  let isFirstPage = true

  for (const section of sections) {
    const canvas = await renderSectionToCanvas(section)
    // 1セクション = 1ページに収まるよう、幅・高さの両方に合わせて縮小する
    const scale = Math.min(pageWidth / canvas.width, pageHeight / canvas.height)
    const imgWidth = canvas.width * scale
    const imgHeight = canvas.height * scale

    if (!isFirstPage) pdf.addPage()
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, imgWidth, imgHeight)
    isFirstPage = false
  }

  return pdf.output('blob')
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
