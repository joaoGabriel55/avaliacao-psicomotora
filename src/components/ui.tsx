import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Chart, type ChartConfiguration } from 'chart.js'
import type { Resposta } from '../lib/domain'

/** Answer marks: shape carries the meaning, color reinforces it. */
export function Marca({ valor, size = 26 }: { valor: Resposta | undefined; size?: number }) {
  const s = size
  if (valor === 2)
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="10" fill="var(--ok)" />
        <path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  if (valor === 1)
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="9" fill="#fff" stroke="var(--dev)" strokeWidth="2" />
        <path d="M12 3a9 9 0 0 1 0 18z" fill="var(--dev)" />
      </svg>
    )
  if (valor === 0)
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="9" fill="#fff" stroke="var(--no)" strokeWidth="2" />
        <path d="M8 12h8" stroke="var(--no)" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    )
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="var(--line-strong)" strokeWidth="2" strokeDasharray="3 3" />
    </svg>
  )
}

/** Booklet mark used as the app's logo. */
export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <rect x="4" y="3" width="30" height="34" rx="5" fill="#fff" />
      <rect x="4" y="3" width="6" height="34" rx="3" fill="#f2b630" />
      <path d="M14 28 C18 27, 20 20, 24 17 S30 12, 31 11" fill="none" stroke="#1e5f8c" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="14" cy="28" r="2.2" fill="#1e5f8c" />
      <circle cx="31" cy="11" r="2.2" fill="#1e5f8c" />
    </svg>
  )
}

export function Grafico({ config, className }: { config: ChartConfiguration; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!ref.current) return
    const c = new Chart(ref.current, config)
    return () => c.destroy()
  }, [config])
  return (
    <div className={`chart-box ${className ?? ''}`}>
      <canvas ref={ref} role="img" aria-label="Gráfico" />
    </div>
  )
}

export function Confirmar({ aberto, titulo, texto, acao, perigo, onConfirmar, onCancelar }: {
  aberto: boolean; titulo: string; texto: ReactNode; acao: string; perigo?: boolean
  onConfirmar: () => void; onCancelar: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (aberto && !d.open) d.showModal()
    if (!aberto && d.open) d.close()
  }, [aberto])
  return (
    <dialog ref={ref} onClose={onCancelar} aria-labelledby="dlg-t">
      <div className="dlg">
        <h2 id="dlg-t">{titulo}</h2>
        <div className="muted">{texto}</div>
        <div className="form-actions">
          <button className="btn" onClick={onCancelar} autoFocus>Cancelar</button>
          <button className={`btn ${perigo ? 'btn-danger-solid' : 'btn-primary'}`} onClick={onConfirmar}>{acao}</button>
        </div>
      </div>
    </dialog>
  )
}

let setToastGlobal: ((t: string | null) => void) | null = null
export function avisar(texto: string) { setToastGlobal?.(texto) }
export function Toaster() {
  const [t, setT] = useState<string | null>(null)
  useEffect(() => { setToastGlobal = setT; return () => { setToastGlobal = null } }, [])
  useEffect(() => {
    if (!t) return
    const id = setTimeout(() => setT(null), 3200)
    return () => clearTimeout(id)
  }, [t])
  return t ? <div className="toast" role="status">{t}</div> : null
}

export const iniciais = (nome: string) =>
  nome.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
