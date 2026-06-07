import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import { calcularHoras, calcularSimplificado, calcularReciboCompleto, TIPOS_FALTA } from '../lib/calculo/salario.js';
import { eur } from '../lib/calculo/arred.js';
import { useConfig } from '../hooks/useConfig.js';
import { useEmpresa } from '../contexts/EmpresaContext.jsx';
import { SITUACOES_FAMILIARES } from '../lib/configDefaults.js';
import { pdfReciboCompleto, pdfReciboSimples } from '../lib/pdf/reciboPdf.js';

export default function CalculoSalario() {
  const { config } = useConfig();
  const [aba, setAba] = useState('completo');
  if (!config) return <div className="card"><p className="muted">A carregar configuração da empresa…</p></div>;

  return (
    <>
      <div className="card">
        <h2>Cálculo salarial</h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <Tab id="horas" aba={aba} setAba={setAba}>1 · Calculadora de horas</Tab>
          <Tab id="simples" aba={aba} setAba={setAba}>2 · Simplificado (salário − faltas)</Tab>
          <Tab id="completo" aba={aba} setAba={setAba}>3 · Completo (como o contabilista)</Tab>
        </div>
      </div>
      {aba === 'horas' && <Horas config={config} />}
      {aba === 'simples' && <Simples config={config} />}
      {aba === 'completo' && <Completo config={config} />}
    </>
  );
}

function Tab({ id, aba, setAba, children }) {
  return <button className={aba === id ? '' : 'sec'} onClick={() => setAba(id)}>{children}</button>;
}

function Horas({ config }) {
  const [horas, setHoras] = useState('');
  const [valorHora, setValorHora] = useState('');
  const [base, setBase] = useState('');
  const r = calcularHoras({ horas: Number(horas) || 0, valorHora: valorHora || undefined, salarioBase: Number(base) || undefined, horasMes: config.horasMes });
  return (
    <div className="card">
      <h3>1 · Calculadora de horas</h3>
      <div className="grid3">
        <div><label>Horas trabalhadas</label><input type="number" value={horas} onChange={(e) => setHoras(e.target.value)} /></div>
        <div><label>Valor/hora (€)</label><input type="number" value={valorHora} onChange={(e) => setValorHora(e.target.value)} placeholder="ou usar salário base →" /></div>
        <div><label>Salário base (€) — opcional</label><input type="number" value={base} onChange={(e) => setBase(e.target.value)} /></div>
      </div>
      <span className="formula">Valor/hora: {r.formulaValorHora}</span>
      <span className="formula">{r.formula}</span>
      <div className="total-line big"><span>Valor das horas</span><span>{eur(r.valor)}</span></div>
    </div>
  );
}

function Simples({ config }) {
  const [base, setBase] = useState('');
  const [dias, setDias] = useState('');
  const [horas, setHoras] = useState('');
  const r = calcularSimplificado({ salarioBase: Number(base) || 0, faltasDias: Number(dias) || 0, faltasHoras: Number(horas) || 0, horasMes: config.horasMes });
  return (
    <div className="card">
      <h3>2 · Cálculo simplificado (salário − faltas)</h3>
      <div className="grid3">
        <div><label>Salário base (€)</label><input type="number" value={base} onChange={(e) => setBase(e.target.value)} /></div>
        <div><label>Faltas (dias)</label><input type="number" value={dias} onChange={(e) => setDias(e.target.value)} /></div>
        <div><label>Faltas (horas)</label><input type="number" value={horas} onChange={(e) => setHoras(e.target.value)} /></div>
      </div>
      <span className="formula">{r.formula}</span>
      <div className="total-line"><span>Base</span><span>{eur(r.base)}</span></div>
      <div className="total-line"><span>Total descontado</span><span>− {eur(r.totalDescontado)}</span></div>
      <div className="total-line big"><span>Valor resultante</span><span>{eur(r.resultado)}</span></div>
      <p className="muted">Sem impostos. Para conferência rápida.</p>
    </div>
  );
}

function Completo({ config }) {
  const { empresaId, empresa } = useEmpresa();
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcId, setFuncId] = useState('');
  const [periodo, setPeriodo] = useState(() => new Date().toISOString().slice(0, 7));
  const [msg, setMsg] = useState('');
  const [f, setF] = useState({
    vencimentoBase: '920', horasTrabalhadas: '', diasAdmissao: '',
    diasSubsidioRefeicao: '', subsidioRefeicaoCartao: false,
    ajudasCusto: '', ajudasCustoEstrangeiro: '',
    duodecimoFerias: true, duodecimoNatal: true,
    situacaoFamiliar: 'solteiro', dependentes: '0',
    faltaInjust: '', faltaJust: '',
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!empresaId) return;
    return onSnapshot(collection(db, 'empresas', empresaId, 'funcionarios'), (s) =>
      setFuncionarios(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
  }, [empresaId]);

  const funcionario = funcionarios.find((x) => x.id === funcId) || null;
  // Preencher o vencimento base a partir do funcionário escolhido
  function escolherFunc(id) {
    setFuncId(id);
    const fn = funcionarios.find((x) => x.id === id);
    if (fn?.salarioBase) set('vencimentoBase', String(fn.salarioBase));
  }

  const faltas = [];
  if (Number(f.faltaInjust) > 0) faltas.push({ tipo: TIPOS_FALTA.INJUSTIFICADA, dias: Number(f.faltaInjust) });
  if (Number(f.faltaJust) > 0) faltas.push({ tipo: TIPOS_FALTA.JUSTIFICADA, dias: Number(f.faltaJust), remunerada: false });

  const r = calcularReciboCompleto({
    config,
    vencimentoBase: Number(f.vencimentoBase) || 0,
    horasTrabalhadas: f.horasTrabalhadas || undefined,
    diasAdmissao: f.diasAdmissao || undefined,
    diasSubsidioRefeicao: Number(f.diasSubsidioRefeicao) || 0,
    subsidioRefeicaoCartao: f.subsidioRefeicaoCartao,
    ajudasCusto: Number(f.ajudasCusto) || 0,
    ajudasCustoEstrangeiro: Number(f.ajudasCustoEstrangeiro) || 0,
    duodecimoFerias: f.duodecimoFerias,
    duodecimoNatal: f.duodecimoNatal,
    faltas,
    situacaoFamiliar: f.situacaoFamiliar,
    dependentes: Number(f.dependentes) || 0,
  });

  async function gravarRecibo() {
    if (!empresaId) return;
    await addDoc(collection(db, 'empresas', empresaId, 'recibos'), {
      periodo,
      funcionarioId: funcId || null,
      funcionarioNome: funcionario?.nome || null,
      entradas: { ...f },
      custoEmpresa: r.totais.custoEmpresa,
      liquido: r.totais.liquido,
      baseSS: r.totais.baseSS,
      descontoSS: r.totais.descontoSS,
      irs: r.totais.irs,
      criado_em: serverTimestamp(),
    });
    setMsg('Recibo gravado no histórico. O custo de pessoal já conta para o IRC.');
    setTimeout(() => setMsg(''), 4000);
  }

  const ctxPdf = { empresa, periodo, funcionario, recibo: r };

  return (
    <>
      <div className="card">
        <h3>3 · Cálculo completo "como o contabilista"</h3>
        <div className="grid3">
          <div>
            <label>Funcionário (opcional)</label>
            <select value={funcId} onChange={(e) => escolherFunc(e.target.value)}>
              <option value="">— manual —</option>
              {funcionarios.map((fn) => <option key={fn.id} value={fn.id}>{fn.nome}</option>)}
            </select>
          </div>
          <div><label>Período (mês)</label><input type="month" value={periodo} onChange={(e) => setPeriodo(e.target.value)} /></div>
          <div />
        </div>
        <div className="grid3">
          <div><label>Vencimento base (€)</label><input type="number" value={f.vencimentoBase} onChange={(e) => set('vencimentoBase', e.target.value)} /></div>
          <div><label>Horas trabalhadas (opcional)</label><input type="number" value={f.horasTrabalhadas} onChange={(e) => set('horasTrabalhadas', e.target.value)} placeholder="vazio = mês completo" /></div>
          <div><label>Dias trabalhados (admissão)</label><input type="number" value={f.diasAdmissao} onChange={(e) => set('diasAdmissao', e.target.value)} placeholder="entrou a meio do mês" /></div>
          <div><label>Dias subs. alimentação</label><input type="number" value={f.diasSubsidioRefeicao} onChange={(e) => set('diasSubsidioRefeicao', e.target.value)} /></div>
          <div><label>Ajudas de custo (€)</label><input type="number" value={f.ajudasCusto} onChange={(e) => set('ajudasCusto', e.target.value)} /></div>
          <div><label>Ajudas custo estrangeiro (€)</label><input type="number" value={f.ajudasCustoEstrangeiro} onChange={(e) => set('ajudasCustoEstrangeiro', e.target.value)} /></div>
          <div><label>Faltas injustificadas (dias)</label><input type="number" value={f.faltaInjust} onChange={(e) => set('faltaInjust', e.target.value)} /></div>
          <div><label>Faltas justif. não remun. (dias)</label><input type="number" value={f.faltaJust} onChange={(e) => set('faltaJust', e.target.value)} /></div>
          <div>
            <label>Situação familiar</label>
            <select value={f.situacaoFamiliar} onChange={(e) => set('situacaoFamiliar', e.target.value)}>
              {SITUACOES_FAMILIARES.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
          </div>
          <div><label>Dependentes</label><input type="number" value={f.dependentes} onChange={(e) => set('dependentes', e.target.value)} /></div>
        </div>
        <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
          <label style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}><input type="checkbox" style={{ width: 'auto', margin: 0 }} checked={f.subsidioRefeicaoCartao} onChange={(e) => set('subsidioRefeicaoCartao', e.target.checked)} /> Subsídio em cartão (limite {config.subsidioRefeicao.cartao} €)</label>
          <label style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}><input type="checkbox" style={{ width: 'auto', margin: 0 }} checked={f.duodecimoFerias} onChange={(e) => set('duodecimoFerias', e.target.checked)} /> Duodécimo de férias</label>
          <label style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}><input type="checkbox" style={{ width: 'auto', margin: 0 }} checked={f.duodecimoNatal} onChange={(e) => set('duodecimoNatal', e.target.checked)} /> Duodécimo de Natal</label>
        </div>
      </div>

      <div className="card">
        <h3>Recibo</h3>
        <table>
          <thead><tr><th>Cód.</th><th>Descrição</th><th>Fórmula</th><th style={{ textAlign: 'right' }}>Valor</th></tr></thead>
          <tbody>
            {r.rubricas.map((ru, i) => (
              <tr key={i}>
                <td>{ru.codigo}</td>
                <td>{ru.descricao}</td>
                <td style={{ fontSize: '0.72rem', color: '#64748b' }}>{ru.formula}</td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: ru.valor < 0 ? '#c0392b' : 'inherit' }}>{eur(ru.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: '1rem', maxWidth: 420, marginLeft: 'auto' }}>
          <div className="total-line"><span>Total ilíquido</span><span>{eur(r.totais.totalIliquido)}</span></div>
          <div className="total-line"><span>Base de Segurança Social</span><span>{eur(r.totais.baseSS)}</span></div>
          <div className="total-line"><span>Desconto SS ({config.ss.taxaTrabalhador}%)</span><span>− {eur(r.totais.descontoSS)}</span></div>
          <div className="total-line"><span>Retenção IRS{r.totais.irsTaxa ? ` (${r.totais.irsTaxa}%)` : ''}</span><span>− {eur(r.totais.irs)}</span></div>
          <div className="total-line big"><span>Líquido a receber</span><span>{eur(r.totais.liquido)}</span></div>
          <div className="total-line"><span>SS entidade ({config.ss.taxaEntidade}%)</span><span>{eur(r.totais.ssEntidade)}</span></div>
          <div className="total-line big"><span>Custo total p/ empresa</span><span>{eur(r.totais.custoEmpresa)}</span></div>
        </div>

        {r.avisos.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            {r.avisos.map((a, i) => <p key={i} className="erro">⚠️ {a}</p>)}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <button onClick={() => pdfReciboCompleto(ctxPdf).save(`recibo-completo-${periodo}.pdf`)}>📄 PDF completo</button>
          <button className="sec" onClick={() => pdfReciboSimples(ctxPdf).save(`recibo-simples-${periodo}.pdf`)}>📄 PDF simples (contabilista)</button>
          <button className="sec" onClick={gravarRecibo}>💾 Gravar no histórico</button>
        </div>
        {msg && <p className="ok">{msg}</p>}
      </div>
    </>
  );
}
