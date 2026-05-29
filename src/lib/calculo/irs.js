import { arred } from './arred.js';

// ============================================================
//  RETENÇÃO NA FONTE DE IRS
//
//  Determinística e auditável. Usa a tabela carregada pela
//  utilizadora na configuração da empresa. Se não houver tabela,
//  NÃO assume retenção — devolve um aviso.
//
//  Mínimo de existência: se a remuneração anualizada estiver
//  dentro do mínimo de existência → retenção 0,00.
// ============================================================

/**
 * @param {object} args
 * @param {number} args.remuneracaoMensal  base sujeita a IRS no mês
 * @param {string} args.situacaoFamiliar   'solteiro' | 'casado1titular' | 'casado2titulares'
 * @param {number} args.dependentes        nº de dependentes
 * @param {object} args.configIRS          config.irs da empresa
 * @returns {{ taxa:number, valor:number, formula:string, aviso:string|null }}
 */
export function calcularIRS({ remuneracaoMensal, situacaoFamiliar, dependentes = 0, configIRS }) {
  const base = arred(remuneracaoMensal);

  // Mínimo de existência (anualizado a 14 meses, abordagem simples e visível)
  const minAno = configIRS?.minimoExistenciaAno || 0;
  const anual = base * 14;
  if (minAno > 0 && anual <= minAno) {
    return {
      taxa: 0,
      valor: 0,
      formula: `Dentro do mínimo de existência (${anual.toFixed(2)} €/ano ≤ ${minAno} €/ano) → retenção 0,00`,
      aviso: null,
    };
  }

  const tabela = configIRS?.tabela?.[situacaoFamiliar];
  if (!tabela || tabela.length === 0) {
    return {
      taxa: 0,
      valor: 0,
      formula: '—',
      aviso: 'Tabela de IRS não carregada para esta situação familiar. Não foi assumida retenção. Carregue a tabela oficial na Configuração.',
    };
  }

  // Procurar o escalão: primeiro escalão cujo "ate" >= remuneração
  const ordenada = [...tabela].sort((a, b) => a.ate - b.ate);
  let escalao = ordenada.find((e) => base <= e.ate);
  if (!escalao) escalao = ordenada[ordenada.length - 1]; // acima do último → usa o último

  let taxa = Number(escalao.taxa) || 0;

  // Redução por dependentes, se a tabela a definir (parcela por dependente
  // em pontos percentuais). Opcional e editável.
  const reducaoDep = Number(escalao.reducaoPorDependente || 0) * (dependentes || 0);
  taxa = Math.max(0, taxa - reducaoDep);

  const valor = arred(base * (taxa / 100));
  return {
    taxa,
    valor,
    formula: `${base.toFixed(2)} € × ${taxa}% (escalão até ${escalao.ate} €, ${situacaoFamiliar}, ${dependentes} dep.) = ${valor.toFixed(2)} €`,
    aviso: null,
  };
}
