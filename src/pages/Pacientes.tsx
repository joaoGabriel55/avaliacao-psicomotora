import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Search, UserPlus } from 'lucide-react'
import { db } from '../lib/db'
import { formatarData, formatarIdade, hoje, idadeEmMeses, pontuar, porData } from '../lib/domain'
import { locale, t } from '../i18n'

const semAcento = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export default function Pacientes() {
  const [busca, setBusca] = useState('')
  const dados = useLiveQuery(async () => {
    const [ps, todas] = await Promise.all([db.pacientes.toArray(), db.avaliacoes.toArray()])
    const avs = todas.filter((a) => a.status === 'concluida')
    return ps
      .sort((a, b) => a.nome.localeCompare(b.nome, locale()))
      .map((p) => {
        const ultima = avs.filter((a) => a.pacienteId === p.id).sort(porData).pop()
        return { p, ultima, geral: ultima ? pontuar(ultima).geral : null, rascunho: todas.some((a) => a.pacienteId === p.id && a.status === 'rascunho') }
      })
  })
  const lista = dados?.filter((d) => semAcento(d.p.nome).includes(semAcento(busca))) ?? []

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>{t('pacientes.titulo')}</h1>
          {dados && dados.length > 0 && <p>{t(dados.length === 1 ? 'pacientes.contagem1' : 'pacientes.contagem', { n: dados.length })}</p>}
        </div>
        <Link to="/paciente/novo" className="btn btn-primary"><Plus size={20} /> {t('pacientes.novo')}</Link>
      </header>

      {dados && dados.length > 0 && (
        <div className="row" style={{ marginBottom: 16 }}>
          <div className="search">
            <Search size={18} />
            <input className="input" type="search" placeholder={t('pacientes.buscar')} value={busca} onChange={(e) => setBusca(e.target.value)} aria-label={t('pacientes.buscarRotulo')} />
          </div>
        </div>
      )}

      {dados && dados.length === 0 && (
        <div className="sheet empty">
          <UserPlus size={40} color="var(--blue)" />
          <h2>{t('pacientes.vazioTitulo')}</h2>
          <p>{t('pacientes.vazioTexto')}</p>
          <Link to="/paciente/novo" className="btn btn-primary"><Plus size={20} /> {t('pacienteForm.cadastrar')}</Link>
        </div>
      )}

      {dados && dados.length > 0 && (lista.length === 0 ? (
        <div className="sheet empty"><p>{t('pacientes.semResultado', { busca })}</p></div>
      ) : (
        <ul className="covers">
          {lista.map(({ p, ultima, geral, rascunho }) => (
            <li key={p.id}>
              <Link to={`/paciente/${p.id}`} className="bcover">
                {rascunho && <span className="bcover-tab">{t('comum.rascunho')}</span>}
                <span className="bcover-plate">
                  <span className="bcover-name">{p.nome}</span>
                  <span className="bcover-birth">{t('pacientes.nasc', { data: formatarData(p.dataNascimento) })}</span>
                </span>
                <dl className="bcover-facts">
                  <div><dt>{t('comum.idade')}</dt><dd>{formatarIdade(idadeEmMeses(p.dataNascimento, hoje()))}</dd></div>
                  <div><dt>{t('comum.ultimaAvaliacao')}</dt><dd>{ultima ? formatarData(ultima.data) : '—'}</dd></div>
                  <div><dt>{t('comum.geral')}</dt><dd>{geral !== null ? `${geral}%` : '—'}</dd></div>
                </dl>
              </Link>
            </li>
          ))}
        </ul>
      ))}
    </div>
  )
}
