import { HashRouter, Link, NavLink, Route, Routes } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { DatabaseBackup, Settings, Users, WifiOff, TriangleAlert } from 'lucide-react'
import { db, lerConfig } from './lib/db'
import { Logo, Toaster } from './components/ui'
import Pacientes from './pages/Pacientes'
import PacienteForm from './pages/PacienteForm'
import PacientePage from './pages/Paciente'
import NovaAvaliacao from './pages/NovaAvaliacao'
import AvaliacaoPage from './pages/Avaliacao'
import Relatorio from './pages/Relatorio'
import Backup from './pages/Backup'
import Config from './pages/Config'

function LembreteBackup() {
  const pendentes = useLiveQuery(async () => {
    const [n, cfg] = await Promise.all([db.avaliacoes.where('status').equals('concluida').count(), lerConfig()])
    return n - cfg.concluidasNoUltimoBackup
  })
  if (!pendentes || pendentes < 5) return null
  return (
    <div className="banner" role="status">
      <div className="banner-in">
        <span><TriangleAlert size={18} /> {pendentes} avaliações concluídas desde o último backup. Os dados só existem neste aparelho.</span>
        <Link className="btn btn-sm btn-sun" to="/backup">Fazer backup</Link>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <div className="shell">
        <aside className="rail">
          <div className="rail-brand">
            <Logo />
            <div><strong>Avaliação Psicomotora</strong><span>0 a 15 anos</span></div>
          </div>
          <nav aria-label="Principal">
            <NavLink to="/" end className={({ isActive }) => (isActive || location.hash.startsWith('#/paciente') || location.hash.startsWith('#/avaliacao') ? 'active' : '')}>
              <Users size={20} /> Pacientes
            </NavLink>
            <NavLink to="/backup"><DatabaseBackup size={20} /> Backup</NavLink>
            <NavLink to="/configuracoes"><Settings size={20} /> Configurações</NavLink>
          </nav>
          <p className="rail-foot"><WifiOff size={13} />Funciona sem internet. Os dados ficam só neste aparelho.</p>
        </aside>
        <main className="main">
          <LembreteBackup />
          <Routes>
            <Route path="/" element={<Pacientes />} />
            <Route path="/paciente/novo" element={<PacienteForm />} />
            <Route path="/paciente/:id/editar" element={<PacienteForm />} />
            <Route path="/paciente/:id/nova" element={<NovaAvaliacao />} />
            <Route path="/paciente/:id/relatorio" element={<Relatorio />} />
            <Route path="/paciente/:id/:aba?" element={<PacientePage />} />
            <Route path="/avaliacao/:id" element={<AvaliacaoPage />} />
            <Route path="/backup" element={<Backup />} />
            <Route path="/configuracoes" element={<Config />} />
            <Route path="*" element={<div className="page"><h1>Página não encontrada</h1><p><Link to="/">Voltar aos pacientes</Link></p></div>} />
          </Routes>
        </main>
      </div>
      <Toaster />
    </HashRouter>
  )
}
