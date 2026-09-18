import type { Book, BookPage } from './types'

function renderPageToCanvas(img: HTMLImageElement, text: string, placement: 'top' | 'bottom'): string {
  const canvas = document.createElement('canvas')
  const W = img.naturalWidth || 768
  const H = img.naturalHeight || 1024
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, W, H)

  if (text) {
    const zoneH = H * 0.30
    const zoneY = placement === 'top' ? 0 : H - zoneH

    // Sample brightness in the zone
    const sample = ctx.getImageData(0, zoneY, W, zoneH)
    let lum = 0
    for (let i = 0; i < sample.data.length; i += 16) {
      lum += 0.299 * sample.data[i] + 0.587 * sample.data[i + 1] + 0.114 * sample.data[i + 2]
    }
    lum /= sample.data.length / 16
    const useDark = lum > 155

    // Gradient overlay
    const grad = ctx.createLinearGradient(0, zoneY, 0, zoneY + zoneH)
    if (placement === 'top') {
      grad.addColorStop(0, useDark ? 'rgba(235,230,220,0.82)' : 'rgba(5,3,12,0.82)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
    } else {
      grad.addColorStop(0, 'rgba(0,0,0,0)')
      grad.addColorStop(1, useDark ? 'rgba(235,230,220,0.82)' : 'rgba(5,3,12,0.82)')
    }
    ctx.fillStyle = grad
    ctx.fillRect(0, zoneY, W, zoneH)

    // Auto-size and wrap text
    const maxW = W * 0.84
    const availH = zoneH * 0.72
    const wrapLines = (size: number): string[] => {
      ctx.font = `600 ${size}px "DM Sans", "Noto Sans JP", sans-serif`
      const words = text.split(' ')
      const result: string[] = []
      let line = ''
      for (const w of words) {
        const test = line ? `${line} ${w}` : w
        if (ctx.measureText(test).width > maxW && line) { result.push(line); line = w }
        else line = test
      }
      if (line) result.push(line)
      return result
    }
    let fontSize = 48, lines: string[] = []
    for (fontSize = 52; fontSize >= 20; fontSize -= 2) {
      lines = wrapLines(fontSize)
      if (lines.length * fontSize * 1.4 <= availH) break
    }

    const lineH = fontSize * 1.4
    const totalH = lines.length * lineH
    const zoneCenter = placement === 'top' ? zoneH / 2 : H - zoneH / 2
    const startY = zoneCenter - totalH / 2 + lineH * 0.5

    ctx.font = `600 ${fontSize}px "DM Sans", "Noto Sans JP", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = useDark ? 'rgba(180,170,160,0.5)' : 'rgba(0,0,0,0.55)'
    ctx.shadowBlur = 5
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1
    ctx.fillStyle = useDark ? 'rgba(18,12,8,0.97)' : 'rgba(255,252,245,0.97)'
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], W / 2, startY + i * lineH)
    }
  }

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
        const isCover = i === 0
        const dataUrl = isCover
          ? (() => {
              const c = document.createElement('canvas')
              c.width = img.naturalWidth; c.height = img.naturalHeight
              c.getContext('2d')!.drawImage(img, 0, 0)
              return c.toDataURL('image/jpeg', 0.93)
            })()
          : renderPageToCanvas(img, page.text || '', 'bottom')

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
