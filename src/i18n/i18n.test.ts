import { afterEach, describe, expect, it, vi } from 'vitest'
import { DICIONARIOS, definirIdioma, t } from '.'
import { DOMINIOS, formatarIdade, questionario } from '../lib/domain'

vi.stubGlobal('document', { documentElement: {} })
vi.stubGlobal('localStorage', { setItem: () => {}, getItem: () => null })
afterEach(() => definirIdioma('pt'))

describe('dicionários', () => {
  const pt = DICIONARIOS.pt
  const codigos = questionario.faixas.flatMap((f) => [f.id, ...f.itens.map((i) => i.codigo)]).sort()
  for (const id of ['en', 'es'] as const) {
    const d = DICIONARIOS[id]
    it(`${id} tem as mesmas chaves de ui e sugestões que pt`, () => {
      expect(Object.keys(d.ui).sort()).toEqual(Object.keys(pt.ui).sort())
      expect(Object.keys(d.sugestoes).sort()).toEqual(Object.keys(pt.sugestoes).sort())
    })
    it(`${id} traduz todas as faixas e itens do questionário`, () => {
      expect(Object.keys(d.questionario).sort()).toEqual(codigos)
    })
    it(`${id} mantém os mesmos {placeholders}`, () => {
      const vars = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort()
      for (const k of Object.keys(pt.ui)) expect(vars(d.ui[k]), k).toEqual(vars(pt.ui[k]))
    })
  }
})

describe('troca de idioma', () => {
  it('muda rótulos, itens e idade em tempo de leitura', () => {
    definirIdioma('en')
    expect(DOMINIOS[0].nome).toBe('Fine motor skills')
    expect(questionario.faixas[0].rotulo).toBe('0 to 2 years')
    expect(questionario.faixas[0].itens[0].texto).toBe('Holds an object placed in the hand')
    expect(formatarIdade(13)).toBe('1 year and 1 month')
    expect(t('comum.faixa', { id: 'C' })).toBe('Band C')
    definirIdioma('pt')
    expect(questionario.faixas[0].itens[0].texto).toBe('Segura um objeto colocado na mão')
  })
})
