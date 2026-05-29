import { useState } from 'react';
import { useEmpresa } from '../contexts/EmpresaContext.jsx';
import { useConfig } from '../hooks/useConfig.js';
import { arred, eur } from '../lib/calculo/arred.js';

export default function ProFormas() {
  const { empresa } = useEmpresa();
  const { config } = useConfig();
  const [cliente, setCliente] = useState('');
  const [linhas, setLinhas] = useState([{ descricao: '', qtd: 1, preco: 0, taxa: 23 }]);

  if (!empresa || !config) return null;
  const set = (i, k, v) => setLinhas((ls) => ls.map((l, j) => (j === i ? { ...l, [k]: v } : l)));
  const add = () => setLinhas((ls) => [...ls, { descricao: '', qtd: 1, preco: 0, taxa: 23 }]);
  const rem = (i) => setLinhas((ls) => ls.filter((_, j) => j !== i));

  let baseTotal = 0, ivaTotal = 0;
  const calc = linhas.map((l) => {
    const b = arred((Number(l.qtd) || 0) * (Number(l.preco) || 0));
    const iva = arred(b * ((Number(l.taxa) || 0) / 100));
    baseTotal += b; ivaTotal += iva;
    return { ...l, base: b, iva };
  });
  baseTotal = arred(baseTotal); ivaTotal = arred(ivaTotal);

  return (
    <div className="card">
      <h2>Pró-forma / Orçamento interno</h2>
      <div className="pill warn" style={{ marginBottom: '0.8rem' }}>DOCUMENTO SEM VALOR FISCAL — NÃO É FATURA CERTIFICADA</div>
      <p className="muted">{empresa.nome}{empresa.nif ? ` · NIF ${empresa.nif}` : ''}</p>

      <label>Cliente</label>
      <input value={cliente} onChange={(e) => setCliente(e.target.value)} />

      <table>
        <thead><tr><th>Descrição</th><th>Qtd</th><th>Preço</th><th>Taxa</th><th>Base</th><th>IVA</th><th></th></tr></thead>
        <tbody>
          {calc.map((l, i) => (
            <tr key={i}>
              <td><input value={l.descricao} onChange={(e) => set(i, 'descricao', e.target.value)} style={{ margin: 0 }} /></td>
              <td><input type="number" value={l.qtd} onChange={(e) => set(i, 'qtd', e.target.value)} style={{ margin: 0, width: 70 }} /></td>
              <td><input type="number" value={l.preco} onChange={(e) => set(i, 'preco', e.target.value)} style={{ margin: 0, width: 90 }} /></td>
              <td>
                <select value={l.taxa} onChange={(e) => set(i, 'taxa', e.target.value)} style={{ margin: 0, width: 90 }}>
                  {config.iva.map((t) => <option key={t.taxa} value={t.taxa}>{t.taxa}%</option>)}
                </select>
              </td>
              <td>{eur(l.base)}</td><td>{eur(l.iva)}</td>
              <td><button className="danger" onClick={() => rem(i)}>×</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="sec" onClick={add}>+ Linha</button>

      <div style={{ maxWidth: 360, marginLeft: 'auto', marginTop: '1rem' }}>
        <div className="total-line"><span>Base tributável</span><span>{eur(baseTotal)}</span></div>
        <div className="total-line"><span>IVA</span><span>{eur(ivaTotal)}</span></div>
        <div className="total-line big"><span>Total</span><span>{eur(baseTotal + ivaTotal)}</span></div>
      </div>
      <p className="muted" style={{ marginTop: '0.8rem' }}>Sem numeração legal nem ATCUD. Geração de PDF — em desenvolvimento.</p>
    </div>
  );
}
