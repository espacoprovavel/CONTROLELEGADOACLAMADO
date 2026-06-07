/* ============================================================
   Teste de regressão — recibos reais de Abril/2026
   Valida o modelo de cálculo "como o contabilista" (cód 1/20/21/30/38/40,
   SS 11%) contra os 9 recibos reais da empresa.

   Espelha as funções puras de index.html (calcContabilista). Se alterar a
   fórmula em index.html, actualize também este espelho.

   Correr:  node tests/recibos_abril2026.test.js
   ============================================================ */
'use strict';

function num(v, def) { const n = parseFloat(v); return isNaN(n) ? (def == null ? 0 : def) : n; }
function valorHoraRef(sb, cfg) { const hm = num(cfg && cfg.horas_mes, 173.33); return hm > 0 ? sb / hm : 0; }

// Espelho de calcContabilista (index.html)
function calcContabilista(inp, cfg) {
  const txSSt = num(cfg.ss_trabalhador, 11);
  const txSSe = num(cfg.ss_entidade, 23.75);
  const faltaDias = num(inp.faltaDias, 0);
  // Cód 1 — vencimento proporcional por 1/30 (mês completo = base exacta)
  const vencimento = faltaDias > 0 ? inp.salarioBase - (inp.salarioBase / 30) * faltaDias : inp.salarioBase;
  const totalSub = inp.subValor * inp.diasSub;             // Cód 30 (isento)
  const subFerias = inp.duodecimoFerias ? inp.salarioBase / 12 : 0;  // Cód 20
  const subNatal = inp.duodecimoNatal ? inp.salarioBase / 12 : 0;    // Cód 21
  // Base SS = vencimento + subs. férias/Natal (NÃO ajudas de custo nem alimentação)
  const baseSS = vencimento + subFerias + subNatal;
  const ssTrab = baseSS * txSSt / 100;
  const ssEnt = baseSS * txSSe / 100;
  // Cód 38/40 ajudas de custo: isentas IRS+SS, somam ao líquido, fora da base
  const iliquido = vencimento + totalSub + inp.ajudasCusto + inp.ajudasCustoEstr + subFerias + subNatal;
  const irs = 0; // tabela de IRS não carregada → não assumido (como nos recibos: retenção 0,00)
  const liquido = iliquido - ssTrab - irs;
  const custoEmpresa = iliquido + ssEnt;
  return { vencimento, baseSS, ssTrab, ssEnt, iliquido, liquido, custoEmpresa };
}

const cfg = { ss_trabalhador: 11, ss_entidade: 23.75, sub_refeicao_dinheiro: 6.15, horas_mes: 173.33 };
const r2 = x => Math.round(x * 100) / 100;

// Recibos reais (todos: base 920, sub 6,15/dia dinheiro, duodécimos férias+Natal)
const recibos = [
  { nome: 'Michelle Monique',  faltaDias: 0, diasSub: 22, ajE: 0,        exp: { baseSS: 1073.34, ssTrab: 118.07, iliquido: 1208.64, liquido: 1090.57 } },
  { nome: 'Lorenzo Jardim',    faltaDias: 0, diasSub: 22, ajE: 0,        exp: { baseSS: 1073.34, ssTrab: 118.07, iliquido: 1208.64, liquido: 1090.57 } },
  { nome: 'Raphaela Oliveira', faltaDias: 0, diasSub: 22, ajE: 1259.43,  exp: { baseSS: 1073.34, ssTrab: 118.07, iliquido: 2468.07, liquido: 2350.00 } },
  { nome: 'Douglas Gonçalves', faltaDias: 0, diasSub: 22, ajE: 1459.43,  exp: { baseSS: 1073.34, ssTrab: 118.07, iliquido: 2668.07, liquido: 2550.00 } },
  { nome: 'Mariel Fonseca',    faltaDias: 2, diasSub: 20, ajE: 1405.71,  exp: { baseSS: 1012.01, ssTrab: 111.32, iliquido: 2540.72, liquido: 2429.40 } },
  { nome: 'Carlos Roberto',    faltaDias: 7, diasSub: 15, ajE: 743.53,   exp: { baseSS: 858.67,  ssTrab: 94.45,  iliquido: 1694.45, liquido: 1600.00 } },
  { nome: 'Agnaldo Pereira',   faltaDias: 2, diasSub: 20, ajE: 1271.77,  exp: { baseSS: 1012.01, ssTrab: 111.32, iliquido: 2406.78, liquido: 2295.46 } },
  { nome: 'Renato Assunção',   faltaDias: 0, diasSub: 22, ajE: 1959.43,  exp: { baseSS: 1073.34, ssTrab: 118.07, iliquido: 3168.07, liquido: 3050.00 } },
  { nome: 'Jilmara Souza',     faltaDias: 2, diasSub: 20, ajE: 0,        exp: { baseSS: 1012.01, ssTrab: 111.32, iliquido: 1135.01, liquido: 1023.69 } }
];

let pass = 0, fail = 0;
recibos.forEach(rc => {
  const inp = {
    salarioBase: 920, faltaDias: rc.faltaDias, valorHora: 5.31,
    subValor: 6.15, diasSub: rc.diasSub, subModo: 'dinheiro',
    ajudasCusto: 0, ajudasCustoEstr: rc.ajE,
    duodecimoFerias: true, duodecimoNatal: true, subsidiosNoIRS: false,
    situacao: 'nao_casado', dependentes: 0
  };
  const o = calcContabilista(inp, cfg);
  const checks = [
    ['baseSS', r2(o.baseSS), rc.exp.baseSS],
    ['ssTrab', r2(o.ssTrab), rc.exp.ssTrab],
    ['iliquido', r2(o.iliquido), rc.exp.iliquido],
    ['liquido', r2(o.liquido), rc.exp.liquido]
  ];
  const bad = checks.filter(([, got, exp]) => Math.abs(got - exp) > 0.02);
  if (bad.length === 0) { pass++; console.log(`PASS  ${rc.nome}`); }
  else { fail++; console.log(`FAIL  ${rc.nome}: ` + bad.map(([k, g, e]) => `${k} ${g}≠${e}`).join(', ')); }
});

console.log(`\n${pass}/${recibos.length} recibos reais de Abril/2026 reconciliados.`);
if (fail > 0) { process.exitCode = 1; }
