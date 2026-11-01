/** Theme: one cover colour, from which every blue-family token of the app, charts and PDF is derived. */

export const TEMAS = [
  { nome: 'Azul caderneta', cor: '#1e5f8c' },
  { nome: 'Verde-água', cor: '#1d6b6b' },
  { nome: 'Verde-folha', cor: '#2f6b3a' },
  { nome: 'Lavanda', cor: '#5b4391' },
  { nome: 'Rosa', cor: '#a33a66' },
  { nome: 'Terracota', cor: '#a3472a' },
  { nome: 'Grafite', cor: '#3d4a55' },
] as const

export const COR_PADRAO: string = TEMAS[0].cor

type RGB = [number, number, number]
const rgb = (hex: string): RGB => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as RGB
const hex = (c: RGB) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
/** Mix `a` toward `b` by t (0..1). */
const mix = (a: RGB, b: RGB, t: number): RGB => a.map((v, i) => v + (b[i] - v) * t) as RGB
const BRANCO: RGB = [255, 255, 255]
const PRETO: RGB = [0, 0, 0]

function luminancia(c: RGB) {
  const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contraste = (a: RGB, b: RGB) => { const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05) }
export const contrasteComBranco = (c: string) => contraste(rgb(c), BRANCO)

/** Darkens a colour until white text on it reaches WCAG AA (4.5:1). Light picks still work. */
export function corSegura(cor: string): string {
  const c = /^#[0-9a-f]{6}$/i.test(cor) ? rgb(cor) : rgb(COR_PADRAO)
  for (let t = 0; t <= 1; t += 0.02) {
    const d = hex(mix(c, PRETO, t))
    if (contrasteComBranco(d) >= 4.5) return d
  }
  return '#000000'
}

/** Darkest tint (≥75% white) of the cover colour that reads as small text on it (AA). */
function suave(c: RGB): RGB {
  for (let t = 0.75; t < 1; t += 0.01) if (contraste(mix(c, BRANCO, t), c) >= 4.5) return mix(c, BRANCO, t)
  return BRANCO
}

function claro(c: RGB): RGB {
  for (let t = 0.5; t > 0; t -= 0.02) if (contraste(mix(c, BRANCO, t), BRANCO) >= 3) return mix(c, BRANCO, t)
  return c
}

export function paleta(cor = COR_PADRAO) {
  const c = rgb(corSegura(cor))
  return {
    base: hex(c),
    deep: hex(mix(c, PRETO, 0.25)),
    ink: hex(mix(c, PRETO, 0.38)),
    tint: hex(mix(c, BRANCO, 0.87)),
    wash: hex(mix(c, BRANCO, 0.92)),
    /** Secondary text on the cover colour. */
    suave: hex(suave(c)),
    /** Oldest bar of the ramp: lightest tint still ≥3:1 on white. */
    claro: hex(claro(c)),
  }
}

let atual = paleta()
/** Current palette, read by chart builders (app and PDF). */
export const temaAtual = () => atual

const CHAVE = 'tema-cor' // per-device cache so the first paint already has the right colour

export function aplicarTema(cor?: string) {
  atual = paleta(cor)
  const st = document.documentElement.style
  st.setProperty('--blue', atual.base)
  st.setProperty('--blue-deep', atual.deep)
  st.setProperty('--blue-ink', atual.ink)
  st.setProperty('--blue-tint', atual.tint)
  st.setProperty('--blue-wash', atual.wash)
  st.setProperty('--on-blue', atual.suave)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', atual.base)
  try { localStorage.setItem(CHAVE, atual.base) } catch { /* storage blocked: falls back to the DB read */ }
}

export function aplicarTemaSalvo() {
  try { aplicarTema(localStorage.getItem(CHAVE) ?? undefined) } catch { /* ignore */ }
}
