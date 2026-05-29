# Changelog

Todas as alterações relevantes deste projeto são documentadas neste ficheiro.

## [3.1.0] — 2026-05-29

### Adicionado — Ferramentas de cálculo e fase 2
- **Valor/hora de referência**: salário base ÷ horas/mês (173,33 por omissão, editável). Ex.: 920 ÷ 173,33 = 5,31 €/h. Usado em todos os cálculos por hora.
- **Três ferramentas independentes na área Funcionários:**
  - **Calculadora de Horas**: horas × valor/hora (ou salário base ÷ 173,33). Mostra a fórmula.
  - **Cálculo Simplificado**: salário base menos faltas (dias 1/30 ou horas), sem impostos, para conferência interna.
  - **Cálculo Completo "como o contabilista"**: rubricas com código — Cód 1 Vencimento (horas × valor/hora), Cód 30 Subs. Alimentação (isento até limite), Cód 38/40 Ajudas de Custo (isentas de IRS e SS, somam ao líquido fora da base), Cód 20/21 Subs. Férias/Natal em duodécimos (base ÷ 12, incidem em SS), desconto SS 11% sobre vencimento+subsídios, retenção de IRS pela tabela. Valor ilíquido, descontos, líquido e custo total. Recibo PDF.
- **Faltas — três tipos**: justificada, injustificada (1/30 + sem subsídio) e **"por admissão"** (entrou a meio do mês; vencimento proporcional, não desconta).
- **Relatório para o Contabilista** por trabalhador e mês (nome, NIF, faltas por tipo, vencimento, subsídios, ajudas, base SS, SS, IRS, líquido). Exportável em PDF e Excel/CSV.
- **Fase 2 — área Empresa operacional:**
  - **Estimador de IVA trimestral**: faturas emitidas/recebidas por taxa, apuramento a entregar/recuperar, prazo da declaração periódica trimestral; guardado por trimestre (colecção `iva`).
  - **Estimador de IRC**: lucro tributável, 19% (ou PME 16% nos primeiros 50.000 €), derrama e pagamentos por conta.
  - **Pró-formas internos**: documento "SEM VALOR FISCAL — NÃO É FATURA CERTIFICADA", exportável em PDF.
- Parâmetro **horas/mês** editável nas Configurações; nova regra Firestore para `iva`.

### Notas
- Cálculos validados por testes unitários, incluindo o valor/hora 920 ÷ 173,33 = 5,31 € e o tratamento de cada código. **Verificação contra os recibos reais de abril/2026 fica pendente** (ficheiros não acessíveis nesta sessão).
- Continua determinístico e **sem inteligência artificial**.

### Validação (atualização) — recibos reais de Abril/2026
- Os 9 recibos reais de Abril/2026 foram reconciliados ao cêntimo (`tests/recibos_abril2026.test.js`).
- Correção importante: no cálculo "como o contabilista", o **Cód 1 Vencimento** é a remuneração base proporcional por **1/30 por dia de falta** (mês completo = base exacta, ex.: 920,00 €), e não `horas × valor/hora` (que arredondava para 920,38 €). O valor/hora (920 ÷ 173,33 = 5,31 €) passa a ser a **taxa informativa** mostrada em "tempos"; a Calculadora de Horas independente continua a usar `horas × valor/hora`.
- Confirmado: ajudas de custo (cód 38/40) e subsídio de alimentação (cód 30) ficam **fora da base de SS**; a base de SS = vencimento + duodécimos de férias/Natal; SS 11 %; retenção de IRS 0,00 quando a tabela não está carregada (nunca assumida). Novo campo "dias de falta" no cálculo contabilista (deriva automaticamente as horas).

## [3.0.0] — 2026-05-29

### Adicionado — Gestão Fiscal e Salarial (fase 1, sem IA)
- Navegação em duas áreas: **👥 Funcionários** e **🏢 Empresa**
- **Processamento de salários** por trabalhador (modo mês ou horas), com SS trabalhador/entidade, parte tributável do subsídio de refeição, base de IRS, retenção pela tabela, líquido e custo total para a empresa. Cada parcela mostra fórmula e taxa
- Histórico mensal de recibos por trabalhador (subcolecção `recibos`), com *snapshot* dos parâmetros usados (não recalcula retroativamente)
- Recibos PDF: **completo** (auditoria) e **simples** (contabilista)
- **Faltas e baixas médicas** (subcolecção `faltas`): justificada/injustificada/baixa (CIT), dias ou horas; injustificada desconta 1/30 e remove subsídio; complemento CCT opcional na baixa; alimenta automaticamente o salário do mês
- **Destacamento A1 e contratos**: estado/validade do A1, base de SS em Portugal, validação de renovações e duração do termo certo
- **Dashboard da empresa**: custo de pessoal do mês, A1 a expirar, contratos a terminar, parâmetros em vigor
- **Configurações** totalmente editáveis (colecção `config`): SS, IAS, RMMG, subsídios, taxas de IVA (adicionáveis), IRC/PME e limite, derrama, mínimo de existência de IRS, dias úteis e horas/dia, e a **tabela de retenção de IRS vazia e editável** (não inventa valores)
- Histórico de alterações de configuração (`config_history`), data de vigência e botão "Repor valores 2026 de origem"
- Validações de configuração (percentagens 0–100, valores não negativos, avisos para valores fora do normal)
- Botão **Exportar todos os dados** (JSON + CSV em ZIP)
- Aviso legal transversal em toda a app e nos PDF
- Novas regras Firestore para `recibos`, `faltas`, `config` e `config_history`
- Documentação `docs/FISCAL.md`

### Notas
- Módulos de IVA, IRC e pró-formas internos estão preparados na interface e entram na **fase 2**
- Tudo determinístico; **nenhuma funcionalidade usa inteligência artificial**
- Mantém-se 100 % gratuito (plano Spark do Firebase + Cloudinary)

## [2.1.0] — 2026-05-27

### Adicionado
- Anexar documentos (JPG, PNG, PDF) a cada funcionário via Cloudinary
- Secção "Documentos Anexados" no modal de detalhe do funcionário
- Upload com Cloudinary Upload Widget (múltiplos ficheiros, câmara, idioma pt, máx 10 MB)
- Visualização interna: lightbox para imagens, iframe para PDFs
- Descarregar documento individual e "Descarregar todos em ZIP" (gerado no browser)
- Eliminação de documento (só admin, dupla confirmação) — remove metadados do Firestore
- Coluna "Docs" na tabela com contador rápido (campo `doc_count` por funcionário)
- Auditoria de documentos: acções `document_upload` e `document_delete`
- Regras Firestore para a subcolecção `documentos` (read auth, create editor, delete admin, update bloqueado)
- Carregamento lazy dos documentos (só ao abrir a ficha do funcionário)
- Documentação `docs/CLOUDINARY.md`

### Notas
- Os ficheiros são armazenados no Cloudinary (cloud `dlhbrckt6`, preset `legado_documentos`).
- A eliminação remove apenas os metadados no Firestore; o ficheiro permanece no Cloudinary (gestão manual no painel).
- A entrega de PDFs requer activar "Allow delivery of PDF and ZIP files" no painel Cloudinary.

## [2.0.0] — 2026-05-27

### MUDANÇAS DISRUPTIVAS
- Sistema migrado de localStorage para Firebase
- Agora requer internet e login
- Sincronização em tempo real entre utilizadores

### Adicionado
- Autenticação Firebase (email + password)
- 3 níveis de permissões: admin/editor/viewer
- Auditoria automática
- Modal gestão de utilizadores (só admin)
- Modal logs auditoria (só admin)
- Recuperação password via email
- Setup inicial (setup.html para criar perfis)
- Regras de segurança Firestore (firestore.rules) e índices

### Removido
- Modo offline
- localStorage como fonte de dados
- Funcionário de exemplo (seed) — os dados vivem agora no Firestore

## [1.2.0] — 2026-05-27

### Adicionado
- Sistema completo de gestão de funcionários offline
- Identidade visual oficial Legado Aclamado (azul marinho #003366 + dourado #D4AF37)
- Tipografia oficial Montserrat + Poppins (+ JetBrains Mono para labels técnicos)
- 3 secções separadas por país de destacamento (Bélgica, Portugal, Outros)
- Ficha completa com 45+ campos em 8 secções
- Exportação PDF individual com cabeçalho azul marinho + dourado
- Exportação PDF consolidada de todos + por grupo
- Exportação ZIP completo + por grupo (fichas individuais + consolidado + JSON + CSV)
- Importação/exportação backup JSON
- Pesquisa instantânea (nome, NIF, NISS, função, cliente, CC)
- Estatísticas em tempo real (total/activos/inactivos)
- Banner de aviso de backup (>7 dias)
- Timestamp da última actualização no rodapé
- Funcionário de exemplo no primeiro carregamento

### Notas
- Dados em localStorage do navegador
- 100% offline após primeiro carregamento
- Sem servidor, sem cloud
