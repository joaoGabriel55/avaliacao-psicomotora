import pt from './pt.json'
import en from './en.json'
import es from './es.json'

/** UI language. Each JSON has `ui` (flat keys), `questionario` (band id / item code → text) and `sugestoes`.
 * pt.json has no `questionario` entries: the Portuguese text lives in data/questionario.json. */
export const IDIOMAS = { pt: 'Português', en: 'English', es: 'Español' } as const
export type Idioma = keyof typeof IDIOMAS
export type Chave = keyof typeof pt.ui

interface Dicionario { ui: Record<string, string>; questionario: Record<string, string>; sugestoes: Record<string, string[]> }
export const DICIONARIOS: Record<Idioma, Dicionario> = { pt, en, es }
const LOCALE: Record<Idioma, string> = { pt: 'pt-BR', en: 'en-US', es: 'es' }

let atual: Idioma = 'pt'
export const idiomaAtual = () => atual
/** BCP 47 tag for Intl, `lang` and the PDF. */
export const locale = () => LOCALE[atual]

export function t(chave: Chave, vars?: Record<string, string | number>): string {
  const s = DICIONARIOS[atual].ui[chave] ?? pt.ui[chave]
  return vars ? s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k])) : s
}

/** Band label or item text in the current language, falling back to the Portuguese original. */
export const textoQuestionario = (chave: string, original: string) => DICIONARIOS[atual].questionario[chave] ?? original

export const sugestoes = (dominio: string): string[] => DICIONARIOS[atual].sugestoes[dominio] ?? DICIONARIOS.pt.sugestoes[dominio] ?? []

const ehIdioma = (i: unknown): i is Idioma => typeof i === 'string' && Object.hasOwn(IDIOMAS, i)
const CHAVE = 'idioma' // per-device cache so the first paint is already in the right language

export function definirIdioma(i?: string) {
  if (!ehIdioma(i) || i === atual) return
  atual = i
  document.documentElement.lang = LOCALE[atual]
  try { localStorage.setItem(CHAVE, atual) } catch { /* storage blocked: falls back to the DB read */ }
}

/** First paint: cached choice, else the browser language, else Portuguese. */
export function definirIdiomaInicial() {
  let salvo: string | null = null
  try { salvo = localStorage.getItem(CHAVE) } catch { /* ignore */ }
  definirIdioma(salvo ?? navigator.language.slice(0, 2))
  document.documentElement.lang = LOCALE[atual]
}
