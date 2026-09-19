import type { Book, BookPage } from './types'

// Le texte est deja integre dans l'illustration (bulle nuage generee cote
// generator.py) : le PDF ne fait que reencoder l'image telle quelle, sans
// superposer une deuxieme fois page.text par-dessus.
function imageToCanvasDataUrl(img: HTMLImageElement): string {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  canvas.getContext('2d')!.drawImage(img, 0, 0)
  return canvas.toDataURL('image/jpeg', 0.93)
}

export async function downloadBookPdf(book: Book, pages: BookPage[]) {
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

    if (page.image_url) {
      try {
        const img = await loadImage(page.image_url)
        const dataUrl = imageToCanvasDataUrl(img)

        // Scale to fill A4 preserving aspect ratio (cover/letterbox)
        const ratio = img.naturalWidth / img.naturalHeight
        let iw = W, ih = W / ratio
        if (ih > H) { ih = H; iw = H * ratio }
        const x = (W - iw) / 2, y = (H - ih) / 2
        pdf.addImage(dataUrl, 'JPEG', x, y, iw, ih)
      } catch {
        if (i === 0) {
          pdf.setFontSize(24)
          pdf.setFont('helvetica', 'bold')
          pdf.text(book.title, W / 2, H / 2, { align: 'center' })
        }
      }
    }

    // Page number (non-cover)
    if (i > 0) {
      pdf.setFontSize(9)
      pdf.setTextColor(200, 195, 190)
      pdf.text(String(i), W / 2, H - 5, { align: 'center' })
    }
  }

  pdf.save(`${book.title.replace(/[^a-z0-9]/gi, '_')}.pdf`)
}
