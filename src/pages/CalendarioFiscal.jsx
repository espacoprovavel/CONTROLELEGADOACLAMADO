import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useEmpresa } from '../contexts/EmpresaContext.jsx';

export default function CalendarioFiscal() {
  const { empresaId, empresa } = useEmpresa();
  const [eventos, setEventos] = useState([]);
  const [form, setForm] = useState({ titulo: '', data: '', tipo: 'IVA' });

  useEffect(() => {
    if (!empresaId) return;
    return onSnapshot(collection(db, 'empresas', empresaId, 'calendario'), (snap) => {
      setEventos(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.data || '').localeCompare(b.data || '')));
    });
  }, [empresaId]);

  if (!empresa) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const hoje = new Date().toISOString().slice(0, 10);

  async function adicionar(e) {
    e.preventDefault();
    if (!form.titulo || !form.data) return;
    await addDoc(collection(db, 'empresas', empresaId, 'calendario'), { ...form, criado_em: serverTimestamp() });
    setForm({ titulo: '', data: '', tipo: form.tipo });
  }

  return (
    <>
      <div className="card">
        <h2>Calendário fiscal — {empresa.nome}</h2>
        <form onSubmit={adicionar}>
          <div className="grid3">
            <div><label>Obrigação</label><input value={form.titulo} onChange={(e) => set('titulo', e.target.value)} placeholder="Ex.: Declaração periódica IVA" /></div>
            <div><label>Data limite</label><input type="date" value={form.data} onChange={(e) => set('data', e.target.value)} /></div>
            <div>
              <label>Tipo</label>
              <select value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
                <option>IVA</option><option>IRC</option><option>Segurança Social</option><option>Outro</option>
              </select>
            </div>
          </div>
          <button type="submit">Adicionar prazo</button>
        </form>
      </div>

      <div className="card">
        <h3>Próximas obrigações</h3>
        {eventos.length === 0 ? <p className="muted">Sem prazos. Adicione acima.</p> : (
          <table>
            <thead><tr><th>Data</th><th>Tipo</th><th>Obrigação</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {eventos.map((ev) => {
                const dias = Math.ceil((new Date(ev.data) - new Date(hoje)) / 86400000);
                return (
                  <tr key={ev.id}>
                    <td>{ev.data}</td><td>{ev.tipo}</td><td>{ev.titulo}</td>
                    <td>{dias < 0 ? <span className="pill warn">passou</span> : dias <= 7 ? <span className="pill warn">{dias} dias</span> : `${dias} dias`}</td>
                    <td><button className="danger" onClick={() => deleteDoc(doc(db, 'empresas', empresaId, 'calendario', ev.id))}>×</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
