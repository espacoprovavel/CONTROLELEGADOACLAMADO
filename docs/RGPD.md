# RGPD — Proteção de Dados Pessoais

Este sistema trata **dados pessoais** de trabalhadores. A **LEGADO ACLAMADO — UNIPESSOAL LDA**, enquanto **responsável pelo tratamento**, deve cumprir o **Regulamento Geral sobre a Proteção de Dados (RGPD — Regulamento (UE) 2016/679)** e a legislação nacional aplicável.

> ⚠️ Este documento é um **guia interno**, não substitui aconselhamento jurídico.

---

## Dados pessoais armazenados (categorias)

| Categoria | Exemplos de campos |
|-----------|--------------------|
| Identificação | Nome, data de nascimento, nacionalidade, naturalidade, estado civil, género |
| Documentação | CC/BI e validade, NIF, NISS, passaporte e validade |
| Contacto e morada | Telemóvel, email, morada, código postal, localidade, país |
| Dados contratuais | Função, categoria, tipo e datas de contrato, vencimento, horário |
| Destacamento | Empresa cliente, país, local de trabalho |
| Dados bancários | Banco, IBAN, SWIFT/BIC |
| Contacto de emergência | Nome, relação, telefone (dados de terceiro) |
| Observações | Texto livre |

---

## Boas práticas implementadas

- **Armazenamento local** no navegador (`localStorage`) — os dados **não** são enviados para servidores ou cloud.
- **Sem tracking**, sem analytics, sem cookies de terceiros.
- Repositório de código **sem dados reais** (apenas um registo fictício de demonstração).
- Recomendação de **repositório privado** e de **backups encriptados**.

---

## Obrigações da empresa

### Base legal
O tratamento deve assentar numa base legal — tipicamente **execução do contrato de trabalho** e **cumprimento de obrigações legais** (fiscais, segurança social). Para finalidades adicionais pode ser necessário **consentimento**.

### Conservação
- Conservar os dados apenas pelo tempo necessário.
- Regra prática: **5 anos após a cessação** do contrato (sem prejuízo de prazos legais específicos — fiscais, laborais, segurança social, que podem ser mais longos).

### Segurança
- **Backups encriptados** (ver [BACKUP.md](BACKUP.md)).
- **Password** no PC e bloqueio de ecrã.
- **Acesso restrito** apenas a pessoas autorizadas (RH).

### Direitos dos titulares
Garantir o exercício dos direitos dos trabalhadores:
- **Acesso** aos seus dados
- **Rectificação** de dados incorretos
- **Apagamento** ("direito a ser esquecido"), quando aplicável
- **Portabilidade** (exportar os dados — o Backup JSON facilita isto)
- **Oposição** / limitação do tratamento

### Registo de atividades de tratamento
Manter um **registo de atividades de tratamento** (documento separado), conforme o art.º 30.º do RGPD.

### Notificação de violações
Em caso de **violação de dados** (perda, acesso indevido, fuga), notificar a **CNPD em 72 horas** e, se aplicável, os titulares afetados.

---

## O que NÃO fazer

- ❌ Não enviar dados ou backups por **email não encriptado**.
- ❌ Não colocar **dados reais** no código-fonte nem em repositórios públicos.
- ❌ Não partilhar o ficheiro com dados com pessoas não autorizadas.
- ❌ Não guardar backups sem encriptação em pens/discos sem proteção.
- ❌ Não conservar dados além do necessário.

---

## Transferência internacional (Bélgica)

O destacamento de trabalhadores para a **Bélgica** envolve outro Estado-Membro da **União Europeia**, abrangido pelo **mesmo RGPD**. Não constitui transferência para país terceiro — aplicam-se as mesmas regras de proteção.

---

## Contactos e recomendações

- **CNPD — Comissão Nacional de Proteção de Dados**
  - Telefone: **+351 21 392 84 00**
  - Site: **www.cnpd.pt**
- **DPO (Encarregado de Proteção de Dados):** recomendado designar um DPO caso a empresa cresça para **mais de 250 trabalhadores** ou trate dados em larga escala.
