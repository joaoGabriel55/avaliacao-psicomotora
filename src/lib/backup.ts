import { z } from 'zod'
import { db, lerConfig, CONFIG_PADRAO } from './db'
import { t } from '../i18n'

const data = z.string().regex(/^\d{4}-\d{2}-\d{2}/)
const resposta = z.union([z.literal(0), z.literal(1), z.literal(2)])
const dominio = z.enum(['MF', 'MG', 'EE', 'ED', 'EN', 'ES', 'LA'])

const paciente = z.object({
  id: z.string().min(1),
  nome: z.string().min(1),
  dataNascimento: data,
  responsavel: z.string().optional(),
  notas: z.string().optional(),
  criadoEm: z.string(),
})

const avaliacao = z.object({
  id: z.string().min(1),
  pacienteId: z.string().min(1),
  data,
  idadeMeses: z.number().int(),
  faixa: z.enum(['A', 'B', 'C', 'D', 'E']),
  faixaManual: z.boolean(),
  versaoQuestionario: z.number().int(),
  respostas: z.record(z.string(), resposta),
  obsDominio: z.partialRecord(dominio, z.string()),
  observacoes: z.string(),
  recomendacoes: z.string(),
  status: z.enum(['rascunho', 'concluida']),
  criadoEm: z.string(),
  atualizadoEm: z.string(),
})

const config = z.object({
  id: z.literal('config'),
  nomeTerapeuta: z.string(),
  registro: z.string(),
  contato: z.string(),
  logo: z.string().optional(),
  corTema: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
  idioma: z.enum(['pt', 'en', 'es']).optional(),
  concluidasNoUltimoBackup: z.number().int().default(0),
})

export const backupSchema = z.object({
  app: z.literal('avaliacao-psicomotora'),
  formato: z.literal(1),
  exportadoEm: z.string(),
  pacientes: z.array(paciente),
  avaliacoes: z.array(avaliacao),
  config: config.nullable(),
})
export type Backup = z.infer<typeof backupSchema>

export async function montarBackup(): Promise<Backup> {
  const [pacientes, avaliacoes, cfg] = await Promise.all([db.pacientes.toArray(), db.avaliacoes.toArray(), db.config.get('config')])
  return { app: 'avaliacao-psicomotora', formato: 1, exportadoEm: new Date().toISOString(), pacientes, avaliacoes, config: cfg ?? null }
}

export async function exportarBackup() {
  const b = await montarBackup()
  const concluidas = b.avaliacoes.filter((a) => a.status === 'concluida').length
  const blob = new Blob([JSON.stringify(b, null, 2)], { type: 'application/json' })
  baixar(blob, `Backup_AvaliacaoPsicomotora_${b.exportadoEm.slice(0, 10)}.json`)
  const atual = await lerConfig()
  await db.config.put({ ...atual, concluidasNoUltimoBackup: concluidas })
}

/** Parses and validates; throws a readable message on bad files. */
export function lerBackup(texto: string): Backup {
  let json: unknown
  try {
    json = JSON.parse(texto)
  } catch {
    throw new Error(t('backup.erroJson'))
  }
  const r = backupSchema.safeParse(json)
  if (!r.success) throw new Error(t('backup.erroFormato'))
  return r.data
}

/** Replaces every table with the backup's contents, atomically. */
export async function restaurarBackup(b: Backup) {
  await db.transaction('rw', db.pacientes, db.avaliacoes, db.config, async () => {
    await Promise.all([db.pacientes.clear(), db.avaliacoes.clear(), db.config.clear()])
    await db.pacientes.bulkAdd(b.pacientes)
    await db.avaliacoes.bulkAdd(b.avaliacoes)
    const concluidas = b.avaliacoes.filter((a) => a.status === 'concluida').length
    await db.config.put({ ...(b.config ?? CONFIG_PADRAO), concluidasNoUltimoBackup: concluidas })
  })
}

export function baixar(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
