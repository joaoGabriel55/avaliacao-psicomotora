import questionarioJson from '../data/questionario.json'
import { locale, t, textoQuestionario, type Idioma } from '../i18n'

export type DominioId = 'MF' | 'MG' | 'EE' | 'ED' | 'EN' | 'ES' | 'LA'
export type FaixaId = 'A' | 'B' | 'C' | 'D' | 'E'
export type Resposta = 0 | 1 | 2

export interface Item { codigo: string; dominio: DominioId; texto: string }
export interface Faixa { id: FaixaId; rotulo: string; idadeMinMeses: number; idadeMaxMeses: number; itens: Item[] }
export interface Questionario { versao: number; faixas: Faixa[] }

export const questionario = questionarioJson as Questionario
// Band labels and item texts follow the UI language at read time; questionario.json holds the Portuguese.
for (const f of questionario.faixas) {
  const rotulo = f.rotulo
  Object.defineProperty(f, 'rotulo', { get: () => textoQuestionario(f.id, rotulo) })
  for (const i of f.itens) {
    const texto = i.texto
    Object.defineProperty(i, 'texto', { get: () => textoQuestionario(i.codigo, texto) })
  }
}

const dominio = (id: DominioId, cor: string) => ({
  id, cor,
  get nome() { return t(`dominio.${id}`) },
  get curto() { return t(`dominio.${id}.curto`) },
})
export const DOMINIOS: { id: DominioId; nome: string; curto: string; cor: string }[] = [
  dominio('MF', '#2F7FC1'),
  dominio('MG', '#D2513C'),
  dominio('EE', '#2E9467'),
  dominio('ED', '#C58A00'),
  dominio('EN', '#8457B5'),
  dominio('ES', '#9C5F2C'),
  dominio('LA', '#CC4F8A'),
]
export const dominioNome = (id: DominioId) => DOMINIOS.find((d) => d.id === id)!.nome

const resposta = (valor: Resposta) => ({
  valor,
  get rotulo() { return t(`resposta.${valor}`) },
  get curto() { return t(`resposta.${valor}.curto`) },
})
export const RESPOSTAS: { valor: Resposta; rotulo: string; curto: string }[] = [resposta(2), resposta(1), resposta(0)]
export const respostaRotulo = (v: Resposta | undefined) => RESPOSTAS.find((r) => r.valor === v)?.rotulo ?? '—'

export interface Paciente {
  id: string
  nome: string
  dataNascimento: string // AAAA-MM-DD
  responsavel?: string
  notas?: string
  criadoEm: string
}

export interface Avaliacao {
  id: string
  pacienteId: string
  data: string // AAAA-MM-DD
  idadeMeses: number
  faixa: FaixaId
  faixaManual: boolean
  versaoQuestionario: number
  respostas: Record<string, Resposta>
  obsDominio: Partial<Record<DominioId, string>>
  observacoes: string
  recomendacoes: string
  status: 'rascunho' | 'concluida'
  criadoEm: string
  atualizadoEm: string
}

export interface Configuracoes {
  id: 'config'
  nomeTerapeuta: string
  registro: string
  contato: string
  logo?: string // data URL
  corTema?: string // '#rrggbb'; app + PDF cover colour, see lib/tema.ts
  idioma?: Idioma // UI + PDF language; unset = browser language
  concluidasNoUltimoBackup: number
}

export const faixaPorId = (id: FaixaId) => questionario.faixas.find((f) => f.id === id)!

/** Months completed between birth and date (both AAAA-MM-DD). */
export function idadeEmMeses(nascimento: string, data: string): number {
  const [ny, nm, nd] = nascimento.split('-').map(Number)
  const [y, m, d] = data.split('-').map(Number)
  let meses = (y - ny) * 12 + (m - nm)
  if (d < nd) meses -= 1
  return meses
}

export function formatarIdade(meses: number): string {
  if (meses < 0) return '—'
  const anos = Math.floor(meses / 12)
  const resto = meses % 12
  const a = t(anos === 1 ? 'idade.ano' : 'idade.anos', { n: anos })
  const m = t(resto === 1 ? 'idade.mes' : 'idade.meses', { n: resto })
  if (anos === 0) return m
  if (resto === 0) return a
  return t('idade.anosEMeses', { a, m })
}

export const IDADE_MAXIMA_MESES = 191

export function faixaSugerida(idadeMeses: number): FaixaId {
  const f = questionario.faixas.find((f) => idadeMeses >= f.idadeMinMeses && idadeMeses <= f.idadeMaxMeses)
  return f ? f.id : idadeMeses < 0 ? 'A' : 'E'
}

/** Domain score 0–100 (unrounded), or null when the band has no items for it. */
function pctBruto(av: Pick<Avaliacao, 'faixa' | 'respostas'>, dominio: DominioId): number | null {
  const itens = faixaPorId(av.faixa).itens.filter((i) => i.dominio === dominio)
  if (itens.length === 0) return null
  const soma = itens.reduce((s, i) => s + (av.respostas[i.codigo] ?? 0), 0)
  return (soma / (2 * itens.length)) * 100
}

export type Pontuacao = Record<DominioId, number> & { geral: number }

export function pontuar(av: Pick<Avaliacao, 'faixa' | 'respostas'>): Pontuacao {
  const out = {} as Pontuacao
  const brutos: number[] = []
  for (const d of DOMINIOS) {
    const p = pctBruto(av, d.id) ?? 0
    brutos.push(p)
    out[d.id] = Math.round(p)
  }
  out.geral = Math.round(brutos.reduce((a, b) => a + b, 0) / brutos.length)
  return out
}

export function itensPendentes(av: Pick<Avaliacao, 'faixa' | 'respostas'>): Item[] {
  return faixaPorId(av.faixa).itens.filter((i) => av.respostas[i.codigo] === undefined)
}

export const hoje = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const formatarData = (iso: string) =>
  new Date(iso.slice(0, 10) + 'T00:00:00Z').toLocaleDateString(locale(), { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })

export const novoId = () => crypto.randomUUID()

/** Largest domain gain between the first and last of a chronologically sorted list. */
export function maiorAvanco(avs: Avaliacao[]): string {
  if (avs.length < 2) return ''
  const a = pontuar(avs[0])
  const b = pontuar(avs[avs.length - 1])
  let melhor: { d: DominioId; delta: number } | null = null
  for (const d of DOMINIOS) {
    const delta = b[d.id] - a[d.id]
    if (!melhor || delta > melhor.delta) melhor = { d: d.id, delta }
  }
  if (!melhor || melhor.delta <= 0) return t('avanco.nenhum')
  const geral = b.geral - a.geral
  const g = geral === 0 ? t('avanco.geralIgual') : t('avanco.geral', { n: `${geral > 0 ? '+' : ''}${geral}` })
  return t('avanco.maior', { dominio: dominioNome(melhor.d), n: melhor.delta, geral: g })
}

export const porData = (a: Avaliacao, b: Avaliacao) => a.data.localeCompare(b.data) || a.criadoEm.localeCompare(b.criadoEm)
