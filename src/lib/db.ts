import Dexie, { type EntityTable } from 'dexie'
import type { Avaliacao, Configuracoes, Paciente } from './domain'

export const db = new Dexie('avaliacao-psicomotora') as Dexie & {
  pacientes: EntityTable<Paciente, 'id'>
  avaliacoes: EntityTable<Avaliacao, 'id'>
  config: EntityTable<Configuracoes, 'id'>
}

db.version(1).stores({
  pacientes: 'id, nome',
  avaliacoes: 'id, pacienteId, data, status',
  config: 'id',
})

export const CONFIG_PADRAO: Configuracoes = {
  id: 'config',
  nomeTerapeuta: '',
  registro: '',
  contato: '',
  concluidasNoUltimoBackup: 0,
}

export async function lerConfig(): Promise<Configuracoes> {
  return (await db.config.get('config')) ?? CONFIG_PADRAO
}

export async function salvarConfig(parcial: Partial<Configuracoes>) {
  const atual = await lerConfig()
  await db.config.put({ ...atual, ...parcial, id: 'config' })
}

// Ask the browser not to evict our data under storage pressure.
navigator.storage?.persist?.().catch(() => {})
