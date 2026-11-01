import { describe, expect, it } from 'vitest'
import { faixaSugerida, formatarIdade, idadeEmMeses, itensPendentes, maiorAvanco, pontuar, questionario, type Avaliacao } from './domain'
import { backupSchema, lerBackup } from './backup'

describe('faixa sugerida', () => {
  it('respeita as fronteiras do SPEC', () => {
    expect(faixaSugerida(0)).toBe('A')
    expect(faixaSugerida(23)).toBe('A')
    expect(faixaSugerida(24)).toBe('B')
    expect(faixaSugerida(47)).toBe('B')
    expect(faixaSugerida(48)).toBe('C')
    expect(faixaSugerida(71)).toBe('C')
    expect(faixaSugerida(72)).toBe('D')
    expect(faixaSugerida(107)).toBe('D')
    expect(faixaSugerida(108)).toBe('E')
    expect(faixaSugerida(191)).toBe('E')
    expect(faixaSugerida(220)).toBe('E')
  })
})

describe('idade', () => {
  it('conta meses completos', () => {
    expect(idadeEmMeses('2020-03-15', '2022-03-14')).toBe(23)
    expect(idadeEmMeses('2020-03-15', '2022-03-15')).toBe(24)
    expect(idadeEmMeses('2020-01-31', '2020-02-29')).toBe(0)
  })
  it('formata em português', () => {
    expect(formatarIdade(5)).toBe('5 meses')
    expect(formatarIdade(12)).toBe('1 ano')
    expect(formatarIdade(13)).toBe('1 ano e 1 mês')
    expect(formatarIdade(50)).toBe('4 anos e 2 meses')
  })
})

describe('pontuação', () => {
  const faixaC = questionario.faixas.find((f) => f.id === 'C')!
  const todas = (v: 0 | 1 | 2) => Object.fromEntries(faixaC.itens.map((i) => [i.codigo, v]))

  it('domínio = soma ÷ (2 × itens) × 100', () => {
    // C-MF has 5 items: 2+2+1+0+0 = 5 of 10 = 50%
    const respostas = { ...todas(0), 'C-MF-1': 2, 'C-MF-2': 2, 'C-MF-3': 1 } as Record<string, 0 | 1 | 2>
    const p = pontuar({ faixa: 'C', respostas })
    expect(p.MF).toBe(50)
    expect(p.MG).toBe(0)
  })

  it('arredonda para inteiro', () => {
    // C-EE has 3 items: 2+0+0 = 2 of 6 = 33.3%
    const p = pontuar({ faixa: 'C', respostas: { ...todas(0), 'C-EE-1': 2 } as Record<string, 0 | 1 | 2> })
    expect(p.EE).toBe(33)
  })

  it('geral = média simples dos 7 domínios', () => {
    expect(pontuar({ faixa: 'C', respostas: todas(2) }).geral).toBe(100)
    expect(pontuar({ faixa: 'C', respostas: todas(1) }).geral).toBe(50)
    const p = pontuar({ faixa: 'C', respostas: { ...todas(0), 'C-EE-1': 2 } as Record<string, 0 | 1 | 2> })
    expect(p.geral).toBe(Math.round(33.333 / 7))
  })

  it('lista itens sem resposta', () => {
    const r = todas(2)
    delete r['C-LA-4']
    expect(itensPendentes({ faixa: 'C', respostas: r }).map((i) => i.codigo)).toEqual(['C-LA-4'])
  })

  it('todas as faixas têm os 7 domínios', () => {
    for (const f of questionario.faixas) expect(new Set(f.itens.map((i) => i.dominio)).size).toBe(7)
  })
})

describe('frase de evolução', () => {
  const base = { faixa: 'C', faixaManual: false, versaoQuestionario: 1, obsDominio: {}, observacoes: '', recomendacoes: '', status: 'concluida', criadoEm: '', atualizadoEm: '', idadeMeses: 50, pacienteId: 'p' } as const
  it('aponta o maior avanço', () => {
    const a: Avaliacao = { ...base, id: '1', data: '2026-01-01', respostas: {} }
    const b: Avaliacao = { ...base, id: '2', data: '2026-06-01', respostas: { 'C-ED-1': 2, 'C-ED-2': 2, 'C-ED-3': 1 } }
    expect(maiorAvanco([a, b])).toContain('Equilíbrio dinâmico, +50 pontos')
  })
})

describe('backup', () => {
  it('ida e volta preserva todos os dados', () => {
    const b = {
      app: 'avaliacao-psicomotora', formato: 1, exportadoEm: '2026-10-31T10:00:00Z',
      pacientes: [{ id: 'p', nome: 'Lia', dataNascimento: '2021-05-10', criadoEm: 'x' }],
      avaliacoes: [{ id: 'a', pacienteId: 'p', data: '2026-01-01', idadeMeses: 55, faixa: 'C', faixaManual: true, versaoQuestionario: 1, respostas: { 'C-MF-1': 2 }, obsDominio: { MF: 'ok' }, observacoes: 'o', recomendacoes: 'r', status: 'rascunho', criadoEm: 'x', atualizadoEm: 'y' }],
      config: { id: 'config', nomeTerapeuta: 'T', registro: 'R', contato: 'C', logo: 'data:image/png;base64,AA', concluidasNoUltimoBackup: 0 },
    }
    expect(lerBackup(JSON.stringify(b))).toEqual(b)
  })
  it('rejeita arquivo de outro app', () => {
    expect(() => lerBackup('{"app":"x"}')).toThrow('não é um backup')
    expect(() => lerBackup('nada')).toThrow('JSON válido')
    expect(backupSchema.safeParse({ app: 'x' }).success).toBe(false)
  })
})
