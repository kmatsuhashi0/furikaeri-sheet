import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export async function generatePdfFromElement(element: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#faf8f1',
    useCORS: true,
  })

  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const ratio = pageWidth / canvas.width
  const pageHeightInCanvasPx = pageHeight / ratio

  let renderedHeight = 0
  let isFirstPage = true

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
    if (!isFirstPage) pdf.addPage()
    pdf.addImage(sliceCanvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pageWidth, sliceImgHeightPt)

    renderedHeight += sliceHeight
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
