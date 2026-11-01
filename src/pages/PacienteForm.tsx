import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { db } from '../lib/db'
import { formatarIdade, hoje, idadeEmMeses, novoId, type Paciente } from '../lib/domain'
import { avisar } from '../components/ui'
import { t } from '../i18n'

export default function PacienteForm() {
  const { id } = useParams()
  const nav = useNavigate()
  const [p, setP] = useState<Partial<Paciente>>({})
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (id) db.pacientes.get(id).then((x) => x && setP(x))
  }, [id])

  const meses = p.dataNascimento ? idadeEmMeses(p.dataNascimento, hoje()) : null

  async function salvar(e: FormEvent) {
    e.preventDefault()
    const nome = p.nome?.trim()
    if (!nome) return setErro(t('pacienteForm.erroNome'))
    if (!p.dataNascimento) return setErro(t('pacienteForm.erroNascimento'))
    if (p.dataNascimento > hoje()) return setErro(t('pacienteForm.erroFuturo'))
    const reg: Paciente = {
      id: p.id ?? novoId(),
      nome,
      dataNascimento: p.dataNascimento,
      responsavel: p.responsavel?.trim() || undefined,
      notas: p.notas?.trim() || undefined,
      criadoEm: p.criadoEm ?? new Date().toISOString(),
    }
    await db.pacientes.put(reg)
    avisar(t(id ? 'pacienteForm.atualizado' : 'pacienteForm.cadastrado'))
    nav(`/paciente/${reg.id}`, { replace: true })
  }

  return (
    <div className="page page-narrow">
      <Link to={id ? `/paciente/${id}` : '/'} className="back" style={{ color: 'var(--blue)' }}><ArrowLeft size={16} /> {t('comum.voltar')}</Link>
      <header className="page-head" style={{ marginTop: 8 }}>
        <h1>{t(id ? 'pacienteForm.editar' : 'pacientes.novo')}</h1>
      </header>
      <form className="sheet sheet-pad" onSubmit={salvar} noValidate>
        <div className="field">
          <label htmlFor="nome">{t('pacienteForm.nome')}</label>
          <input id="nome" className="input" autoComplete="off" value={p.nome ?? ''} onChange={(e) => setP({ ...p, nome: e.target.value })} autoFocus={!id} />
        </div>
        <div className="grid-2" style={{ marginTop: 18 }}>
          <div className="field">
            <label htmlFor="nasc">{t('comum.dataNascimento')}</label>
            <input id="nasc" type="date" className="input" max={hoje()} value={p.dataNascimento ?? ''} onChange={(e) => setP({ ...p, dataNascimento: e.target.value })} />
            <span className="hint" aria-live="polite">{meses !== null && meses >= 0 ? t('pacienteForm.idadeHoje', { idade: formatarIdade(meses) }) : ' '}</span>
          </div>
          <div className="field">
            <label htmlFor="resp">{t('comum.responsavel')} <span className="muted" style={{ fontWeight: 600 }}>{t('comum.opcional')}</span></label>
            <input id="resp" className="input" value={p.responsavel ?? ''} onChange={(e) => setP({ ...p, responsavel: e.target.value })} />
          </div>
        </div>
        <div className="field" style={{ marginTop: 18 }}>
          <label htmlFor="notas">{t('comum.notas')} <span className="muted" style={{ fontWeight: 600 }}>{t('comum.opcional')}</span></label>
          <textarea id="notas" className="textarea" value={p.notas ?? ''} onChange={(e) => setP({ ...p, notas: e.target.value })} placeholder={t('pacienteForm.notasDica')} />
        </div>
        {erro && <p className="error-text" role="alert" style={{ marginTop: 16 }}>{erro}</p>}
        <div className="form-actions">
          <Link className="btn btn-ghost" to={id ? `/paciente/${id}` : '/'}>{t('comum.cancelar')}</Link>
          <button className="btn btn-primary" type="submit">{t(id ? 'pacienteForm.salvar' : 'pacienteForm.cadastrar')}</button>
        </div>
      </form>
    </div>
  )
}
