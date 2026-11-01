import type { DominioId } from '../lib/domain'

// Starting library of parent-facing suggestions; the therapist edits after inserting.
export const SUGESTOES: Record<DominioId, string[]> = {
  MF: [
    'Oferecer massinha, argila ou massa de pão para apertar, enrolar e modelar.',
    'Brincar de pegar objetos pequenos com os dedos (feijões, botões, pregadores), sempre com supervisão.',
    'Desenhar, pintar e recortar juntos, com papel grande e giz de cera grosso no começo.',
    'Incentivar a criança a se vestir sozinha: abotoar, fechar zíper, calçar.',
  ],
  MG: [
    'Brincar ao ar livre todos os dias: correr, pular, chutar e arremessar bola.',
    'Montar pequenos circuitos em casa com almofadas, cadeiras e cordas.',
    'Brincadeiras de pegar, pega-pega e esconde-esconde.',
    'Andar de bicicleta, patinete ou velotrol, conforme a idade.',
  ],
  EE: [
    'Brincar de "estátua" com música, parando ao sinal.',
    'Desafiar a ficar num pé só enquanto conta até cinco, trocando de pé.',
    'Brincadeiras de imitar animais parados (flamingo, cegonha).',
  ],
  ED: [
    'Andar sobre uma linha de fita no chão, para frente e para trás.',
    'Brincar de amarelinha e de pular com um pé só.',
    'Andar sobre meio-fio baixo ou tronco no parque, de mãos dadas no início.',
    'Brincar de "seu mestre mandou" com mudanças de direção e paradas.',
  ],
  EN: [
    'Brincar de engatinhar como bicho (gato, urso) pela casa.',
    'Montar túneis com cadeiras e lençol para passar por baixo.',
    'Corridas de quatro apoios no tapete ou no gramado.',
  ],
  ES: [
    'Frequentar parquinho com escada, escorregador e trepa-trepa, com supervisão.',
    'Subir e descer escadas com calma, alternando os pés.',
    'Escalar almofadas empilhadas ou sofá, ensinando a descer com segurança.',
  ],
  LA: [
    'Brincadeiras com comandos de direita e esquerda ("mão direita na cabeça").',
    'Jogos de bater palmas cruzadas e de espelho.',
    'Pedir para pegar objetos colocados do lado oposto do corpo.',
    'Usar o caminho até a escola para nomear virar à direita e à esquerda.',
  ],
}
