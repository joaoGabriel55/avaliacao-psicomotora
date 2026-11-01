import { useMemo, useState } from 'react'
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, ClipboardPlus, FileText, Info, Pencil, Trash2, ChevronRight } from 'lucide-react'
import { db } from '../lib/db'
import { DOMINIOS, faixaPorId, formatarData, formatarIdade, hoje, idadeEmMeses, itensPendentes, pontuar, porData, type Avaliacao } from '../lib/domain'
import { configBarras, configEvolucao } from '../lib/charts'
import { Confirmar, Grafico, avisar } from '../components/ui'
import { t } from '../i18n'

export default function PacientePage() {
  const { id = '', aba } = useParams()
  const nav = useNavigate()
  const paciente = useLiveQuery(() => db.pacientes.get(id).then((p) => p ?? null), [id])
  const avaliacoes = useLiveQuery(() => db.avaliacoes.where('pacienteId').equals(id).toArray().then((a) => a.sort(porData)), [id])
  const [excluir, setExcluir] = useState<Avaliacao | null>(null)
  const [excluirPaciente, setExcluirPaciente] = useState(false)

  if (paciente === undefined || avaliacoes === undefined) return null
  if (paciente === null) return <div className="page"><h1>{t('paciente.naoEncontrado')}</h1><p><Link to="/">{t('comum.voltarPacientes')}</Link></p></div>

  const concluidas = avaliacoes.filter((a) => a.status === 'concluida')
  const rascunho = avaliacoes.find((a) => a.status === 'rascunho')
  const aAba = aba === 'avaliacoes' ? 'avaliacoes' : 'painel'

  return (
    <>
      <section className="cover">
        <div className="cover-in">
          <Link to="/" className="back"><ArrowLeft size={16} /> {t('pacientes.titulo')}</Link>
          <div className="cover-top">
            <div>
              <h1>{paciente.nome}</h1>
              <dl className="idbox">
                <div><dt>{t('paciente.nascimento')}</dt><dd>{formatarData(paciente.dataNascimento)}</dd></div>
                <div><dt>{t('comum.idade')}</dt><dd>{formatarIdade(idadeEmMeses(paciente.dataNascimento, hoje()))}</dd></div>
                {paciente.responsavel && <div><dt>{t('comum.responsavel')}</dt><dd>{paciente.responsavel}</dd></div>}
              </dl>
            </div>
            <div className="row">
              <Link to={`/paciente/${id}/editar`} className="btn btn-icon" aria-label={t('paciente.editarRotulo')} title={t('paciente.editar')}><Pencil size={18} /></Link>
              {concluidas.length > 0 && <Link to={`/paciente/${id}/relatorio`} className="btn"><FileText size={18} /> {t('relatorio.titulo')}</Link>}
              {rascunho ? (
                <Link to={`/avaliacao/${rascunho.id}`} className="btn btn-sun"><ClipboardPlus size={18} /> {t('paciente.continuarRascunho')}</Link>
              ) : (
                <Link to={`/paciente/${id}/nova`} className="btn btn-sun"><ClipboardPlus size={18} /> {t('nova.titulo')}</Link>
              )}
            </div>
          </div>
          <nav className="tabs" aria-label={t('paciente.secoes')}>
            <NavLink to={`/paciente/${id}`} end className={aAba === 'painel' ? 'active' : ''}>{t('paciente.painel')}</NavLink>
            <NavLink to={`/paciente/${id}/avaliacoes`} className={aAba === 'avaliacoes' ? 'active' : ''}>{t('comum.avaliacoes')} <span className="count">{avaliacoes.length}</span></NavLink>
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
                <h2>{t('paciente.nenhumaAvaliacao')}</h2>
                <p>{t('paciente.nenhumaAvaliacaoTexto')}</p>
                <Link to={`/paciente/${id}/nova`} className="btn btn-primary"><ClipboardPlus size={18} /> {t('nova.titulo')}</Link>
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
                          <div className="sub">{formatarIdade(a.idadeMeses)} · {t('comum.faixa', { id: a.faixa })} ({f.rotulo}){a.faixaManual ? ` · ${t('comum.escolhidaManualmente')}` : ''}</div>
                        </div>
                        <div>
                          {a.status === 'concluida'
                            ? <span className="badge badge-done">{t('paciente.concluida', { n: pontuar(a).geral })}</span>
                            : <span className="badge badge-draft">{t('paciente.rascunhoFaltam', { n: pend })}</span>}
                        </div>
                        <div className="row">
                          <button className="btn btn-sm btn-danger btn-ghost" onClick={() => setExcluir(a)} aria-label={t('paciente.excluirAvaliacaoDe', { data: formatarData(a.data) })}><Trash2 size={16} /> {t('comum.excluir')}</button>
                          <Link className="btn btn-sm" to={`/avaliacao/${a.id}`}>{t(a.status === 'concluida' ? 'paciente.abrir' : 'paciente.continuar')} <ChevronRight size={16} /></Link>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            <div className="row" style={{ marginTop: 32, justifyContent: 'flex-end' }}>
              <button className="btn btn-sm btn-ghost btn-danger" onClick={() => setExcluirPaciente(true)}><Trash2 size={16} /> {t('paciente.excluirPaciente')}</button>
            </div>
          </>
        )}
      </div>

      <Confirmar
        aberto={!!excluir}
        titulo={t('paciente.excluirAvaliacaoTitulo')}
        texto={excluir && t('paciente.excluirAvaliacaoTexto', { data: formatarData(excluir.data) })}
        acao={t('paciente.excluirAvaliacao')}
        perigo
        onCancelar={() => setExcluir(null)}
        onConfirmar={async () => { if (excluir) await db.avaliacoes.delete(excluir.id); setExcluir(null); avisar(t('paciente.avaliacaoExcluida')) }}
      />
      <Confirmar
        aberto={excluirPaciente}
        titulo={t('paciente.excluirPacienteTitulo')}
        texto={t('paciente.excluirPacienteTexto', { nome: paciente.nome, n: avaliacoes.length })}
        acao={t('paciente.excluirTudo')}
        perigo
        onCancelar={() => setExcluirPaciente(false)}
        onConfirmar={async () => {
          await db.transaction('rw', db.pacientes, db.avaliacoes, async () => {
            await db.avaliacoes.where('pacienteId').equals(id).delete()
            await db.pacientes.delete(id)
          })
          avisar(t('paciente.pacienteExcluido'))
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
        <h2>{t('painel.vazioTitulo')}</h2>
        <p>{t(temRascunho ? 'painel.vazioRascunho' : 'painel.vazioTexto')}</p>
        {!temRascunho && <Link to={`/paciente/${pacienteId}/nova`} className="btn btn-primary"><ClipboardPlus size={18} /> {t('nova.titulo')}</Link>}
      </div>
    )

  const ultima = concluidas[concluidas.length - 1]
  const anterior = concluidas[concluidas.length - 2]
  const p = pontuar(ultima)
  const pa = anterior ? pontuar(anterior) : null

  const linhas = [{ id: 'geral' as const, nome: t('comum.geral'), cor: 'var(--ink)' }, ...DOMINIOS]
  return (
    <div className="sheet folha">
      <section className="folha-sec">
        <div className="sheet-head">
          <h2>{t('painel.evolucao')}</h2>
          <p>{t(concluidas.length === 1 ? 'painel.contagem1' : 'painel.contagem', { n: concluidas.length })} · {concluidas.length > 1 ? t('comum.periodo', { de: formatarData(concluidas[0].data), ate: formatarData(ultima.data) }) : formatarData(concluidas[0].data)}</p>
        </div>
        {evol ? (
          <>
            <Grafico config={evol} />
            <p className="small muted" style={{ marginTop: 10 }}>{t('painel.evolucaoDica')}</p>
          </>
        ) : (
          <div className="note"><Info size={18} />{t('painel.evolucaoVazia')}</div>
        )}
      </section>
      <div className="folha-split">
        <section className="folha-sec">
          <div className="sheet-head">
            <h2>{t('painel.comparativo')}</h2>
            <p>{Math.min(concluidas.length, 4) === 1 ? t('comum.ultimaAvaliacao') : t('painel.comparativoN', { n: Math.min(concluidas.length, 4) })}</p>
          </div>
          {barras && <Grafico config={barras} className="sm" />}
        </section>
        <section className="folha-sec">
          <div className="sheet-head"><h2>{t('comum.ultimaAvaliacao')}</h2><p>{formatarData(ultima.data)}</p></div>
          <table className="ledger">
            <thead><tr><th scope="col">{t('painel.dominio')}</th><th scope="col">{t('painel.atual')}</th>{pa && <th scope="col">{t('painel.variacao')}</th>}</tr></thead>
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
          {pa && <p className="small muted" style={{ marginTop: 10 }}>{t('painel.variacaoDica', { data: formatarData(anterior.data) })}</p>}
        </section>
      </div>
      {notas && (
        <section className="folha-sec">
          <h2 style={{ marginBottom: 6 }}>{t('comum.notas')}</h2>
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
