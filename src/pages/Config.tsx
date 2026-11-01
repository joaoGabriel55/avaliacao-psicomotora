import { useEffect, useRef, useState } from 'react'
import { Check, ImageUp, Palette, Trash2 } from 'lucide-react'
import { lerConfig, salvarConfig } from '../lib/db'
import type { Configuracoes } from '../lib/domain'
import { avisar } from '../components/ui'
import { COR_PADRAO, TEMAS, corSegura } from '../lib/tema'
import { IDIOMAS, idiomaAtual, t, type Idioma } from '../i18n'

/** Downscale the logo so the PDF and backup stay small. */
async function reduzirImagem(f: File, max = 600): Promise<string> {
  const bmp = await createImageBitmap(f)
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * k)
  c.height = Math.round(bmp.height * k)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  return c.toDataURL('image/png')
}

export default function Config() {
  const [c, setC] = useState<Configuracoes | null>(null)
  const [erro, setErro] = useState('')
  const inp = useRef<HTMLInputElement>(null)
  useEffect(() => { lerConfig().then(setC) }, [])
  if (!c) return null

  const set = (p: Partial<Configuracoes>) => setC({ ...c, ...p })
  // Colour applies at once (App re-themes from the DB), so the picker is its own preview.
  const setCor = (corTema: string) => { set({ corTema }); salvarConfig({ corTema }) }
  const cor = c.corTema ?? COR_PADRAO
  const personalizada = !TEMAS.some((t) => t.cor === cor)

  return (
    <div className="page page-narrow">
      <header className="page-head"><div><h1>{t('config.titulo')}</h1><p>{t('config.subtitulo')}</p></div></header>
      <form className="sheet sheet-pad" onSubmit={async (e) => { e.preventDefault(); await salvarConfig(c); avisar(t('config.salvas')) }}>
        <div className="field">
          <label htmlFor="idioma">{t('config.idioma')}</label>
          <p className="hint">{t('config.idiomaDica')}</p>
          {/* Saved at once, like the colour: App re-renders in the new language. */}
          <select id="idioma" className="input" style={{ maxWidth: 280 }} value={c.idioma ?? idiomaAtual()} onChange={(e) => { const idioma = e.target.value as Idioma; set({ idioma }); salvarConfig({ idioma }) }}>
            {Object.entries(IDIOMAS).map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}
          </select>
        </div>
        <div className="field" style={{ marginTop: 18 }}>
          <label htmlFor="nome">{t('config.nome')}</label>
          <input id="nome" className="input" value={c.nomeTerapeuta} onChange={(e) => set({ nomeTerapeuta: e.target.value })} />
        </div>
        <div className="grid-2" style={{ marginTop: 18 }}>
          <div className="field">
            <label htmlFor="reg">{t('config.registro')}</label>
            <input id="reg" className="input" placeholder={t('config.registroDica')} value={c.registro} onChange={(e) => set({ registro: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="cont">{t('config.contato')}</label>
            <input id="cont" className="input" placeholder={t('config.contatoDica')} value={c.contato} onChange={(e) => set({ contato: e.target.value })} />
          </div>
        </div>
        <div className="field" style={{ marginTop: 18 }}>
          <span className="label">{t('config.logo')}</span>
          <div className="row">
            <div className="logo-prev">{c.logo ? <img src={c.logo} alt={t('config.logoAtual')} /> : t('config.semLogo')}</div>
            <input ref={inp} type="file" accept="image/*" hidden onChange={async (e) => {
              const f = e.target.files?.[0]
              setErro('')
              if (f) { try { set({ logo: await reduzirImagem(f) }) } catch { setErro(t('config.erroImagem')) } }
              e.target.value = ''
            }} />
            <button type="button" className="btn btn-sm" onClick={() => inp.current?.click()}><ImageUp size={16} /> {t(c.logo ? 'config.trocar' : 'config.escolherImagem')}</button>
            {c.logo && <button type="button" className="btn btn-sm btn-ghost btn-danger" onClick={() => set({ logo: undefined })}><Trash2 size={16} /> {t('config.remover')}</button>}
          </div>
          {erro && <p className="error-text" role="alert">{erro}</p>}
        </div>
        <div className="field" style={{ marginTop: 18 }}>
          <span className="label" id="tema-label">{t('config.cor')}</span>
          <p className="hint">{t('config.corDica')}</p>
          <div className="swatches" role="radiogroup" aria-labelledby="tema-label">
            {TEMAS.map((t) => (
              <button key={t.cor} type="button" role="radio" aria-checked={cor === t.cor} className="swatch" onClick={() => setCor(t.cor)}>
                <span className="swatch-dot" style={{ background: t.cor }}>{cor === t.cor && <Check size={18} />}</span>{t.nome}
              </button>
            ))}
            <label className="swatch" data-on={personalizada}>
              <span className="swatch-dot" style={{ background: personalizada ? cor : 'conic-gradient(#a33a66, #a3472a, #2f6b3a, #1d6b6b, #1e5f8c, #5b4391, #a33a66)' }}>
                {personalizada ? <Check size={18} /> : <Palette size={18} />}
              </span>
              {t('config.personalizada')}
              <input type="color" className="visually-hidden" aria-label={t('config.personalizadaRotulo')} value={cor} onChange={(e) => setCor(corSegura(e.target.value))} />
            </label>
          </div>
          {personalizada && <p className="hint">{t('config.personalizadaDica')}</p>}
        </div>
        <div className="form-actions"><button className="btn btn-primary" type="submit">{t('comum.salvar')}</button></div>
      </form>
    </div>
  )
}
