import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, ArrowRight, Check, CloudCheck, Plus } from 'lucide-react'
import { db } from '../lib/db'
import { DOMINIOS, RESPOSTAS, faixaPorId, formatarData, formatarIdade, itensPendentes, type Avaliacao, type Item, type DominioId, type Resposta } from '../lib/domain'
import { SUGESTOES } from '../data/sugestoes'
import { Marca, avisar } from '../components/ui'

const DESCRICAO: Record<DominioId, string> = {
  MF: 'Preensão, manipulação, grafismo e recorte.',
  MG: 'Correr, chutar, arremessar, saltar e coordenação global.',
  EE: 'Manter posturas paradas: um pé, olhos fechados, estátua.',
  ED: 'Pular com um pé, andar em superfícies estreitas, ponta dos pés, parar ao comando.',
  EN: 'Padrão cruzado; a partir de 4 anos, quadrupedia em circuito.',
  ES: 'Subir e descer com segurança em degraus, trepa-trepa, parede.',
  LA: 'Preferência mão/pé, linha média, noção de direita e esquerda.',
}

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

  if (inicial === null) return <div className="page"><h1>Avaliação não encontrada</h1><p><Link to="/">Voltar aos pacientes</Link></p></div>
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
    avisar(av.status === 'concluida' ? 'Avaliação atualizada.' : 'Avaliação concluída. Painel atualizado.')
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
              <h1>{av.status === 'concluida' ? 'Avaliação concluída' : 'Avaliação em andamento'}</h1>
              <div className="sub">{formatarData(av.data)} · {formatarIdade(av.idadeMeses)} · Faixa {av.faixa} ({faixa.rotulo}){av.faixaManual ? ', escolhida manualmente' : ''}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{respondidos} de {total} itens</div>
              <span className="saved" aria-live="polite">{salvo ? <><CloudCheck size={15} /> {av.status === 'rascunho' ? 'Rascunho salvo' : 'Salvo'}</> : 'Salvando…'}</span>
            </div>
          </div>
          <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={respondidos} aria-label="Itens respondidos"><i style={{ transform: `scaleX(${respondidos / total})` }} /></div>
          <nav className="steps" aria-label="Domínios">
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
              Finalizar
            </button>
          </nav>
        </div>
      </div>

      <div className="page" style={{ paddingTop: 28 }}>
        {dominio ? (
          <>
            <div className="dom-head"><span className="swatch" style={{ background: dominio.cor }} /><h2>{dominio.nome}</h2></div>
            <p className="dom-desc">{DESCRICAO[dominio.id]}</p>
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
              <label htmlFor="obs-d">Observações sobre {dominio.nome.toLowerCase()} <span className="muted" style={{ fontWeight: 600 }}>(opcional)</span></label>
              <textarea id="obs-d" className="textarea" style={{ minHeight: 90 }} value={av.obsDominio[dominio.id] ?? ''}
                onChange={(e) => persistir({ ...av, obsDominio: { ...av.obsDominio, [dominio.id]: e.target.value } })} />
            </div>
            <div className="runner-foot">
              <button className="btn" disabled={passo === 0} onClick={() => irPara(passo - 1)}><ArrowLeft size={18} /> Anterior</button>
              <button className="btn btn-primary" onClick={() => irPara(passo + 1)}>
                {passo === FINAL - 1 ? 'Finalizar' : `Próximo: ${DOMINIOS[passo + 1].nome}`} <ArrowRight size={18} />
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
      <div className="dom-head"><h2>Finalizar</h2></div>
      <p className="dom-desc">Observações gerais e recomendações entram no relatório para os pais.</p>
      <div className="sheet sheet-pad">
        <div className="field">
          <label htmlFor="obs">Observações gerais</label>
          <textarea id="obs" className="textarea" value={av.observacoes} onChange={(e) => persistir({ ...av, observacoes: e.target.value })}
            placeholder="Como a criança se apresentou, comportamento, engajamento, pontos de atenção" />
        </div>
        <div className="field">
          <label htmlFor="rec">Recomendações</label>
          <textarea id="rec" className="textarea" style={{ minHeight: 160 }} value={av.recomendacoes} onChange={(e) => persistir({ ...av, recomendacoes: e.target.value })}
            placeholder="Escreva livremente ou insira sugestões abaixo e ajuste o texto" />
          <div className="sugg">
            <span className="label">Sugestões prontas</span>
            <div className="sugg-tabs" role="group" aria-label="Domínio das sugestões" style={{ marginTop: 8 }}>
              {DOMINIOS.map((d) => (
                <button key={d.id} type="button" className="chip" aria-pressed={dom === d.id} onClick={() => setDom(d.id)}>
                  <i className="dot" style={{ background: d.cor }} />{d.curto}
                </button>
              ))}
            </div>
            <div className="sugg-list">
              {SUGESTOES[dom].map((s) => (
                <button key={s} type="button" className="sugg-item" onClick={() => inserir(s)}><Plus size={16} />{s}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="sheet sheet-pad" style={{ marginTop: 20 }}>
        {pendentes.length > 0 ? (
          <>
            <h2 style={{ fontSize: 18 }}>Faltam {pendentes.length} {pendentes.length === 1 ? 'item' : 'itens'} para concluir</h2>
            <p className="muted small" style={{ marginTop: 4 }}>A avaliação fica salva como rascunho até tudo ser respondido.</p>
            <ul className="pending">
              {pendentes.slice(0, 8).map((i) => (
                <li key={i.codigo}><button onClick={() => irPara(DOMINIOS.findIndex((d) => d.id === i.dominio))}>{DOMINIOS.find((d) => d.id === i.dominio)!.nome}: {i.texto}</button></li>
              ))}
              {pendentes.length > 8 && <li className="muted small">e mais {pendentes.length - 8}.</li>}
            </ul>
          </>
        ) : (
          <p style={{ fontWeight: 700 }}><Check size={18} color="var(--ok)" style={{ verticalAlign: -3 }} /> Todos os itens respondidos.</p>
        )}
        <div className="form-actions">
          <button className="btn" onClick={() => irPara(FINAL - 1)}><ArrowLeft size={18} /> Voltar</button>
          <button className="btn btn-primary" disabled={pendentes.length > 0} onClick={concluir}>
            <Check size={18} /> {av.status === 'concluida' ? 'Salvar e voltar ao painel' : 'Concluir avaliação'}
          </button>
        </div>
      </div>
    </>
  )
}
