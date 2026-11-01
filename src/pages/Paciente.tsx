import { useMemo, useState } from 'react'
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, ClipboardPlus, FileText, Info, Pencil, Trash2, ChevronRight } from 'lucide-react'
import { db } from '../lib/db'
import { DOMINIOS, faixaPorId, formatarData, formatarIdade, hoje, idadeEmMeses, itensPendentes, pontuar, porData, type Avaliacao } from '../lib/domain'
import { configBarras, configEvolucao } from '../lib/charts'
import { Confirmar, Grafico, avisar } from '../components/ui'

export default function PacientePage() {
  const { id = '', aba } = useParams()
  const nav = useNavigate()
  const paciente = useLiveQuery(() => db.pacientes.get(id).then((p) => p ?? null), [id])
  const avaliacoes = useLiveQuery(() => db.avaliacoes.where('pacienteId').equals(id).toArray().then((a) => a.sort(porData)), [id])
  const [excluir, setExcluir] = useState<Avaliacao | null>(null)
  const [excluirPaciente, setExcluirPaciente] = useState(false)

  if (paciente === undefined || avaliacoes === undefined) return null
  if (paciente === null) return <div className="page"><h1>Paciente não encontrado</h1><p><Link to="/">Voltar aos pacientes</Link></p></div>

  const concluidas = avaliacoes.filter((a) => a.status === 'concluida')
  const rascunho = avaliacoes.find((a) => a.status === 'rascunho')
  const aAba = aba === 'avaliacoes' ? 'avaliacoes' : 'painel'

  return (
    <>
      <section className="cover">
        <div className="cover-in">
          <Link to="/" className="back"><ArrowLeft size={16} /> Pacientes</Link>
          <div className="cover-top">
            <div>
              <h1>{paciente.nome}</h1>
              <dl className="idbox">
                <div><dt>Nascimento</dt><dd>{formatarData(paciente.dataNascimento)}</dd></div>
                <div><dt>Idade</dt><dd>{formatarIdade(idadeEmMeses(paciente.dataNascimento, hoje()))}</dd></div>
                {paciente.responsavel && <div><dt>Responsável</dt><dd>{paciente.responsavel}</dd></div>}
              </dl>
            </div>
            <div className="row">
              <Link to={`/paciente/${id}/editar`} className="btn btn-icon" aria-label="Editar dados do paciente" title="Editar dados"><Pencil size={18} /></Link>
              {concluidas.length > 0 && <Link to={`/paciente/${id}/relatorio`} className="btn"><FileText size={18} /> Relatório PDF</Link>}
              {rascunho ? (
                <Link to={`/avaliacao/${rascunho.id}`} className="btn btn-sun"><ClipboardPlus size={18} /> Continuar rascunho</Link>
              ) : (
                <Link to={`/paciente/${id}/nova`} className="btn btn-sun"><ClipboardPlus size={18} /> Nova avaliação</Link>
              )}
            </div>
          </div>
          <nav className="tabs" aria-label="Seções do paciente">
            <NavLink to={`/paciente/${id}`} end className={aAba === 'painel' ? 'active' : ''}>Painel</NavLink>
            <NavLink to={`/paciente/${id}/avaliacoes`} className={aAba === 'avaliacoes' ? 'active' : ''}>Avaliações <span className="count">{avaliacoes.length}</span></NavLink>
          </nav>
        </div>
      </section>

      <div className="page">
        {aAba === 'painel' ? (
          <Painel concluidas={concluidas} pacienteId={id} temRascunho={!!rascunho} notas={paciente.notas} />
        ) : (
          <>
            {avaliacoes.length === 0 ? (
              <div className="sheet empty">
                <h2>Nenhuma avaliação</h2>
                <p>Comece a primeira avaliação; ela fica salva como rascunho até todos os itens serem respondidos.</p>
                <Link to={`/paciente/${id}/nova`} className="btn btn-primary"><ClipboardPlus size={18} /> Nova avaliação</Link>
              </div>
            ) : (
              <div className="sheet">
                <ul className="alist">
                  {[...avaliacoes].reverse().map((a) => {
                    const f = faixaPorId(a.faixa)
                    const pend = itensPendentes(a).length
                    return (
                      <li key={a.id}>
                        <div>
                          <div className="when">{formatarData(a.data)}</div>
                          <div className="sub">{formatarIdade(a.idadeMeses)} · Faixa {a.faixa} ({f.rotulo}){a.faixaManual ? ' · escolhida manualmente' : ''}</div>
                        </div>
                        <div>
                          {a.status === 'concluida'
                            ? <span className="badge badge-done">Concluída · {pontuar(a).geral}%</span>
                            : <span className="badge badge-draft">Rascunho · faltam {pend}</span>}
                        </div>
                        <div className="row">
                          <button className="btn btn-sm btn-danger btn-ghost" onClick={() => setExcluir(a)} aria-label={`Excluir avaliação de ${formatarData(a.data)}`}><Trash2 size={16} /> Excluir</button>
                          <Link className="btn btn-sm" to={`/avaliacao/${a.id}`}>{a.status === 'concluida' ? 'Abrir' : 'Continuar'} <ChevronRight size={16} /></Link>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            <div className="row" style={{ marginTop: 32, justifyContent: 'flex-end' }}>
              <button className="btn btn-sm btn-ghost btn-danger" onClick={() => setExcluirPaciente(true)}><Trash2 size={16} /> Excluir paciente</button>
            </div>
          </>
        )}
      </div>

      <Confirmar
        aberto={!!excluir}
        titulo="Excluir avaliação?"
        texto={excluir && <>A avaliação de <b>{formatarData(excluir.data)}</b> e todas as respostas serão apagadas. Não dá para desfazer.</>}
        acao="Excluir avaliação"
        perigo
        onCancelar={() => setExcluir(null)}
        onConfirmar={async () => { if (excluir) await db.avaliacoes.delete(excluir.id); setExcluir(null); avisar('Avaliação excluída.') }}
      />
      <Confirmar
        aberto={excluirPaciente}
        titulo="Excluir paciente?"
        texto={<><b>{paciente.nome}</b> e as {avaliacoes.length} avaliações serão apagados deste aparelho. Não dá para desfazer.</>}
        acao="Excluir tudo"
        perigo
        onCancelar={() => setExcluirPaciente(false)}
        onConfirmar={async () => {
          await db.transaction('rw', db.pacientes, db.avaliacoes, async () => {
            await db.avaliacoes.where('pacienteId').equals(id).delete()
            await db.pacientes.delete(id)
          })
          avisar('Paciente excluído.')
          nav('/', { replace: true })
        }}
      />
    </>
  )
}

function Painel({ concluidas, pacienteId, temRascunho, notas }: { concluidas: Avaliacao[]; pacienteId: string; temRascunho: boolean; notas?: string }) {
  const evol = useMemo(() => (concluidas.length >= 2 ? configEvolucao(concluidas) : null), [concluidas])
  const barras = useMemo(() => (concluidas.length ? configBarras(concluidas.slice(-4)) : null), [concluidas])

  if (concluidas.length === 0)
    return (
      <div className="sheet empty">
        <h2>O painel aparece depois da primeira avaliação concluída</h2>
        <p>{temRascunho ? 'Há um rascunho em andamento. Conclua-o para ver as pontuações por domínio.' : 'Faça a primeira avaliação para ver as pontuações por domínio e, a partir da segunda, a evolução.'}</p>
        {!temRascunho && <Link to={`/paciente/${pacienteId}/nova`} className="btn btn-primary"><ClipboardPlus size={18} /> Nova avaliação</Link>}
      </div>
    )

  const ultima = concluidas[concluidas.length - 1]
  const anterior = concluidas[concluidas.length - 2]
  const p = pontuar(ultima)
  const pa = anterior ? pontuar(anterior) : null

  const linhas = [{ id: 'geral' as const, nome: 'Geral', cor: 'var(--ink)' }, ...DOMINIOS]
  return (
    <div className="sheet folha">
      <section className="folha-sec">
        <div className="sheet-head">
          <h2>Evolução</h2>
          <p>{concluidas.length} {concluidas.length === 1 ? 'avaliação' : 'avaliações'} · {formatarData(concluidas[0].data)}{concluidas.length > 1 ? ` a ${formatarData(ultima.data)}` : ''}</p>
        </div>
        {evol ? (
          <>
            <Grafico config={evol} />
            <p className="small muted" style={{ marginTop: 10 }}>Toque na legenda para mostrar ou ocultar domínios. A faixa azul no topo e a linha tracejada marcam a mudança de faixa etária.</p>
          </>
        ) : (
          <div className="note"><Info size={18} />A linha de evolução aparece a partir da segunda avaliação concluída.</div>
        )}
      </section>
      <div className="folha-split">
        <section className="folha-sec">
          <div className="sheet-head">
            <h2>Comparativo por domínio</h2>
            <p>{Math.min(concluidas.length, 4) === 1 ? 'Última avaliação' : `Últimas ${Math.min(concluidas.length, 4)}, da mais antiga (clara) à mais recente (escura)`}</p>
          </div>
          {barras && <Grafico config={barras} className="sm" />}
        </section>
        <section className="folha-sec">
          <div className="sheet-head"><h2>Última avaliação</h2><p>{formatarData(ultima.data)}</p></div>
          <table className="ledger">
            <thead><tr><th scope="col">Domínio</th><th scope="col">Atual</th>{pa && <th scope="col">Variação</th>}</tr></thead>
            <tbody>
              {linhas.map((d) => (
                <tr key={d.id} className={d.id === 'geral' ? 'is-geral' : ''}>
                  <th scope="row"><i className="dot" style={{ background: d.cor }} />{d.nome}</th>
                  <td>{p[d.id]}%<span className="meter"><i style={{ width: `${p[d.id]}%`, background: d.cor }} /></span></td>
                  {pa && <td><Delta v={p[d.id] - pa[d.id]} /></td>}
                </tr>
              ))}
            </tbody>
          </table>
          {pa && <p className="small muted" style={{ marginTop: 10 }}>Variação em pontos em relação a {formatarData(anterior.data)}.</p>}
        </section>
      </div>
      {notas && (
        <section className="folha-sec">
          <h2 style={{ marginBottom: 6 }}>Notas</h2>
          <p className="muted" style={{ whiteSpace: 'pre-wrap' }}>{notas}</p>
        </section>
      )}
    </div>
  )
}

function Delta({ v }: { v: number }) {
  if (v === 0) return <span className="delta">±0</span>
  return <span className={`delta ${v > 0 ? 'up' : 'down'}`}>{v > 0 ? `+${v}` : v}</span>
}
