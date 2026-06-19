import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import { calcularReciboPorLinhas, linhasReciboPadrao } from '../lib/calculo/salario.js';
import { eur } from '../lib/calculo/arred.js';
import { useConfig } from '../hooks/useConfig.js';
import { useEmpresa } from '../contexts/EmpresaContext.jsx';
import { SITUACOES_FAMILIARES } from '../lib/configDefaults.js';
import { pdfReciboPT } from '../lib/pdf/reciboPdf.js';

// Recibo de Portugal totalmente editável (modelo do recibo real).
export default function ReciboPT() {
  const { config } = useConfig();
  const { empresa, empresaId } = useEmpresa();
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcId, setFuncId] = useState('');
  const [periodo, setPeriodo] = useState(() => new Date().toISOString().slice(0, 7));
  const [situacaoFamiliar, setSituacao] = useState('solteiro');
  const [dependentes, setDependentes] = useState('0');
  const [linhas, setLinhas] = useState(() => linhasReciboPadrao(920));
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!empresaId) return;
    return onSnapshot(collection(db, 'empresas', empresaId, 'funcionarios'), (s) =>
      setFuncionarios(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
  }, [empresaId]);

  if (!config) return <div className="card"><p className="muted">A carregar configuração…</p></div>;

  const funcionario = funcionarios.find((x) => x.id === funcId) || null;
  const setLinha = (i, k, v) => setLinhas((ls) => ls.map((l, j) => (j === i ? { ...l, [k]: v } : l)));
  const addLinha = () => setLinhas((ls) => [...ls, { codigo: '', descricao: '', valor: 0, incideSS: true, incideIRS: true }]);
  const remLinha = (i) => setLinhas((ls) => ls.filter((_, j) => j !== i));

  function escolherFunc(id) {
    setFuncId(id);
    const fn = funcionarios.find((x) => x.id === id);
    if (fn?.salarioBase) setLinhas(linhasReciboPadrao(Number(fn.salarioBase)));
  }

  const r = calcularReciboPorLinhas({ config, linhas, situacaoFamiliar, dependentes: Number(dependentes) || 0 });
  const ctxPdf = { empresa, periodo, funcionario, recibo: r };

  async function gravar() {
    if (!empresaId) return;
    await addDoc(collection(db, 'empresas', empresaId, 'recibos'), {
      periodo, funcionarioId: funcId || null, funcionarioNome: funcionario?.nome || null,
      linhas, custoEmpresa: r.custoEmpresa, liquido: r.liquido, baseSS: r.baseSS,
      descontoSS: r.descontoSS, irs: r.irs, origem: 'recibo-pt', criado_em: serverTimestamp(),
    });
    setMsg('Recibo gravado no histórico (conta para o IRC).');
    setTimeout(() => setMsg(''), 4000);
  }

  return (
    <>
      <div className="card">
        <h2>Recibo (Portugal) — totalmente editável{empresa ? ` · ${empresa.nome}` : ''}</h2>
        <p className="muted">Reproduz o modelo do recibo real. Edita, acrescenta ou remove linhas. O cálculo usa as taxas de Portugal (SS {config.ss.taxaTrabalhador}% / entidade {config.ss.taxaEntidade}%, IRS pela tabela).</p>
        <div className="grid3">
          <div>
            <label>Funcionário (opcional)</label>
            <select value={funcId} onChange={(e) => escolherFunc(e.target.value)}>
              <option value="">— manual —</option>
              {funcionarios.map((fn) => <option key={fn.id} value={fn.id}>{fn.nome}</option>)}
            </select>
          </div>
          <div><label>Período (mês)</label><input type="month" value={periodo} onChange={(e) => setPeriodo(e.target.value)} /></div>
          <div>
            <label>Situação familiar</label>
            <select value={situacaoFamiliar} onChange={(e) => setSituacao(e.target.value)}>
              {SITUACOES_FAMILIARES.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
          </div>
          <div><label>Dependentes</label><input type="number" value={dependentes} onChange={(e) => setDependentes(e.target.value)} /></div>
        </div>
      </div>

      <div className="card">
        <h3>Remunerações (rubricas editáveis)</h3>
        <table>
          <thead><tr><th style={{ width: 70 }}>Cód.</th><th>Descrição</th><th style={{ width: 120 }}>Valor (€)</th><th style={{ width: 60 }}>SS</th><th style={{ width: 60 }}>IRS</th><th></th></tr></thead>
          <tbody>
            {linhas.map((l, i) => (
              <tr key={i}>
                <td><input value={l.codigo} onChange={(e) => setLinha(i, 'codigo', e.target.value)} style={{ margin: 0 }} /></td>
                <td><input value={l.descricao} onChange={(e) => setLinha(i, 'descricao', e.target.value)} style={{ margin: 0 }} /></td>
                <td><input type="number" value={l.valor} onChange={(e) => setLinha(i, 'valor', e.target.value)} style={{ margin: 0 }} /></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" checked={l.incideSS} onChange={(e) => setLinha(i, 'incideSS', e.target.checked)} style={{ width: 'auto', margin: 0 }} /></td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" checked={l.incideIRS} onChange={(e) => setLinha(i, 'incideIRS', e.target.checked)} style={{ width: 'auto', margin: 0 }} /></td>
                <td><button className="danger" onClick={() => remLinha(i)}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="sec" onClick={addLinha}>+ Adicionar linha</button>
        <p className="muted" style={{ marginTop: '0.5rem' }}>Marca <strong>SS</strong> nas rubricas que entram na base de Segurança Social e <strong>IRS</strong> nas que são tributadas. As ajudas de custo e o subsídio de alimentação ficam normalmente sem marca (isentos).</p>
      </div>

      <div className="card">
        <h3>Resultado</h3>
        <div style={{ maxWidth: 480 }}>
          <div className="total-line"><span>Total de remunerações</span><span>{eur(r.totalRem)}</span></div>
          <div className="total-line"><span>Base de Segurança Social</span><span>{eur(r.baseSS)}</span></div>
          <div className="total-line"><span>Desconto SS ({r.taxaSS}%)</span><span>− {eur(r.descontoSS)}</span></div>
          <div className="total-line"><span>Base de IRS</span><span>{eur(r.baseIRS)}</span></div>
          <div className="total-line"><span>Retenção IRS{r.irsTaxa ? ` (${r.irsTaxa}%)` : ''}</span><span>− {eur(r.irs)}</span></div>
          <div className="total-line big"><span>Líquido a receber</span><span>{eur(r.liquido)}</span></div>
          <div className="total-line"><span>SS entidade ({r.taxaSSEnt}%)</span><span>{eur(r.ssEntidade)}</span></div>
          <div className="total-line big"><span>Custo total p/ empresa</span><span>{eur(r.custoEmpresa)}</span></div>
        </div>
        {r.irsAviso && <p className="erro" style={{ marginTop: '0.6rem' }}>⚠️ {r.irsAviso}</p>}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <button onClick={() => pdfReciboPT(ctxPdf).save(`recibo-${periodo}.pdf`)}>📄 PDF do recibo</button>
          <button className="sec" onClick={gravar}>💾 Gravar no histórico</button>
        </div>
        {msg && <p className="ok">{msg}</p>}
      </div>
    </>
  );
}
