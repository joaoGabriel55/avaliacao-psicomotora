import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Download, Upload, ShieldCheck } from 'lucide-react'
import { db, lerConfig } from '../lib/db'
import { exportarBackup, lerBackup, restaurarBackup, type Backup as B } from '../lib/backup'
import { formatarData } from '../lib/domain'
import { Confirmar, avisar } from '../components/ui'
import { t } from '../i18n'

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
      <header className="page-head"><div><h1>{t('backup.titulo')}</h1><p>{t('backup.subtitulo')}</p></div></header>

      <section className="sheet sheet-pad">
        <h2 style={{ marginBottom: 14 }}>{t('backup.exportar')}</h2>
        {info && (
          <dl className="stat-row">
            <div><dt>{t('pacientes.titulo')}</dt><dd>{info.p}</dd></div>
            <div><dt>{t('comum.avaliacoes')}</dt><dd>{info.a}</dd></div>
            <div><dt>{t('backup.semBackup')}</dt><dd>{Math.max(0, info.desde)}</dd></div>
          </dl>
        )}
        <p className="muted small">{t('backup.exportarTexto')}</p>
        <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
          <button className="btn btn-primary" onClick={async () => { await exportarBackup(); avisar(t('backup.exportado')) }}><Download size={18} /> {t('backup.exportarBotao')}</button>
        </div>
      </section>

      <section className="sheet sheet-pad">
        <h2 style={{ marginBottom: 8 }}>{t('backup.importar')}</h2>
        <p className="muted small">{t('backup.importarTexto')} <b>{t('backup.importarAviso')}</b></p>
        <input ref={inp} type="file" accept="application/json,.json" hidden onChange={(e) => escolher(e.target.files?.[0])} />
        {erro && <p className="error-text" role="alert" style={{ marginTop: 12 }}>{erro}</p>}
        <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
          <button className="btn" onClick={() => inp.current?.click()}><Upload size={18} /> {t('backup.escolherArquivo')}</button>
        </div>
      </section>

      <p className="small muted" style={{ marginTop: 20, display: 'flex', gap: 8 }}><ShieldCheck size={16} /> {t('backup.privacidade')}</p>

      <Confirmar
        aberto={!!pendente}
        titulo={t('backup.substituirTitulo')}
        texto={pendente && t('backup.substituirTexto', { data: formatarData(pendente.exportadoEm), p: pendente.pacientes.length, a: pendente.avaliacoes.length })}
        acao={t('backup.restaurar')}
        perigo
        onCancelar={() => setPendente(null)}
        onConfirmar={async () => {
          if (!pendente) return
          try {
            await restaurarBackup(pendente)
            avisar(t('backup.restaurado'))
          } catch {
            setErro(t('backup.erroRestaurar'))
          }
          setPendente(null)
        }}
      />
    </div>
  )
}
