import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import { CONFIG_2026 } from '../lib/configDefaults.js';
import { useEmpresa } from '../contexts/EmpresaContext.jsx';

// Carrega a configuração (parâmetros legais) da empresa selecionada.
export function useConfig() {
  const { empresaId } = useEmpresa();
  const [config, setConfig] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!empresaId) { setConfig(null); setCarregando(false); return; }
    setCarregando(true);
    const ref = doc(db, 'empresas', empresaId, 'config', 'parametros');
    return onSnapshot(ref, (snap) => {
      setConfig(snap.exists() ? snap.data() : { ...CONFIG_2026 });
      setCarregando(false);
    });
  }, [empresaId]);

  async function guardar(novaConfig, registo) {
    if (!empresaId) return;
    const ref = doc(db, 'empresas', empresaId, 'config', 'parametros');
    const historico = [...(config?.historico || [])];
    if (registo) historico.push({ ...registo, data: new Date().toISOString() });
    await setDoc(ref, { ...novaConfig, historico, atualizada_em: serverTimestamp() }, { merge: true });
  }

  async function repor(quem) {
    if (!empresaId) return;
    const ref = doc(db, 'empresas', empresaId, 'config', 'parametros');
    const historico = [...(config?.historico || []), { campo: 'TODOS', antigo: '—', novo: 'valores 2026 de origem', quem, data: new Date().toISOString() }];
    await setDoc(ref, { ...CONFIG_2026, regimeIVA: config?.regimeIVA || CONFIG_2026.regimeIVA, historico, atualizada_em: serverTimestamp() });
  }

  return { config, carregando, guardar, repor };
}
