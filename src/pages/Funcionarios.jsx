import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useEmpresa } from '../contexts/EmpresaContext.jsx';
import { PAISES_DESTACAMENTO } from '../lib/configDefaults.js';

const VAZIO = { nome: '', nif: '', niss: '', categoria: '', salarioBase: '', tipoContrato: 'Sem termo', paisDestacamento: 'Portugal', a1Estado: '', a1Validade: '', ativo: true };

export default function Funcionarios() {
  const { empresaId, empresa } = useEmpresa();
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (!empresaId) { setLista([]); return; }
    return onSnapshot(collection(db, 'empresas', empresaId, 'funcionarios'), (snap) => {
      setLista(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.nome || '').localeCompare(b.nome || '')));
    });
  }, [empresaId]);

  if (!empresa) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submeter(e) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    const dados = { ...form, salarioBase: Number(form.salarioBase) || 0 };
    if (editId) await updateDoc(doc(db, 'empresas', empresaId, 'funcionarios', editId), dados);
    else await addDoc(collection(db, 'empresas', empresaId, 'funcionarios'), { ...dados, criado_em: serverTimestamp() });
    setForm(VAZIO); setEditId(null);
  }

  async function eliminar(fn) {
    if (!confirm(`Apagar definitivamente "${fn.nome}" e os seus dados (RGPD)?`)) return;
    await deleteDoc(doc(db, 'empresas', empresaId, 'funcionarios', fn.id));
  }

  return (
    <>
      <div className="card">
        <h2>{editId ? 'Editar funcionário' : 'Novo funcionário'} — {empresa.nome}</h2>
        <form onSubmit={submeter}>
          <div className="grid3">
            <div><label>Nome *</label><input value={form.nome} onChange={(e) => set('nome', e.target.value)} required /></div>
            <div><label>NIF</label><input value={form.nif} onChange={(e) => set('nif', e.target.value)} /></div>
            <div><label>NISS</label><input value={form.niss} onChange={(e) => set('niss', e.target.value)} /></div>
            <div><label>Categoria</label><input value={form.categoria} onChange={(e) => set('categoria', e.target.value)} /></div>
            <div><label>Salário base (€)</label><input type="number" value={form.salarioBase} onChange={(e) => set('salarioBase', e.target.value)} /></div>
            <div>
              <label>Tipo de contrato</label>
              <select value={form.tipoContrato} onChange={(e) => set('tipoContrato', e.target.value)}>
                <option>Sem termo</option><option>A termo certo</option><option>A termo incerto</option>
              </select>
            </div>
            <div>
              <label>País de destacamento</label>
              <select value={form.paisDestacamento} onChange={(e) => set('paisDestacamento', e.target.value)}>
                {PAISES_DESTACAMENTO.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label>Estado A1</label>
              <select value={form.a1Estado} onChange={(e) => set('a1Estado', e.target.value)}>
                <option value="">—</option><option>Pedido</option><option>Emitido</option>
              </select>
            </div>
            <div><label>Validade A1</label><input type="date" value={form.a1Validade} onChange={(e) => set('a1Validade', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit">{editId ? 'Guardar' : 'Adicionar'}</button>
            {editId && <button type="button" className="sec" onClick={() => { setEditId(null); setForm(VAZIO); }}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Funcionários ({lista.length})</h2>
        {lista.length === 0 ? <p className="muted">Sem funcionários nesta empresa.</p> : (
          <table>
            <thead><tr><th>Nome</th><th>NIF</th><th>Categoria</th><th>Base</th><th>Destacamento</th><th>A1</th><th></th></tr></thead>
            <tbody>
              {lista.map((fn) => (
                <tr key={fn.id}>
                  <td><strong>{fn.nome}</strong></td>
                  <td>{fn.nif || '—'}</td>
                  <td>{fn.categoria || '—'}</td>
                  <td>{fn.salarioBase ? `${fn.salarioBase} €` : '—'}</td>
                  <td>{fn.paisDestacamento}</td>
                  <td>{fn.a1Estado || '—'}{fn.a1Validade ? ` · ${fn.a1Validade}` : ''}</td>
                  <td style={{ display: 'flex', gap: '0.3rem' }}>
                    <button className="sec" onClick={() => { setEditId(fn.id); setForm({ ...VAZIO, ...fn }); }}>Editar</button>
                    <button className="danger" onClick={() => eliminar(fn)}>Apagar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
