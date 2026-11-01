import { Document, Image, Page, StyleSheet, Svg, Circle, Path, Text, View, pdf } from '@react-pdf/renderer'
import { DOMINIOS, RESPOSTAS, faixaPorId, formatarData, formatarIdade, hoje, idadeEmMeses, maiorAvanco, pontuar, type Avaliacao, type Configuracoes, type Paciente, type Resposta } from '../lib/domain'

const BLUE = '#1E5F8C'
const INK = '#1B2B36'
const INK2 = '#4B5E6C'
const LINE = '#D6E2EA'
const WASH = '#EEF4F8'
const OK = '#24804F'
const DEV = '#B07A00'
const NO = '#B0473A'

const s = StyleSheet.create({
  page: { paddingTop: 48, paddingBottom: 64, paddingHorizontal: 48, fontFamily: 'Helvetica', fontSize: 10.5, color: INK, lineHeight: 1.45 },
  h1: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: INK, marginBottom: 12, lineHeight: 1.2 },
  h2: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: BLUE, marginTop: 14, marginBottom: 6 },
  lead: { fontSize: 11.5, color: INK2, marginBottom: 14 },
  p: { marginBottom: 6 },
  footer: { position: 'absolute', bottom: 28, left: 48, right: 48, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8.5, color: INK2, borderTopWidth: 0.75, borderTopColor: LINE, paddingTop: 6 },
  coverBand: { backgroundColor: BLUE, marginHorizontal: -48, marginTop: -48, paddingHorizontal: 48, paddingTop: 56, paddingBottom: 36, color: '#fff' },
  coverTitle: { fontSize: 12, color: '#CFE2F0', fontFamily: 'Helvetica-Bold', marginBottom: 10 },
  coverName: { fontSize: 30, fontFamily: 'Helvetica-Bold', color: '#fff', lineHeight: 1.15 },
  idgrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 28, borderWidth: 0.75, borderColor: LINE, borderRadius: 6 },
  idcell: { width: '50%', padding: 12, borderBottomWidth: 0.75, borderBottomColor: LINE },
  idlabel: { fontSize: 8.5, color: INK2, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  idvalue: { fontSize: 12.5, fontFamily: 'Helvetica-Bold' },
  box: { backgroundColor: WASH, borderRadius: 6, padding: 12, marginTop: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  table: { borderWidth: 0.75, borderColor: LINE, borderRadius: 4, marginBottom: 12 },
  tr: { flexDirection: 'row', borderTopWidth: 0.75, borderTopColor: LINE, minHeight: 22, alignItems: 'center' },
  th: { fontFamily: 'Helvetica-Bold', fontSize: 8.5, color: INK2 },
  tdItem: { flex: 1, paddingVertical: 4, paddingHorizontal: 6, fontSize: 9.5 },
  tdCell: { width: 78, paddingVertical: 4, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center', fontSize: 8.5 },
  domHead: { flexDirection: 'row', alignItems: 'center', backgroundColor: WASH, paddingVertical: 5, paddingHorizontal: 6 },
  chart: { width: '100%', marginTop: 4 },
})

function Marca({ v, size = 9 }: { v: Resposta | undefined; size?: number }) {
  if (v === undefined) return null
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {v === 2 && <Circle cx="12" cy="12" r="10" fill={OK} />}
      {v === 2 && <Path d="M7.5 12.5l3 3 6-6.5" stroke="#fff" strokeWidth={3} fill="none" />}
      {v === 1 && <Circle cx="12" cy="12" r="9" fill="#fff" stroke={DEV} strokeWidth={2.4} />}
      {v === 1 && <Path d="M12 3a9 9 0 0 1 0 18z" fill={DEV} />}
      {v === 0 && <Circle cx="12" cy="12" r="9" fill="#fff" stroke={NO} strokeWidth={2.4} />}
      {v === 0 && <Path d="M7.5 12h9" stroke={NO} strokeWidth={3} />}
    </Svg>
  )
}

const curto = (v: Resposta | undefined) => (v === undefined ? '—' : RESPOSTAS.find((r) => r.valor === v)!.curto)

function Rodape({ emissao }: { emissao: string }) {
  return (
    <View style={s.footer} fixed>
      <Text>Avaliação Psicomotora · emitido em {emissao}</Text>
      <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
    </View>
  )
}

export interface DadosRelatorio {
  paciente: Paciente
  avaliacoes: Avaliacao[] // chronological, completed
  config: Configuracoes
  graficoEvolucao: string | null
  graficoBarras: string
}

function Relatorio({ paciente, avaliacoes, config, graficoEvolucao, graficoBarras }: DadosRelatorio) {
  const emissao = formatarData(hoje())
  const ultima = avaliacoes[avaliacoes.length - 1]
  const anteriores = avaliacoes.slice(0, -1).slice(-3) // up to 3 earlier columns fit A4
  const faixa = faixaPorId(ultima.faixa)
  const nBarras = Math.min(avaliacoes.length, 4)

  return (
    <Document title={`Relatório — ${paciente.nome}`} author={config.nomeTerapeuta || undefined} language="pt-BR">
      {/* 1. Capa */}
      <Page size="A4" style={s.page}>
        <View style={s.coverBand}>
          <Text style={s.coverTitle}>RELATÓRIO DE AVALIAÇÃO PSICOMOTORA</Text>
          <Text style={s.coverName}>{paciente.nome}</Text>
        </View>
        <View style={s.idgrid}>
          <View style={s.idcell}><Text style={s.idlabel}>Data de nascimento</Text><Text style={s.idvalue}>{formatarData(paciente.dataNascimento)}</Text></View>
          <View style={s.idcell}><Text style={s.idlabel}>Idade atual</Text><Text style={s.idvalue}>{formatarIdade(idadeEmMeses(paciente.dataNascimento, hoje()))}</Text></View>
          <View style={s.idcell}><Text style={s.idlabel}>Período coberto</Text><Text style={s.idvalue}>{formatarData(avaliacoes[0].data)}{avaliacoes.length > 1 ? ` a ${formatarData(ultima.data)}` : ''}</Text></View>
          <View style={s.idcell}><Text style={s.idlabel}>Avaliações</Text><Text style={s.idvalue}>{avaliacoes.length}</Text></View>
          {paciente.responsavel && <View style={[s.idcell, { width: '100%' }]}><Text style={s.idlabel}>Responsável</Text><Text style={s.idvalue}>{paciente.responsavel}</Text></View>}
        </View>
        <View style={{ marginTop: 'auto', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Text style={s.idlabel}>Terapeuta</Text>
            <Text style={s.idvalue}>{config.nomeTerapeuta || '—'}</Text>
            {config.registro ? <Text style={{ color: INK2 }}>{config.registro}</Text> : null}
            {config.contato ? <Text style={{ color: INK2 }}>{config.contato}</Text> : null}
          </View>
          {config.logo ? <Image src={config.logo} style={{ maxWidth: 150, maxHeight: 80, objectFit: 'contain' }} /> : null}
        </View>
        <Rodape emissao={emissao} />
      </Page>

      {/* 2. Como ler */}
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>Como ler este relatório</Text>
        <Text style={s.lead}>Durante a avaliação, a terapeuta observa a criança em atividades do dia a dia e de brincadeira, organizadas em sete áreas do movimento.</Text>
        <Text style={s.h2}>Cada atividade recebe uma de três respostas</Text>
        <View style={s.box}>
          {[
            [2, 'Realiza', 'a criança faz a atividade sozinha e com segurança (2 pontos).'],
            [1, 'Em desenvolvimento', 'a criança tenta, faz em parte ou precisa de ajuda (1 ponto).'],
            [0, 'Não realiza', 'a criança ainda não consegue fazer (0 ponto).'],
          ].map(([v, t, d]) => (
            <View key={String(v)} style={s.legendRow}>
              <Marca v={v as Resposta} size={13} />
              <Text style={{ marginLeft: 8 }}><Text style={{ fontFamily: 'Helvetica-Bold' }}>{t}:</Text> {d}</Text>
            </View>
          ))}
        </View>
        <Text style={s.h2}>O que significa o percentual</Text>
        <Text style={s.p}>Em cada área, somamos os pontos e comparamos com o máximo possível. 100% quer dizer que a criança realiza todas as atividades daquela área; 50% quer dizer que ela está na metade do caminho. A pontuação geral é a média das sete áreas.</Text>
        <Text style={s.p}>As atividades mudam conforme a idade (faixas de 0 a 2, 2 a 4, 4 a 6, 6 a 9 e 9 a 15 anos). Por isso usamos percentuais: assim dá para comparar avaliações mesmo quando a criança passa para outra faixa.</Text>
        <Text style={s.h2}>As sete áreas</Text>
        {DOMINIOS.map((d) => (
          <View key={d.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: d.cor, marginRight: 8 }} />
            <Text>{d.nome}</Text>
          </View>
        ))}
        <View style={[s.box, { marginTop: 18 }]}>
          <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 3 }}>Importante</Text>
          <Text>Este é um instrumento de acompanhamento clínico interno, não uma escala padronizada e validada. Os marcos de idade são referências e não servem como diagnóstico. Converse com a terapeuta sobre qualquer dúvida.</Text>
        </View>
        <Rodape emissao={emissao} />
      </Page>

      {/* 3. Evolução */}
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>Evolução</Text>
        {graficoEvolucao ? (
          <>
            <Text style={s.lead}>{maiorAvanco(avaliacoes)}</Text>
            <Image src={graficoEvolucao} style={s.chart} />
            <Text style={{ color: INK2, fontSize: 9, marginTop: 6 }}>Cada linha colorida é uma área; a linha preta mais grossa é a pontuação geral. A linha tracejada marca quando a faixa de idade mudou.</Text>
          </>
        ) : (
          <View style={s.box}><Text>A linha de evolução aparece a partir da segunda avaliação. Este relatório inclui uma avaliação, de {formatarData(ultima.data)}.</Text></View>
        )}
        <Rodape emissao={emissao} />
      </Page>

      {/* 4. Comparativo */}
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>Comparativo por área</Text>
        <Text style={s.lead}>{nBarras === 1 ? `Percentual por área na avaliação de ${formatarData(ultima.data)}.` : `As ${nBarras} avaliações mais recentes, da mais antiga (tom claro) à mais recente (tom forte).`}</Text>
        <Image src={graficoBarras} style={s.chart} />
        <View style={[s.table, { marginTop: 16 }]}>
          <View style={[s.tr, { borderTopWidth: 0 }]}>
            <Text style={[s.tdItem, s.th]}>Área</Text>
            {avaliacoes.slice(-nBarras).map((a) => <Text key={a.id} style={[s.tdCell, s.th]}>{formatarData(a.data)}</Text>)}
          </View>
          {[...DOMINIOS, { id: 'geral' as const, nome: 'Geral' }].map((d) => (
            <View key={d.id} style={s.tr}>
              <Text style={[s.tdItem, d.id === 'geral' ? { fontFamily: 'Helvetica-Bold' } : {}]}>{d.nome}</Text>
              {avaliacoes.slice(-nBarras).map((a) => <Text key={a.id} style={[s.tdCell, { fontFamily: 'Helvetica-Bold' }]}>{pontuar(a)[d.id]}%</Text>)}
            </View>
          ))}
        </View>
        <Rodape emissao={emissao} />
      </Page>

      {/* 5. Item a item */}
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>Item a item</Text>
        <Text style={s.lead}>Respostas da avaliação mais recente ({formatarData(ultima.data)}, faixa {ultima.faixa}: {faixa.rotulo}){anteriores.length ? ', ao lado das anteriores quando a atividade é a mesma' : ''}.</Text>
        <View style={s.table}>
          <View style={[s.tr, { borderTopWidth: 0 }]} fixed>
            <Text style={[s.tdItem, s.th]}>Atividade</Text>
            {anteriores.map((a) => <Text key={a.id} style={[s.tdCell, s.th]}>{formatarData(a.data)}</Text>)}
            <Text style={[s.tdCell, s.th, { color: INK }]}>{formatarData(ultima.data)}</Text>
          </View>
          {DOMINIOS.map((d) => (
            <View key={d.id}>
              <View style={s.domHead} wrap={false}>
                <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: d.cor, marginRight: 6 }} />
                <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9.5 }}>{d.nome} · {pontuar(ultima)[d.id]}%</Text>
              </View>
              {faixa.itens.filter((i) => i.dominio === d.id).map((i) => (
                <View key={i.codigo} style={s.tr} wrap={false}>
                  <Text style={s.tdItem}>{i.texto}</Text>
                  {[...anteriores, ultima].map((a) => {
                    const v = a.respostas[i.codigo]
                    return (
                      <View key={a.id} style={s.tdCell}>
                        <Marca v={v} />
                        <Text style={{ marginLeft: v === undefined ? 0 : 4, color: v === undefined ? INK2 : INK }}>{curto(v)}</Text>
                      </View>
                    )
                  })}
                </View>
              ))}
            </View>
          ))}
        </View>
        {anteriores.length > 0 && <Text style={{ color: INK2, fontSize: 8.5 }}>— indica que a atividade não fez parte daquela avaliação (outra faixa de idade).</Text>}
        <Rodape emissao={emissao} />
      </Page>

      {/* 6. Observações */}
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>Observações</Text>
        <Text style={s.lead}>Avaliação de {formatarData(ultima.data)}.</Text>
        <Text style={s.h2}>Gerais</Text>
        <Text style={s.p}>{ultima.observacoes.trim() || 'Sem observações gerais.'}</Text>
        {DOMINIOS.filter((d) => ultima.obsDominio[d.id]?.trim()).map((d) => (
          <View key={d.id} wrap={false}>
            <Text style={s.h2}>{d.nome}</Text>
            <Text style={s.p}>{ultima.obsDominio[d.id]}</Text>
          </View>
        ))}
        <Rodape emissao={emissao} />
      </Page>

      {/* 7. Recomendações */}
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>Recomendações</Text>
        <Text style={[s.p, { fontSize: 11.5 }]}>{ultima.recomendacoes.trim() || 'Sem recomendações registradas.'}</Text>
        <View style={{ marginTop: 40, borderTopWidth: 0.75, borderTopColor: INK, width: 220, paddingTop: 6 }}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>{config.nomeTerapeuta || 'Terapeuta'}</Text>
          {config.registro ? <Text style={{ color: INK2 }}>{config.registro}</Text> : null}
        </View>
        <Rodape emissao={emissao} />
      </Page>
    </Document>
  )
}

export const gerarPdf = (d: DadosRelatorio) => pdf(<Relatorio {...d} />).toBlob()

export function nomeArquivo(nome: string) {
  const limpo = nome.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^A-Za-z0-9 ]/g, '').trim()
    .split(/\s+/).map((p) => p[0].toUpperCase() + p.slice(1)).join('')
  return `Relatorio_${limpo || 'Paciente'}_${hoje()}.pdf`
}
