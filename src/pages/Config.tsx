import { useEffect, useRef, useState } from 'react'
import { ImageUp, Trash2 } from 'lucide-react'
import { lerConfig, salvarConfig } from '../lib/db'
import type { Configuracoes } from '../lib/domain'
import { avisar } from '../components/ui'

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

  return (
    <div className="page page-narrow">
      <header className="page-head"><div><h1>Configurações</h1><p>Dados da terapeuta que aparecem na capa e no fim do relatório.</p></div></header>
      <form className="sheet sheet-pad" onSubmit={async (e) => { e.preventDefault(); await salvarConfig(c); avisar('Configurações salvas.') }}>
        <div className="field">
          <label htmlFor="nome">Nome da terapeuta</label>
          <input id="nome" className="input" value={c.nomeTerapeuta} onChange={(e) => set({ nomeTerapeuta: e.target.value })} />
        </div>
        <div className="grid-2" style={{ marginTop: 18 }}>
          <div className="field">
            <label htmlFor="reg">Registro profissional</label>
            <input id="reg" className="input" placeholder="Ex.: CREFITO 0-000000-F" value={c.registro} onChange={(e) => set({ registro: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="cont">Contato</label>
            <input id="cont" className="input" placeholder="Telefone ou e-mail" value={c.contato} onChange={(e) => set({ contato: e.target.value })} />
          </div>
        </div>
        <div className="field" style={{ marginTop: 18 }}>
          <span className="label">Logo para o PDF</span>
          <div className="row">
            <div className="logo-prev">{c.logo ? <img src={c.logo} alt="Logo atual" /> : 'Sem logo'}</div>
            <input ref={inp} type="file" accept="image/*" hidden onChange={async (e) => {
              const f = e.target.files?.[0]
              setErro('')
              if (f) { try { set({ logo: await reduzirImagem(f) }) } catch { setErro('Não foi possível ler esta imagem. Use PNG ou JPG.') } }
              e.target.value = ''
            }} />
            <button type="button" className="btn btn-sm" onClick={() => inp.current?.click()}><ImageUp size={16} /> {c.logo ? 'Trocar' : 'Escolher imagem'}</button>
            {c.logo && <button type="button" className="btn btn-sm btn-ghost btn-danger" onClick={() => set({ logo: undefined })}><Trash2 size={16} /> Remover</button>}
          </div>
          {erro && <p className="error-text" role="alert">{erro}</p>}
        </div>
        <div className="form-actions"><button className="btn btn-primary" type="submit">Salvar</button></div>
      </form>
    </div>
  )
}
