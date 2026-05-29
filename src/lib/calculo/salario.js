import { arred } from './arred.js';
import { calcularIRS } from './irs.js';

// ============================================================
//  MOTOR DE CÁLCULO SALARIAL — Espaço Provável
//
//  Funções PURAS, determinísticas e auditáveis. Sem IA.
//  Cada parcela devolve a fórmula e a taxa usadas.
//
//  Códigos de rubrica (replicam os recibos reais):
//   1   Vencimento (por horas)
//   20  Subsídio de Férias (duodécimo)
//   21  Subsídio de Natal (duodécimo)
//   30  Subsídio de Alimentação (S/IRS e SS)
//   38  Ajudas de Custo
//   40  Ajudas de Custo Estrangeiro
// ============================================================

// ---------- 1. CALCULADORA DE HORAS (independente) ----------
/**
 * Valor do vencimento de um conjunto de horas.
 * Aceita valorHora directo OU salarioBase (→ valorHora = base / horasMes).
 */
export function calcularHoras({ horas, valorHora, salarioBase, horasMes = 173.33 }) {
  let vh = valorHora;
  let formulaVH = `${arred(vh).toFixed(2)} €/h (introduzido)`;
  if ((vh === undefined || vh === null || vh === '') && salarioBase) {
    vh = arred(salarioBase / horasMes, 4);
    formulaVH = `${salarioBase} € ÷ ${horasMes} h = ${vh.toFixed(4)} €/h`;
  }
  vh = Number(vh) || 0;
  const valor = arred((Number(horas) || 0) * vh);
  return {
    horas: Number(horas) || 0,
    valorHora: vh,
    valor,
    formula: `${horas || 0} h × ${vh.toFixed(4)} €/h = ${valor.toFixed(2)} €`,
    formulaValorHora: formulaVH,
  };
}

// ---------- 2. CÁLCULO SIMPLIFICADO (salário − faltas) ----------
/**
 * Salário base menos faltas (em dias ou horas). Sem impostos.
 * Para conferência rápida.
 */
export function calcularSimplificado({ salarioBase, faltasDias = 0, faltasHoras = 0, horasMes = 173.33 }) {
  const base = Number(salarioBase) || 0;
  const valorDia = arred(base / 30, 4);
  const valorHora = arred(base / horasMes, 4);
  const descDias = arred(faltasDias * valorDia);
  const descHoras = arred(faltasHoras * valorHora);
  const totalDescontado = arred(descDias + descHoras);
  const resultado = arred(base - totalDescontado);
  return {
    base,
    valorDia,
    valorHora,
    descDias,
    descHoras,
    totalDescontado,
    resultado,
    formula:
      `Base ${base.toFixed(2)} € − faltas ` +
      `(${faltasDias} dia(s) × ${valorDia.toFixed(4)} = ${descDias.toFixed(2)} € ; ` +
      `${faltasHoras} h × ${valorHora.toFixed(4)} = ${descHoras.toFixed(2)} €) ` +
      `= ${resultado.toFixed(2)} €`,
  };
}

// Tipos de falta suportados
export const TIPOS_FALTA = {
  JUSTIFICADA: 'justificada',
  INJUSTIFICADA: 'injustificada',
  ADMISSAO: 'admissao',
  BAIXA: 'baixa', // CIT / baixa médica
};

// ---------- 3. CÁLCULO COMPLETO "COMO O CONTABILISTA" ----------
/**
 * @param {object} args
 * @param {object} args.config            configuração da empresa (rates 2026 editáveis)
 * @param {number} args.vencimentoBase    salário base mensal
 * @param {number} [args.horasTrabalhadas] se quiser vencimento por horas em vez do base completo
 * @param {number} [args.valorHora]
 * @param {number} [args.diasAdmissao]    dias trabalhados se entrou a meio do mês (admissão)
 * @param {number} [args.diasSubsidioRefeicao]
 * @param {boolean}[args.subsidioRefeicaoCartao] true = limite cartão, false = dinheiro
 * @param {number} [args.subsidioRefeicaoValorDia] valor pago por dia (default = limite isento)
 * @param {number} [args.ajudasCusto]
 * @param {number} [args.ajudasCustoEstrangeiro]
 * @param {boolean}[args.duodecimoFerias=true]
 * @param {boolean}[args.duodecimoNatal=true]
 * @param {Array}  [args.faltas]          [{ tipo, dias, horas, remunerada }]
 * @param {string} [args.situacaoFamiliar='solteiro']
 * @param {number} [args.dependentes=0]
 */
export function calcularReciboCompleto(args) {
  const {
    config,
    vencimentoBase = 0,
    horasTrabalhadas,
    valorHora,
    diasAdmissao,
    diasSubsidioRefeicao = 0,
    subsidioRefeicaoCartao = false,
    subsidioRefeicaoValorDia,
    ajudasCusto = 0,
    ajudasCustoEstrangeiro = 0,
    duodecimoFerias = true,
    duodecimoNatal = true,
    faltas = [],
    situacaoFamiliar = 'solteiro',
    dependentes = 0,
  } = args;

  const horasMes = config?.horasMes || 173.33;
  const taxaSS = config?.ss?.taxaTrabalhador ?? 11;
  const taxaSSEnt = config?.ss?.taxaEntidade ?? 23.75;
  const base = Number(vencimentoBase) || 0;
  const valorDia = arred(base / 30, 4);
  const vh = valorHora ? Number(valorHora) : arred(base / horasMes, 4);

  const rubricas = [];
  const avisos = [];

  // ---- Cód. 1 — Vencimento ----
  let vencimento;
  if (horasTrabalhadas !== undefined && horasTrabalhadas !== null && horasTrabalhadas !== '') {
    vencimento = arred(Number(horasTrabalhadas) * vh);
    rubricas.push({
      codigo: 1,
      descricao: 'Vencimento',
      taxa: null,
      valor: vencimento,
      formula: `${horasTrabalhadas} h × ${vh.toFixed(4)} €/h = ${vencimento.toFixed(2)} €`,
    });
  } else if (diasAdmissao !== undefined && diasAdmissao !== null && diasAdmissao !== '') {
    // Admissão a meio do mês → proporcional aos dias trabalhados (sobre 30)
    vencimento = arred(valorDia * Number(diasAdmissao));
    rubricas.push({
      codigo: 1,
      descricao: 'Vencimento (admissão — proporcional)',
      taxa: null,
      valor: vencimento,
      formula: `${diasAdmissao} dia(s) × ${valorDia.toFixed(4)} €/dia = ${vencimento.toFixed(2)} €`,
    });
  } else {
    vencimento = base;
    rubricas.push({
      codigo: 1,
      descricao: 'Vencimento',
      taxa: null,
      valor: vencimento,
      formula: `Salário base mensal = ${vencimento.toFixed(2)} €`,
    });
  }

  // ---- FALTAS ----
  let descontoFaltas = 0;
  let diasSemSubsidio = 0; // injustificadas removem subsídio de refeição
  const detalheFaltas = [];
  for (const f of faltas) {
    const dias = Number(f.dias) || 0;
    const horas = Number(f.horas) || 0;
    if (f.tipo === TIPOS_FALTA.INJUSTIFICADA) {
      // 1/30 por dia (+ valorHora por hora) e remove subsídio de alimentação desses dias
      const d = arred(dias * valorDia + horas * vh);
      descontoFaltas += d;
      diasSemSubsidio += dias;
      detalheFaltas.push({ ...f, desconto: d, nota: 'Injustificada: 1/30 por dia + remove subs. alimentação' });
    } else if (f.tipo === TIPOS_FALTA.JUSTIFICADA) {
      if (f.remunerada === false) {
        const d = arred(dias * valorDia + horas * vh);
        descontoFaltas += d;
        detalheFaltas.push({ ...f, desconto: d, nota: 'Justificada não remunerada (config): descontada' });
      } else {
        detalheFaltas.push({ ...f, desconto: 0, nota: 'Justificada remunerada (config): sem desconto' });
      }
    } else if (f.tipo === TIPOS_FALTA.BAIXA) {
      // Empresa deixa de pagar os dias (salvo complemento por CCT — opção remunerada)
      if (f.remunerada === true) {
        detalheFaltas.push({ ...f, desconto: 0, nota: 'Baixa com complemento (CCT): empresa paga' });
      } else {
        const d = arred(dias * valorDia + horas * vh);
        descontoFaltas += d;
        detalheFaltas.push({ ...f, desconto: d, nota: 'Baixa médica (CIT): empresa não paga estes dias. Subsídio de doença pago pela Segurança Social (55%–75%).' });
      }
      avisos.push('Há baixa médica (CIT): o subsídio de doença é pago pela Segurança Social, não pela empresa.');
    } else if (f.tipo === TIPOS_FALTA.ADMISSAO) {
      // Não é falta a descontar (já tratada via diasAdmissao no vencimento)
      detalheFaltas.push({ ...f, desconto: 0, nota: 'Por admissão: não desconta (vencimento já proporcional)' });
    }
  }
  descontoFaltas = arred(descontoFaltas);
  if (descontoFaltas > 0) {
    rubricas.push({
      codigo: 2,
      descricao: 'Desconto por faltas',
      taxa: null,
      valor: -descontoFaltas,
      formula: detalheFaltas.filter((d) => d.desconto > 0).map((d) => `${d.nota} → −${d.desconto.toFixed(2)} €`).join(' ; ') || `−${descontoFaltas.toFixed(2)} €`,
    });
  }

  const vencimentoLiquidoFaltas = arred(vencimento - descontoFaltas);

  // ---- Cód. 20 / 21 — Duodécimos (entram na base de SS) ----
  let subFerias = 0;
  let subNatal = 0;
  if (duodecimoFerias) {
    subFerias = arred(base / 12);
    rubricas.push({ codigo: 20, descricao: 'Subsídio de Férias (duodécimo)', taxa: null, valor: subFerias, formula: `${base.toFixed(2)} € ÷ 12 = ${subFerias.toFixed(2)} €` });
  }
  if (duodecimoNatal) {
    subNatal = arred(base / 12);
    rubricas.push({ codigo: 21, descricao: 'Subsídio de Natal (duodécimo)', taxa: null, valor: subNatal, formula: `${base.toFixed(2)} € ÷ 12 = ${subNatal.toFixed(2)} €` });
  }

  // ---- Cód. 30 — Subsídio de Alimentação (S/IRS e SS) ----
  const limiteRef = subsidioRefeicaoCartao
    ? config?.subsidioRefeicao?.cartao ?? 10.46
    : config?.subsidioRefeicao?.dinheiro ?? 6.15;
  const valorRefDia = subsidioRefeicaoValorDia != null && subsidioRefeicaoValorDia !== ''
    ? Number(subsidioRefeicaoValorDia)
    : limiteRef;
  const diasRefEfetivos = Math.max(0, (Number(diasSubsidioRefeicao) || 0) - diasSemSubsidio);
  let subAlimentacao = 0;
  let subAlimentacaoTributavel = 0; // parte acima do limite isento
  if (diasRefEfetivos > 0) {
    subAlimentacao = arred(diasRefEfetivos * valorRefDia);
    const isentoDia = Math.min(valorRefDia, limiteRef);
    const tributavelDia = Math.max(0, valorRefDia - limiteRef);
    subAlimentacaoTributavel = arred(diasRefEfetivos * tributavelDia);
    rubricas.push({
      codigo: 30,
      descricao: 'Subsídio de Alimentação (S/IRS e SS até ao limite)',
      taxa: null,
      valor: subAlimentacao,
      formula:
        `${diasRefEfetivos} dia(s) × ${valorRefDia.toFixed(2)} € = ${subAlimentacao.toFixed(2)} € ` +
        `(isento até ${limiteRef.toFixed(2)} €/dia${subAlimentacaoTributavel > 0 ? `, tributável ${subAlimentacaoTributavel.toFixed(2)} €` : ''}` +
        `${diasSemSubsidio > 0 ? `; ${diasSemSubsidio} dia(s) removido(s) por faltas injustificadas` : ''})`,
    });
  }

  // ---- Cód. 38 / 40 — Ajudas de Custo (isentas de IRS e SS) ----
  let ajudasIsentas = 0;
  let ajudasTributaveis = 0;
  const totalAjudas = (Number(ajudasCusto) || 0) + (Number(ajudasCustoEstrangeiro) || 0);
  if (totalAjudas > 0) {
    if (config?.ajudasCusto?.limiteIsentoAtivo) {
      const limite = Number(config.ajudasCusto.limiteIsentoDia) || 0; // tratado como limite total aqui
      ajudasIsentas = Math.min(totalAjudas, limite);
      ajudasTributaveis = arred(totalAjudas - ajudasIsentas);
    } else {
      ajudasIsentas = totalAjudas; // tratamento do contabilista: isentas
    }
    if (Number(ajudasCusto) > 0) {
      rubricas.push({ codigo: 38, descricao: 'Ajudas de Custo (isentas IRS/SS)', taxa: null, valor: arred(ajudasCusto), formula: `${arred(ajudasCusto).toFixed(2)} € — isentas de IRS e de SS` });
    }
    if (Number(ajudasCustoEstrangeiro) > 0) {
      rubricas.push({ codigo: 40, descricao: 'Ajudas de Custo Estrangeiro (isentas IRS/SS)', taxa: null, valor: arred(ajudasCustoEstrangeiro), formula: `${arred(ajudasCustoEstrangeiro).toFixed(2)} € — isentas de IRS e de SS` });
    }
  }

  // ---- BASE DE SEGURANÇA SOCIAL ----
  // = vencimento (líquido de faltas) + subsídios férias/Natal
  //   (NÃO inclui ajudas de custo nem subsídio de alimentação isento)
  const baseSS = arred(vencimentoLiquidoFaltas + subFerias + subNatal);
  const descontoSS = arred(baseSS * (taxaSS / 100));
  const ssEntidade = arred(baseSS * (taxaSSEnt / 100));

  rubricas.push({
    codigo: 'SS',
    descricao: `Desconto Segurança Social (${taxaSS}%)`,
    taxa: taxaSS,
    valor: -descontoSS,
    formula: `${taxaSS}% × base SS ${baseSS.toFixed(2)} € (venc. ${vencimentoLiquidoFaltas.toFixed(2)} + férias ${subFerias.toFixed(2)} + Natal ${subNatal.toFixed(2)}) = ${descontoSS.toFixed(2)} €`,
  });

  // ---- IRS ----
  // Base de IRS = parte tributável (vencimento + subsídios + parte tributável
  // de refeição/ajudas). Isentos não entram.
  const baseIRS = arred(vencimentoLiquidoFaltas + subFerias + subNatal + subAlimentacaoTributavel + ajudasTributaveis);
  const irs = calcularIRS({ remuneracaoMensal: baseIRS, situacaoFamiliar, dependentes, configIRS: config?.irs });
  if (irs.aviso) avisos.push(irs.aviso);
  rubricas.push({
    codigo: 'IRS',
    descricao: `Retenção na fonte de IRS${irs.taxa ? ` (${irs.taxa}%)` : ''}`,
    taxa: irs.taxa,
    valor: -irs.valor,
    formula: irs.formula,
  });

  // ---- TOTAIS ----
  const totalIliquido = arred(vencimentoLiquidoFaltas + subFerias + subNatal + subAlimentacao + ajudasIsentas + ajudasTributaveis);
  const totalDescontos = arred(descontoSS + irs.valor);
  const liquido = arred(totalIliquido - totalDescontos);
  const custoEmpresa = arred(totalIliquido + ssEntidade);

  return {
    rubricas,
    avisos,
    detalheFaltas,
    totais: {
      vencimento,
      descontoFaltas,
      vencimentoLiquidoFaltas,
      subFerias,
      subNatal,
      subAlimentacao,
      subAlimentacaoTributavel,
      ajudasIsentas,
      ajudasTributaveis,
      baseSS,
      descontoSS,
      ssEntidade,
      baseIRS,
      irs: irs.valor,
      irsTaxa: irs.taxa,
      totalIliquido,
      totalDescontos,
      liquido,
      custoEmpresa,
    },
  };
}
