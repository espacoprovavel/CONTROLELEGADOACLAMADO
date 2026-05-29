# Espaço Provável — Gestão RH & Fiscal (multi-cliente)

Aplicação web **interna** da Espaço Provável para gerir a **contabilidade e os
salários de várias empresas clientes**. Tudo em **português de Portugal**.
Cálculos **determinísticos e auditáveis** (sem IA) — cada resultado mostra a
fórmula e a taxa. Corre **100% no plano gratuito (Spark)** do Firebase.

> ⚠️ **Aviso legal:** Estimativas de apoio à gestão. Não substituem contabilidade
> certificada nem software de faturação certificado pela Autoridade Tributária.
> As faturas legais têm de ser emitidas em software certificado.

---

## O que faz

- **Multi-cliente** — seletor de empresa sempre visível; dados de cada empresa
  totalmente isolados (`empresas/{empresaId}/...`).
- **Acesso por login** (Firebase Auth, email + palavra-passe), 2 utilizadores com
  acesso total. Sem login, ninguém vê nada.
- **Área RH:**
  - Calculadora de horas.
  - Cálculo simplificado (salário − faltas).
  - Cálculo completo "como o contabilista": Vencimento (cód. 1), subsídios de
    férias/Natal em duodécimos (20/21), subsídio de alimentação S/IRS e SS (30),
    ajudas de custo isentas (38/40), desconto de SS (11%), SS entidade (23,75%),
    retenção de IRS por tabela, faltas (justificada, injustificada, admissão,
    baixa/CIT), líquido e custo total para a empresa.
  - Ficha de funcionários, país de destacamento e estado do A1.
- **Área Fiscal:** estimador de IVA (mensal/trimestral), estimador de IRC (19% /
  PME 16% + derrama, com custo de pessoal automático), pró-formas/orçamentos
  ("SEM VALOR FISCAL"), calendário fiscal com alertas.
- **Configuração por empresa** com os parâmetros legais de 2026 (todos editáveis,
  com histórico de alterações e botão "repor valores 2026").

---

## Stack

React + Vite · Firebase (Authentication + Firestore) · Cloudinary (anexos) ·
jsPDF (PDF) · xlsx (Excel/CSV). Sem backend próprio, sem Cloud Functions, sem
serviços pagos.

> **Porquê Cloudinary e não Firebase Storage?** Em projetos novos o Cloud Storage
> do Firebase obriga ao plano pago Blaze. Para manter tudo **100% gratuito**, os
> anexos usam o Cloudinary (tier gratuito).

---

## Como pôr ONLINE com login

Ver **[DEPLOY.md](DEPLOY.md)** — resumo:

```bash
npm install
cp .env.example .env        # chaves do Firebase
npm test                    # 13 testes (inclui recibo real Legado abr/2026)
npm run build
firebase login && firebase deploy
```

Na consola Firebase: ativar **Authentication (Email/Palavra-passe)**, criar os
**2 utilizadores** e criar a base de dados **Firestore**.

## Correr localmente
```bash
npm install
npm run dev      # http://localhost:5173
```

---

## Estrutura

```
src/
├── firebase.js                 # init Firebase + Cloudinary
├── lib/
│   ├── configDefaults.js       # parâmetros legais 2026
│   └── calculo/                # MOTOR DE CÁLCULO (puro, testável)
│       ├── arred.js  irs.js  iva.js  irc.js  salario.js
│       └── salario.test.js     # 13 testes (vitest)
├── contexts/                   # AuthContext, EmpresaContext
├── hooks/useConfig.js
├── components/                 # Login, Layout, AvisoLegal
└── pages/                      # Dashboard, Empresas, Funcionarios, CalculoSalario,
                                #   IVA, IRC, ProFormas, CalendarioFiscal, Configuracao
firestore.rules                 # isolamento por empresa, só autenticados
firebase.json / .firebaserc     # config Firebase Hosting
docs/RELATORIO_HANDOFF.md       # estado, decisões e próximos passos
legacy/                         # app v2.1 antiga (single-file), preservada
```

---

## RGPD

A app trata dados pessoais (nomes, NIF, salários) de trabalhadores de empresas
clientes. É possível apagar definitivamente um funcionário/empresa. **Tratar dados
de terceiros exige base legal e, possivelmente, contrato de tratamento de dados com
cada cliente — responsabilidade da Espaço Provável, a validar com jurista/contabilista.**

---

## Estado

Fundação + motor de cálculo verificado + UI funcional (login, multi-empresa,
calculadoras, IVA, IRC, pró-formas, calendário, configuração, painel). Por
desenvolver: geração de PDF, importação de PDF/Excel/Word, anexos Cloudinary na
UI, exportações Excel/CSV e backup global. Ver `docs/RELATORIO_HANDOFF.md`.
