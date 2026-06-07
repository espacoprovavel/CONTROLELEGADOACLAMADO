import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useEmpresa } from '../contexts/EmpresaContext.jsx';
import { useConfig } from '../hooks/useConfig.js';
import { apurarIVA, ivaDaLinha, periodosDoRegime } from '../lib/calculo/iva.js';
import { eur } from '../lib/calculo/arred.js';
import { pdfIVA } from '../lib/pdf/fiscalPdf.js';
import { exportarExcel, exportarCSV } from '../lib/export.js';

export default function IVA() {
  const { empresaId, empresa } = useEmpresa();
  const { config } = useConfig();
  const [faturas, setFaturas] = useState([]);
  const [tipo, setTipo] = useState('emitida');
  const [form, setForm] = useState({ data: '', nif: '', base: '', taxa: 23, periodo: '' });
  const [periodoFiltro, setPeriodoFiltro] = useState('');

  useEffect(() => {
    if (!empresaId) return;
    return onSnapshot(collection(db, 'empresas', empresaId, 'faturas'), (snap) => {
      setFaturas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [empresaId]);

  if (!empresa || !config) return null;
  const periodos = periodosDoRegime(config.regimeIVA);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function adicionar(e) {
    e.preventDefault();
    await addDoc(collection(db, 'empresas', empresaId, 'faturas'), {
      tipo, data: form.data, nif: form.nif,
      base: Number(form.base) || 0, taxa: Number(form.taxa) || 0,
      valor: ivaDaLinha({ base: form.base, taxa: form.taxa }),
      periodo: form.periodo || periodos[0]?.id, criada_em: serverTimestamp(),
    });
    setForm({ data: '', nif: '', base: '', taxa: form.taxa, periodo: form.periodo });
  }

  const doPeriodo = periodoFiltro ? faturas.filter((f) => f.periodo === periodoFiltro) : faturas;
  const emitidas = doPeriodo.filter((f) => f.tipo === 'emitida');
  const recebidas = doPeriodo.filter((f) => f.tipo === 'recebida');
  const ap = apurarIVA(emitidas, recebidas);

  return (
    <>
      <div className="card">
        <h2>Estimador de IVA — {empresa.nome} <span className="pill warn">{config.regimeIVA === 'MENSAL' ? 'Mensal' : 'Trimestral'}</span></h2>
        <form onSubmit={adicionar}>
          <div className="grid3">
            <div>
              <label>Tipo</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="emitida">Emitida (IVA liquidado)</option>
                <option value="recebida">Recebida (IVA dedutível)</option>
              </select>
            </div>
            <div><label>Data</label><input type="date" value={form.data} onChange={(e) => set('data', e.target.value)} /></div>
            <div><label>NIF</label><input value={form.nif} onChange={(e) => set('nif', e.target.value)} /></div>
            <div><label>Base (€)</label><input type="number" value={form.base} onChange={(e) => set('base', e.target.value)} /></div>
            <div>
              <label>Taxa (%)</label>
              <select value={form.taxa} onChange={(e) => set('taxa', e.target.value)}>
                {config.iva.map((t) => <option key={t.taxa} value={t.taxa}>{t.nome} ({t.taxa}%)</option>)}
              </select>
            </div>
            <div>
              <label>Período</label>
              <select value={form.periodo} onChange={(e) => set('periodo', e.target.value)}>
                {periodos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
          </div>
          <button type="submit">Adicionar fatura</button>
        </form>
        <p className="muted" style={{ marginTop: '0.5rem' }}>Importação de PDF/Excel/Word: extrair texto e preencher à mão (sem IA) — em desenvolvimento.</p>
      </div>

      <div className="card">
        <h3>Apuramento</h3>
        <label>Filtrar por período</label>
        <select value={periodoFiltro} onChange={(e) => setPeriodoFiltro(e.target.value)} style={{ maxWidth: 320 }}>
          <option value="">Todos os períodos</option>
          {periodos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
        <div style={{ maxWidth: 460 }}>
          <div className="total-line"><span>IVA liquidado (emitidas)</span><span>{eur(ap.ivaLiquidado)}</span></div>
          <div className="total-line"><span>IVA dedutível (recebidas)</span><span>− {eur(ap.ivaDedutivel)}</span></div>
          <div className="total-line big"><span>{ap.saldo >= 0 ? 'IVA a entregar' : 'IVA a recuperar'}</span><span>{eur(ap.saldo >= 0 ? ap.aEntregar : ap.aRecuperar)}</span></div>
        </div>
        <span className="formula">{ap.formula}</span>
        <p className="muted">Prazo: {config.regimeIVA === 'MENSAL' ? config.prazos.ivaMensal : config.prazos.ivaTrimestral}</p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
          <button onClick={() => pdfIVA({ empresa, periodo: periodoFiltro || 'Todos', apuramento: ap, faturas: doPeriodo }).save(`iva-${periodoFiltro || 'total'}.pdf`)}>📄 PDF</button>
          <button className="sec" onClick={() => exportarExcel(doPeriodo.map((f) => ({ tipo: f.tipo, data: f.data, nif: f.nif, base: f.base, taxa: f.taxa, iva: f.valor, periodo: f.periodo })), `iva-${periodoFiltro || 'total'}.xlsx`)}>⬇ Excel</button>
          <button className="sec" onClick={() => exportarCSV(doPeriodo.map((f) => ({ tipo: f.tipo, data: f.data, nif: f.nif, base: f.base, taxa: f.taxa, iva: f.valor, periodo: f.periodo })), `iva-${periodoFiltro || 'total'}.csv`)}>⬇ CSV</button>
        </div>
      </div>

      <div className="card">
        <h3>Faturas ({doPeriodo.length})</h3>
        <table>
          <thead><tr><th>Tipo</th><th>Data</th><th>NIF</th><th>Base</th><th>Taxa</th><th>IVA</th><th>Período</th><th></th></tr></thead>
          <tbody>
            {doPeriodo.map((f) => (
              <tr key={f.id}>
                <td>{f.tipo === 'emitida' ? 'Emitida' : 'Recebida'}</td>
                <td>{f.data || '—'}</td><td>{f.nif || '—'}</td>
                <td>{eur(f.base)}</td><td>{f.taxa}%</td><td>{eur(f.valor)}</td><td>{f.periodo}</td>
                <td><button className="danger" onClick={() => deleteDoc(doc(db, 'empresas', empresaId, 'faturas', f.id))}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
