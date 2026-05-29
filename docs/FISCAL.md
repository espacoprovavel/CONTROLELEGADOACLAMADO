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

## Fase 2 (preparada na interface)

Os módulos **Estimador de IVA**, **Estimador de IRC** e **Pró-formas internos** já têm separador na área Empresa e entram na fase seguinte. O núcleo (Configurações, Salários, Faltas/Baixas, A1/Contratos e Dashboard) está operacional.
