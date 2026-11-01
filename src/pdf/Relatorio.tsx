import { Document, Image, Page, StyleSheet, Svg, Circle, Path, Text, View, pdf } from '@react-pdf/renderer'
import { paleta } from '../lib/tema'
import { locale, t } from '../i18n'
import { DOMINIOS, RESPOSTAS, faixaPorId, formatarData, formatarIdade, hoje, idadeEmMeses, maiorAvanco, pontuar, type Avaliacao, type Configuracoes, type Paciente, type Resposta } from '../lib/domain'

const INK = '#1B2B36'
const INK2 = '#4B5E6C'
const LINE = '#D6E2EA'
const OK = '#24804F'
const DEV = '#B07A00'
const NO = '#B0473A'

const base = StyleSheet.create({
  page: { paddingTop: 48, paddingBottom: 64, paddingHorizontal: 48, fontFamily: 'Helvetica', fontSize: 10.5, color: INK, lineHeight: 1.45 },
  h1: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: INK, marginBottom: 12, lineHeight: 1.2 },
  h2: { fontSize: 13, fontFamily: 'Helvetica-Bold', marginTop: 14, marginBottom: 6 },
  lead: { fontSize: 11.5, color: INK2, marginBottom: 14 },
  p: { marginBottom: 6 },
  footer: { position: 'absolute', bottom: 28, left: 48, right: 48, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8.5, color: INK2, borderTopWidth: 0.75, borderTopColor: LINE, paddingTop: 6 },
  coverBand: { marginHorizontal: -48, marginTop: -48, paddingHorizontal: 48, paddingTop: 56, paddingBottom: 36, color: '#fff' },
  coverTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 10 },
  coverName: { fontSize: 30, fontFamily: 'Helvetica-Bold', color: '#fff', lineHeight: 1.15 },
  idgrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 28, borderWidth: 0.75, borderColor: LINE, borderRadius: 6 },
  idcell: { width: '50%', padding: 12, borderBottomWidth: 0.75, borderBottomColor: LINE },
  idlabel: { fontSize: 8.5, color: INK2, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  idvalue: { fontSize: 12.5, fontFamily: 'Helvetica-Bold' },
  box: { borderRadius: 6, padding: 12, marginTop: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  table: { borderWidth: 0.75, borderColor: LINE, borderRadius: 4, marginBottom: 12 },
  tr: { flexDirection: 'row', borderTopWidth: 0.75, borderTopColor: LINE, minHeight: 22, alignItems: 'center' },
  th: { fontFamily: 'Helvetica-Bold', fontSize: 8.5, color: INK2 },
  tdItem: { flex: 1, paddingVertical: 4, paddingHorizontal: 6, fontSize: 9.5 },
  tdCell: { width: 78, paddingVertical: 4, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center', fontSize: 8.5 },
  domHead: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, paddingHorizontal: 6 },
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
    <View style={base.footer} fixed>
      <Text>{t('pdf.rodape', { data: emissao })}</Text>
      <Text render={({ pageNumber, totalPages }) => t('pdf.pagina', { n: pageNumber, total: totalPages })} />
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
  const p = paleta(config.corTema)
  const s = {
    ...base,
    h2: { ...base.h2, color: p.base },
    coverBand: { ...base.coverBand, backgroundColor: p.base },
    coverTitle: { ...base.coverTitle, color: p.suave },
    box: { ...base.box, backgroundColor: p.wash },
    domHead: { ...base.domHead, backgroundColor: p.wash },
  }

  return (
    <Document title={t('pdf.tituloDoc', { nome: paciente.nome })} author={config.nomeTerapeuta || undefined} language={locale()}>
      {/* 1. Capa */}
      <Page size="A4" style={s.page}>
        <View style={s.coverBand}>
          <Text style={s.coverTitle}>{t('pdf.capa')}</Text>
          <Text style={s.coverName}>{paciente.nome}</Text>
        </View>
        <View style={s.idgrid}>
          <View style={s.idcell}><Text style={s.idlabel}>{t('comum.dataNascimento')}</Text><Text style={s.idvalue}>{formatarData(paciente.dataNascimento)}</Text></View>
          <View style={s.idcell}><Text style={s.idlabel}>{t('pdf.idadeAtual')}</Text><Text style={s.idvalue}>{formatarIdade(idadeEmMeses(paciente.dataNascimento, hoje()))}</Text></View>
          <View style={s.idcell}><Text style={s.idlabel}>{t('pdf.periodo')}</Text><Text style={s.idvalue}>{avaliacoes.length > 1 ? t('comum.periodo', { de: formatarData(avaliacoes[0].data), ate: formatarData(ultima.data) }) : formatarData(ultima.data)}</Text></View>
          <View style={s.idcell}><Text style={s.idlabel}>{t('comum.avaliacoes')}</Text><Text style={s.idvalue}>{avaliacoes.length}</Text></View>
          {paciente.responsavel && <View style={[s.idcell, { width: '100%' }]}><Text style={s.idlabel}>{t('comum.responsavel')}</Text><Text style={s.idvalue}>{paciente.responsavel}</Text></View>}
        </View>
        <View style={{ marginTop: 'auto', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Text style={s.idlabel}>{t('pdf.terapeuta')}</Text>
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
        <Text style={s.h1}>{t('pdf.comoLer')}</Text>
        <Text style={s.lead}>{t('pdf.comoLerLead')}</Text>
        <Text style={s.h2}>{t('pdf.respostasTitulo')}</Text>
        <View style={s.box}>
          {RESPOSTAS.map((r) => (
            <View key={r.valor} style={s.legendRow}>
              <Marca v={r.valor} size={13} />
              <Text style={{ marginLeft: 8 }}><Text style={{ fontFamily: 'Helvetica-Bold' }}>{r.rotulo}:</Text> {t(`pdf.resposta.${r.valor}`)}</Text>
            </View>
          ))}
        </View>
        <Text style={s.h2}>{t('pdf.percentualTitulo')}</Text>
        <Text style={s.p}>{t('pdf.percentual1')}</Text>
        <Text style={s.p}>{t('pdf.percentual2')}</Text>
        <Text style={s.h2}>{t('pdf.areas')}</Text>
        {DOMINIOS.map((d) => (
          <View key={d.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: d.cor, marginRight: 8 }} />
            <Text>{d.nome}</Text>
          </View>
        ))}
        <View style={[s.box, { marginTop: 18 }]}>
          <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 3 }}>{t('pdf.importante')}</Text>
          <Text>{t('pdf.importanteTexto')}</Text>
        </View>
        <Rodape emissao={emissao} />
      </Page>

      {/* 3. Evolução */}
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>{t('painel.evolucao')}</Text>
        {graficoEvolucao ? (
          <>
            <Text style={s.lead}>{maiorAvanco(avaliacoes)}</Text>
            <Image src={graficoEvolucao} style={s.chart} />
            <Text style={{ color: INK2, fontSize: 9, marginTop: 6 }}>{t('pdf.evolucaoDica')}</Text>
          </>
        ) : (
          <View style={s.box}><Text>{t('pdf.evolucaoVazia', { data: formatarData(ultima.data) })}</Text></View>
        )}
        <Rodape emissao={emissao} />
      </Page>

      {/* 4. Comparativo */}
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>{t('pdf.comparativo')}</Text>
        <Text style={s.lead}>{nBarras === 1 ? t('pdf.comparativo1', { data: formatarData(ultima.data) }) : t('pdf.comparativoN', { n: nBarras })}</Text>
        <Image src={graficoBarras} style={s.chart} />
        <View style={[s.table, { marginTop: 16 }]}>
          <View style={[s.tr, { borderTopWidth: 0 }]}>
            <Text style={[s.tdItem, s.th]}>{t('pdf.area')}</Text>
            {avaliacoes.slice(-nBarras).map((a) => <Text key={a.id} style={[s.tdCell, s.th]}>{formatarData(a.data)}</Text>)}
          </View>
          {[...DOMINIOS, { id: 'geral' as const, nome: t('comum.geral') }].map((d) => (
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
        <Text style={s.h1}>{t('pdf.itemAItem')}</Text>
        <Text style={s.lead}>{t(anteriores.length ? 'pdf.itemLeadAnteriores' : 'pdf.itemLead', { data: formatarData(ultima.data), faixa: ultima.faixa, rotulo: faixa.rotulo })}</Text>
        <View style={s.table}>
          <View style={[s.tr, { borderTopWidth: 0 }]} fixed>
            <Text style={[s.tdItem, s.th]}>{t('pdf.atividade')}</Text>
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
        {anteriores.length > 0 && <Text style={{ color: INK2, fontSize: 8.5 }}>{t('pdf.traco')}</Text>}
        <Rodape emissao={emissao} />
      </Page>

      {/* 6. Observações */}
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>{t('pdf.observacoes')}</Text>
        <Text style={s.lead}>{t('pdf.avaliacaoDe', { data: formatarData(ultima.data) })}</Text>
        <Text style={s.h2}>{t('pdf.gerais')}</Text>
        <Text style={s.p}>{ultima.observacoes.trim() || t('pdf.semObservacoes')}</Text>
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
        <Text style={s.h1}>{t('comum.recomendacoes')}</Text>
        <Text style={[s.p, { fontSize: 11.5 }]}>{ultima.recomendacoes.trim() || t('pdf.semRecomendacoes')}</Text>
        <View style={{ marginTop: 40, borderTopWidth: 0.75, borderTopColor: INK, width: 220, paddingTop: 6 }}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>{config.nomeTerapeuta || t('pdf.terapeuta')}</Text>
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
  return `${t('pdf.arquivo')}_${limpo || t('pdf.arquivoPaciente')}_${hoje()}.pdf`
}
