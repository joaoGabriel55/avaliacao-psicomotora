import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, Download, ExternalLink, FileText, Info, LoaderCircle } from 'lucide-react'
import { db, lerConfig } from '../lib/db'
import { formatarData, pontuar, porData, type Avaliacao } from '../lib/domain'
import { configBarras, configEvolucao, graficoComoImagem } from '../lib/charts'
import { baixar } from '../lib/backup'

export default function Relatorio() {
  const { id = '' } = useParams()
  const paciente = useLiveQuery(() => db.pacientes.get(id), [id])
  const todas = useLiveQuery(() => db.avaliacoes.where('pacienteId').equals(id).toArray().then((a) => a.filter((x) => x.status === 'concluida').sort(porData)), [id])
  const [selecao, setSelecao] = useState<Set<string> | null>(null)
  const [ultima, setUltima] = useState<Avaliacao | null>(null)
  const [estado, setEstado] = useState<'pronto' | 'gerando' | 'erro'>('pronto')
  const [arquivo, setArquivo] = useState<{ url: string; blob: Blob; nome: string } | null>(null)

  const escolhidas = useMemo(() => (todas && selecao ? todas.filter((a) => selecao.has(a.id)) : []), [todas, selecao])
  useEffect(() => { if (todas && !selecao) setSelecao(new Set(todas.map((a) => a.id))) }, [todas, selecao])
  const maisRecente = escolhidas[escolhidas.length - 1]
  useEffect(() => { setUltima(maisRecente ?? null) }, [maisRecente?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (arquivo) URL.revokeObjectURL(arquivo.url) }, [arquivo])

  if (!paciente || !todas || !selecao) return null

  const alternar = (aid: string) => {
    const n = new Set(selecao)
    if (n.has(aid)) n.delete(aid)
    else n.add(aid)
    setSelecao(n)
    setArquivo(null)
  }
  const editar = (campo: 'observacoes' | 'recomendacoes', valor: string) => {
    if (!ultima) return
    const n = { ...ultima, [campo]: valor }
    setUltima(n)
    setArquivo(null)
    db.avaliacoes.put({ ...n, atualizadoEm: new Date().toISOString() })
  }

  async function gerar() {
    if (!paciente || !ultima) return
    setEstado('gerando')
    try {
      const avs = escolhidas.map((a) => (a.id === ultima.id ? ultima : a))
      const [{ gerarPdf, nomeArquivo }, config] = await Promise.all([import('../pdf/Relatorio'), lerConfig()])
      const graficoEvolucao = avs.length >= 2 ? await graficoComoImagem(configEvolucao(avs, { estatico: true }) as never, 760, 440) : null
      const graficoBarras = await graficoComoImagem(configBarras(avs.slice(-4), { estatico: true }) as never, 760, 400)
      const blob = await gerarPdf({ paciente, avaliacoes: avs, config, graficoEvolucao, graficoBarras })
      setArquivo({ url: URL.createObjectURL(blob), blob, nome: nomeArquivo(paciente.nome) })
      setEstado('pronto')
    } catch (e) {
      console.error(e)
      setEstado('erro')
    }
  }

  return (
    <div className="page">
      <Link to={`/paciente/${id}`} className="back" style={{ color: 'var(--blue)' }}><ArrowLeft size={16} /> {paciente.nome}</Link>
      <header className="page-head" style={{ marginTop: 8 }}>
        <div><h1>Relatório PDF</h1><p>Escolha as avaliações, revise o texto da mais recente e gere o PDF para os pais.</p></div>
      </header>

      <div className="report-grid">
        <div className="stack">
          <section className="sheet sheet-pad">
            <div className="sheet-head"><h2>Avaliações incluídas</h2><p>{escolhidas.length} de {todas.length}</p></div>
            <ul className="checks">
              {[...todas].reverse().map((a) => (
                <li key={a.id}>
                  <label className="check">
                    <input type="checkbox" checked={selecao.has(a.id)} onChange={() => alternar(a.id)} />
                    <span style={{ flex: 1 }}><b>{formatarData(a.data)}</b> <span className="muted small">· Faixa {a.faixa}</span></span>
                    <span className="badge badge-plain">{pontuar(a).geral}%</span>
                  </label>
                </li>
              ))}
            </ul>
            {escolhidas.length > 4 && <p className="small muted" style={{ marginTop: 8 }}>O gráfico de barras mostra só as 4 mais recentes da seleção; a linha de evolução usa todas.</p>}
          </section>
          {ultima && (
            <section className="sheet sheet-pad">
              <div className="sheet-head"><h2>Texto do relatório</h2><p>Da avaliação de {formatarData(ultima.data)}</p></div>
              <div className="field">
                <label htmlFor="r-obs">Observações gerais</label>
                <textarea id="r-obs" className="textarea" value={ultima.observacoes} onChange={(e) => editar('observacoes', e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="r-rec">Recomendações</label>
                <textarea id="r-rec" className="textarea" style={{ minHeight: 180 }} value={ultima.recomendacoes} onChange={(e) => editar('recomendacoes', e.target.value)} />
                <span className="hint">As alterações são salvas na avaliação. Observações por domínio são editadas na própria avaliação.</span>
              </div>
            </section>
          )}
        </div>

        <section className="sheet sheet-pad report-preview">
          <div className="sheet-head"><h2>PDF do relatório</h2>{arquivo && <p>{arquivo.nome}</p>}</div>
          {escolhidas.length === 0 ? (
            <div className="note"><Info size={18} />Selecione ao menos uma avaliação.</div>
          ) : arquivo ? (
            <>
              <iframe className="preview" src={arquivo.url} title="Pré-visualização do relatório" />
              {/* Phone browsers don't render PDFs inside an iframe; offer opening it instead. */}
              <div className="note only-mobile"><FileText size={18} />PDF pronto. Abra para conferir ou baixe para enviar.</div>
              <div className="form-actions report-actions">
                <button className="btn" onClick={gerar}>Gerar de novo</button>
                <a className="btn only-mobile" href={arquivo.url} target="_blank" rel="noopener"><ExternalLink size={18} /> Abrir PDF</a>
                <button className="btn btn-primary" onClick={() => baixar(arquivo.blob, arquivo.nome)}><Download size={18} /> Baixar PDF</button>
              </div>
            </>
          ) : (
            <div className="empty" style={{ padding: '40px 12px' }}>
              <FileText size={40} color="var(--blue)" />
              <p>7 seções em A4: capa, como ler, evolução, comparativo, item a item, observações e recomendações.</p>
              {estado === 'erro' && <p className="error-text" role="alert">Não foi possível gerar o PDF. Tente de novo; se persistir, recarregue o app.</p>}
              <button className="btn btn-primary" onClick={gerar} disabled={estado === 'gerando'}>
                {estado === 'gerando' ? <><LoaderCircle size={18} className="spin" /> Gerando…</> : <><FileText size={18} /> Gerar PDF</>}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
