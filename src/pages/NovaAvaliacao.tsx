import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, TriangleAlert } from 'lucide-react'
import { db } from '../lib/db'
import { IDADE_MAXIMA_MESES, faixaSugerida, formatarData, formatarIdade, hoje, idadeEmMeses, novoId, questionario, type Avaliacao, type FaixaId } from '../lib/domain'
import { t } from '../i18n'

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
        <div><h1>{t('nova.titulo')}</h1><p>{t('nova.subtitulo')}</p></div>
      </header>
      <div className="sheet sheet-pad">
        <div className="field" style={{ maxWidth: 280 }}>
          <label htmlFor="data">{t('nova.data')}</label>
          <input id="data" type="date" className="input" value={data} max={hoje()} onChange={(e) => e.target.value && setData(e.target.value)} />
        </div>
        <dl className="agebox">
          <div><dt>{t('nova.idadeNaData')}</dt><dd>{antesDoNascimento ? '—' : formatarIdade(meses)}</dd></div>
          <div><dt>{t('nova.emMeses')}</dt><dd>{antesDoNascimento ? '—' : meses}</dd></div>
          <div><dt>{t('nova.faixaSugerida')}</dt><dd>{antesDoNascimento ? '—' : `${sugerida} · ${questionario.faixas.find((f) => f.id === sugerida)!.rotulo}`}</dd></div>
        </dl>
        {antesDoNascimento && <p className="warn" role="alert"><TriangleAlert size={18} />{t('nova.antesNascimento', { data: formatarData(paciente.dataNascimento) })}</p>}
        {meses > IDADE_MAXIMA_MESES && <p className="warn" role="status"><TriangleAlert size={18} />{t('nova.acimaIdade')}</p>}

        <div className="field" style={{ marginTop: 26 }}>
          <span className="label" id="faixa-l">{t('nova.faixaAplicada')}</span>
          <span className="hint">{t('nova.faixaDica')}</span>
          <div className="bands" role="radiogroup" aria-labelledby="faixa-l" style={{ marginTop: 6 }}>
            {questionario.faixas.map((f) => (
              <button key={f.id} type="button" role="radio" aria-checked={escolhida === f.id} className="band" onClick={() => setFaixa(f.id)}>
                {f.id === sugerida && !antesDoNascimento && <em>{t('nova.sugerida')}</em>}
                <b>{f.id}</b>
                <span>{f.rotulo}</span>
                <span>{t('nova.itens', { n: f.itens.length })}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="form-actions">
          <Link to={`/paciente/${id}`} className="btn btn-ghost">{t('comum.cancelar')}</Link>
          <button className="btn btn-primary" disabled={antesDoNascimento} onClick={comecar}>{t('nova.comecar')}</button>
        </div>
      </div>
    </div>
  )
}
