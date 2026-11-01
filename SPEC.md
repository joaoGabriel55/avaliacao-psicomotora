# Avaliação Psicomotora Infantil — Questionário e Spec do MVP

Oct 31, 2026 · @Gabriel

## Visão geral

Um app para uma única terapeuta aplicar um questionário psicomotor (0 a 15 anos), acompanhar a evolução de cada paciente e gerar um relatório em PDF para os pais.

- **Usuário:** apenas a terapeuta. Sem login, sem multiusuário.
- **Saída:** PDF com capa, gráfico de evolução, gráfico comparativo por domínio, tabela item a item, observações e recomendações.
- **Premissa adotada:** dados guardados só no dispositivo (sem servidor), por serem dados de saúde de crianças (LGPD). Backup manual por exportação de arquivo.
- **Aviso:** é um instrumento de acompanhamento clínico interno, não uma escala padronizada e validada. Os marcos de idade são referências e podem ser ajustados pela terapeuta.

## Questionário: estrutura e pontuação

São 7 domínios, cada um com 2 a 5 itens, em 5 faixas etárias. "Pular com um pé" e "andar em superfícies estreitas" foram incorporados ao equilíbrio dinâmico.

| Domínio | O que observa |
| --- | --- |
| Motricidade fina | Preensão, manipulação, grafismo, recorte |
| Motricidade grossa | Correr, chutar, arremessar, saltar, coordenação global |
| Equilíbrio estático | Manter posturas paradas (um pé, olhos fechados, estátua) |
| Equilíbrio dinâmico | Pular com um pé, andar em superfícies estreitas, ponta dos pés, parar ao comando |
| Engatinhar | Padrão cruzado; a partir de 4 anos, quadrupedia em circuito |
| Escalar | Subir e descer com segurança em degraus, trepa-trepa, parede |
| Lateralidade | Preferência mão/pé, linha média, noção de direita e esquerda |

**Escala de resposta por item**

| Resposta | Pontos |
| --- | --- |
| Realiza | 2 |
| Em desenvolvimento | 1 |
| Não realiza | 0 |

**Pontuação do domínio** = soma dos pontos ÷ (2 × número de itens) × 100, de 0% a 100%. Usar percentual permite comparar avaliações mesmo quando a criança muda de faixa e os itens mudam.

**Pontuação geral** = média simples dos 7 domínios.

**Faixa etária aplicada:** definida pela idade na data da avaliação. A terapeuta pode escolher outra faixa manualmente (ex.: criança com atraso avaliada pela faixa anterior); essa escolha fica registrada.

**Campos da avaliação:** paciente, data, idade calculada, faixa aplicada, resposta de cada item, observação opcional por domínio, observações gerais, recomendações.

## Itens por faixa etária

Códigos: faixa (A–E) + domínio (MF, MG, EE, ED, EN, ES, LA) + número. Os códigos servem para o app ligar a mesma pergunta entre avaliações.

### Faixa A: 0 a 2 anos

| Código | Domínio | Item |
| --- | --- | --- |
| A-MF-1 | Motricidade fina | Segura um objeto colocado na mão |
| A-MF-2 | Motricidade fina | Passa um objeto de uma mão para a outra |
| A-MF-3 | Motricidade fina | Pega objetos pequenos em pinça (polegar e indicador) |
| A-MF-4 | Motricidade fina | Coloca objetos dentro de um recipiente |
| A-MG-1 | Motricidade grossa | Sustenta a cabeça |
| A-MG-2 | Motricidade grossa | Senta sem apoio |
| A-MG-3 | Motricidade grossa | Fica em pé com apoio |
| A-MG-4 | Motricidade grossa | Anda sem apoio |
| A-EE-1 | Equilíbrio estático | Mantém-se sentado sem apoio por 30 segundos |
| A-EE-2 | Equilíbrio estático | Fica em pé sem apoio por alguns segundos |
| A-EE-3 | Equilíbrio estático | Agacha e volta a ficar em pé sem apoio |
| A-ED-1 | Equilíbrio dinâmico | Anda vários passos sem cair |
| A-ED-2 | Equilíbrio dinâmico | Anda de lado segurando nos móveis |
| A-ED-3 | Equilíbrio dinâmico | Anda puxando ou carregando um brinquedo |
| A-EN-1 | Engatinhar | Rola de barriga para cima e para baixo |
| A-EN-2 | Engatinhar | Rasteja ou arrasta-se para alcançar algo |
| A-EN-3 | Engatinhar | Engatinha em padrão cruzado (braço e perna opostos) |
| A-ES-1 | Escalar | Sobe em sofá ou degrau baixo engatinhando |
| A-ES-2 | Escalar | Desce do sofá de costas, com segurança |
| A-LA-1 | Lateralidade | Explora objetos com as duas mãos |
| A-LA-2 | Lateralidade | Bate um objeto no outro, um em cada mão |
| A-LA-3 | Lateralidade | Alcança um objeto cruzando a linha média do corpo |

### Faixa B: 2 a 4 anos

| Código | Domínio | Item |
| --- | --- | --- |
| B-MF-1 | Motricidade fina | Empilha 4 ou mais blocos |
| B-MF-2 | Motricidade fina | Imita um traço vertical |
| B-MF-3 | Motricidade fina | Vira páginas de livro uma a uma |
| B-MF-4 | Motricidade fina | Encaixa peças simples |
| B-MG-1 | Motricidade grossa | Corre sem cair |
| B-MG-2 | Motricidade grossa | Chuta uma bola parada |
| B-MG-3 | Motricidade grossa | Arremessa a bola por cima do ombro |
| B-MG-4 | Motricidade grossa | Pula com os dois pés juntos |
| B-MG-5 | Motricidade grossa | Sobe escadas alternando os pés, com apoio |
| B-EE-1 | Equilíbrio estático | Fica em um pé só por 1 a 2 segundos |
| B-EE-2 | Equilíbrio estático | Faz "estátua" por 3 segundos |
| B-ED-1 | Equilíbrio dinâmico | Anda na ponta dos pés |
| B-ED-2 | Equilíbrio dinâmico | Anda sobre uma linha no chão |
| B-ED-3 | Equilíbrio dinâmico | Anda para trás |
| B-ED-4 | Equilíbrio dinâmico | Dá um pulo com um pé só |
| B-EN-1 | Engatinhar | Engatinha em padrão cruzado |
| B-EN-2 | Engatinhar | Engatinha por baixo de um obstáculo |
| B-EN-3 | Engatinhar | Engatinha sobre superfície irregular (colchão, almofadas) |
| B-ES-1 | Escalar | Sobe a escada do escorregador |
| B-ES-2 | Escalar | Sobe e desce de móveis com segurança |
| B-LA-1 | Lateralidade | Começa a mostrar preferência por uma das mãos |
| B-LA-2 | Lateralidade | Segura com uma mão e manipula com a outra |
| B-LA-3 | Lateralidade | Cruza a linha média para pegar um objeto |

### Faixa C: 4 a 6 anos

| Código | Domínio | Item |
| --- | --- | --- |
| C-MF-1 | Motricidade fina | Segura o lápis em pinça trípode |
| C-MF-2 | Motricidade fina | Copia círculo e cruz |
| C-MF-3 | Motricidade fina | Recorta em linha reta |
| C-MF-4 | Motricidade fina | Desenha figura humana com 3 ou mais partes |
| C-MF-5 | Motricidade fina | Abotoa botões grandes |
| C-MG-1 | Motricidade grossa | Pega uma bola grande com as mãos |
| C-MG-2 | Motricidade grossa | Chuta uma bola em movimento |
| C-MG-3 | Motricidade grossa | Sobe e desce escadas alternando os pés, sem apoio |
| C-MG-4 | Motricidade grossa | Salta um obstáculo baixo com os dois pés |
| C-MG-5 | Motricidade grossa | Galopa |
| C-EE-1 | Equilíbrio estático | Fica em um pé por 5 segundos (cada pé) |
| C-EE-2 | Equilíbrio estático | Fica de pés juntos e olhos fechados por 10 segundos |
| C-EE-3 | Equilíbrio estático | Faz "estátua" por 10 segundos |
| C-ED-1 | Equilíbrio dinâmico | Pula com um pé 5 vezes no lugar (cada pé) |
| C-ED-2 | Equilíbrio dinâmico | Avança pulando em um pé só (3 ou mais saltos) |
| C-ED-3 | Equilíbrio dinâmico | Anda sobre trave ou banco baixo |
| C-ED-4 | Equilíbrio dinâmico | Anda calcanhar-ponta sobre uma linha |
| C-ED-5 | Equilíbrio dinâmico | Para ao comando sem perder o equilíbrio |
| C-EN-1 | Engatinhar | Engatinha em padrão cruzado, com ritmo |
| C-EN-2 | Engatinhar | Rasteja de barriga no chão em padrão cruzado |
| C-EN-3 | Engatinhar | Engatinha em circuito com obstáculos |
| C-ES-1 | Escalar | Sobe no trepa-trepa |
| C-ES-2 | Escalar | Sobe uma escada vertical de parquinho |
| C-ES-3 | Escalar | Desce com segurança e controle |
| C-LA-1 | Lateralidade | Tem preferência manual consistente |
| C-LA-2 | Lateralidade | Tem preferência de pé consistente (chutar, pular) |
| C-LA-3 | Lateralidade | Cruza a linha média com facilidade |
| C-LA-4 | Lateralidade | Identifica direita e esquerda no próprio corpo |

### Faixa D: 6 a 9 anos

| Código | Domínio | Item |
| --- | --- | --- |
| D-MF-1 | Motricidade fina | Recorta formas curvas |
| D-MF-2 | Motricidade fina | Escreve letras com tamanho regular |
| D-MF-3 | Motricidade fina | Amarra o cadarço |
| D-MF-4 | Motricidade fina | Copia um losango |
| D-MF-5 | Motricidade fina | Enfia contas pequenas com rapidez |
| D-MG-1 | Motricidade grossa | Pula corda |
| D-MG-2 | Motricidade grossa | Quica a bola andando |
| D-MG-3 | Motricidade grossa | Arremessa com precisão em um alvo |
| D-MG-4 | Motricidade grossa | Corre em zigue-zague mudando de direção |
| D-MG-5 | Motricidade grossa | Anda de bicicleta |
| D-EE-1 | Equilíbrio estático | Fica em um pé por 10 segundos (cada pé) |
| D-EE-2 | Equilíbrio estático | Fica em um pé de olhos fechados por 5 segundos |
| D-EE-3 | Equilíbrio estático | Fica na ponta dos pés por 10 segundos |
| D-ED-1 | Equilíbrio dinâmico | Brinca de amarelinha |
| D-ED-2 | Equilíbrio dinâmico | Avança pulando em um pé 10 vezes |
| D-ED-3 | Equilíbrio dinâmico | Anda para trás sobre uma trave |
| D-ED-4 | Equilíbrio dinâmico | Anda sobre trave carregando um objeto |
| D-ED-5 | Equilíbrio dinâmico | Anda calcanhar-ponta para trás |
| D-EN-1 | Engatinhar | Faz quadrupedia em padrão cruzado com velocidade |
| D-EN-2 | Engatinhar | Engatinha para trás de forma coordenada |
| D-EN-3 | Engatinhar | Faz circuito de quadrupedia mudando de direção |
| D-ES-1 | Escalar | Sobe em corda com nós ou parede de escalada baixa |
| D-ES-2 | Escalar | Passa de um lado ao outro do trepa-trepa |
| D-ES-3 | Escalar | Desce com controle |
| D-LA-1 | Lateralidade | Tem preferência de mão, pé e olho definida |
| D-LA-2 | Lateralidade | Identifica direita e esquerda no próprio corpo sem hesitar |
| D-LA-3 | Lateralidade | Identifica direita e esquerda em outra pessoa de frente |
| D-LA-4 | Lateralidade | Executa comandos cruzados (mão direita na orelha esquerda) |

### Faixa E: 9 a 15 anos

| Código | Domínio | Item |
| --- | --- | --- |
| E-MF-1 | Motricidade fina | Escreve em letra cursiva fluente e legível |
| E-MF-2 | Motricidade fina | Usa régua e compasso com precisão |
| E-MF-3 | Motricidade fina | Faz dobraduras ou nós com as duas mãos |
| E-MF-4 | Motricidade fina | Manipula pequenos objetos com rapidez e precisão |
| E-MG-1 | Motricidade grossa | Faz um circuito motor com sequência de ações |
| E-MG-2 | Motricidade grossa | Corre e dribla ou arremessa coordenando os movimentos |
| E-MG-3 | Motricidade grossa | Salta em distância com impulso dos dois pés |
| E-MG-4 | Motricidade grossa | Pula corda com variações |
| E-EE-1 | Equilíbrio estático | Fica em um pé de olhos fechados por 10 segundos |
| E-EE-2 | Equilíbrio estático | Mantém a posição de "avião" por 10 segundos |
| E-EE-3 | Equilíbrio estático | Fica na ponta dos pés de olhos fechados por 5 segundos |
| E-ED-1 | Equilíbrio dinâmico | Pula em um pé mudando de direção |
| E-ED-2 | Equilíbrio dinâmico | Anda sobre trave estreita para frente e para trás |
| E-ED-3 | Equilíbrio dinâmico | Salta em um pé sobre marcas no chão em sequência |
| E-ED-4 | Equilíbrio dinâmico | Gira 360° e mantém o equilíbrio |
| E-EN-1 | Engatinhar | Faz quadrupedia coordenada em circuito |
| E-EN-2 | Engatinhar | Faz padrão cruzado seguindo um ritmo marcado |
| E-EN-3 | Engatinhar | Faz quadrupedia para trás e de lado |
| E-ES-1 | Escalar | Sobe em parede de escalada ou corda |
| E-ES-2 | Escalar | Transpõe obstáculos altos (muro baixo, plinto) |
| E-ES-3 | Escalar | Desce com controle |
| E-LA-1 | Lateralidade | Orienta-se por direita e esquerda no espaço |
| E-LA-2 | Lateralidade | Identifica direita e esquerda em outra pessoa sem hesitar |
| E-LA-3 | Lateralidade | Executa comandos cruzados rápidos |
| E-LA-4 | Lateralidade | Segue trajetos ou mapas com direita e esquerda |

## Spec do MVP

O MVP é um app web instalável (PWA) que funciona offline, guarda tudo no próprio dispositivo e gera o PDF sem enviar dados para nenhum servidor.

### Funcionalidades

1. **Pacientes:** cadastrar, editar e listar (nome, data de nascimento, responsável e notas opcionais). Idade exibida automaticamente.
2. **Nova avaliação:** escolher paciente, data (padrão: hoje), faixa sugerida pela idade (editável) e responder os itens domínio a domínio, com 3 botões por item.
3. **Histórico:** lista de avaliações do paciente, com abrir, editar e excluir (com confirmação).
4. **Painel do paciente:** gráfico de linha de evolução e gráfico de barras agrupadas.
5. **Relatório PDF:** escolher as avaliações, revisar observações e recomendações, pré-visualizar e baixar.
6. **Backup:** exportar e importar todos os dados em um arquivo JSON.
7. **Configurações:** nome da terapeuta, registro profissional, contato e logo para o PDF.

### Fluxo de uma avaliação

1. Abrir o paciente e tocar em "Nova avaliação".
2. Confirmar a data; o app calcula a idade e sugere a faixa.
3. Responder os itens de cada domínio (uma tela ou seção por domínio, com barra de progresso).
4. Escrever observações por domínio (opcional).
5. Escrever observações gerais e recomendações.
6. Concluir. O app só conclui com todos os itens respondidos; antes disso fica salvo como rascunho automaticamente.
7. Ver o painel atualizado e, se quiser, gerar o PDF.

### Modelo de dados

| Entidade | Campos |
| --- | --- |
| Paciente | id, nome, dataNascimento, responsavel?, notas?, criadoEm |
| Avaliacao | id, pacienteId, data, idadeMeses, faixa (A–E), faixaManual (sim/não), versaoQuestionario, respostas {codigoItem: 0, 1 ou 2}, obsDominio {domínio: texto}, observacoes, recomendacoes, status (rascunho ou concluída), criadoEm, atualizadoEm |
| Questionario | arquivo JSON versionado no código: versao, faixas \[{id, idadeMinMeses, idadeMaxMeses, itens \[{codigo, dominio, texto}\]}\] |
| Configuracoes | nomeTerapeuta, registro, contato, logo (imagem) |

### Regras de cálculo

| Faixa | Idade na data da avaliação |
| --- | --- |
| A | 0 a 23 meses |
| B | 24 a 47 meses |
| C | 48 a 71 meses |
| D | 72 a 107 meses |
| E | 108 a 191 meses (até 15 anos e 11 meses) |

- Pontuação do domínio e geral conforme a seção de pontuação acima, arredondadas para inteiro.
- Acima de 15 anos e 11 meses o app avisa, mas permite aplicar a faixa E.
- Mudar de faixa entre avaliações não quebra a comparação, porque os gráficos usam percentuais por domínio.

### Gráficos

**1. Linha de evolução**

- Eixo X: datas das avaliações, espaçadas proporcionalmente ao tempo.
- Eixo Y: 0% a 100%.
- Uma linha por domínio (7 cores fixas) e a pontuação geral em destaque (mais grossa).
- No app, tocar na legenda mostra ou oculta domínios.
- Linha vertical tracejada quando a faixa etária muda entre avaliações.
- Requer 2 ou mais avaliações; com 1 só, mostra apenas as barras.

**2. Barras agrupadas por domínio**

- Eixo X: os 7 domínios. Eixo Y: 0% a 100%.
- Uma barra por avaliação, da mais antiga (tom claro) à mais recente (tom forte), com o valor escrito em cima.
- No PDF, até 4 avaliações (as 4 mais recentes da seleção), para manter a leitura.

### Relatório PDF (A4, retrato)

| Página | Conteúdo |
| --- | --- |
| 1. Capa | Nome, data de nascimento, idade atual, período coberto, número de avaliações, terapeuta, registro e logo |
| 2. Como ler | Escala Realiza / Em desenvolvimento / Não realiza, o que significa o percentual, em linguagem simples para os pais; aviso de instrumento interno |
| 3. Evolução | Gráfico de linha + uma frase automática (ex.: maior avanço: Equilíbrio dinâmico, +25 pontos) |
| 4. Comparativo | Gráfico de barras agrupadas por domínio |
| 5. Item a item | Tabela da avaliação mais recente por domínio, com colunas das anteriores quando o código do item é o mesmo; respostas com texto e ícone, não só cor |
| 6. Observações | Observações gerais e por domínio da avaliação mais recente |
| 7. Recomendações | Texto da terapeuta |

- Rodapé em todas as páginas: número da página e data de emissão.
- Nome do arquivo: Relatorio\_NomeDoPaciente\_AAAA-MM-DD.pdf.

### Requisitos não funcionais

- Funciona sem internet depois do primeiro acesso; instalável em celular, tablet e computador.
- Nenhum dado sai do dispositivo. Limpar os dados do navegador apaga tudo, então o app lembra de fazer backup a cada 5 avaliações concluídas.
- Botões grandes para uso em tablet durante a sessão; uma avaliação preenchida em até 10 minutos.
- Interface e PDF em português do Brasil.
- PDF gerado em até 10 segundos.

### Stack sugerida

| Parte | Escolha |
| --- | --- |
| Base | React + TypeScript + Vite |
| Offline e instalação | vite-plugin-pwa |
| Armazenamento local | Dexie (IndexedDB) |
| Gráficos | Chart.js, exportando os gráficos como imagem para o PDF |
| PDF | @react-pdf/renderer, gerado no navegador |
| Validação do backup | zod |
| Testes | Vitest |
| Hospedagem | Site estático (Vercel, Netlify ou GitHub Pages) |

### Critérios de aceite

- [ ] Cadastrar paciente e ver a idade calculada.
- [ ] Faixa sugerida certa nas fronteiras: 23 meses = A, 24 meses = B, 108 meses = E.
- [ ] Não é possível concluir avaliação com item sem resposta; rascunho é salvo sozinho.
- [ ] Percentual por domínio confere com a fórmula (testes unitários).
- [ ] Gráfico de linha aparece com 2+ avaliações e marca a mudança de faixa.
- [ ] Barras agrupadas mostram até 4 avaliações.
- [ ] PDF sai com as 7 seções, em A4, sem internet.
- [ ] Tabela item a item alinha os itens de mesmo código entre avaliações.
- [ ] Exportar e importar o backup restaura todos os dados.

### Fora do escopo do MVP

Login, nuvem, vários profissionais, edição do questionário dentro do app (fica no JSON, editado pelo desenvolvedor), envio por e-mail ou WhatsApp, normas e percentis populacionais.

### Ordem de implementação

1. Projeto PWA, JSON do questionário e modelo de dados.
2. Cadastro de pacientes e fluxo de avaliação com rascunho.
3. Cálculo das pontuações e os dois gráficos.
4. Relatório PDF.
5. Backup, configurações e testes.

### Pontos em aberto

- Senha ou PIN para abrir o app (útil se o dispositivo for compartilhado)? Não
- Dispositivo principal: tablet, celular ou computador? os tres
- Recomendações em texto livre ou com sugestões prontas por domínio para escolher? os dois
- Os itens e marcos de idade precisam da sua revisão clínica antes de implementar. Resposta: Nao
