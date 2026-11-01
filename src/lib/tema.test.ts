import { describe, expect, it } from 'vitest'
import { TEMAS, contrasteComBranco, corSegura, paleta } from './tema'

describe('tema', () => {
  it('presets já têm contraste AA com texto branco', () => {
    for (const t of TEMAS) expect(corSegura(t.cor)).toBe(t.cor)
  })
  it('escurece cores claras até 4.5:1', () => {
    const c = corSegura('#ffe066')
    expect(contrasteComBranco(c)).toBeGreaterThanOrEqual(4.5)
  })
  it('cor inválida cai no padrão', () => {
    expect(paleta('xyz').base).toBe(TEMAS[0].cor)
  })
})
