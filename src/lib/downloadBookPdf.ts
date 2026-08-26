import type { Book, BookPage } from './types'

export async function downloadBookPdf(book: Book, pages: BookPage[]) {
  // If a pre-generated PDF exists, use it directly
  if (book.pdf_url) {
    const a = document.createElement('a')
    a.href = book.pdf_url
    a.download = `${book.title}.pdf`
    a.click()
    return
  }

  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const H = 297
  const MARGIN = 15

  const loadImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    if (i > 0) pdf.addPage()

    const isCover = i === 0

    if (isCover) {
      // Cover: full-page image
      if (page.image_url) {
        try {
          const img = await loadImage(page.image_url)
          const ratio = img.naturalWidth / img.naturalHeight
          let iw = W, ih = W / ratio
          if (ih > H) { ih = H; iw = H * ratio }
          const x = (W - iw) / 2
          const y = (H - ih) / 2
          pdf.addImage(img, 'JPEG', x, y, iw, ih)
        } catch {
          pdf.setFontSize(24)
          pdf.setFont('helvetica', 'bold')
          pdf.text(book.title, W / 2, H / 2, { align: 'center' })
        }
      } else {
        pdf.setFontSize(24)
        pdf.setFont('helvetica', 'bold')
        pdf.text(book.title, W / 2, H / 2, { align: 'center' })
      }
    } else {
      // Content pages: image top 2/3, text bottom 1/3
      const imgAreaH = (H - MARGIN * 2) * 0.65
      const textAreaY = MARGIN + imgAreaH + 8
      const textAreaH = H - textAreaY - MARGIN

      if (page.image_url) {
        try {
          const img = await loadImage(page.image_url)
          const maxW = W - MARGIN * 2
          const ratio = img.naturalWidth / img.naturalHeight
          let iw = maxW, ih = maxW / ratio
          if (ih > imgAreaH) { ih = imgAreaH; iw = imgAreaH * ratio }
          const x = MARGIN + (maxW - iw) / 2
          pdf.addImage(img, 'JPEG', x, MARGIN, iw, ih)
        } catch { /* no image, skip */ }
      }

      if (page.text) {
        pdf.setFontSize(13)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(40, 30, 25)
        const lines = pdf.splitTextToSize(page.text, W - MARGIN * 2)
        const lineH = 6
        const totalH = lines.length * lineH
        const startY = textAreaY + Math.max(0, (textAreaH - totalH) / 2)
        pdf.text(lines, W / 2, startY, { align: 'center' })
      }

      // Page number
      pdf.setFontSize(9)
      pdf.setTextColor(160, 150, 145)
      pdf.text(String(i), W / 2, H - 6, { align: 'center' })
    }
  }

  pdf.save(`${book.title.replace(/[^a-z0-9]/gi, '_')}.pdf`)
}
