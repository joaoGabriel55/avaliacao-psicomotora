import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Search, UserPlus } from 'lucide-react'
import { db } from '../lib/db'
import { formatarData, formatarIdade, hoje, idadeEmMeses, pontuar, porData } from '../lib/domain'

const semAcento = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export default function Pacientes() {
  const [busca, setBusca] = useState('')
  const dados = useLiveQuery(async () => {
    const [ps, todas] = await Promise.all([db.pacientes.toArray(), db.avaliacoes.toArray()])
    const avs = todas.filter((a) => a.status === 'concluida')
    return ps
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
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
          <h1>Pacientes</h1>
          {dados && dados.length > 0 && <p>{dados.length} {dados.length === 1 ? 'criança cadastrada' : 'crianças cadastradas'}</p>}
        </div>
        <Link to="/paciente/novo" className="btn btn-primary"><Plus size={20} /> Novo paciente</Link>
      </header>

      {dados && dados.length > 0 && (
        <div className="row" style={{ marginBottom: 16 }}>
          <div className="search">
            <Search size={18} />
            <input className="input" type="search" placeholder="Buscar pelo nome" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar paciente" />
          </div>
        </div>
      )}

      {dados && dados.length === 0 && (
        <div className="sheet empty">
          <UserPlus size={40} color="var(--blue)" />
          <h2>Nenhum paciente ainda</h2>
          <p>Cadastre a primeira criança para começar. Cada paciente ganha sua caderneta com avaliações, evolução e relatório.</p>
          <Link to="/paciente/novo" className="btn btn-primary"><Plus size={20} /> Cadastrar paciente</Link>
        </div>
      )}

      {dados && dados.length > 0 && (lista.length === 0 ? (
        <div className="sheet empty"><p>Nenhum paciente com “{busca}”.</p></div>
      ) : (
        <ul className="covers">
          {lista.map(({ p, ultima, geral, rascunho }) => (
            <li key={p.id}>
              <Link to={`/paciente/${p.id}`} className="bcover">
                {rascunho && <span className="bcover-tab">Rascunho</span>}
                <span className="bcover-plate">
                  <span className="bcover-name">{p.nome}</span>
                  <span className="bcover-birth">nasc. {formatarData(p.dataNascimento)}</span>
                </span>
                <dl className="bcover-facts">
                  <div><dt>Idade</dt><dd>{formatarIdade(idadeEmMeses(p.dataNascimento, hoje()))}</dd></div>
                  <div><dt>Última avaliação</dt><dd>{ultima ? formatarData(ultima.data) : '—'}</dd></div>
                  <div><dt>Geral</dt><dd>{geral !== null ? `${geral}%` : '—'}</dd></div>
                </dl>
              </Link>
            </li>
          ))}
        </ul>
      ))}
    </div>
  )
}
