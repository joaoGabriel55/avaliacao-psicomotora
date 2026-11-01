import { HashRouter, Link, NavLink, Route, Routes } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { DatabaseBackup, Settings, Users, WifiOff, TriangleAlert } from 'lucide-react'
import { db, lerConfig } from './lib/db'
import { useEffect } from 'react'
import { Logo, Toaster } from './components/ui'
import { aplicarTema } from './lib/tema'
import { definirIdioma, idiomaAtual, t } from './i18n'
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
        <span><TriangleAlert size={18} /> {t('app.lembreteBackup', { n: pendentes })}</span>
        <Link className="btn btn-sm btn-sun" to="/backup">{t('app.fazerBackup')}</Link>
      </div>
    </div>
  )
}

export default function App() {
  const cfg = useLiveQuery(lerConfig)
  const corTema = cfg ? cfg.corTema ?? '' : undefined
  useEffect(() => { if (corTema !== undefined) aplicarTema(corTema || undefined) }, [corTema])
  // Set before children render so every t() call below reads the chosen language.
  definirIdioma(cfg?.idioma)
  return (
    <HashRouter>
      <div className="shell" key={idiomaAtual()}>
        <aside className="rail">
          <div className="rail-brand">
            <Logo />
            <div><strong>{t('app.nome')}</strong><span>{t('app.faixaEtaria')}</span></div>
          </div>
          <nav aria-label={t('app.navPrincipal')}>
            <NavLink to="/" end className={({ isActive }) => (isActive || location.hash.startsWith('#/paciente') || location.hash.startsWith('#/avaliacao') ? 'active' : '')}>
              <Users size={20} /> {t('pacientes.titulo')}
            </NavLink>
            <NavLink to="/backup"><DatabaseBackup size={20} /> {t('backup.titulo')}</NavLink>
            <NavLink to="/configuracoes"><Settings size={20} /> {t('config.titulo')}</NavLink>
          </nav>
          <p className="rail-foot"><WifiOff size={13} />{t('app.offline')}</p>
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
            <Route path="*" element={<div className="page"><h1>{t('app.naoEncontrada')}</h1><p><Link to="/">{t('comum.voltarPacientes')}</Link></p></div>} />
          </Routes>
        </main>
      </div>
      <Toaster />
    </HashRouter>
  )
}
