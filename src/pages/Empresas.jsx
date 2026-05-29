import { useState } from 'react';
import { useEmpresa } from '../contexts/EmpresaContext.jsx';

const VAZIA = { nome: '', nif: '', morada: '', codigoPostal: '', localidade: '', regimeIVA: 'TRIMESTRAL', atividade: '' };

export default function Empresas() {
  const { empresas, criarEmpresa, atualizarEmpresa, arquivarEmpresa, apagarEmpresa, selecionar } = useEmpresa();
  const [form, setForm] = useState(VAZIA);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submeter(e) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    if (editId) { await atualizarEmpresa(editId, form); setMsg('Empresa atualizada.'); }
    else { await criarEmpresa(form); setMsg('Empresa criada com a configuração de 2026.'); }
    setForm(VAZIA); setEditId(null);
  }

  function editar(emp) {
    setEditId(emp.id);
    setForm({ nome: emp.nome || '', nif: emp.nif || '', morada: emp.morada || '', codigoPostal: emp.codigoPostal || '', localidade: emp.localidade || '', regimeIVA: emp.regimeIVA || 'TRIMESTRAL', atividade: emp.atividade || '' });
  }

  async function eliminar(emp) {
    if (!confirm(`Apagar DEFINITIVAMENTE a empresa "${emp.nome}" e todos os seus dados? Esta ação é irreversível.`)) return;
    if (!confirm('Tem mesmo a certeza? Confirme novamente.')) return;
    await apagarEmpresa(emp.id);
    setMsg('Empresa apagada.');
  }

  return (
    <>
      <div className="card">
        <h2>{editId ? 'Editar empresa' : 'Nova empresa'}</h2>
        <form onSubmit={submeter}>
          <label>Nome / Designação social *</label>
          <input value={form.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Ex.: LEGADO ACLAMADO – UNIPESSOAL LDA" required />
          <div className="grid2">
            <div><label>NIF</label><input value={form.nif} onChange={(e) => set('nif', e.target.value)} /></div>
            <div>
              <label>Regime de IVA</label>
              <select value={form.regimeIVA} onChange={(e) => set('regimeIVA', e.target.value)}>
                <option value="TRIMESTRAL">Trimestral</option>
                <option value="MENSAL">Mensal</option>
              </select>
            </div>
          </div>
          <label>Morada</label>
          <input value={form.morada} onChange={(e) => set('morada', e.target.value)} />
          <div className="grid2">
            <div><label>Código postal</label><input value={form.codigoPostal} onChange={(e) => set('codigoPostal', e.target.value)} placeholder="0000-000" /></div>
            <div><label>Localidade</label><input value={form.localidade} onChange={(e) => set('localidade', e.target.value)} /></div>
          </div>
          <label>Atividade</label>
          <input value={form.atividade} onChange={(e) => set('atividade', e.target.value)} placeholder="Ex.: cedência de trabalhadores destacados" />
          {msg && <p className="ok">{msg}</p>}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
            <button type="submit">{editId ? 'Guardar alterações' : 'Criar empresa'}</button>
            {editId && <button type="button" className="sec" onClick={() => { setEditId(null); setForm(VAZIA); }}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Empresas ({empresas.length})</h2>
        {empresas.length === 0 && <p className="muted">Ainda não há empresas. Crie a primeira acima.</p>}
        {empresas.length > 0 && (
          <table>
            <thead><tr><th>Nome</th><th>NIF</th><th>IVA</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {empresas.map((e) => (
                <tr key={e.id}>
                  <td><strong>{e.nome}</strong><br /><span className="muted">{e.atividade}</span></td>
                  <td>{e.nif || '—'}</td>
                  <td>{e.regimeIVA === 'MENSAL' ? 'Mensal' : 'Trimestral'}</td>
                  <td>{e.arquivada ? <span className="pill warn">Arquivada</span> : 'Ativa'}</td>
                  <td style={{ whiteSpace: 'nowrap', display: 'flex', gap: '0.3rem' }}>
                    <button className="sec" onClick={() => selecionar(e.id)}>Selecionar</button>
                    <button className="sec" onClick={() => editar(e)}>Editar</button>
                    <button className="sec" onClick={() => arquivarEmpresa(e.id, !e.arquivada)}>{e.arquivada ? 'Reativar' : 'Arquivar'}</button>
                    <button className="danger" onClick={() => eliminar(e)}>Apagar</button>
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
