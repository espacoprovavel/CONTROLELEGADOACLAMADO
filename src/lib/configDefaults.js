// ============================================================
//  PARÂMETROS LEGAIS DE PARTIDA — 2026
//
//  Valores 100% editáveis por empresa. Servem só de ponto de
//  partida. Cada empresa guarda a sua própria cópia no Firestore
//  e pode alterar tudo (com data de início de vigência).
//
//  ATENÇÃO: estes são valores de referência introduzidos pela
//  utilizadora. A app NÃO os impõe nem os valida legalmente —
//  são auditáveis e alteráveis a qualquer momento.
// ============================================================

export const CONFIG_2026 = {
  // Segurança Social
  ss: {
    taxaTrabalhador: 11, // %
    taxaEntidade: 23.75, // %
  },

  // Indexante dos Apoios Sociais
  ias: 537.13,

  // Salário mínimo nacional
  salarioMinimo: 920,
  mesesSalario: 14,

  // Subsídio de refeição isento (por dia)
  subsidioRefeicao: {
    dinheiro: 6.15, // €/dia isento em dinheiro
    cartao: 10.46, // €/dia isento em cartão/vale
  },

  // Horas de referência do mês completo
  horasMes: 173.33,

  // Dias úteis padrão por mês
  diasUteisMes: 22,

  // Regime de IVA: 'MENSAL' ou 'TRIMESTRAL'
  regimeIVA: 'TRIMESTRAL',

  // Taxas de IVA (editáveis, é possível acrescentar novas)
  iva: [
    { nome: 'Normal', taxa: 23 },
    { nome: 'Intermédia', taxa: 13 },
    { nome: 'Reduzida', taxa: 6 },
  ],

  // IRC
  irc: {
    taxaNormal: 19, // %
    pmeAtiva: true, // taxa reduzida PME nos primeiros X €
    taxaPME: 16, // %
    limitePME: 50000, // €
    derramaMunicipal: 0, // % (0 a 1,5)
  },

  // IRS
  irs: {
    minimoExistenciaAno: 12880, // €/ano → abaixo disto retenção 0,00
    // Tabela de retenção na fonte. VAZIA de propósito: a
    // utilizadora cola a tabela oficial. NÃO inventamos valores.
    // Estrutura sugerida por cada situação familiar:
    //  { ate: <remuneração mensal>, taxa: <% retenção> }
    tabela: {
      // chave = situação familiar; valor = lista de escalões
      solteiro: [],
      casado1titular: [],
      casado2titulares: [],
    },
  },

  // Ajudas de custo — limite isento opcional (desligado por omissão)
  ajudasCusto: {
    limiteIsentoAtivo: false,
    limiteIsentoDia: 0,
  },

  // Prazos fiscais (editáveis)
  prazos: {
    ivaMensal: 'Até dia 20 do 2.º mês seguinte',
    ivaTrimestral: 'Até dia 20 do 2.º mês seguinte ao trimestre',
    pagamentoContaIRC: 'Julho, Setembro e até 15 de Dezembro',
  },
};

// Situações familiares suportadas na tabela de IRS
export const SITUACOES_FAMILIARES = [
  { id: 'solteiro', nome: 'Solteiro / Não casado' },
  { id: 'casado1titular', nome: 'Casado, único titular' },
  { id: 'casado2titulares', nome: 'Casado, dois titulares' },
];

// Países comuns de destacamento (apenas sugestões para o select)
export const PAISES_DESTACAMENTO = ['Bélgica', 'Portugal', 'Alemanha', 'França', 'Países Baixos', 'Luxemburgo', 'Outro'];
