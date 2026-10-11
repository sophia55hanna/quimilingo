import type {
  FillBlankQuestion,
  Lesson,
  LessonRef,
  MatchPairsQuestion,
  Module,
  MultipleChoiceQuestion,
  Question,
  QuestionRef,
  TrueFalseQuestion,
} from '../types/chemistry';

// Fórmulas químicas usam a notação `$...$`: `_` para subscrito e `^` para sobrescrito.
// Ex.: `$H_2SO_4$`, `$SO_4^{2-}$`, `$Na^+$`, `$10^{-3}$`.

type Draft =
  | Omit<MultipleChoiceQuestion, 'id'>
  | Omit<TrueFalseQuestion, 'id'>
  | Omit<FillBlankQuestion, 'id'>
  | Omit<MatchPairsQuestion, 'id'>;

const mc = (prompt: string, options: string[], correctIndex: number, explanation: string): Draft => ({
  type: 'multiple-choice',
  prompt,
  options,
  correctIndex,
  explanation,
});

const tf = (statement: string, answer: boolean, explanation: string): Draft => ({
  type: 'true-false',
  statement,
  answer,
  explanation,
});

const fill = (
  prompt: string,
  template: string,
  options: string[],
  answers: string[],
  explanation: string,
): Draft => ({ type: 'fill-blank', prompt, template, options, answers, explanation });

const match = (prompt: string, pairs: Array<[string, string]>, explanation: string): Draft => ({
  type: 'match-pairs',
  prompt,
  pairs: pairs.map(([left, right]) => ({ left, right })),
  explanation,
});

const lesson = (id: string, title: string, description: string, drafts: Draft[]): Lesson => ({
  id,
  title,
  description,
  xpReward: 10,
  questions: drafts.map((draft, i) => ({ ...draft, id: `${id}-q${i + 1}` }) as Question),
});

// ===========================================================================
// MÓDULOS
// ===========================================================================

export const modules: Module[] = [
  // -------------------------------------------------------------------------
  {
    id: 'm1',
    number: 1,
    title: 'Matéria e Estados Físicos',
    description: 'Estados da matéria, mudanças de estado, fenômenos e misturas.',
    color: 'green',
    icon: 'flask',
    lessons: [
      lesson('m1-l1', 'Matéria e seus estados', 'Sólido, líquido, gasoso e as mudanças de estado.', [
        mc(
          'O que é matéria?',
          [
            'Tudo aquilo que tem massa e ocupa lugar no espaço',
            'Somente os materiais no estado sólido',
            'Tudo aquilo que pode ser visto a olho nu',
            'Apenas substâncias formadas por carbono',
          ],
          0,
          'Matéria é tudo que possui massa e ocupa espaço (tem volume) — inclusive o ar, que não vemos.',
        ),
        mc(
          'Em qual estado físico as partículas têm forma e volume definidos?',
          ['Sólido', 'Líquido', 'Gasoso', 'Vapor'],
          0,
          'No sólido, as partículas estão muito próximas e organizadas, vibrando em posições fixas: forma e volume definidos.',
        ),
        tf(
          'No estado líquido, a substância possui volume definido, mas forma variável (assume a forma do recipiente).',
          true,
          'Líquidos têm volume constante, mas as partículas deslizam umas sobre as outras, adaptando-se ao recipiente.',
        ),
        match(
          'Associe cada mudança de estado à sua transformação.',
          [
            ['Fusão', 'Sólido → líquido'],
            ['Vaporização', 'Líquido → gasoso'],
            ['Solidificação', 'Líquido → sólido'],
            ['Sublimação', 'Sólido → gasoso'],
          ],
          'Fusão (S→L), vaporização (L→G), solidificação (L→S) e sublimação (S→G, direto, sem passar pelo líquido).',
        ),
        fill(
          'Complete as lacunas.',
          'A passagem do estado gasoso para o líquido chama-se ___, e a do líquido para o sólido chama-se ___.',
          ['condensação', 'solidificação', 'fusão', 'sublimação'],
          ['condensação', 'solidificação'],
          'Gasoso → líquido é condensação (ou liquefação); líquido → sólido é solidificação.',
        ),
        mc(
          'A naftalina “desaparecendo” dentro do armário é um exemplo de:',
          ['Sublimação', 'Fusão', 'Evaporação', 'Condensação'],
          0,
          'A naftalina passa diretamente do estado sólido para o gasoso: sublimação.',
        ),
        tf(
          'A ebulição é uma vaporização rápida, que ocorre em todo o líquido e, para uma substância pura, a uma temperatura definida (sob pressão constante).',
          true,
          'Diferente da evaporação (lenta, só na superfície), a ebulição é tumultuosa e ocorre no ponto de ebulição.',
        ),
      ]),
      lesson('m1-l2', 'Fenômenos físicos e químicos', 'Quando a matéria muda de forma ou de identidade.', [
        mc(
          'Qual destes é um fenômeno químico?',
          ['Queima de uma folha de papel', 'Gelo derretendo', 'Quebrar um copo de vidro', 'Dissolver açúcar em água'],
          0,
          'Na combustão do papel formam-se novas substâncias ($CO_2$, $H_2O$, cinzas). Os demais não alteram a composição.',
        ),
        tf(
          'A evaporação da água de uma poça é um fenômeno químico.',
          false,
          'É um fenômeno físico: a água continua sendo $H_2O$, apenas muda de estado físico.',
        ),
        fill(
          'Complete as lacunas.',
          'Num fenômeno ___ a composição da matéria não muda; num fenômeno ___ formam-se novas substâncias.',
          ['físico', 'químico', 'nuclear', 'mecânico'],
          ['físico', 'químico'],
          'Fenômeno físico preserva a identidade das substâncias; fenômeno químico (reação) cria substâncias novas.',
        ),
        mc(
          'Qual das opções NÃO é um indício de reação química?',
          ['Mudança de estado físico', 'Liberação de gás', 'Mudança de cor', 'Formação de precipitado'],
          0,
          'Mudança de estado é física. Liberação de gás, mudança de cor e formação de sólido (precipitado) indicam reação.',
        ),
        tf(
          'Cozinhar um ovo é uma transformação química, pois as proteínas sofrem desnaturação irreversível.',
          true,
          'O calor altera a estrutura das proteínas de forma irreversível: há transformação química.',
        ),
        mc(
          'O apodrecimento de uma fruta é um:',
          ['Fenômeno químico', 'Fenômeno físico', 'Processo de sublimação', 'Exemplo de mistura heterogênea'],
          0,
          'A decomposição por microrganismos produz novas substâncias: fenômeno químico.',
        ),
        match(
          'Classifique cada processo.',
          [
            ['Ferro enferrujando', 'Oxidação (químico)'],
            ['Amassar uma latinha', 'Deformação (físico)'],
            ['Fermentação do pão', 'Produção de $CO_2$ (químico)'],
            ['Moer café', 'Fragmentação (físico)'],
          ],
          'Ferrugem e fermentação geram novas substâncias; amassar e moer só mudam a forma/tamanho.',
        ),
      ]),
      lesson('m1-l3', 'Substâncias e misturas', 'Simples, compostas, homogêneas e heterogêneas.', [
        mc(
          'Qual das opções é uma substância simples?',
          ['$O_2$', '$H_2O$', '$CO_2$', '$NaCl$'],
          0,
          'Substância simples é formada por um único elemento químico: $O_2$ só tem oxigênio.',
        ),
        mc(
          'Qual das opções é uma substância composta?',
          ['$H_2O$', '$O_3$', '$N_2$', '$Fe$'],
          0,
          'A água é formada por dois elementos diferentes (H e O): substância composta.',
        ),
        tf(
          'Água e óleo formam uma mistura homogênea.',
          false,
          'Água e óleo não se misturam: formam uma mistura heterogênea com duas fases.',
        ),
        match(
          'Classifique cada material.',
          [
            ['Água pura', 'Substância composta'],
            ['Gás oxigênio ($O_2$)', 'Substância simples'],
            ['Ar atmosférico filtrado', 'Mistura homogênea'],
            ['Água e areia', 'Mistura heterogênea'],
          ],
          'Ar filtrado é uma solução gasosa (uma fase). Água e areia apresentam duas fases visíveis.',
        ),
        tf(
          'Substâncias puras apresentam temperatura constante durante a fusão e a ebulição.',
          true,
          'Pontos de fusão e ebulição constantes são critérios de pureza. Misturas comuns variam a temperatura durante a mudança.',
        ),
        fill(
          'Complete as lacunas.',
          'Uma mistura que apresenta uma única fase é ___; com duas ou mais fases é ___.',
          ['homogênea', 'heterogênea', 'azeotrópica', 'eutética'],
          ['homogênea', 'heterogênea'],
          'O número de fases define o tipo de mistura: 1 fase = homogênea; 2 ou mais = heterogênea.',
        ),
        mc(
          'O ozônio ($O_3$) e o gás oxigênio ($O_2$) são:',
          ['Formas alotrópicas do oxigênio', 'Isótopos do oxigênio', 'Misturas homogêneas', 'Substâncias compostas'],
          0,
          'Alotropia: um mesmo elemento forma substâncias simples diferentes ($O_2$ e $O_3$; grafite e diamante).',
        ),
      ]),
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'm2',
    number: 2,
    title: 'O Átomo e Semelhanças',
    description: 'Partículas subatômicas, íons, semelhanças atômicas e modelos.',
    color: 'blue',
    icon: 'atom',
    lessons: [
      lesson('m2-l1', 'Partículas do átomo', 'Prótons, nêutrons, elétrons, Z, A e íons.', [
        match(
          'Associe cada termo à sua definição.',
          [
            ['Próton', 'Carga positiva, no núcleo'],
            ['Nêutron', 'Sem carga, no núcleo'],
            ['Elétron', 'Carga negativa, na eletrosfera'],
            ['Número atômico (Z)', 'Quantidade de prótons'],
          ],
          'O núcleo contém prótons (+) e nêutrons (0); os elétrons (−) ficam na eletrosfera. Z = número de prótons.',
        ),
        mc(
          'O número de massa (A) de um átomo é dado por:',
          ['A = Z + N (prótons + nêutrons)', 'A = Z + elétrons', 'A = Z − N', 'A = prótons + elétrons'],
          0,
          'A massa do átomo está concentrada no núcleo: A = Z + N.',
        ),
        mc(
          'Um átomo de sódio tem Z = 11 e A = 23. Quantos nêutrons ele possui?',
          ['12', '11', '23', '34'],
          0,
          'N = A − Z = 23 − 11 = 12 nêutrons.',
        ),
        tf(
          'Em um átomo neutro, o número de prótons é igual ao número de elétrons.',
          true,
          'Cargas positivas e negativas se equilibram no átomo neutro.',
        ),
        mc(
          'O cátion $Fe^{3+}$ (Z = 26) possui quantos elétrons?',
          ['23', '26', '29', '3'],
          0,
          'O ferro neutro tem 26 elétrons; ao perder 3 elétrons, fica com 23.',
        ),
        fill(
          'Complete as lacunas.',
          'Um átomo que ganha elétrons torna-se um ___; um átomo que perde elétrons torna-se um ___.',
          ['ânion', 'cátion', 'isótopo', 'nêutron'],
          ['ânion', 'cátion'],
          'Ganhar elétrons → carga negativa (ânion). Perder elétrons → carga positiva (cátion).',
        ),
        mc(
          'O ânion $Cl^-$ (Z = 17, A = 35) possui:',
          [
            '17 prótons, 18 nêutrons e 18 elétrons',
            '17 prótons, 18 nêutrons e 17 elétrons',
            '18 prótons, 17 nêutrons e 18 elétrons',
            '17 prótons, 35 nêutrons e 16 elétrons',
          ],
          0,
          'p = Z = 17; N = 35 − 17 = 18; como ganhou 1 elétron, e = 17 + 1 = 18.',
        ),
      ]),
      lesson('m2-l2', 'Isótopos, isóbaros e isótonos', 'Semelhanças atômicas e espécies isoeletrônicas.', [
        match(
          'Associe cada semelhança atômica ao que é igual entre os átomos.',
          [
            ['Isótopos', 'Mesmo número de prótons (Z)'],
            ['Isóbaros', 'Mesmo número de massa (A)'],
            ['Isótonos', 'Mesmo número de nêutrons (N)'],
            ['Isoeletrônicos', 'Mesmo número de elétrons'],
          ],
          'Dica: isótoPos → mesmo nº de Prótons; isóbAros → mesma mAssa (A); isótoNos → mesmo nº de Nêutrons.',
        ),
        mc(
          'Prótio, deutério e trítio (todos com Z = 1) são:',
          ['Isótopos do hidrogênio', 'Isóbaros', 'Isótonos', 'Formas alotrópicas'],
          0,
          'Todos têm 1 próton, mas 0, 1 e 2 nêutrons, respectivamente: são isótopos.',
        ),
        mc(
          'Cálcio-40 (Z = 20) e potássio-40 (Z = 19) são:',
          ['Isóbaros', 'Isótopos', 'Isótonos', 'Isoeletrônicos'],
          0,
          'Ambos têm número de massa A = 40, mas números atômicos diferentes: isóbaros.',
        ),
        mc(
          'Potássio-39 (Z = 19) e cálcio-40 (Z = 20) são:',
          ['Isótonos', 'Isótopos', 'Isóbaros', 'Alótropos'],
          0,
          'N(K) = 39 − 19 = 20 e N(Ca) = 40 − 20 = 20: mesmo número de nêutrons, logo isótonos.',
        ),
        tf(
          'Isótopos de um mesmo elemento possuem propriedades químicas praticamente iguais.',
          true,
          'As propriedades químicas dependem da eletrosfera, que é igual nos isótopos. Mudam propriedades físicas como a massa.',
        ),
        tf(
          '$Na^+$ (Z = 11) e o átomo de neônio (Z = 10) são isoeletrônicos.',
          true,
          '$Na^+$ tem 11 − 1 = 10 elétrons, assim como o Ne neutro: são isoeletrônicos.',
        ),
        fill(
          'Complete as lacunas.',
          'O carbono-12 e o carbono-14 são ___, pois têm o mesmo número de ___.',
          ['isótopos', 'prótons', 'isóbaros', 'nêutrons'],
          ['isótopos', 'prótons'],
          'Ambos são carbono (Z = 6). Diferem no número de nêutrons (6 e 8).',
        ),
      ]),
      lesson('m2-l3', 'Modelos atômicos', 'De Dalton a Bohr: a evolução da ideia de átomo.', [
        match(
          'Associe cada cientista ao seu modelo atômico.',
          [
            ['Dalton', 'Esfera maciça e indivisível'],
            ['Thomson', 'Esfera positiva com elétrons incrustados'],
            ['Rutherford', 'Núcleo pequeno e denso + eletrosfera'],
            ['Bohr', 'Elétrons em níveis de energia definidos'],
          ],
          'Dalton (“bola de bilhar”), Thomson (“pudim de passas”), Rutherford (“planetário”), Bohr (níveis quantizados).',
        ),
        mc(
          'O experimento de bombardear uma fina lâmina de ouro com partículas alfa levou ao modelo de:',
          ['Rutherford', 'Dalton', 'Thomson', 'Demócrito'],
          0,
          'A maioria das partículas atravessou a lâmina e poucas desviaram: o átomo tem um núcleo pequeno e denso.',
        ),
        tf(
          'Segundo Rutherford, a maior parte do volume do átomo é espaço vazio.',
          true,
          'Como quase todas as partículas alfa atravessaram o ouro sem desvio, concluiu-se que o átomo é majoritariamente vazio.',
        ),
        mc(
          'No modelo de Bohr, quando um elétron passa de um nível mais externo para um mais interno, ele:',
          ['Emite energia na forma de luz (fóton)', 'Absorve energia', 'Transforma-se em próton', 'Sai do átomo'],
          0,
          'Ao “descer” de nível, o elétron libera a diferença de energia como luz — base dos testes de chama.',
        ),
        tf(
          'O modelo de Thomson já previa a existência de um núcleo atômico.',
          false,
          'O núcleo só foi proposto por Rutherford (1911). Thomson imaginava uma esfera positiva uniforme.',
        ),
        mc(
          'Qual partícula foi descoberta por Thomson em experimentos com tubos de raios catódicos?',
          ['Elétron', 'Próton', 'Nêutron', 'Fóton'],
          0,
          'Os raios catódicos são feixes de elétrons — partículas negativas, presentes em todos os átomos.',
        ),
      ]),
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'm3',
    number: 3,
    title: 'Distribuição Eletrônica',
    description: 'Diagrama de Linus Pauling, subníveis e camada de valência.',
    color: 'purple',
    icon: 'layers',
    lessons: [
      lesson('m3-l1', 'Níveis e subníveis', 'Camadas K a Q e subníveis s, p, d, f.', [
        mc(
          'Quantos elétrons cabem, no máximo, em um subnível p?',
          ['6', '2', '10', '14'],
          0,
          'Capacidades: s = 2, p = 6, d = 10, f = 14.',
        ),
        match(
          'Associe cada subnível à sua capacidade máxima.',
          [
            ['s', 'Até 2 elétrons'],
            ['p', 'Até 6 elétrons'],
            ['d', 'Até 10 elétrons'],
            ['f', 'Até 14 elétrons'],
          ],
          'Cada subnível tem 1, 3, 5 ou 7 orbitais, com até 2 elétrons cada: 2, 6, 10 e 14.',
        ),
        tf(
          'A camada K (n = 1) comporta no máximo 2 elétrons.',
          true,
          'A camada K possui apenas o subnível 1s, que comporta 2 elétrons.',
        ),
        mc(
          'Qual a capacidade máxima teórica da camada M (n = 3)?',
          ['18', '8', '32', '2'],
          0,
          'Pela fórmula 2n²: 2 × 3² = 18 elétrons (3s² 3p⁶ 3d¹⁰).',
        ),
        fill(
          'Complete as lacunas.',
          'O diagrama de ___ organiza os subníveis em ordem crescente de ___.',
          ['Linus Pauling', 'energia', 'Bohr', 'massa'],
          ['Linus Pauling', 'energia'],
          'O diagrama de Linus Pauling indica a ordem de preenchimento por energia crescente.',
        ),
        tf(
          'Pelo diagrama de Pauling, o subnível 4s é preenchido antes do 3d.',
          true,
          'O 4s tem energia menor que o 3d, por isso é preenchido antes.',
        ),
      ]),
      lesson('m3-l2', 'Diagrama de Linus Pauling', 'Distribuição eletrônica em subníveis.', [
        mc(
          'Qual é a ordem correta de preenchimento?',
          [
            '1s 2s 2p 3s 3p 4s 3d',
            '1s 2s 2p 3s 3p 3d 4s',
            '1s 2p 2s 3s 3p 4s 3d',
            '1s 2s 3s 2p 3p 3d 4s',
          ],
          0,
          'Seguindo as diagonais: 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p, 5s, 4d…',
        ),
        mc(
          'Qual é a distribuição eletrônica do sódio (Z = 11)?',
          ['$1s^2 2s^2 2p^6 3s^1$', '$1s^2 2s^2 2p^6 3p^1$', '$1s^2 2s^2 2p^7$', '$1s^2 2s^2 2p^5 3s^2$'],
          0,
          '2 + 2 + 6 + 1 = 11 elétrons, preenchendo 2p completamente (6) antes do 3s.',
        ),
        mc(
          'Para o ferro (Z = 26), qual é o subnível mais energético?',
          ['$3d^6$', '$4s^2$', '$3p^6$', '$4p^2$'],
          0,
          'Fe: $1s^2 2s^2 2p^6 3s^2 3p^6 4s^2 3d^6$. O último subnível preenchido (mais energético) é o $3d^6$.',
        ),
        fill(
          'Complete a distribuição do cloro (Z = 17).',
          '$1s^2 2s^2 2p^6$ ___ ___',
          ['$3s^2$', '$3p^5$', '$3p^6$', '$3d^5$'],
          ['$3s^2$', '$3p^5$'],
          'Já temos 10 elétrons; faltam 7: $3s^2$ (2) + $3p^5$ (5) = 17.',
        ),
        tf(
          'A distribuição do cálcio (Z = 20) é $1s^2 2s^2 2p^6 3s^2 3p^6 4s^2$.',
          true,
          '2 + 2 + 6 + 2 + 6 + 2 = 20 elétrons. Correto!',
        ),
        mc(
          'Quantos elétrons há no subnível mais energético do enxofre (Z = 16)?',
          ['4', '6', '2', '16'],
          0,
          'S: $1s^2 2s^2 2p^6 3s^2 3p^4$. O subnível mais energético é o $3p^4$: 4 elétrons.',
        ),
      ]),
      lesson('m3-l3', 'Camada de valência', 'A camada mais externa e a reatividade.', [
        mc(
          'O que é a camada de valência?',
          [
            'A camada mais externa do átomo que contém elétrons',
            'A camada mais próxima do núcleo',
            'O subnível mais energético',
            'A camada que contém os prótons',
          ],
          0,
          'É a última camada ocupada; seus elétrons participam das ligações químicas.',
        ),
        mc(
          'Quantos elétrons há na camada de valência do oxigênio (Z = 8)?',
          ['6', '2', '8', '4'],
          0,
          'O: $1s^2 2s^2 2p^4$. A camada 2 (L) tem 2 + 4 = 6 elétrons.',
        ),
        mc(
          'Qual é a camada de valência do ferro (Z = 26)?',
          ['Camada N (4ª), com 2 elétrons', 'Camada M (3ª), com 14 elétrons', 'Subnível 3d, com 6 elétrons', 'Camada N (4ª), com 8 elétrons'],
          0,
          'Fe: …$4s^2 3d^6$. A camada mais externa é a 4 (N), com os 2 elétrons do 4s.',
        ),
        tf(
          'O subnível mais energético sempre pertence à camada de valência.',
          false,
          'No ferro, o mais energético é o 3d (camada M), mas a valência é a camada N (4s²).',
        ),
        mc(
          'Qual é a distribuição por camadas do potássio (Z = 19)?',
          ['K = 2, L = 8, M = 8, N = 1', 'K = 2, L = 8, M = 9', 'K = 2, L = 9, M = 8', 'K = 2, L = 8, M = 7, N = 2'],
          0,
          'K: $1s^2 2s^2 2p^6 3s^2 3p^6 4s^1$ → 2, 8, 8, 1. O 4s é preenchido antes do 3d.',
        ),
        fill(
          'Complete as lacunas.',
          'O magnésio (Z = 12) tem ___ elétrons na camada de valência e tende a ___ esses elétrons.',
          ['2', 'perder', '6', 'ganhar'],
          ['2', 'perder'],
          'Mg: 2, 8, 2. Perdendo 2 elétrons, forma o cátion $Mg^{2+}$ com configuração de gás nobre.',
        ),
      ]),
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'm4',
    number: 4,
    title: 'Tabela Periódica',
    description: 'Períodos, famílias e propriedades periódicas.',
    color: 'orange',
    icon: 'grid',
    lessons: [
      lesson('m4-l1', 'Períodos e famílias', 'A organização da tabela periódica.', [
        tf(
          'Os períodos são as linhas horizontais da tabela e indicam o número de camadas eletrônicas do átomo.',
          true,
          'Há 7 períodos. Um elemento do 3º período possui 3 camadas ocupadas.',
        ),
        match(
          'Associe cada grupo ao nome da família.',
          [
            ['Grupo 1', 'Metais alcalinos'],
            ['Grupo 2', 'Metais alcalinoterrosos'],
            ['Grupo 17', 'Halogênios'],
            ['Grupo 18', 'Gases nobres'],
          ],
          'Famílias importantes: alcalinos (1), alcalinoterrosos (2), calcogênios (16), halogênios (17), gases nobres (18).',
        ),
        mc(
          'Um elemento cuja distribuição termina em $3s^2 3p^5$ pertence a:',
          ['3º período, grupo 17', '5º período, grupo 3', '3º período, grupo 15', '2º período, grupo 17'],
          0,
          'Camada 3 → 3º período; 7 elétrons na valência (2 + 5) → grupo 17 (é o cloro).',
        ),
        mc(
          'Qual destes elementos é um gás nobre?',
          ['Argônio (Ar)', 'Cloro (Cl)', 'Nitrogênio (N)', 'Sódio (Na)'],
          0,
          'O argônio está no grupo 18, com camada de valência completa.',
        ),
        fill(
          'Complete as lacunas.',
          'As colunas verticais da tabela periódica são chamadas de ___ ou ___.',
          ['grupos', 'famílias', 'períodos', 'séries'],
          ['grupos', 'famílias'],
          'Colunas = grupos (famílias), com propriedades químicas semelhantes. Linhas = períodos.',
        ),
        mc(
          'Os elementos de transição (externa) ocupam o bloco:',
          ['d', 's', 'p', 'f'],
          0,
          'Grupos 3 a 12: o elétron mais energético está em um subnível d.',
        ),
        tf(
          'O hidrogênio, apesar de aparecer na coluna 1, não é um metal alcalino.',
          true,
          'O hidrogênio é um ametal com propriedades únicas; fica no grupo 1 por ter 1 elétron de valência.',
        ),
      ]),
      lesson('m4-l2', 'Propriedades periódicas', 'Raio atômico, eletronegatividade e ionização.', [
        mc(
          'Como varia o raio atômico na tabela periódica?',
          [
            'Aumenta de cima para baixo nos grupos e da direita para a esquerda nos períodos',
            'Aumenta de baixo para cima nos grupos e da esquerda para a direita nos períodos',
            'É igual para todos os elementos de um período',
            'Aumenta somente da esquerda para a direita',
          ],
          0,
          'Mais camadas (descendo) → átomo maior. No período, mais prótons para a direita → elétrons mais atraídos → átomo menor.',
        ),
        mc(
          'Qual é o elemento mais eletronegativo da tabela?',
          ['Flúor (F)', 'Oxigênio (O)', 'Césio (Cs)', 'Hélio (He)'],
          0,
          'O flúor tem eletronegatividade 4,0 (escala de Pauling), a maior de todas.',
        ),
        tf(
          'A eletronegatividade cresce de baixo para cima nos grupos e da esquerda para a direita nos períodos (excluindo gases nobres).',
          true,
          'Ela é maior em átomos pequenos com núcleo atraindo fortemente — tendência para o canto superior direito (F).',
        ),
        mc(
          'Qual elemento tem o maior raio atômico?',
          ['Césio (Cs)', 'Lítio (Li)', 'Flúor (F)', 'Cloro (Cl)'],
          0,
          'O césio está no canto inferior esquerdo (6º período, grupo 1): muitas camadas e baixa carga nuclear efetiva.',
        ),
        mc(
          'O que é energia de ionização?',
          [
            'A energia necessária para remover um elétron de um átomo isolado no estado gasoso',
            'A energia liberada quando um átomo recebe um elétron',
            'A tendência de um átomo atrair elétrons numa ligação',
            'A energia necessária para quebrar o núcleo',
          ],
          0,
          'A energia de ionização varia de forma inversa ao raio: átomos menores seguram mais os elétrons.',
        ),
        fill(
          'Complete as lacunas.',
          'Num mesmo período, ao avançar para a direita, o raio atômico ___ porque a carga nuclear ___.',
          ['diminui', 'aumenta', 'permanece igual', 'desaparece'],
          ['diminui', 'aumenta'],
          'Mais prótons, mesmo número de camadas → maior atração sobre os elétrons → raio menor.',
        ),
        tf(
          'O cátion $Na^+$ tem raio maior que o átomo neutro de Na.',
          false,
          'Ao perder seu único elétron da camada 3, o $Na^+$ fica com 2 camadas: o cátion é menor que o átomo.',
        ),
      ]),
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'm5',
    number: 5,
    title: 'Ligações Químicas',
    description: 'Regra do octeto e ligações iônica, covalente e metálica.',
    color: 'pink',
    icon: 'link',
    lessons: [
      lesson('m5-l1', 'Regra do octeto', 'Por que os átomos se ligam.', [
        mc(
          'O que afirma a regra do octeto?',
          [
            'Átomos tendem a ficar com 8 elétrons na camada de valência (ou 2, se só tiverem a camada K)',
            'Todo átomo possui exatamente 8 prótons',
            'Moléculas sempre têm 8 átomos',
            'Átomos tendem a perder todos os seus elétrons',
          ],
          0,
          'Os átomos ganham, perdem ou compartilham elétrons para atingir a configuração estável de um gás nobre.',
        ),
        tf(
          'Os gases nobres são estáveis porque já possuem a camada de valência completa.',
          true,
          'Por isso raramente formam ligações. São o “modelo” de estabilidade da regra do octeto.',
        ),
        mc(
          'Para atingir o octeto, o cloro (7 elétrons de valência) tende a:',
          ['Ganhar 1 elétron', 'Perder 7 elétrons', 'Ganhar 7 elétrons', 'Perder 1 elétron'],
          0,
          'É muito mais fácil ganhar 1 elétron do que perder 7. Forma o ânion $Cl^-$.',
        ),
        mc(
          'O alumínio (Z = 13; 2, 8, 3) tende a formar o íon:',
          ['$Al^{3+}$', '$Al^{3-}$', '$Al^+$', '$Al^{5-}$'],
          0,
          'Perdendo os 3 elétrons da valência, o alumínio fica com 2, 8 — configuração do neônio.',
        ),
        fill(
          'Complete as lacunas.',
          'Metais tendem a ___ elétrons, formando ___.',
          ['perder', 'cátions', 'ganhar', 'ânions'],
          ['perder', 'cátions'],
          'Metais têm poucos elétrons de valência (1 a 3) e baixa energia de ionização: formam cátions.',
        ),
        tf(
          'O boro, no $BF_3$, é uma exceção ao octeto, ficando com apenas 6 elétrons na camada de valência.',
          true,
          'O boro tem 3 elétrons de valência e faz 3 ligações: fica com 6 elétrons (octeto incompleto).',
        ),
      ]),
      lesson('m5-l2', 'Iônica, covalente e metálica', 'Tipos de ligação e suas propriedades.', [
        match(
          'Associe cada ligação à sua característica.',
          [
            ['Ligação iônica', 'Metal + ametal: transferência de elétrons'],
            ['Ligação covalente', 'Ametal + ametal: compartilhamento de elétrons'],
            ['Ligação metálica', 'Metal + metal: “mar” de elétrons livres'],
            ['Ligação covalente dativa', 'Par de elétrons cedido por um só átomo'],
          ],
          'A natureza dos átomos envolvidos (metal/ametal) indica o tipo de ligação.',
        ),
        mc(
          'O cloreto de sódio ($NaCl$) é formado por ligação:',
          ['Iônica', 'Covalente apolar', 'Metálica', 'Covalente dativa'],
          0,
          'O sódio (metal) transfere 1 elétron ao cloro (ametal), formando $Na^+$ e $Cl^-$.',
        ),
        mc(
          'Na molécula de $H_2O$, os átomos estão unidos por ligações:',
          ['Covalentes', 'Iônicas', 'Metálicas', 'Nucleares'],
          0,
          'H e O são ametais: compartilham pares de elétrons (ligações covalentes polares).',
        ),
        tf(
          'Compostos iônicos conduzem corrente elétrica no estado sólido.',
          false,
          'No sólido os íons estão presos no retículo cristalino. Conduzem quando fundidos ou dissolvidos em água.',
        ),
        mc(
          'Qual é a fórmula do composto formado por $Ca^{2+}$ e $Cl^-$?',
          ['$CaCl_2$', '$CaCl$', '$Ca_2Cl$', '$Ca_2Cl_3$'],
          0,
          'São necessários 2 $Cl^-$ para neutralizar a carga +2 do cálcio: $CaCl_2$.',
        ),
        mc(
          'A boa condutividade elétrica e o brilho dos metais são explicados:',
          [
            'Pelos elétrons livres (deslocalizados) da ligação metálica',
            'Pela transferência de elétrons entre íons',
            'Pelo compartilhamento de pares fixos de elétrons',
            'Pela ausência de elétrons nos metais',
          ],
          0,
          'O “mar de elétrons” se move livremente pelo retículo metálico, conduzindo eletricidade e calor.',
        ),
        fill(
          'Complete as lacunas.',
          'Na molécula de $N_2$ há uma ligação ___, com ___ pares de elétrons compartilhados.',
          ['tripla', '3', 'dupla', '2'],
          ['tripla', '3'],
          'Cada N tem 5 elétrons de valência e precisa de 3 para o octeto: N≡N (3 pares compartilhados).',
        ),
        mc(
          'Qual é a fórmula do composto formado por $Al^{3+}$ e $O^{2-}$?',
          ['$Al_2O_3$', '$AlO$', '$Al_3O_2$', '$AlO_3$'],
          0,
          'Cruzando as cargas: 2 × (+3) = +6 e 3 × (−2) = −6. Fórmula: $Al_2O_3$.',
        ),
      ]),
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'm6',
    number: 6,
    title: 'Ácidos: Conceito e Força',
    description: 'Teoria de Arrhenius, ionização, classificação e força.',
    color: 'teal',
    icon: 'droplet',
    lessons: [
      lesson('m6-l1', 'Teoria de Arrhenius', 'O que define um ácido e como ele se ioniza.', [
        mc(
          'Segundo Arrhenius, ácido é toda substância que, em água:',
          [
            'Sofre ionização liberando como único cátion o $H^+$ (ou $H_3O^+$)',
            'Sofre dissociação liberando $OH^-$',
            'Não libera íons',
            'Libera como único ânion o $O^{2-}$',
          ],
          0,
          'O íon $H^+$ se une à água formando o hidrônio ($H_3O^+$), responsável pelo caráter ácido.',
        ),
        fill(
          'Complete a equação de ionização.',
          '$HCl$ + $H_2O$ → ___ + ___',
          ['$H_3O^+$', '$Cl^-$', '$OH^-$', '$Cl_2$'],
          ['$H_3O^+$', '$Cl^-$'],
          'O HCl transfere o $H^+$ para a água: $HCl + H_2O → H_3O^+ + Cl^-$.',
        ),
        tf(
          'Ácidos puros (sem água) são bons condutores de eletricidade.',
          false,
          'Ácidos são compostos moleculares: só formam íons (e conduzem) quando ionizados em água.',
        ),
        mc(
          'O processo pelo qual um ácido forma íons em água chama-se:',
          ['Ionização', 'Dissociação iônica', 'Sublimação', 'Neutralização'],
          0,
          'Ionização: formação de íons a partir de moléculas. Dissociação: separação de íons já existentes (bases e sais).',
        ),
        mc(
          'Quantos hidrogênios ionizáveis possui o ácido fosforoso ($H_3PO_3$)?',
          ['2', '3', '1', '0'],
          0,
          'Em oxiácidos, só são ionizáveis os H ligados a oxigênio. No $H_3PO_3$, um H está ligado direto ao P: é um diácido.',
        ),
        tf(
          '$H_2SO_4$ é um diácido, pois possui 2 hidrogênios ionizáveis.',
          true,
          'O ácido sulfúrico libera até 2 $H^+$ por molécula.',
        ),
        mc(
          'Qual é o sabor característico dos ácidos (como no limão e no vinagre)?',
          ['Azedo', 'Adstringente', 'Doce', 'Amargo'],
          0,
          'O sabor azedo é típico dos ácidos. (Nunca prove substâncias no laboratório!)',
        ),
      ]),
      lesson('m6-l2', 'Classificação e força', 'Hidrácidos, oxiácidos e a regra y − x.', [
        match(
          'Associe cada ácido à sua classificação.',
          [
            ['$HCl$', 'Hidrácido forte'],
            ['$HF$', 'Hidrácido moderado'],
            ['$H_2S$', 'Hidrácido fraco'],
            ['$H_2SO_4$', 'Oxiácido forte'],
          ],
          'Hidrácidos fortes: HCl, HBr, HI. Moderado: HF. Os demais (como $H_2S$ e HCN) são fracos.',
        ),
        mc(
          'Os hidrácidos são ácidos que:',
          ['Não possuem oxigênio na molécula', 'Possuem oxigênio na molécula', 'São sempre fortes', 'Possuem hidroxila ($OH^-$)'],
          0,
          'Hidrácidos (HCl, HBr, $H_2S$) não têm oxigênio; oxiácidos ($HNO_3$, $H_2SO_4$) têm.',
        ),
        mc(
          'Pela regra prática para oxiácidos $H_xEO_y$, calcula-se y − x. Para $H_2SO_4$ (4 − 2 = 2), o ácido é:',
          ['Forte', 'Moderado', 'Fraco', 'Neutro'],
          0,
          'y − x ≥ 2: forte; = 1: moderado; = 0: fraco.',
        ),
        mc(
          'Pela regra y − x, o ácido hipocloroso ($HClO$) é:',
          ['Fraco', 'Forte', 'Moderado', 'Muito forte'],
          0,
          'y − x = 1 − 1 = 0 → ácido fraco.',
        ),
        tf(
          '$HNO_3$ é um ácido forte.',
          true,
          'y − x = 3 − 1 = 2 → forte.',
        ),
        mc(
          'Qual destes hidrácidos é forte?',
          ['$HBr$', '$HF$', '$H_2S$', '$HCN$'],
          0,
          'Entre os hidrácidos, apenas HCl, HBr e HI são fortes.',
        ),
        fill(
          'Complete as lacunas.',
          'Pela regra y − x, $H_3PO_4$ (4 − 3 = 1) é um ácido ___, e $HClO_4$ (4 − 1 = 3) é um ácido ___.',
          ['moderado', 'forte', 'fraco', 'neutro'],
          ['moderado', 'forte'],
          'Diferença 1 → moderado; diferença 3 → forte (o ácido perclórico é um dos mais fortes).',
        ),
        tf(
          'O grau de ionização (α) indica a fração de moléculas que se ionizam; quanto maior α, mais forte o ácido.',
          true,
          'Ácidos fortes têm α > 50%; moderados, entre 5% e 50%; fracos, α < 5%.',
        ),
      ]),
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'm7',
    number: 7,
    title: 'Ácidos: Nomenclatura',
    description: 'Terminações -ídrico, -ico, -oso e prefixos hipo- e per-.',
    color: 'indigo',
    icon: 'book',
    lessons: [
      lesson('m7-l1', 'Hidrácidos (-ídrico)', 'Nomeando ácidos sem oxigênio.', [
        mc(
          'Qual é o nome do $HCl$?',
          ['Ácido clorídrico', 'Ácido clórico', 'Ácido cloroso', 'Ácido hipocloroso'],
          0,
          'Hidrácidos: ácido + nome do elemento + “ídrico”. HCl = ácido clorídrico.',
        ),
        match(
          'Associe cada hidrácido ao seu nome.',
          [
            ['$HF$', 'Ácido fluorídrico'],
            ['$HBr$', 'Ácido bromídrico'],
            ['$HI$', 'Ácido iodídrico'],
            ['$H_2S$', 'Ácido sulfídrico'],
          ],
          'Todos os hidrácidos terminam em -ídrico.',
        ),
        tf(
          '$HCN$ é chamado de ácido cianídrico.',
          true,
          'O grupo CN (cianeto) segue a mesma regra: ácido cianídrico.',
        ),
        fill(
          'Complete as lacunas.',
          'Hidrácidos: ácido + nome do elemento + ___. Assim, $HBr$ é o ácido ___.',
          ['ídrico', 'bromídrico', 'ico', 'brômico'],
          ['ídrico', 'bromídrico'],
          'A terminação -ídrico é exclusiva dos hidrácidos.',
        ),
        mc(
          'Qual é a fórmula do ácido iodídrico?',
          ['$HI$', '$HIO_3$', '$HIO$', '$H_2I$'],
          0,
          'Ácido iodídrico é o hidrácido do iodo: HI.',
        ),
      ]),
      lesson('m7-l2', 'Oxiácidos (-ico / -oso)', 'Nomeando ácidos com oxigênio.', [
        mc(
          'Qual é o nome do $H_2SO_4$?',
          ['Ácido sulfúrico', 'Ácido sulfuroso', 'Ácido sulfídrico', 'Ácido hipossulfuroso'],
          0,
          'É o oxiácido “padrão” do enxofre, com terminação -ico: ácido sulfúrico.',
        ),
        mc(
          'Qual é o nome do $H_2SO_3$?',
          ['Ácido sulfuroso', 'Ácido sulfúrico', 'Ácido sulfídrico', 'Ácido persulfúrico'],
          0,
          'Tem um oxigênio a menos que o sulfúrico → terminação -oso: ácido sulfuroso.',
        ),
        tf(
          'Entre dois oxiácidos do mesmo elemento, o que tem mais oxigênio recebe o sufixo -ico.',
          true,
          'Mais oxigênio (maior Nox do elemento central) → -ico; menos oxigênio → -oso.',
        ),
        match(
          'Associe cada oxiácido ao seu nome.',
          [
            ['$HNO_3$', 'Ácido nítrico'],
            ['$HNO_2$', 'Ácido nitroso'],
            ['$H_2CO_3$', 'Ácido carbônico'],
            ['$H_3PO_4$', 'Ácido fosfórico'],
          ],
          'Memorize os oxiácidos-padrão (-ico): $HNO_3$, $H_2CO_3$, $H_3PO_4$, $H_2SO_4$, $HClO_3$.',
        ),
        fill(
          'Complete as lacunas.',
          '$HNO_2$ é o ácido ___ e $HNO_3$ é o ácido ___.',
          ['nitroso', 'nítrico', 'nitrídrico', 'hiponitroso'],
          ['nitroso', 'nítrico'],
          'Menos oxigênio → -oso (nitroso); mais oxigênio → -ico (nítrico).',
        ),
        mc(
          'Qual é a fórmula do ácido carbônico?',
          ['$H_2CO_3$', '$HCO_3$', '$H_2CO_2$', '$H_2C$'],
          0,
          'O ácido carbônico ($H_2CO_3$) se forma quando o $CO_2$ reage com a água (presente nos refrigerantes).',
        ),
      ]),
      lesson('m7-l3', 'Prefixos hipo- e per-', 'A série completa dos oxiácidos do cloro.', [
        match(
          'Associe cada oxiácido do cloro ao seu nome.',
          [
            ['$HClO$', 'Ácido hipocloroso'],
            ['$HClO_2$', 'Ácido cloroso'],
            ['$HClO_3$', 'Ácido clórico'],
            ['$HClO_4$', 'Ácido perclórico'],
          ],
          'Ordem crescente de oxigênio: hipo…oso < …oso < …ico < per…ico.',
        ),
        mc(
          'O prefixo per- indica o oxiácido que possui:',
          [
            'Um oxigênio a mais que o ácido terminado em -ico',
            'Um oxigênio a menos que o ácido terminado em -oso',
            'Nenhum oxigênio',
            'O mesmo número de oxigênios do -ico',
          ],
          0,
          'Per…ico = mais oxigenado que o -ico. Hipo…oso = menos oxigenado que o -oso.',
        ),
        mc(
          'Qual é o nome do $HBrO$?',
          ['Ácido hipobromoso', 'Ácido bromoso', 'Ácido brômico', 'Ácido perbrômico'],
          0,
          'O bromo forma a mesma série do cloro: $HBrO$ é o ácido hipobromoso.',
        ),
        tf(
          '$HIO_4$ é o ácido periódico.',
          true,
          'Per + iod + ico: ácido periódico (o mais oxigenado da série do iodo).',
        ),
        fill(
          'Complete a série do mais oxigenado para o menos oxigenado.',
          'Ácido ___ → ácido clórico → ácido cloroso → ácido ___',
          ['perclórico', 'hipocloroso', 'clorídrico', 'hiperclórico'],
          ['perclórico', 'hipocloroso'],
          '$HClO_4$ (perclórico) → $HClO_3$ (clórico) → $HClO_2$ (cloroso) → $HClO$ (hipocloroso).',
        ),
        mc(
          'Qual é o Nox do cloro no $HClO_4$?',
          ['+7', '+5', '+1', '−1'],
          0,
          'H = +1 e O = −2 (×4 = −8). Para somar zero: +1 + Cl − 8 = 0 → Cl = +7.',
        ),
      ]),
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'm8',
    number: 8,
    title: 'Bases (Hidróxidos)',
    description: 'Dissociação, força, solubilidade e nomenclatura.',
    color: 'sky',
    icon: 'test-tube',
    lessons: [
      lesson('m8-l1', 'Conceito e dissociação', 'A hidroxila e a teoria de Arrhenius.', [
        mc(
          'Segundo Arrhenius, base é toda substância que, em água:',
          [
            'Sofre dissociação iônica liberando como único ânion o $OH^-$',
            'Sofre ionização liberando $H^+$',
            'Libera apenas cátions $Na^+$',
            'Não forma íons',
          ],
          0,
          'O íon hidroxila ($OH^-$) é o responsável pelas propriedades básicas.',
        ),
        fill(
          'Complete a equação de dissociação.',
          '$NaOH$ → ___ + ___ (em água)',
          ['$Na^+$', '$OH^-$', '$H^+$', '$O^{2-}$'],
          ['$Na^+$', '$OH^-$'],
          'O hidróxido de sódio é iônico: em água, seus íons se separam (dissociação).',
        ),
        tf(
          'Bases têm sabor adstringente (que “amarra” a boca) e deixam a fenolftaleína rosa.',
          true,
          'O caqui verde e a banana verde são exemplos de sabor adstringente.',
        ),
        mc(
          'Quantos íons $OH^-$ são liberados por fórmula de $Ca(OH)_2$?',
          ['2', '1', '3', '4'],
          0,
          '$Ca(OH)_2 → Ca^{2+} + 2 OH^-$: é uma dibase.',
        ),
        mc(
          'Quanto ao número de hidroxilas, $Al(OH)_3$ é uma:',
          ['Tribase', 'Monobase', 'Dibase', 'Tetrabase'],
          0,
          'Três grupos $OH^-$ por fórmula: tribase.',
        ),
        tf(
          'O hidróxido de amônio ($NH_4OH$) é uma base que não contém metal.',
          true,
          'É a única base comum sem metal: forma-se quando a amônia ($NH_3$) reage com a água.',
        ),
      ]),
      lesson('m8-l2', 'Força e solubilidade', 'Bases fortes, fracas, solúveis e insolúveis.', [
        mc(
          'As bases fortes são, em geral, hidróxidos de:',
          [
            'Metais alcalinos e alcalinoterrosos (exceto Be e Mg)',
            'Metais de transição',
            'Ametais',
            'Gases nobres',
          ],
          0,
          'São compostos iônicos com alto grau de dissociação, como NaOH, KOH e $Ca(OH)_2$.',
        ),
        match(
          'Associe cada base à sua força e solubilidade.',
          [
            ['$NaOH$', 'Forte e solúvel'],
            ['$Ca(OH)_2$', 'Forte e pouco solúvel'],
            ['$Mg(OH)_2$', 'Fraca e praticamente insolúvel'],
            ['$NH_4OH$', 'Fraca e solúvel'],
          ],
          'Alcalinos: fortes e solúveis. Alcalinoterrosos (Ca, Sr, Ba): fortes, pouco solúveis. $NH_4OH$: fraca, mas solúvel.',
        ),
        tf(
          'O $Mg(OH)_2$ é usado como antiácido estomacal (leite de magnésia).',
          true,
          'Por ser uma base fraca e pouco solúvel, neutraliza o excesso de acidez sem agredir o organismo.',
        ),
        mc(
          'Qual destas bases é fraca?',
          ['$Fe(OH)_3$', '$KOH$', '$NaOH$', '$Ba(OH)_2$'],
          0,
          'Hidróxidos de metais de transição, como $Fe(OH)_3$, são fracos e insolúveis.',
        ),
        tf(
          'Todos os hidróxidos de metais de transição são bases fortes e solúveis.',
          false,
          'É o contrário: em geral são bases fracas e praticamente insolúveis.',
        ),
        fill(
          'Complete as lacunas.',
          'O $KOH$ é uma base ___ porque o potássio é um metal ___.',
          ['forte', 'alcalino', 'fraca', 'de transição'],
          ['forte', 'alcalino'],
          'Hidróxidos de metais alcalinos (grupo 1) são bases fortes e solúveis.',
        ),
      ]),
      lesson('m8-l3', 'Nomenclatura de bases', 'Hidróxidos e metais de carga variável.', [
        mc(
          'Qual é o nome do $KOH$?',
          ['Hidróxido de potássio', 'Hidróxido de criptônio', 'Óxido de potássio', 'Potássio hidratado'],
          0,
          'Regra: “hidróxido de” + nome do cátion.',
        ),
        match(
          'Associe cada base ao seu nome.',
          [
            ['$NaOH$', 'Hidróxido de sódio'],
            ['$Ca(OH)_2$', 'Hidróxido de cálcio'],
            ['$Al(OH)_3$', 'Hidróxido de alumínio'],
            ['$NH_4OH$', 'Hidróxido de amônio'],
          ],
          'Cátions de carga fixa não precisam de algarismo romano no nome.',
        ),
        mc(
          'Qual é o nome do $Fe(OH)_2$?',
          ['Hidróxido de ferro II (ferroso)', 'Hidróxido de ferro III (férrico)', 'Hidróxido de ferro I', 'Hidróxido férrico II'],
          0,
          'Dois $OH^-$ → ferro com carga +2: ferro II, ou ferroso (sufixo -oso para a menor carga).',
        ),
        fill(
          'Complete as lacunas.',
          '$Fe(OH)_3$ pode ser chamado de hidróxido de ferro ___ ou hidróxido ___.',
          ['III', 'férrico', 'II', 'ferroso'],
          ['III', 'férrico'],
          'Ferro +3 é a maior carga: algarismo III ou sufixo -ico (férrico).',
        ),
        tf(
          '$CuOH$ é o hidróxido cúprico.',
          false,
          'Em $CuOH$ o cobre é +1 (menor carga): hidróxido cuproso. O cúprico é o $Cu(OH)_2$.',
        ),
        mc(
          'Qual é a fórmula do hidróxido de chumbo IV?',
          ['$Pb(OH)_4$', '$Pb(OH)_2$', '$PbOH$', '$Pb_4OH$'],
          0,
          'Chumbo IV = $Pb^{4+}$, que precisa de 4 $OH^-$: $Pb(OH)_4$.',
        ),
      ]),
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'm9',
    number: 9,
    title: 'Sais',
    description: 'Neutralização, fórmulas, nomenclatura e tipos de sais.',
    color: 'amber',
    icon: 'gem',
    lessons: [
      lesson('m9-l1', 'Neutralização', 'Ácido + base → sal + água.', [
        mc(
          'O que se forma na reação entre um ácido e uma base (neutralização)?',
          ['Sal e água', 'Óxido e hidrogênio', 'Apenas água', 'Ácido mais forte'],
          0,
          'Ácido + base → sal + água. O $H^+$ e o $OH^-$ formam água; os demais íons formam o sal.',
        ),
        fill(
          'Complete a reação de neutralização.',
          '$HCl$ + $NaOH$ → ___ + ___',
          ['$NaCl$', '$H_2O$', '$NaOH_2$', '$H_2$'],
          ['$NaCl$', '$H_2O$'],
          'O $H^+$ do ácido se une ao $OH^-$ da base, formando água; $Na^+$ e $Cl^-$ formam o sal.',
        ),
        tf(
          'Na neutralização, o $H^+$ do ácido reage com o $OH^-$ da base formando água.',
          true,
          'Equação iônica essencial: $H^+ + OH^- → H_2O$.',
        ),
        mc(
          'Qual sal se forma em $H_2SO_4$ + $2 NaOH$ → ? + $2 H_2O$',
          ['$Na_2SO_4$', '$NaSO_4$', '$Na_2SO_3$', '$NaHSO_4$'],
          0,
          'Dois $Na^+$ neutralizam a carga do sulfato ($SO_4^{2-}$): $Na_2SO_4$.',
        ),
        mc(
          'Em $H_2SO_4$ + $Ca(OH)_2$ → $CaSO_4$ + x $H_2O$, qual o valor de x?',
          ['2', '1', '3', '4'],
          0,
          'O ácido libera 2 $H^+$ e a base, 2 $OH^-$: formam-se 2 moléculas de água.',
        ),
        mc(
          'Fazendo o cruzamento de cargas entre $Al^{3+}$ e $SO_4^{2-}$, obtém-se:',
          ['$Al_2(SO_4)_3$', '$Al_3(SO_4)_2$', '$AlSO_4$', '$Al(SO_4)_3$'],
          0,
          'A carga de um vira o índice do outro: $Al_2(SO_4)_3$ → 2 × (+3) = 3 × (−2).',
        ),
      ]),
      lesson('m9-l2', 'Nomenclatura de sais', 'Ânions -eto, -ato e -ito.', [
        match(
          'Associe a terminação do ácido à terminação do ânion.',
          [
            ['-ídrico', '-eto'],
            ['-ico', '-ato'],
            ['-oso', '-ito'],
            ['hipo…oso', 'hipo…ito'],
          ],
          'Macete: “Bico de pato, mosquito no periquito”: ídrico → eto, ico → ato, oso → ito.',
        ),
        mc(
          'Qual é o nome do $NaCl$?',
          ['Cloreto de sódio', 'Clorato de sódio', 'Clorito de sódio', 'Hipoclorito de sódio'],
          0,
          'Vem do ácido clorídrico (-ídrico → -eto): cloreto de sódio, o sal de cozinha.',
        ),
        mc(
          'Qual é o nome do $CaCO_3$?',
          ['Carbonato de cálcio', 'Carbonito de cálcio', 'Carbeto de cálcio', 'Bicarbonato de cálcio'],
          0,
          'Vem do ácido carbônico (-ico → -ato): carbonato de cálcio (calcário, mármore).',
        ),
        mc(
          'Qual é o nome do $KNO_2$?',
          ['Nitrito de potássio', 'Nitrato de potássio', 'Nitreto de potássio', 'Hiponitrito de potássio'],
          0,
          'Vem do ácido nitroso (-oso → -ito): nitrito de potássio.',
        ),
        fill(
          'Complete as lacunas.',
          '$Na_2SO_4$ é o ___ de sódio e $Na_2SO_3$ é o ___ de sódio.',
          ['sulfato', 'sulfito', 'sulfeto', 'sulfurato'],
          ['sulfato', 'sulfito'],
          'Sulfúrico (-ico) → sulfato; sulfuroso (-oso) → sulfito. Sulfeto vem do sulfídrico ($Na_2S$).',
        ),
        tf(
          '$FeCl_3$ é o cloreto de ferro III (cloreto férrico).',
          true,
          'Três $Cl^-$ indicam ferro +3: cloreto de ferro III ou férrico.',
        ),
        mc(
          'Qual é a fórmula do nitrato de cálcio?',
          ['$Ca(NO_3)_2$', '$CaNO_3$', '$Ca_2NO_3$', '$Ca(NO_2)_2$'],
          0,
          '$Ca^{2+}$ e $NO_3^-$: são necessários 2 nitratos → $Ca(NO_3)_2$.',
        ),
      ]),
      lesson('m9-l3', 'Tipos de sais', 'Neutros, ácidos, básicos, duplos e hidratados.', [
        match(
          'Associe cada tipo de sal a um exemplo.',
          [
            ['Sal neutro (normal)', '$NaCl$'],
            ['Hidrogenossal (sal ácido)', '$NaHCO_3$'],
            ['Hidroxissal (sal básico)', '$Mg(OH)Cl$'],
            ['Sal duplo (misto)', '$KNaSO_4$'],
          ],
          'Hidrogenossal tem H ionizável; hidroxissal tem $OH^-$; sal duplo tem dois cátions (ou dois ânions) diferentes.',
        ),
        tf(
          'O bicarbonato de sódio ($NaHCO_3$) é um hidrogenossal.',
          true,
          'Ele resulta da neutralização parcial do $H_2CO_3$ e ainda tem um H ionizável.',
        ),
        mc(
          'Qual destes é um sal hidratado?',
          ['$CuSO_4·5H_2O$', '$NaCl$', '$KNO_3$', '$NaHSO_4$'],
          0,
          'O sulfato de cobre pentaidratado tem 5 moléculas de água na estrutura cristalina (cristais azuis).',
        ),
        mc(
          'Qual é o nome oficial do $NaHCO_3$?',
          ['Hidrogenocarbonato de sódio', 'Carbonato de sódio', 'Hidroxicarbonato de sódio', 'Carbeto de sódio'],
          0,
          'Popularmente “bicarbonato de sódio”; oficialmente, hidrogenocarbonato de sódio.',
        ),
        tf(
          'Uma solução aquosa de $NaCl$ é ácida.',
          false,
          'O NaCl vem de ácido forte (HCl) e base forte (NaOH): sua solução é neutra (pH ≈ 7).',
        ),
        mc(
          'O $NH_4Cl$ vem de ácido forte (HCl) e base fraca ($NH_4OH$). Sua solução aquosa é:',
          ['Ácida', 'Básica', 'Neutra', 'Impossível de prever'],
          0,
          'Na hidrólise salina, prevalece o caráter do mais forte: o ácido. Solução ácida.',
        ),
      ]),
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'm10',
    number: 10,
    title: 'Óxidos',
    description: 'Classificação, nomenclatura, peróxidos e meio ambiente.',
    color: 'rose',
    icon: 'wind',
    lessons: [
      lesson('m10-l1', 'Conceito e classificação', 'Óxidos básicos, ácidos, neutros e anfóteros.', [
        mc(
          'O que é um óxido?',
          [
            'Composto binário em que o oxigênio é o elemento mais eletronegativo',
            'Qualquer substância que contenha oxigênio',
            'Um ácido que contém oxigênio',
            'Uma base que contém hidroxila',
          ],
          0,
          'Óxidos têm 2 elementos, sendo o oxigênio o mais eletronegativo (ex.: CaO, $CO_2$, $Fe_2O_3$).',
        ),
        tf(
          '$OF_2$ é classificado como um óxido.',
          false,
          'O flúor é mais eletronegativo que o oxigênio. O $OF_2$ é o fluoreto de oxigênio.',
        ),
        match(
          'Associe cada classe de óxido a um exemplo.',
          [
            ['Óxido básico', '$Na_2O$'],
            ['Óxido ácido (anidrido)', '$CO_2$'],
            ['Óxido neutro', '$CO$'],
            ['Óxido anfótero', '$ZnO$'],
          ],
          'Básicos: metais de carga baixa. Ácidos: ametais. Neutros: CO, NO, $N_2O$. Anfóteros: ZnO, $Al_2O_3$.',
        ),
        mc(
          'Um óxido básico reage com água formando:',
          ['Uma base', 'Um ácido', 'Um sal', 'Nada (não reage)'],
          0,
          'Ex.: $Na_2O + H_2O → 2 NaOH$.',
        ),
        fill(
          'Complete os produtos.',
          '$CaO$ + $H_2O$ → ___    e    $SO_3$ + $H_2O$ → ___',
          ['$Ca(OH)_2$', '$H_2SO_4$', '$CaH_2$', '$H_2SO_3$'],
          ['$Ca(OH)_2$', '$H_2SO_4$'],
          'Óxido básico + água → base. Óxido ácido + água → ácido (o $SO_3$ é o anidrido sulfúrico).',
        ),
        mc(
          'Qual destes é um óxido neutro?',
          ['$NO$', '$SO_2$', '$CaO$', '$Al_2O_3$'],
          0,
          'Óxidos neutros (CO, NO, $N_2O$) não reagem com água, ácidos ou bases.',
        ),
        tf(
          'Óxidos anfóteros, como o $Al_2O_3$, reagem tanto com ácidos quanto com bases.',
          true,
          'Têm comportamento duplo: diante de ácido, agem como base; diante de base, agem como ácido.',
        ),
      ]),
      lesson('m10-l2', 'Nomenclatura, peróxidos e ambiente', 'Nomes dos óxidos e seu impacto ambiental.', [
        mc(
          'O $H_2O_2$ (água oxigenada) é classificado como:',
          ['Peróxido (oxigênio com Nox −1)', 'Óxido básico', 'Óxido neutro', 'Superóxido (Nox −1/2)'],
          0,
          'Em peróxidos há o grupo $O_2^{2-}$, e cada oxigênio tem Nox −1.',
        ),
        mc(
          'Qual é o nome do $CO_2$?',
          ['Dióxido de carbono', 'Monóxido de carbono', 'Óxido de carbono II', 'Peróxido de carbono'],
          0,
          'Para óxidos moleculares usam-se prefixos: mono-, di-, tri-… “di-óxido de carbono”.',
        ),
        match(
          'Associe cada óxido ao seu nome.',
          [
            ['$SO_2$', 'Dióxido de enxofre'],
            ['$Fe_2O_3$', 'Óxido de ferro III'],
            ['$N_2O_5$', 'Pentóxido de dinitrogênio'],
            ['$CaO$', 'Óxido de cálcio (cal viva)'],
          ],
          'Óxidos iônicos: “óxido de” + metal (com romano se a carga variar). Moleculares: prefixos numéricos.',
        ),
        tf(
          'A chuva ácida é causada principalmente por óxidos de enxofre e de nitrogênio, que reagem com a água da atmosfera.',
          true,
          'Ex.: $SO_3 + H_2O → H_2SO_4$. Esses óxidos vêm da queima de combustíveis fósseis.',
        ),
        mc(
          'Qual gás é o principal responsável pela intensificação do efeito estufa pela queima de combustíveis fósseis?',
          ['$CO_2$', '$O_2$', '$N_2$', '$Ar$'],
          0,
          'O $CO_2$ absorve radiação infravermelha, retendo calor na atmosfera.',
        ),
        mc(
          'Para corrigir a acidez de solos, os agricultores costumam usar:',
          ['$CaO$ (cal virgem) ou calcário', '$SO_3$', '$NO_2$', '$CO$'],
          0,
          'O CaO é um óxido básico: neutraliza a acidez do solo (calagem).',
        ),
        tf(
          'O monóxido de carbono ($CO$) é tóxico porque se liga fortemente à hemoglobina do sangue.',
          true,
          'O CO forma carboxiemoglobina, impedindo o transporte de oxigênio.',
        ),
      ]),
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'm11',
    number: 11,
    title: 'Escala de pH e Indicadores',
    description: 'Escala 0–14, caráter logarítmico e indicadores ácido-base.',
    color: 'lime',
    icon: 'palette',
    lessons: [
      lesson('m11-l1', 'A escala de pH', 'Ácido, neutro, básico e o caráter logarítmico.', [
        mc(
          'A 25 °C, uma solução com pH = 7 é:',
          ['Neutra', 'Ácida', 'Básica', 'Salina'],
          0,
          'pH 7 indica [$H^+$] = [$OH^-$] = $10^{-7}$ mol/L: solução neutra.',
        ),
        match(
          'Associe cada valor aproximado de pH ao material.',
          [
            ['pH ≈ 1,5', 'Suco gástrico'],
            ['pH = 7', 'Água pura (25 °C)'],
            ['pH ≈ 7,4', 'Sangue humano'],
            ['pH ≈ 12,5', 'Água sanitária'],
          ],
          'O suco gástrico é muito ácido (HCl); o sangue é levemente básico; a água sanitária é bem básica.',
        ),
        tf(
          'Uma solução de pH 3 é 10 vezes mais ácida que uma solução de pH 4.',
          true,
          'A escala é logarítmica: cada unidade de pH a menos corresponde a 10 vezes mais $H^+$.',
        ),
        mc(
          'Quantas vezes a concentração de $H^+$ em pH 2 é maior que em pH 5?',
          ['1000', '3', '30', '100'],
          0,
          'Diferença de 3 unidades → $10^3$ = 1000 vezes.',
        ),
        fill(
          'Complete as lacunas (a 25 °C).',
          'pH menor que 7 indica meio ___ e pH maior que 7 indica meio ___.',
          ['ácido', 'básico', 'neutro', 'salino'],
          ['ácido', 'básico'],
          'Abaixo de 7: ácido. Exatamente 7: neutro. Acima de 7: básico (alcalino).',
        ),
        mc(
          'Sabendo que pH = −log[$H^+$], se [$H^+$] = $10^{-3}$ mol/L, o pH é:',
          ['3', '−3', '11', '0,001'],
          0,
          'pH = −log($10^{-3}$) = 3.',
        ),
        tf(
          'A 25 °C, pH + pOH = 14.',
          true,
          'Porque [$H^+$]·[$OH^-$] = $10^{-14}$ (produto iônico da água, Kw).',
        ),
      ]),
      lesson('m11-l2', 'Indicadores ácido-base', 'Fenolftaleína, tornassol e repolho roxo.', [
        mc(
          'Qual é a cor da fenolftaleína em meio básico?',
          ['Rosa (carmim)', 'Incolor', 'Azul', 'Amarela'],
          0,
          'A fenolftaleína é incolor em meio ácido/neutro e fica rosa em meio básico (pH acima de ~8,2).',
        ),
        match(
          'Associe cada situação à cor observada.',
          [
            ['Fenolftaleína em meio ácido', 'Incolor'],
            ['Fenolftaleína em meio básico', 'Rosa'],
            ['Tornassol azul em meio ácido', 'Fica vermelho'],
            ['Tornassol vermelho em meio básico', 'Fica azul'],
          ],
          'Macete do tornassol: “ácido avermelha, base azula”.',
        ),
        tf(
          'O extrato de repolho roxo pode ser usado como indicador natural, mudando de cor conforme o pH.',
          true,
          'Ele contém pigmentos que mudam de cor ao longo de toda a escala de pH.',
        ),
        mc(
          'Em meio fortemente básico, o extrato de repolho roxo tende a ficar:',
          ['Verde a amarelo', 'Vermelho', 'Incolor', 'Sempre roxo'],
          0,
          'Repolho roxo: vermelho/rosa em ácido, roxo perto do neutro, azul/verde/amarelo em meio básico.',
        ),
        mc(
          'Qual pigmento é responsável pela mudança de cor do repolho roxo?',
          ['Antocianinas', 'Clorofila', 'Carotenoides', 'Hemoglobina'],
          0,
          'As antocianinas mudam de estrutura (e de cor) conforme a concentração de $H^+$.',
        ),
        tf(
          'A fenolftaleína fica rosa quando adicionada ao vinagre.',
          false,
          'O vinagre é ácido (ácido acético). Em meio ácido, a fenolftaleína permanece incolor.',
        ),
        fill(
          'Complete as lacunas.',
          'O papel de tornassol azul fica ___ em meio ácido; o vermelho fica ___ em meio básico.',
          ['vermelho', 'azul', 'verde', 'incolor'],
          ['vermelho', 'azul'],
          'Tornassol: ácido → vermelho; base → azul.',
        ),
      ]),
    ],
  },
];

// ===========================================================================
// ÍNDICES DERIVADOS
// ===========================================================================

export const allLessons: LessonRef[] = modules.flatMap((module) => module.lessons.map((lesson) => ({ lesson, module }))).map(
  (ref, order) => ({ ...ref, order }),
);

export const lessonsById: ReadonlyMap<string, LessonRef> = new Map(allLessons.map((ref) => [ref.lesson.id, ref]));

export const questionsById: ReadonlyMap<string, QuestionRef> = new Map(
  allLessons.flatMap(({ lesson, module }) =>
    lesson.questions.map((question) => [question.id, { question, lessonId: lesson.id, moduleId: module.id }] as const),
  ),
);

export const totalLessons = allLessons.length;
