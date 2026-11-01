import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Download, Upload, ShieldCheck } from 'lucide-react'
import { db, lerConfig } from '../lib/db'
import { exportarBackup, lerBackup, restaurarBackup, type Backup as B } from '../lib/backup'
import { formatarData } from '../lib/domain'
import { Confirmar, avisar } from '../components/ui'

export default function Backup() {
  const info = useLiveQuery(async () => {
    const [p, a, c, cfg] = await Promise.all([db.pacientes.count(), db.avaliacoes.count(), db.avaliacoes.where('status').equals('concluida').count(), lerConfig()])
    return { p, a, desde: c - cfg.concluidasNoUltimoBackup }
  })
  const inp = useRef<HTMLInputElement>(null)
  const [erro, setErro] = useState('')
  const [pendente, setPendente] = useState<B | null>(null)

  async function escolher(f: File | undefined) {
    setErro('')
    if (!f) return
    try {
      setPendente(lerBackup(await f.text()))
    } catch (e) {
      setErro((e as Error).message)
    }
    if (inp.current) inp.current.value = ''
  }

  return (
    <div className="page page-narrow">
      <header className="page-head"><div><h1>Backup</h1><p>Os dados ficam só neste aparelho. Limpar os dados do navegador apaga tudo; guarde uma cópia.</p></div></header>

      <section className="sheet sheet-pad">
        <h2 style={{ marginBottom: 14 }}>Exportar</h2>
        {info && (
          <dl className="stat-row">
            <div><dt>Pacientes</dt><dd>{info.p}</dd></div>
            <div><dt>Avaliações</dt><dd>{info.a}</dd></div>
            <div><dt>Concluídas sem backup</dt><dd>{Math.max(0, info.desde)}</dd></div>
          </dl>
        )}
        <p className="muted small">Gera um arquivo JSON com pacientes, avaliações e configurações. Guarde-o em local seguro: contém dados de saúde de crianças.</p>
        <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
          <button className="btn btn-primary" onClick={async () => { await exportarBackup(); avisar('Backup exportado.') }}><Download size={18} /> Exportar backup</button>
        </div>
      </section>

      <section className="sheet sheet-pad">
        <h2 style={{ marginBottom: 8 }}>Importar</h2>
        <p className="muted small">Restaura um backup exportado por este app. <b>Substitui todos os dados atuais</b> deste aparelho.</p>
        <input ref={inp} type="file" accept="application/json,.json" hidden onChange={(e) => escolher(e.target.files?.[0])} />
        {erro && <p className="error-text" role="alert" style={{ marginTop: 12 }}>{erro}</p>}
        <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
          <button className="btn" onClick={() => inp.current?.click()}><Upload size={18} /> Escolher arquivo</button>
        </div>
      </section>

      <p className="small muted" style={{ marginTop: 20, display: 'flex', gap: 8 }}><ShieldCheck size={16} /> Nada é enviado para servidores. O app funciona sem internet.</p>

      <Confirmar
        aberto={!!pendente}
        titulo="Substituir os dados atuais?"
        texto={pendente && <>O backup de <b>{formatarData(pendente.exportadoEm)}</b> tem {pendente.pacientes.length} pacientes e {pendente.avaliacoes.length} avaliações. Os dados atuais deste aparelho serão apagados.</>}
        acao="Restaurar backup"
        perigo
        onCancelar={() => setPendente(null)}
        onConfirmar={async () => {
          if (!pendente) return
          try {
            await restaurarBackup(pendente)
            avisar('Backup restaurado.')
          } catch {
            setErro('Falha ao restaurar. Os dados atuais foram mantidos.')
          }
          setPendente(null)
        }}
      />
    </div>
  )
}
