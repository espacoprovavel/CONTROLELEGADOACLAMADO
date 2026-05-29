import { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { CONFIG_2026 } from '../lib/configDefaults.js';
import { useAuth } from './AuthContext.jsx';

const EmpresaCtx = createContext(null);
const STORAGE_KEY = 'ep_empresa_selecionada';

export function EmpresaProvider({ children }) {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState([]);
  const [empresaId, setEmpresaId] = useState(localStorage.getItem(STORAGE_KEY) || null);
  const [carregando, setCarregando] = useState(true);

  // Subscrever a lista de empresas (só com sessão iniciada)
  useEffect(() => {
    if (!user) {
      setEmpresas([]);
      setCarregando(false);
      return;
    }
    const unsub = onSnapshot(collection(db, 'empresas'), (snap) => {
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      lista.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
      setEmpresas(lista);
      setCarregando(false);
    });
    return unsub;
  }, [user]);

  // Garantir que há sempre uma empresa selecionada válida
  useEffect(() => {
    const ativas = empresas.filter((e) => !e.arquivada);
    if (empresaId && empresas.some((e) => e.id === empresaId)) return;
    if (ativas.length > 0) selecionar(ativas[0].id);
  }, [empresas]); // eslint-disable-line

  function selecionar(id) {
    setEmpresaId(id);
    if (id) localStorage.setItem(STORAGE_KEY, id);
  }

  async function criarEmpresa(dados) {
    const ref = await addDoc(collection(db, 'empresas'), {
      ...dados,
      arquivada: false,
      criada_em: serverTimestamp(),
    });
    // Semear a configuração 2026 (editável depois)
    await setDoc(doc(db, 'empresas', ref.id, 'config', 'parametros'), {
      ...CONFIG_2026,
      regimeIVA: dados.regimeIVA || CONFIG_2026.regimeIVA,
      historico: [],
      atualizada_em: serverTimestamp(),
    });
    selecionar(ref.id);
    return ref.id;
  }

  const atualizarEmpresa = (id, dados) => updateDoc(doc(db, 'empresas', id), dados);
  const arquivarEmpresa = (id, arquivada) => updateDoc(doc(db, 'empresas', id), { arquivada });
  const apagarEmpresa = (id) => deleteDoc(doc(db, 'empresas', id));

  const empresa = empresas.find((e) => e.id === empresaId) || null;

  const value = {
    empresas,
    empresa,
    empresaId,
    carregando,
    selecionar,
    criarEmpresa,
    atualizarEmpresa,
    arquivarEmpresa,
    apagarEmpresa,
  };

  return <EmpresaCtx.Provider value={value}>{children}</EmpresaCtx.Provider>;
}

export const useEmpresa = () => useContext(EmpresaCtx);
