import { describe, it, expect } from 'vitest';
import { calcularReciboCompleto, calcularHoras, calcularSimplificado, TIPOS_FALTA } from './salario.js';
import { apurarIVA } from './iva.js';
import { estimarIRC } from './irc.js';
import { CONFIG_2026 } from '../configDefaults.js';

const config = JSON.parse(JSON.stringify(CONFIG_2026));

describe('Recibo completo — Legado Aclamado abril/2026', () => {
  // Base 920 € + ajudas de custo (estrangeiro). O recibo real do
  // contabilista dá: base de SS 1.073,34 € e desconto SS 118,07 €.
  const r = calcularReciboCompleto({
    config,
    vencimentoBase: 920,
    ajudasCustoEstrangeiro: 1500, // valor exemplo, isento → não entra na base SS
    diasSubsidioRefeicao: 0,
    duodecimoFerias: true,
    duodecimoNatal: true,
  });

  it('base de SS = 1.073,34 € (920 + 76,67 + 76,67)', () => {
    expect(r.totais.baseSS).toBe(1073.34);
  });

  it('desconto SS (11%) = 118,07 €', () => {
    expect(r.totais.descontoSS).toBe(118.07);
  });

  it('ajudas de custo NÃO entram na base de SS', () => {
    // base SS ignora as ajudas (1500 €)
    expect(r.totais.baseSS).toBe(1073.34);
    expect(r.totais.ajudasIsentas).toBe(1500);
  });

  it('SS entidade (23,75%) sobre a mesma base', () => {
    expect(r.totais.ssEntidade).toBe(254.92); // 1073.34 * 0.2375 = 254.918...
  });

  it('sem tabela de IRS carregada → retenção 0 e aviso', () => {
    expect(r.totais.irs).toBe(0);
    expect(r.avisos.some((a) => a.includes('IRS'))).toBe(true);
  });
});

describe('Calculadora de horas', () => {
  it('horas × valor/hora', () => {
    const h = calcularHoras({ horas: 10, valorHora: 5 });
    expect(h.valor).toBe(50);
  });
  it('deriva valor/hora do salário base ÷ 173,33', () => {
    const h = calcularHoras({ horas: 173.33, salarioBase: 920, horasMes: 173.33 });
    // 920/173.33 = 5.3079... × 173.33 ≈ 920
    expect(h.valor).toBeCloseTo(920, 1);
  });
});

describe('Cálculo simplificado (salário − faltas)', () => {
  it('desconta dias a 1/30', () => {
    const s = calcularSimplificado({ salarioBase: 900, faltasDias: 3 });
    // 900/30 = 30 €/dia × 3 = 90 → 810
    expect(s.resultado).toBe(810);
  });
});

describe('Faltas injustificadas removem subsídio de alimentação', () => {
  const r = calcularReciboCompleto({
    config,
    vencimentoBase: 900,
    diasSubsidioRefeicao: 22,
    faltas: [{ tipo: TIPOS_FALTA.INJUSTIFICADA, dias: 2 }],
    duodecimoFerias: false,
    duodecimoNatal: false,
  });
  it('desconta 2/30 do vencimento', () => {
    // 900/30 = 30 × 2 = 60 desconto
    expect(r.totais.descontoFaltas).toBe(60);
  });
  it('só paga 20 dias de subsídio (22 − 2)', () => {
    // limite dinheiro 6.15 × 20 = 123
    expect(r.totais.subAlimentacao).toBe(123);
  });
});

describe('Apuramento de IVA', () => {
  it('liquidado − dedutível = saldo a entregar', () => {
    const out = apurarIVA(
      [{ base: 1000, taxa: 23 }], // 230 liquidado
      [{ base: 500, taxa: 23 }] // 115 dedutível
    );
    expect(out.ivaLiquidado).toBe(230);
    expect(out.ivaDedutivel).toBe(115);
    expect(out.aEntregar).toBe(115);
  });
});

describe('Estimativa de IRC', () => {
  it('PME 16% nos primeiros 50.000 € + 19% no excedente', () => {
    const out = estimarIRC({ rendimentos: 100000, gastos: 20000, custoPessoal: 0, configIRC: config.irc });
    // lucro 80000 → 50000*16% = 8000 + 30000*19% = 5700 → 13700
    expect(out.lucroTributavel).toBe(80000);
    expect(out.ircTotal).toBe(13700);
  });
  it('lucro negativo → IRC 0', () => {
    const out = estimarIRC({ rendimentos: 10000, gastos: 20000, custoPessoal: 5000, configIRC: config.irc });
    expect(out.ircTotal).toBe(0);
  });
});
