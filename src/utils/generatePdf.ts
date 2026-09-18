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
      backgroundColor: '#faf8f1',
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

  let isFirstPageOverall = true

  for (const section of sections) {
    const canvas = await renderSectionToCanvas(section)
    const ratio = pageWidth / canvas.width
    const pageHeightInCanvasPx = pageHeight / ratio

    let renderedHeight = 0

    while (renderedHeight < canvas.height) {
      const sliceHeight = Math.min(pageHeightInCanvasPx, canvas.height - renderedHeight)

      const sliceCanvas = document.createElement('canvas')
      sliceCanvas.width = canvas.width
      sliceCanvas.height = sliceHeight
      const ctx = sliceCanvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(canvas, 0, renderedHeight, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight)
      }

      const sliceImgHeightPt = sliceHeight * ratio
      if (!isFirstPageOverall) pdf.addPage()
      pdf.addImage(sliceCanvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pageWidth, sliceImgHeightPt)

      renderedHeight += sliceHeight
      isFirstPageOverall = false
    }
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
