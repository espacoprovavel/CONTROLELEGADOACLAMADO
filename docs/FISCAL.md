# Gestão Fiscal e Salarial (v3.0)

Este módulo acrescenta ao Legado RH cálculos fiscais e salariais **exactos, determinísticos e auditáveis**. Cada resultado mostra a **fórmula** e a **taxa** usadas. **Nenhuma funcionalidade usa inteligência artificial.**

> ⚠️ **Aviso legal:** estimativas de apoio à gestão. Não substituem contabilidade certificada nem software de faturação certificado pela AT.

---

## Duas áreas

A barra de navegação tem duas áreas:

- **👥 Funcionários** — gestão individual (ficha, documentos, salário, faltas, A1/contrato).
- **🏢 Empresa** — Dashboard, IVA, IRC, Pró-formas e ⚙️ Configurações.

---

## Configurações (⚙️, área Empresa)

Todos os parâmetros são editáveis e guardados no Firestore (documento `config/parametros`). Os cálculos lêem **sempre** estes valores no momento do cálculo.

| Parâmetro | Valor 2026 de origem |
|-----------|----------------------|
| SS — trabalhador | 11 % |
| SS — entidade | 23,75 % |
| IAS | 537,13 € |
| RMMG | 920 € × 14 meses |
| Subsídio refeição isento (dinheiro) | 6,15 €/dia |
| Subsídio refeição isento (cartão) | 10,46 €/dia |
| IVA | 23 % / 13 % / 6 % (adicionáveis) |
| IRC | 19 % (PME 16 % nos primeiros 50.000 €) |
| Derrama municipal | configurável (0 %–1,5 %) |
| Mínimo de existência IRS | 12.880 €/ano |
| Dias úteis / mês | 22 |
| Horas / dia | 8 |
| Tabela de retenção de IRS | **vazia** (cola-se a oficial) |

**Importante sobre a tabela de IRS:** está vazia por opção — não inventamos valores. Enquanto estiver vazia, a retenção é calculada a **0 %** e os recibos avisam disso. Adicione as linhas da tabela oficial (situação familiar, nº de dependentes, remuneração até, taxa) para obter a retenção correcta.

**Vigência:** cada vez que guarda a configuração, fica registada a data de vigência. Os recibos já guardados mantêm as taxas com que foram calculados (guardam um *snapshot* dos parâmetros) — **nunca são recalculados retroativamente**. As alterações ficam no histórico (`config_history`): que mudou, valor antigo, valor novo, data e quem alterou.

Botão **"Repor valores 2026 de origem"** repõe tudo (com confirmação).

---

## Processamento de salários (ficha do funcionário → 💶)

1. Escolha o **período** e o **modo**:
   - **Por mês:** usa o vencimento mensal.
   - **Por horas:** `valor/hora = salário base ÷ (dias úteis × horas/dia)`, multiplicado pelas horas trabalhadas.
2. Preencha subsídio de refeição (valor/dia e modo dinheiro/cartão), dias com subsídio, diuturnidades, comissões, prémios, horas extra, situação familiar e dependentes.
3. As **faltas do período** são lidas automaticamente e descontadas.
4. **Calcular** mostra todas as parcelas com fórmula e taxa:
   - Vencimento base (com desconto de faltas a 1/30)
   - Subsídio de refeição (parte isenta vs. tributável)
   - Base de incidência (SS/IRS)
   - SS trabalhador (11 %) e entidade (23,75 %)
   - Retenção de IRS (pela tabela)
   - **Líquido a receber** e **Custo total para a empresa**
5. **Guardar no histórico** grava o recibo no Firestore (subcolecção `recibos`, um por período).
6. **Recibo PDF**: completo (auditoria) ou simples (para o contabilista).

Subsídios de férias/Natal: a SS incide; o IRS pode não incidir até ao mínimo de existência. O subsídio de doença (baixa) é pago pela Segurança Social, **não pela empresa** — a app apenas informa.

---

## Faltas e baixas médicas (ficha do funcionário → 🗓️)

- **Justificada:** marca-se se é remunerada ou não (depende do motivo/CCT).
- **Injustificada:** desconta 1/30 do salário por dia (ou proporcional às horas) **e** remove o subsídio de refeição desses dias.
- **Baixa médica (CIT):** a empresa deixa de pagar os dias de baixa; o subsídio de doença (55 %–75 %) é pago pela Segurança Social. Há a opção de **complemento por CCT** pago pela empresa.
- Anexe o comprovativo (atestado/CIT) na secção de documentos da ficha. A leitura é **manual** — introduz os dias/horas sem IA.

O resultado das faltas alimenta automaticamente o salário do mês correspondente.

---

## Destacamento A1 e contratos (ficha do funcionário → 🌍)

- Estado do A1 (pedido/emitido), datas e validade; base de remuneração.
- Confirma que a SS continua a ser paga em **Portugal** durante o destacamento válido e estima a base.
- Contrato a termo: tipo, início, fim, nº de renovações, com **validação dos limites legais** (avisos).
- **Alertas no Dashboard:** A1 a expirar e contratos a terminar, com a antecedência configurável (por omissão 30 dias).

---

## Backup / Exportação

- **Exportar todos os dados** (área Empresa) gera um ZIP com `dados_completos.json` (funcionários + recibos + faltas + config), `funcionarios.csv` e `config.json`.

---

## Estrutura de dados (Firestore)

```
config/parametros                       # documento único de parâmetros
config_history/{id}                     # histórico de alterações (imutável)
funcionarios/{id}                       # ficha (já existia)
funcionarios/{id}/documentos/{id}       # anexos Cloudinary (já existia)
funcionarios/{id}/recibos/{periodo}     # recibos mensais (AAAA-MM)
funcionarios/{id}/faltas/{id}           # faltas e baixas
```

Permissões (Firestore Rules): leitura para autenticados; criação/edição para `editor`/`admin`; eliminação só `admin`. A configuração não pode ser eliminada; o histórico é imutável.

---

## Valor/hora de referência (v3.1)

`valor/hora = salário base ÷ horas/mês` (173,33 por omissão, editável em Configurações). Ex.: `920 ÷ 173,33 = 5,31 €`. É usado em **todos** os cálculos por hora.

## Três ferramentas de cálculo (área Funcionários, v3.1)

São independentes e abrem-se na barra "Ferramentas de cálculo":

1. **🕐 Calculadora de Horas** — `horas × valor/hora`. Pode introduzir o valor/hora diretamente ou um salário base (a app calcula `÷ 173,33`). Mostra a fórmula.
2. **➖ Cálculo Simplificado** — salário base menos faltas (dias a 1/30 ou horas ao valor/hora). Sem impostos. Para conferência interna.
3. **📑 Cálculo Completo "como o contabilista"** — replica os recibos reais, com rubricas por código:
   - **Cód 1 Vencimento** — `horas × valor/hora`.
   - **Cód 30 Subs. Alimentação** — `dias × valor/dia`, isento até 6,15 €/dia (dinheiro) ou 10,46 €/dia (cartão); não conta para SS nem IRS dentro do limite.
   - **Cód 38 / 40 Ajudas de Custo (e Estrangeiro)** — isentas de IRS e SS: somam ao líquido mas **ficam fora** da base de SS e da incidência de IRS. (A app replica o tratamento do contabilista; não valida limites legais.)
   - **Cód 20 / 21 Subs. Férias / Natal** — em duodécimos (`base ÷ 12`); entram na base de SS, podem não entrar no IRS (opção).
   - **Desconto SS** — 11 % sobre `vencimento + subs. férias/Natal` (não sobre ajudas de custo nem alimentação).
   - **Retenção de IRS** — pela tabela das Configurações. Se a tabela **não estiver carregada**, a app avisa "tabela de IRS não carregada" e **não assume** retenção (0,00, nunca inventa).
   - Valor ilíquido, descontos, líquido a receber e custo total para a empresa. Recibo PDF.

   Também acessível por trabalhador em **Ficha → 📑 Cálculo Contabilista** (pré-preenche o salário base).

## Faltas — três tipos (v3.1)

- **Justificada** — segundo a config (remunerada ou não).
- **Injustificada** — desconta 1/30 por dia + remove subsídio de alimentação desses dias.
- **Por admissão** — entrou a meio do mês: **não** é falta a descontar; o vencimento é proporcional aos dias/horas trabalhados (usar o modo por horas).

## Relatório para o Contabilista (v3.1)

Em **Funcionários → 📤 Relatório p/ Contabilista**, escolhe-se o mês e gera-se uma tabela por trabalhador (nome, NIF, faltas por tipo J/I/B/A, vencimento, subsídios, ajudas de custo, base de SS, desconto SS, IRS, líquido), a partir dos recibos guardados. Exportável em **PDF** e **Excel/CSV**.

## Fase 2 — área Empresa (v3.1, operacional)

- **🧾 Estimador de IVA trimestral** — faturas emitidas (IVA liquidado) e recebidas (IVA dedutível) por taxa (23/13/6 %); apura IVA a entregar/recuperar por trimestre e mostra o prazo da declaração periódica trimestral. Guardado por trimestre (colecção `iva`).
- **🏛️ Estimador de IRC** — lucro tributável, 19 % (ou PME 16 % nos primeiros 50.000 €), derrama e pagamentos por conta (estimativa).
- **📄 Pró-formas internos** — documento marcado "DOCUMENTO SEM VALOR FISCAL — NÃO É FATURA CERTIFICADA", com linhas (qtd × preço + IVA) e exportação PDF. Não simula faturas certificadas nem numeração da AT.

> ⚠️ **Validação pendente:** os cálculos foram testados com testes unitários (incluindo 920 ÷ 173,33 = 5,31 € e o tratamento de cada código), mas a conferência contra os **recibos reais de abril/2026** ainda não foi feita — os ficheiros não estavam acessíveis na sessão de desenvolvimento.
