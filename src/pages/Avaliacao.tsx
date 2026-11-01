import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, ArrowRight, Check, CloudCheck, Plus } from 'lucide-react'
import { db } from '../lib/db'
import { DOMINIOS, RESPOSTAS, faixaPorId, formatarData, formatarIdade, itensPendentes, type Avaliacao, type Item, type DominioId, type Resposta } from '../lib/domain'
import { Marca, avisar } from '../components/ui'
import { sugestoes, t } from '../i18n'

const FINAL = 7

export default function AvaliacaoPage() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const inicial = useLiveQuery(() => db.avaliacoes.get(id).then((a) => a ?? null), [id])
  const paciente = useLiveQuery(async () => (inicial ? db.pacientes.get(inicial.pacienteId) : undefined), [inicial?.pacienteId])
  const [av, setAv] = useState<Avaliacao | null>(null)
  const [passo, setPasso] = useState(0)
  const [salvo, setSalvo] = useState(true)
  const topo = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const ultimo = useRef<Avaliacao | null>(null)

  // Load once; afterwards local state is the source of truth and is persisted.
  useEffect(() => { if (inicial && !av) setAv(inicial) }, [inicial, av])

  const persistir = (novo: Avaliacao, imediato = false) => {
    setAv(novo)
    setSalvo(false)
    ultimo.current = novo
    clearTimeout(timer.current)
    const gravar = async () => {
      const n = ultimo.current!
      // Editing a finished assessment keeps it finished; all items stay answered.
      await db.avaliacoes.put({ ...n, atualizadoEm: new Date().toISOString() })
      setSalvo(true)
    }
    if (imediato) gravar()
    else timer.current = setTimeout(gravar, 500)
  }
  // Flush a pending text save when leaving the page.
  useEffect(() => () => {
    if (timer.current && ultimo.current) {
      clearTimeout(timer.current)
      db.avaliacoes.put({ ...ultimo.current, atualizadoEm: new Date().toISOString() })
    }
  }, [])

  const faixa = av ? faixaPorId(av.faixa) : null
  const porDominio = useMemo(() => {
    const m = {} as Record<DominioId, Item[]>
    if (faixa) for (const d of DOMINIOS) m[d.id] = faixa.itens.filter((i) => i.dominio === d.id)
    return m
  }, [faixa])

  if (inicial === null) return <div className="page"><h1>{t('avaliacao.naoEncontrada')}</h1><p><Link to="/">{t('comum.voltarPacientes')}</Link></p></div>
  if (!av || !faixa || !paciente) return null

  const total = faixa.itens.length
  const respondidos = faixa.itens.filter((i) => av.respostas[i.codigo] !== undefined).length
  const pendentes = itensPendentes(av)

  const irPara = (p: number) => {
    setPasso(p)
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  }
  const responder = (codigo: string, v: Resposta) => persistir({ ...av, respostas: { ...av.respostas, [codigo]: v } }, true)

  async function concluir() {
    if (!av || pendentes.length) return
    clearTimeout(timer.current)
    await db.avaliacoes.put({ ...av, status: 'concluida', atualizadoEm: new Date().toISOString() })
    ultimo.current = null
    avisar(t(av.status === 'concluida' ? 'avaliacao.atualizada' : 'avaliacao.concluidaAviso'))
    nav(`/paciente/${av.pacienteId}`)
  }

  const dominio = passo < FINAL ? DOMINIOS[passo] : null

  return (
    <>
      <div className="runner-top" ref={topo}>
        <div className="runner-top-in">
          <div className="runner-meta">
            <div>
              <Link to={`/paciente/${paciente.id}`} className="back" style={{ color: 'var(--blue)', minHeight: 28 }}><ArrowLeft size={16} /> {paciente.nome}</Link>
              <h1>{t(av.status === 'concluida' ? 'avaliacao.concluida' : 'avaliacao.emAndamento')}</h1>
              <div className="sub">{formatarData(av.data)} · {formatarIdade(av.idadeMeses)} · {t('comum.faixa', { id: av.faixa })} ({faixa.rotulo}){av.faixaManual ? `, ${t('comum.escolhidaManualmente')}` : ''}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{t('avaliacao.progresso', { n: respondidos, total })}</div>
              <span className="saved" aria-live="polite">{salvo ? <><CloudCheck size={15} /> {t(av.status === 'rascunho' ? 'avaliacao.rascunhoSalvo' : 'avaliacao.salvo')}</> : t('avaliacao.salvando')}</span>
            </div>
          </div>
          <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={respondidos} aria-label={t('avaliacao.itensRespondidos')}><i style={{ transform: `scaleX(${respondidos / total})` }} /></div>
          <nav className="steps" aria-label={t('avaliacao.dominios')}>
            {DOMINIOS.map((d, i) => {
              const its = porDominio[d.id] ?? []
              const r = its.filter((it) => av.respostas[it.codigo] !== undefined).length
              const ok = r === its.length
              return (
                <button key={d.id} className={`step ${passo === i ? 'active' : ''} ${ok ? 'done' : ''}`} style={{ ['--stepc' as string]: d.cor }} onClick={() => irPara(i)} aria-current={passo === i ? 'step' : undefined}>
                  {ok ? <Check size={15} strokeWidth={3} color={passo === i ? '#fff' : d.cor} /> : <i className="dot" style={{ background: d.cor }} />}
                  {d.curto} <span className="n">{r}/{its.length}</span>
                </button>
              )
            })}
            <button className={`step ${passo === FINAL ? 'active' : ''}`} onClick={() => irPara(FINAL)} aria-current={passo === FINAL ? 'step' : undefined}>
              {t('avaliacao.finalizar')}
            </button>
          </nav>
        </div>
      </div>

      <div className="page" style={{ paddingTop: 28 }}>
        {dominio ? (
          <>
            <div className="dom-head"><span className="swatch" style={{ background: dominio.cor }} /><h2>{dominio.nome}</h2></div>
            <p className="dom-desc">{t(`descricao.${dominio.id}`)}</p>
            <ol className="sheet items">
              {(porDominio[dominio.id] ?? []).map((it) => {
                const v = av.respostas[it.codigo]
                return (
                  <li className="item" key={it.codigo}>
                    <div>
                      <div className="item-text" id={`t-${it.codigo}`}>{it.texto}</div>
                      <div className="item-code">{it.codigo}</div>
                    </div>
                    <div className="stamps stamp-set" role="radiogroup" aria-labelledby={`t-${it.codigo}`} data-answered={v !== undefined}>
                      {RESPOSTAS.map((r) => (
                        <button key={r.valor} type="button" role="radio" aria-checked={v === r.valor} className={`stamp s${r.valor}`} onClick={() => responder(it.codigo, r.valor)}>
                          <Marca valor={r.valor} />
                          {r.rotulo}
                        </button>
                      ))}
                    </div>
                  </li>
                )
              })}
            </ol>
            <div className="field" style={{ marginTop: 22 }}>
              <label htmlFor="obs-d">{t('avaliacao.obsDominio', { dominio: dominio.nome.toLowerCase() })} <span className="muted" style={{ fontWeight: 600 }}>{t('comum.opcional')}</span></label>
              <textarea id="obs-d" className="textarea" style={{ minHeight: 90 }} value={av.obsDominio[dominio.id] ?? ''}
                onChange={(e) => persistir({ ...av, obsDominio: { ...av.obsDominio, [dominio.id]: e.target.value } })} />
            </div>
            <div className="runner-foot">
              <button className="btn" disabled={passo === 0} onClick={() => irPara(passo - 1)}><ArrowLeft size={18} /> {t('avaliacao.anterior')}</button>
              <button className="btn btn-primary" onClick={() => irPara(passo + 1)}>
                {passo === FINAL - 1 ? t('avaliacao.finalizar') : t('avaliacao.proximo', { dominio: DOMINIOS[passo + 1].nome })} <ArrowRight size={18} />
              </button>
            </div>
          </>
        ) : (
          <Final av={av} pendentes={pendentes} persistir={persistir} irPara={irPara} concluir={concluir} />
        )}
      </div>
    </>
  )
}

function Final({ av, pendentes, persistir, irPara, concluir }: {
  av: Avaliacao; pendentes: ReturnType<typeof itensPendentes>; persistir: (a: Avaliacao) => void; irPara: (p: number) => void; concluir: () => void
}) {
  const [dom, setDom] = useState<DominioId>('MF')
  const inserir = (t: string) => {
    const atual = av.recomendacoes.trimEnd()
    persistir({ ...av, recomendacoes: (atual ? atual + '\n' : '') + '• ' + t })
  }
  return (
    <>
      <div className="dom-head"><h2>{t('avaliacao.finalizar')}</h2></div>
      <p className="dom-desc">{t('avaliacao.finalDesc')}</p>
      <div className="sheet sheet-pad">
        <div className="field">
          <label htmlFor="obs">{t('comum.observacoesGerais')}</label>
          <textarea id="obs" className="textarea" value={av.observacoes} onChange={(e) => persistir({ ...av, observacoes: e.target.value })}
            placeholder={t('avaliacao.obsDica')} />
        </div>
        <div className="field">
          <label htmlFor="rec">{t('comum.recomendacoes')}</label>
          <textarea id="rec" className="textarea" style={{ minHeight: 160 }} value={av.recomendacoes} onChange={(e) => persistir({ ...av, recomendacoes: e.target.value })}
            placeholder={t('avaliacao.recDica')} />
          <div className="sugg">
            <span className="label">{t('avaliacao.sugestoes')}</span>
            <div className="sugg-tabs" role="group" aria-label={t('avaliacao.sugestoesDominio')} style={{ marginTop: 8 }}>
              {DOMINIOS.map((d) => (
                <button key={d.id} type="button" className="chip" aria-pressed={dom === d.id} onClick={() => setDom(d.id)}>
                  <i className="dot" style={{ background: d.cor }} />{d.curto}
                </button>
              ))}
            </div>
            <div className="sugg-list">
              {sugestoes(dom).map((s) => (
                <button key={s} type="button" className="sugg-item" onClick={() => inserir(s)}><Plus size={16} />{s}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="sheet sheet-pad" style={{ marginTop: 20 }}>
        {pendentes.length > 0 ? (
          <>
            <h2 style={{ fontSize: 18 }}>{t(pendentes.length === 1 ? 'avaliacao.falta1' : 'avaliacao.faltam', { n: pendentes.length })}</h2>
            <p className="muted small" style={{ marginTop: 4 }}>{t('avaliacao.rascunhoDica')}</p>
            <ul className="pending">
              {pendentes.slice(0, 8).map((i) => (
                <li key={i.codigo}><button onClick={() => irPara(DOMINIOS.findIndex((d) => d.id === i.dominio))}>{DOMINIOS.find((d) => d.id === i.dominio)!.nome}: {i.texto}</button></li>
              ))}
              {pendentes.length > 8 && <li className="muted small">{t('avaliacao.eMais', { n: pendentes.length - 8 })}</li>}
            </ul>
          </>
        ) : (
          <p style={{ fontWeight: 700 }}><Check size={18} color="var(--ok)" style={{ verticalAlign: -3 }} /> {t('avaliacao.todosRespondidos')}</p>
        )}
        <div className="form-actions">
          <button className="btn" onClick={() => irPara(FINAL - 1)}><ArrowLeft size={18} /> {t('comum.voltar')}</button>
          <button className="btn btn-primary" disabled={pendentes.length > 0} onClick={concluir}>
            <Check size={18} /> {t(av.status === 'concluida' ? 'avaliacao.salvarVoltar' : 'avaliacao.concluir')}
          </button>
        </div>
      </div>
    </>
  )
}
