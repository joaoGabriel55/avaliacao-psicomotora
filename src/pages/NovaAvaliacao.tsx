import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, TriangleAlert } from 'lucide-react'
import { db } from '../lib/db'
import { IDADE_MAXIMA_MESES, faixaSugerida, formatarIdade, hoje, idadeEmMeses, novoId, questionario, type Avaliacao, type FaixaId } from '../lib/domain'

export default function NovaAvaliacao() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const paciente = useLiveQuery(() => db.pacientes.get(id), [id])
  const [data, setData] = useState(hoje())
  const [faixa, setFaixa] = useState<FaixaId | null>(null)

  const meses = paciente ? idadeEmMeses(paciente.dataNascimento, data) : 0
  const sugerida = faixaSugerida(meses)
  useEffect(() => setFaixa(null), [data])
  const escolhida = faixa ?? sugerida
  const antesDoNascimento = meses < 0

  if (!paciente) return null

  async function comecar() {
    const agora = new Date().toISOString()
    const av: Avaliacao = {
      id: novoId(), pacienteId: id, data, idadeMeses: meses, faixa: escolhida, faixaManual: escolhida !== sugerida,
      versaoQuestionario: questionario.versao, respostas: {}, obsDominio: {}, observacoes: '', recomendacoes: '',
      status: 'rascunho', criadoEm: agora, atualizadoEm: agora,
    }
    await db.avaliacoes.add(av)
    nav(`/avaliacao/${av.id}`, { replace: true })
  }

  return (
    <div className="page page-narrow">
      <Link to={`/paciente/${id}`} className="back" style={{ color: 'var(--blue)' }}><ArrowLeft size={16} /> {paciente.nome}</Link>
      <header className="page-head" style={{ marginTop: 8 }}>
        <div><h1>Nova avaliação</h1><p>Confirme a data e a faixa etária aplicada.</p></div>
      </header>
      <div className="sheet sheet-pad">
        <div className="field" style={{ maxWidth: 280 }}>
          <label htmlFor="data">Data da avaliação</label>
          <input id="data" type="date" className="input" value={data} max={hoje()} onChange={(e) => e.target.value && setData(e.target.value)} />
        </div>
        <dl className="agebox">
          <div><dt>Idade na data</dt><dd>{antesDoNascimento ? '—' : formatarIdade(meses)}</dd></div>
          <div><dt>Em meses</dt><dd>{antesDoNascimento ? '—' : meses}</dd></div>
          <div><dt>Faixa sugerida</dt><dd>{antesDoNascimento ? '—' : `${sugerida} · ${questionario.faixas.find((f) => f.id === sugerida)!.rotulo}`}</dd></div>
        </dl>
        {antesDoNascimento && <p className="warn" role="alert"><TriangleAlert size={18} />A data é anterior ao nascimento ({paciente.dataNascimento.split('-').reverse().join('/')}).</p>}
        {meses > IDADE_MAXIMA_MESES && <p className="warn" role="status"><TriangleAlert size={18} />A criança tem mais de 15 anos e 11 meses. O questionário vai até a faixa E; você pode aplicá-la mesmo assim.</p>}

        <div className="field" style={{ marginTop: 26 }}>
          <span className="label" id="faixa-l">Faixa aplicada</span>
          <span className="hint">Troque se quiser avaliar por outra faixa (ex.: a anterior, em caso de atraso). A escolha fica registrada.</span>
          <div className="bands" role="radiogroup" aria-labelledby="faixa-l" style={{ marginTop: 6 }}>
            {questionario.faixas.map((f) => (
              <button key={f.id} type="button" role="radio" aria-checked={escolhida === f.id} className="band" onClick={() => setFaixa(f.id)}>
                {f.id === sugerida && !antesDoNascimento && <em>sugerida</em>}
                <b>{f.id}</b>
                <span>{f.rotulo}</span>
                <span>{f.itens.length} itens</span>
              </button>
            ))}
          </div>
        </div>
        <div className="form-actions">
          <Link to={`/paciente/${id}`} className="btn btn-ghost">Cancelar</Link>
          <button className="btn btn-primary" disabled={antesDoNascimento} onClick={comecar}>Começar avaliação</button>
        </div>
      </div>
    </div>
  )
}
