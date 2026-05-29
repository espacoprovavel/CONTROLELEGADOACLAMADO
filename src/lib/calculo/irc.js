import { arred } from './arred.js';

// ============================================================
//  ESTIMADOR DE IRC
//
//  Determinístico. Lucro tributável = rendimentos − gastos
//  (incluindo o custo total de pessoal puxado do histórico de
//  salários da MESMA empresa). Aplica 19% (ou PME 16% nos
//  primeiros X €) + derrama municipal.
// ============================================================

/**
 * @param {object} args
 * @param {number} args.rendimentos
 * @param {number} args.gastos              gastos dedutíveis (sem pessoal)
 * @param {number} args.custoPessoal        custo total de pessoal (auto)
 * @param {object} args.configIRC           config.irc da empresa
 */
export function estimarIRC({ rendimentos = 0, gastos = 0, custoPessoal = 0, configIRC }) {
  const c = configIRC || {};
  const totalGastos = arred((Number(gastos) || 0) + (Number(custoPessoal) || 0));
  const lucro = arred((Number(rendimentos) || 0) - totalGastos);

  const passos = [];
  passos.push(`Lucro tributável = rendimentos ${arred(rendimentos).toFixed(2)} € − gastos ${arred(gastos).toFixed(2)} € − pessoal ${arred(custoPessoal).toFixed(2)} € = ${lucro.toFixed(2)} €`);

  let coleta = 0;
  if (lucro <= 0) {
    passos.push('Lucro ≤ 0 → IRC estimado 0,00 €');
  } else if (c.pmeAtiva) {
    const limite = Number(c.limitePME) || 0;
    const parte1 = Math.min(lucro, limite);
    const parte2 = Math.max(0, lucro - limite);
    const irc1 = arred(parte1 * ((Number(c.taxaPME) || 0) / 100));
    const irc2 = arred(parte2 * ((Number(c.taxaNormal) || 0) / 100));
    coleta = arred(irc1 + irc2);
    passos.push(`PME: ${parte1.toFixed(2)} € × ${c.taxaPME}% = ${irc1.toFixed(2)} €`);
    if (parte2 > 0) passos.push(`Excedente: ${parte2.toFixed(2)} € × ${c.taxaNormal}% = ${irc2.toFixed(2)} €`);
  } else {
    coleta = arred(lucro * ((Number(c.taxaNormal) || 0) / 100));
    passos.push(`${lucro.toFixed(2)} € × ${c.taxaNormal}% = ${coleta.toFixed(2)} €`);
  }

  const derramaTaxa = Number(c.derramaMunicipal) || 0;
  const derrama = lucro > 0 ? arred(lucro * (derramaTaxa / 100)) : 0;
  if (derramaTaxa > 0) passos.push(`Derrama municipal: ${lucro.toFixed(2)} € × ${derramaTaxa}% = ${derrama.toFixed(2)} €`);

  const ircTotal = arred(coleta + derrama);
  // Pagamentos por conta (estimativa simples: ~95% do IRC do ano anterior, em 3 prestações)
  const pagamentosPorConta = arred(ircTotal * 0.95);

  return {
    lucroTributavel: lucro,
    totalGastos,
    coleta,
    derrama,
    ircTotal,
    pagamentosPorConta,
    prestacaoPorConta: arred(pagamentosPorConta / 3),
    passos,
  };
}
