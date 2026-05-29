import { arred } from './arred.js';

// ============================================================
//  ESTIMADOR DE IVA  (respeita o regime: MENSAL ou TRIMESTRAL)
//
//  Determinístico. Soma o IVA liquidado (faturas emitidas) e o
//  IVA dedutível (faturas recebidas) do período e apura o saldo.
// ============================================================

/** Calcula o valor de IVA de uma linha a partir da base e taxa. */
export function ivaDaLinha({ base, taxa }) {
  return arred((Number(base) || 0) * ((Number(taxa) || 0) / 100));
}

/**
 * @param {Array} emitidas  faturas emitidas [{ base, taxa, valor? }]
 * @param {Array} recebidas faturas recebidas [{ base, taxa, valor? }]
 */
export function apurarIVA(emitidas = [], recebidas = []) {
  const soma = (lista) =>
    lista.reduce(
      (acc, f) => {
        const iva = f.valor != null && f.valor !== '' ? Number(f.valor) : ivaDaLinha(f);
        acc.base += Number(f.base) || 0;
        acc.iva += iva;
        return acc;
      },
      { base: 0, iva: 0 }
    );

  const liq = soma(emitidas);
  const ded = soma(recebidas);
  const ivaLiquidado = arred(liq.iva);
  const ivaDedutivel = arred(ded.iva);
  const saldo = arred(ivaLiquidado - ivaDedutivel);

  return {
    baseEmitida: arred(liq.base),
    ivaLiquidado,
    baseRecebida: arred(ded.base),
    ivaDedutivel,
    saldo, // > 0 → a entregar ; < 0 → a recuperar
    aEntregar: saldo > 0 ? saldo : 0,
    aRecuperar: saldo < 0 ? arred(-saldo) : 0,
    formula: `IVA liquidado ${ivaLiquidado.toFixed(2)} € − IVA dedutível ${ivaDedutivel.toFixed(2)} € = ${saldo.toFixed(2)} € (${saldo > 0 ? 'a entregar' : saldo < 0 ? 'a recuperar' : 'nulo'})`,
  };
}

/** Devolve os períodos do ano conforme o regime. */
export function periodosDoRegime(regime) {
  if (regime === 'MENSAL') {
    return ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((m) => ({
      id: m,
      nome: `Mês ${m}`,
    }));
  }
  return [
    { id: 'T1', nome: '1.º Trimestre (Jan–Mar)' },
    { id: 'T2', nome: '2.º Trimestre (Abr–Jun)' },
    { id: 'T3', nome: '3.º Trimestre (Jul–Set)' },
    { id: 'T4', nome: '4.º Trimestre (Out–Dez)' },
  ];
}
