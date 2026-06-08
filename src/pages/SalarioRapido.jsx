import { useState } from 'react';
import { calcularSalarioRapido } from '../lib/calculo/salario.js';
import { eur } from '../lib/calculo/arred.js';
import { useConfig } from '../hooks/useConfig.js';
import { useEmpresa } from '../contexts/EmpresaContext.jsx';

// Página simples de cálculo rápido do salário a receber.
// Campos: salário, horas extra, vale alimentação, dias úteis e faltas.
export default function SalarioRapido() {
  const { config } = useConfig();
  const { empresa } = useEmpresa();
  const [f, setF] = useState({ salario: '', horasExtra: '', valeAlimentacao: '', diasUteis: '22', faltas: '' });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const diasUteisPadrao = config?.diasUteisMes || 22;
  const r = calcularSalarioRapido({
    salario: Number(f.salario) || 0,
    horasExtra: Number(f.horasExtra) || 0,
    valeAlimentacao: Number(f.valeAlimentacao) || 0,
    diasUteis: Number(f.diasUteis) || diasUteisPadrao,
    faltas: Number(f.faltas) || 0,
  });

  return (
    <>
      <div className="card">
        <h2>Salário rápido{empresa ? ` — ${empresa.nome}` : ''}</h2>
        <p className="muted">Cálculo simples, sem impostos. Preenche os campos e o valor aparece logo abaixo.</p>
        <div className="grid2">
          <div><label>Salário (€)</label><input type="number" inputMode="decimal" value={f.salario} onChange={(e) => set('salario', e.target.value)} placeholder="Ex.: 920" /></div>
          <div><label>Horas extra</label><input type="number" inputMode="decimal" value={f.horasExtra} onChange={(e) => set('horasExtra', e.target.value)} placeholder="Ex.: 4" /></div>
          <div><label>Vale alimentação (€)</label><input type="number" inputMode="decimal" value={f.valeAlimentacao} onChange={(e) => set('valeAlimentacao', e.target.value)} placeholder="Ex.: 120" /></div>
          <div><label>Dias úteis do mês</label><input type="number" inputMode="numeric" value={f.diasUteis} onChange={(e) => set('diasUteis', e.target.value)} placeholder={String(diasUteisPadrao)} /></div>
          <div><label>Faltas (dias)</label><input type="number" inputMode="numeric" value={f.faltas} onChange={(e) => set('faltas', e.target.value)} placeholder="Ex.: 2" /></div>
        </div>
      </div>

      <div className="card">
        <h3>Resultado</h3>
        <div style={{ maxWidth: 460 }}>
          <div className="total-line"><span>Salário</span><span>{eur(r.base)}</span></div>
          <div className="total-line"><span>Horas extra ({f.horasExtra || 0} h)</span><span>+ {eur(r.pagoHorasExtra)}</span></div>
          <div className="total-line"><span>Vale alimentação</span><span>+ {eur(r.valeAlimentacao)}</span></div>
          <div className="total-line"><span>Faltas ({f.faltas || 0} dia(s))</span><span>− {eur(r.descontoFaltas)}</span></div>
          <div className="total-line big"><span>Salário a receber</span><span>{eur(r.aReceber)}</span></div>
        </div>
        <h3>Como foi calculado</h3>
        <span className="formula">Valor/dia: {r.formulas.valorDia}</span>
        <span className="formula">Valor/hora: {r.formulas.valorHora}</span>
        <span className="formula">Faltas: {r.formulas.descontoFaltas}</span>
        <span className="formula">Horas extra: {r.formulas.pagoHorasExtra}</span>
        <span className="formula">Total: {r.formulas.aReceber}</span>
      </div>
    </>
  );
}
