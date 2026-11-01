import {
  BarController, BarElement, CategoryScale, Chart, Legend, LinearScale, LineController, LineElement, PointElement, Tooltip,
  type ChartConfiguration, type Plugin,
} from 'chart.js'
import { DOMINIOS, faixaPorId, formatarData, pontuar, type Avaliacao } from './domain'

Chart.register(LineController, LineElement, PointElement, BarController, BarElement, LinearScale, CategoryScale, Legend, Tooltip)

const INK = '#1B2B36'
const INK_SOFT = '#5B6C78'
const GRID = '#D6E2EA'
const FONT = "'Nunito Sans Variable', 'Nunito Sans', system-ui, sans-serif"

const ts = (iso: string) => new Date(iso + 'T12:00:00').getTime()

/** Caderneta curve-sheet: printed band fills plus a fine graph-paper grid. Bands are sheet material, not clinical zones. */
const folhaDeCurva: Plugin = {
  id: 'folhaDeCurva',
  beforeDatasetsDraw(chart) {
    const { ctx, chartArea: a, scales } = chart
    const y = scales.y
    ctx.save()
    for (let v = 0; v < 100; v += 10) {
      const top = y.getPixelForValue(v + 10)
      const bottom = y.getPixelForValue(v)
      ctx.fillStyle = (v / 10) % 2 === 0 ? 'rgba(46, 148, 103, 0.075)' : 'rgba(242, 182, 48, 0.07)'
      ctx.fillRect(a.left, top, a.right - a.left, bottom - top)
    }
    ctx.strokeStyle = 'rgba(30, 95, 140, 0.09)'
    ctx.lineWidth = 1
    const fino = a.right - a.left >= 640 // fine grid only where it reads as paper, not hatching
    for (let v = fino ? 2 : 10; v < 100; v += fino ? 2 : 10) {
      if (v % 10 === 0) continue
      const py = Math.round(y.getPixelForValue(v)) + 0.5
      ctx.beginPath(); ctx.moveTo(a.left, py); ctx.lineTo(a.right, py); ctx.stroke()
    }
    const passo = (a.bottom - a.top) / (fino ? 50 : 10)
    for (let px = a.left + passo; px < a.right; px += passo) {
      ctx.beginPath(); ctx.moveTo(Math.round(px) + 0.5, a.top); ctx.lineTo(Math.round(px) + 0.5, a.bottom); ctx.stroke()
    }
    ctx.restore()
  },
}

/** Printed age-band strip above the plot, plus a dashed rule at each change. */
const faixasImpressas = (segs: { de: number; ate: number; faixa: string; rotulo: string }[]): Plugin => ({
  id: 'faixasImpressas',
  afterDatasetsDraw(chart) {
    const { ctx, chartArea: a, scales } = chart
    const x = (v: number) => Math.min(a.right, Math.max(a.left, scales.x.getPixelForValue(v)))
    ctx.save()
    segs.forEach((sg, i) => {
      const x0 = i === 0 ? a.left : x(sg.de)
      const x1 = i === segs.length - 1 ? a.right : x(sg.ate)
      ctx.fillStyle = i % 2 === 0 ? '#1e5f8c' : '#154a6e'
      ctx.fillRect(x0, a.top - 26, x1 - x0, 20)
      ctx.fillStyle = '#fff'
      ctx.font = `800 11px ${FONT}`
      ctx.textAlign = 'left'
      const label = x1 - x0 > 120 ? `Faixa ${sg.faixa} · ${sg.rotulo}` : `Faixa ${sg.faixa}`
      ctx.fillText(label, x0 + 8, a.top - 12)
      if (i > 0) {
        ctx.setLineDash([6, 5]); ctx.strokeStyle = INK_SOFT; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.moveTo(x0, a.top - 6); ctx.lineTo(x0, a.bottom); ctx.stroke(); ctx.setLineDash([])
      }
    })
    ctx.restore()
  },
})

/** Value printed above each bar. */
const valorNaBarra: Plugin = {
  id: 'valorNaBarra',
  afterDatasetsDraw(chart) {
    const { ctx } = chart
    if (chart.width < 640) return // labels collide on phones; tooltip still shows values
    ctx.save()
    ctx.fillStyle = INK
    ctx.textAlign = 'center'
    ctx.font = `700 11px ${FONT}`
    chart.data.datasets.forEach((ds, i) => {
      const meta = chart.getDatasetMeta(i)
      if (meta.hidden) return
      meta.data.forEach((bar, j) => {
        ctx.fillText(String(ds.data[j]), bar.x, bar.y - 4)
      })
    })
    ctx.restore()
  },
}

export function configEvolucao(avs: Avaliacao[], opts: { estatico?: boolean } = {}): ChartConfiguration<'line'> {
  const pts = avs.map((a) => ({ x: ts(a.data), p: pontuar(a), faixa: a.faixa }))
  const segs: { de: number; ate: number; faixa: string; rotulo: string }[] = []
  pts.forEach((p, i) => {
    const meio = i > 0 ? (p.x + pts[i - 1].x) / 2 : -Infinity
    if (i === 0 || p.faixa !== pts[i - 1].faixa) {
      if (segs.length) segs[segs.length - 1].ate = meio
      segs.push({ de: meio, ate: Infinity, faixa: p.faixa, rotulo: faixaPorId(p.faixa).rotulo })
    }
  })
  const min = pts[0]?.x ?? 0
  const max = pts[pts.length - 1]?.x ?? 1
  const pad = Math.max((max - min) * 0.04, 86_400_000 * 3)
  return {
    type: 'line',
    data: {
      datasets: [
        ...DOMINIOS.map((d) => ({
          label: d.nome,
          data: pts.map((p) => ({ x: p.x, y: p.p[d.id] })),
          borderColor: d.cor + 'CC',
          backgroundColor: d.cor,
          borderWidth: 1.75,
          pointRadius: 3,
          tension: 0,
        })),
        {
          label: 'Geral',
          data: pts.map((p) => ({ x: p.x, y: p.p.geral })),
          borderColor: INK,
          backgroundColor: INK,
          borderWidth: 4.5,
          pointRadius: 5,
          tension: 0,
        },
      ],
    },
    options: {
      animation: opts.estatico ? false : { duration: 500 },
      responsive: !opts.estatico,
      maintainAspectRatio: false,
      devicePixelRatio: opts.estatico ? 2 : undefined,
      layout: { padding: { top: 28 } },
      interaction: { mode: 'nearest', intersect: false },
      // The curve rises from the baseline once, on first draw.
      animations: opts.estatico ? undefined : { y: { from: (ctx: { chart: Chart }) => ctx.chart.scales.y?.getPixelForValue(0), duration: 900, easing: 'easeOutQuart' } } as never,
      scales: {
        x: {
          type: 'linear',
          min: min - pad,
          max: max + pad,
          afterBuildTicks: (axis) => { axis.ticks = pts.map((p) => ({ value: p.x })) },
          ticks: { callback: (v) => formatarData(new Date(Number(v)).toISOString()), color: INK_SOFT, font: { family: FONT, size: 12 }, maxRotation: 0, autoSkip: true },
          grid: { color: GRID },
          border: { color: GRID },
        },
        y: {
          min: 0, max: 100,
          ticks: { stepSize: 20, callback: (v) => `${v}%`, color: INK_SOFT, font: { family: FONT, size: 12 } },
          grid: { color: 'rgba(30, 95, 140, 0.24)' },
          border: { display: false },
        },
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 8, boxHeight: 8, padding: 16, color: INK, font: { family: FONT, size: 13, weight: 600 } },
        },
        tooltip: {
          backgroundColor: INK,
          titleFont: { family: FONT }, bodyFont: { family: FONT },
          callbacks: { title: (it) => formatarData(new Date(Number(it[0].parsed.x)).toISOString()), label: (it) => ` ${it.dataset.label}: ${it.parsed.y}%` },
        },
      },
    },
    plugins: [folhaDeCurva, faixasImpressas(segs)],
  }
}

/** Light → strong ramp of caderneta blue, oldest first. */
export function rampa(n: number): string[] {
  const claro = [104, 146, 184] // ≥3:1 on white so the oldest bar stays visible
  const forte = [20, 74, 112]
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 1 : i / (n - 1)
    const c = claro.map((v, k) => Math.round(v + (forte[k] - v) * t))
    return `rgb(${c.join(',')})`
  })
}

export function configBarras(avs: Avaliacao[], opts: { estatico?: boolean } = {}): ChartConfiguration<'bar'> {
  const cores = rampa(avs.length)
  return {
    type: 'bar',
    data: {
      labels: DOMINIOS.map((d) => d.curto.split(' ')),
      datasets: avs.map((a, i) => ({
        label: formatarData(a.data),
        data: DOMINIOS.map((d) => pontuar(a)[d.id]),
        backgroundColor: cores[i],
        borderRadius: 3,
        maxBarThickness: 34,
        categoryPercentage: 0.78,
        barPercentage: 0.92,
      })),
    },
    options: {
      animation: opts.estatico ? false : { duration: 500 },
      responsive: !opts.estatico,
      maintainAspectRatio: false,
      devicePixelRatio: opts.estatico ? 2 : undefined,
      layout: { padding: { top: 18 } },
      scales: {
        x: { ticks: { color: INK, maxRotation: 50, autoSkip: false, font: { family: FONT, size: 12, weight: 600 } }, grid: { display: false }, border: { color: GRID } },
        y: { min: 0, max: 100, ticks: { stepSize: 20, callback: (v) => `${v}%`, color: INK_SOFT, font: { family: FONT, size: 12 } }, grid: { color: GRID }, border: { display: false } },
      },
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 14, boxHeight: 14, padding: 16, color: INK, font: { family: FONT, size: 13, weight: 600 } } },
        tooltip: { backgroundColor: INK, callbacks: { label: (it) => ` ${it.dataset.label}: ${it.parsed.y}%` } },
      },
    },
    plugins: [valorNaBarra],
  }
}

/** Renders a chart offscreen and returns a PNG data URL (for the PDF). */
export async function graficoComoImagem(config: ChartConfiguration, largura: number, altura: number): Promise<string> {
  await document.fonts?.ready
  const canvas = document.createElement('canvas')
  canvas.width = largura * 2
  canvas.height = altura * 2
  canvas.style.width = `${largura}px`
  canvas.style.height = `${altura}px`
  const holder = document.createElement('div')
  holder.style.cssText = `position:fixed;left:-10000px;top:0;width:${largura}px;height:${altura}px`
  holder.appendChild(canvas)
  document.body.appendChild(holder)
  const fundo: Plugin = {
    id: 'fundoBranco',
    beforeDraw: (c) => { c.ctx.save(); c.ctx.fillStyle = '#fff'; c.ctx.fillRect(0, 0, c.width, c.height); c.ctx.restore() },
  }
  const chart = new Chart(canvas, { ...config, plugins: [...(config.plugins ?? []), fundo] } as ChartConfiguration)
  chart.resize(largura, altura)
  const url = chart.toBase64Image('image/png')
  chart.destroy()
  holder.remove()
  return url
}
