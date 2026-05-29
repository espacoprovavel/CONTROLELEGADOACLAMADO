# Relatório de Handoff — App Multi-Cliente RH + Fiscal (Espaço Provável)

> Documento para outra instância de Claude (ou colaborador) continuar o trabalho
> em paralelo. Estado em **2026-05-29**. Branch de trabalho: `claude/exciting-keller-Nrjph`.

---

## 1. Objetivo do projeto

Aplicação web ÚNICA, **multi-cliente**, de gestão de **RH** e **fiscal/contábil** para
a "Espaço Provável", que gere a contabilidade e salários de várias empresas clientes.
Toda a interface em **português de Portugal**. Cálculos **determinísticos** (sem IA),
cada resultado mostra a **fórmula e a taxa**. Tem de correr **100% no plano gratuito**.

**Aviso legal obrigatório** (em toda a app e em todos os PDF):
> "Estimativas de apoio à gestão. Não substituem contabilidade certificada nem software
> de faturação certificado pela Autoridade Tributária. As faturas legais têm de ser
> emitidas em software certificado."

---

## 2. Decisões já tomadas (NÃO reabrir sem motivo)

1. **React + Vite** (rewrite from scratch). A app v2.1 antiga (single-file) foi movida
   para `legacy/` e preservada.
2. **Firebase Auth + Firestore** no plano **Spark (gratuito)**. **Firebase Hosting** para publicar.
3. **Anexos via Cloudinary** (não Firebase Storage). Motivo: o Cloud Storage do Firebase
   passou a exigir o plano pago Blaze em projetos novos; Cloudinary tem tier gratuito e
   já estava configurado na v2.1 (`cloud dlhbrckt6`, preset `legado_documentos`).
4. **Sem Cloud Functions, sem backend Node, sem APIs pagas.**
5. Reutilizamos o projeto Firebase existente `controle-legado-aclamado` (chaves em `.env.example`).
6. Apenas **2 utilizadores** (gestora + dono), ambos com **acesso total a todas as empresas**.
   Os clientes não têm login.

---

## 3. Stack e como correr

```bash
npm install
npm run dev      # arranca em http://localhost:5173
npm test         # corre os testes (vitest) do motor de cálculo
npm run build    # gera dist/ para publicar no Firebase Hosting
```

Dependências-chave: `react`, `react-router-dom`, `firebase`, `jspdf` + `jspdf-autotable`
(PDF), `xlsx` (Excel/CSV), `mammoth` (ler Word). Build: `vite`, testes: `vitest`.

---

## 4. Modelo de dados Firestore (isolamento total por empresa)

```
empresas/{empresaId}                         # nome, nif, morada, regimeIVA, arquivada, ...
empresas/{empresaId}/config/parametros       # cópia editável da config 2026 + histórico vigência
empresas/{empresaId}/funcionarios/{id}       # ficha do trabalhador
empresas/{empresaId}/funcionarios/{id}/documentos/{id}   # metadados Cloudinary
empresas/{empresaId}/funcionarios/{id}/faltas/{id}       # faltas com tipo + anexo
empresas/{empresaId}/recibos/{id}            # histórico mensal de cálculos salariais
empresas/{empresaId}/faturas/{id}            # IVA: emitidas/recebidas
empresas/{empresaId}/proformas/{id}          # pró-formas / orçamentos
empresas/{empresaId}/calendario/{id}         # prazos fiscais
users/{uid}                                  # os 2 utilizadores (acesso total)
audit_logs/{id}                              # registo de acessos/alterações (campo empresaId)
```

**Regra de ouro:** NADA de uma empresa pode aparecer noutra. Todas as queries têm de
partir de `empresas/{empresaIdSelecionada}/...`. O `empresaId` selecionado vive num
React Context (ver Secção 6).

---

## 5. ESTADO ATUAL — o que já está FEITO ✅

### Motor de cálculo (puro, testável) — `src/lib/calculo/`
- `arred.js` — arredondamento determinístico + formatação `eur()`, `pct()`.
- `salario.js` — **as 3 calculadoras**:
  - `calcularHoras()` — Cód. 1, horas × valor/hora (ou base ÷ 173,33).
  - `calcularSimplificado()` — salário − faltas, sem impostos.
  - `calcularReciboCompleto()` — "como o contabilista": Cód. 1/20/21/30/38/40,
    base SS, desconto SS (11%), SS entidade (23,75%), IRS, faltas (4 tipos:
    justificada, injustificada, admissão, baixa/CIT), líquido, custo empresa.
    **Cada parcela devolve `formula` e `taxa`.**
- `irs.js` — `calcularIRS()` por tabela editável + mínimo de existência; se não houver
  tabela → 0 e aviso "tabela não carregada".
- `iva.js` — `apurarIVA()`, `ivaDaLinha()`, `periodosDoRegime()` (mensal/trimestral).
- `irc.js` — `estimarIRC()` (19% / PME 16% até 50.000 € + derrama + pagamentos por conta).
- `src/lib/configDefaults.js` — `CONFIG_2026` (todos os parâmetros legais de partida).

### Testes — `src/lib/calculo/salario.test.js` (13 testes, **todos passam**)
- ✅ **Recibo real Legado abr/2026: base SS = 1.073,34 €, desconto SS = 118,07 €.**
- ✅ Ajudas de custo NÃO entram na base de SS; SS entidade 254,92 €.
- ✅ Sem tabela IRS → retenção 0 + aviso.
- ✅ Calculadora de horas, simplificado, faltas injustificadas removem subsídio refeição.
- ✅ Apuramento IVA e estimativa IRC (PME).

> **Fórmula verificada:** base SS = vencimento + duodécimo férias (base÷12, arred. a cêntimos)
> + duodécimo Natal (base÷12). 920 + 76,67 + 76,67 = 1.073,34. SS = 11% = 118,07. ✔️

### Infraestrutura
- `package.json`, `vite.config.js`, `index.html`, `public/favicon.svg`.
- `src/firebase.js` (Auth + Firestore + config Cloudinary, lê de `.env`).
- `.env.example` com as chaves do projeto. `.gitignore` atualizado (node_modules, .env, dist).

---

## 6. O que FALTA — plano por etapas (ordem pedida pela utilizadora)

### ETAPA 1 — Fundação multi-cliente + Auth + Layout  *(a fazer a seguir)*
- `src/main.jsx`, `src/App.jsx` com `react-router-dom`.
- `src/contexts/AuthContext.jsx` — login email/senha, recuperação, logout, guarda de rota.
- `src/contexts/EmpresaContext.jsx` — empresa selecionada (persistir em localStorage),
  fornece `empresaId` e funções de leitura/escrita scoped.
- `src/components/Login.jsx` — ecrã de login + "esqueci a palavra-passe".
- `src/components/Layout.jsx` — topo com **SELETOR DE EMPRESA sempre visível**, menu
  lateral (RH | Fiscal | Config | Relatórios), botão logout, **banner do aviso legal**.
- `src/components/AvisoLegal.jsx` — componente reutilizável.
- `src/pages/Empresas.jsx` — CRUD de empresas (criar/editar/arquivar/apagar), dados
  fiscais (nome, NIF, morada, regime IVA). Ao criar empresa, semear `config/parametros`
  com `CONFIG_2026`. **Primeiro registo de exemplo: LEGADO ACLAMADO (não fixar no código).**
- `firestore.rules` e `storage.rules` (ou nota Cloudinary) com isolamento por empresa.
- `firebase.json` (config Hosting → `dist`).

### ETAPA 2 — Config por empresa + Área RH
- `src/pages/Configuracao.jsx` — editar TODOS os parâmetros 2026, com **data de início
  de vigência** (períodos já calculados mantêm taxa antiga), histórico de alterações
  (valor antigo/novo/data/quem), botão "Repor valores 2026", colar tabela de IRS.
- `src/pages/Funcionarios.jsx` + `FuncionarioFicha.jsx` — ficha (NIF, nº SS, categoria,
  contrato, documentos Cloudinary).
- `src/pages/CalculoSalario.jsx` — UI das 3 calculadoras (usa `salario.js`), grava recibo
  em `recibos/`, mostra fórmulas, gera PDF.
- Faltas (4 tipos) com anexo de comprovativo (ler ficheiro, introduzir dias/horas à mão).
- A1 / Contratos: país destacamento, datas, estado A1, contratos a termo + alertas.

### ETAPA 3 — Área Fiscal
- `src/pages/IVA.jsx` — faturas emitidas/recebidas, importar PDF/Excel/Word (extrair
  texto → preencher à mão, **sem IA**), apurar por período do regime, prazos.
- `src/pages/IRC.jsx` — usa `estimarIRC()`, puxa **custo de pessoal** do histórico `recibos/`.
- `src/pages/ProFormas.jsx` — documento "SEM VALOR FISCAL", PDF, sem ATCUD.
- `src/pages/CalendarioFiscal.jsx` — prazos + alertas no dashboard.

### ETAPA 4 — PDF, relatórios, RGPD, dashboard, backup
- `src/lib/pdf/` — PDF COMPLETO e PDF SIMPLES (contabilista), com empresa/NIF/período/aviso.
- `src/lib/export.js` — exportar Excel/CSV (com BOM UTF-8).
- `src/pages/Dashboard.jsx` — custo pessoal do mês, IVA do período, IRC do ano, A1/contratos
  a expirar, próximas obrigações (tudo da empresa selecionada).
- Backup "Exportar todos os dados" (JSON+Excel) por empresa e global.
- RGPD: apagar definitivamente trabalhador/empresa, registo de acessos, política privacidade.
- README pt-PT (criar projeto Firebase, ativar Auth/Firestore, colar chaves, criar 2
  utilizadores, criar 1.ª empresa, correr e publicar com Hosting).

---

## 7. Convenções a respeitar

- **pt-PT** em tudo (texto, comentários úteis). Datas/€ com `Intl` locale `pt-PT`.
- Cálculos **só** em `src/lib/calculo/` (puros, testáveis). UI não recalcula à mão.
- Cada novo cálculo → escrever/atualizar teste em `*.test.js` e correr `npm test`.
- Arredondar com `arred()` (cêntimos). Duodécimos arredondados ANTES de somar (crítico
  para bater certo com os recibos).
- Isolamento por empresa em TODAS as queries.
- Identidade visual herdada da v2.1: azul `#003366` + dourado `#D4AF37`.

---

## 8. Como dividir trabalho em paralelo (sugestão)

- **Instância A:** Etapa 1 (router, Auth, EmpresaContext, Layout, CRUD Empresas, rules).
- **Instância B:** Camada PDF (`src/lib/pdf/`) + export Excel/CSV — independente da UI,
  testável com dados fictícios, integra-se depois.
- Evitar editar os mesmos ficheiros em simultâneo. O motor de cálculo (`src/lib/calculo/`)
  está estável — tratar como API e não reescrever.
