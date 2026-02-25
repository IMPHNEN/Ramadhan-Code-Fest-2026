// lib/imageGenerator.ts

export function drawExcuseImage(
  canvas: HTMLCanvasElement,
  text: string,
  rarity: string
) {
  const ctx = canvas.getContext('2d')!
  const w = canvas.width
  const h = canvas.height

  const glow: Record<string, string> = {
    common: '#94a3b8',
    rare: '#38bdf8',
    epic: '#c084fc',
    legendary: '#facc15',
    mythic: '#fb7185'
  }

  // background
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, w, h)

  // border
  ctx.strokeStyle = glow[rarity] || '#fff'
  ctx.lineWidth = 10
  ctx.strokeRect(10, 10, w - 20, h - 20)

  // title
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 54px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Ramadhan Excuse Protocol', w / 2, 140)

  // text
  ctx.font = 'bold 64px sans-serif'
  wrapText(ctx, text, w / 2, h / 2, 820, 90)

  // rarity
  ctx.font = 'bold 42px sans-serif'
  ctx.fillStyle = glow[rarity] || '#fff'
  ctx.fillText(rarity.toUpperCase(), w / 2, h - 160)

  // watermark
  ctx.font = '24px monospace'
  ctx.fillStyle = '#64748b'
  ctx.fillText('ramadhan-excuse.vercel.app', w / 2, h - 80)
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ')
  let line = ''
  let yy = y

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' '
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      ctx.fillText(line, x, yy)
      line = words[n] + ' '
      yy += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, yy)
}