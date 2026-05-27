# Gestão do Firebase

Guia de administração do backend Firebase do **Legado RH** (v2.0).

- **Projecto:** `controle-legado-aclamado`
- **Região:** europe-west (RGPD)
- **Serviços:** Authentication (Email/Password) + Firestore Database
- **Plano:** Spark (gratuito)

---

## Coleções no Firestore

| Coleção | Conteúdo | Chave (ID do documento) |
|---------|----------|--------------------------|
| `funcionarios` | Fichas dos trabalhadores | ID gerado pela app (ex.: `F...`) |
| `users` | Perfis e roles | **UID** do Firebase Authentication |
| `audit_logs` | Registo de auditoria (imutável) | ID automático |

> ⚠️ Os documentos em `users` **têm de usar o UID do Authentication como ID**, porque as regras de segurança identificam o role por `users/{request.auth.uid}`.

---

## Setup inicial (uma vez)

### O problema do "primeiro admin" (bootstrap)
As regras só permitem que um **admin** escreva em `users`. Mas "ser admin" lê-se do próprio documento — que ainda não existe. Por isso o **primeiro** documento de admin tem de ser criado por um de dois caminhos:

### Caminho A — Criar o admin manualmente no Console (recomendado)
1. Firebase Console → **Firestore Database** → **Iniciar coleção** (se ainda não existir): nome `users`.
2. **ID do documento** = UID do admin (ex.: `GNrpJCSUv4SweoOYYolWSs2gR2V2`).
3. Campos:
   - `email` (string) = `espacoprovavel@gmail.com`
   - `nome` (string) = `Michelle`
   - `role` (string) = `admin`
   - `created_at` (timestamp) = agora
4. **Publicar as Firestore Rules** (separador Regras → colar `firestore.rules` → Publicar).
5. Abrir `setup.html`, entrar como admin e clicar em **"Criar / actualizar perfis"** para criar o **assistente** (e reconfirmar o admin).

### Caminho B — Correr o setup antes das regras
1. Manter o Firestore em **modo de teste** (regras abertas) temporariamente.
2. Abrir `setup.html`, entrar como admin, clicar em **"Criar / actualizar perfis"** (cria admin + assistente).
3. **Só depois** publicar `firestore.rules`.

### Eliminar o `setup.html`
Depois de criar os perfis, **elimina** `setup.html` do repositório:
- Pelo site do GitHub: abrir o ficheiro → ícone do caixote do lixo 🗑️ → *Commit*.
- Por CLI:
  ```bash
  git rm setup.html
  git commit -m "remover setup.html após configuração inicial"
  git push
  ```

---

## Criar um utilizador novo

1. Firebase Console → **Authentication** → **Users** → **Add user**.
2. Introduzir email + palavra-passe temporária → criar.
3. Copiar o **User UID** gerado.
4. Na app (como admin) → botão **👥 Utilizadores** → preencher **UID**, **email**, **nome**, **role** → **Adicionar perfil**.
   - Em alternativa, criar o documento manualmente em `users` no Console (ID = UID).

> Exemplo futuro — **contabilista**: criar conta em Authentication, copiar o UID, adicionar perfil com role `viewer` ou `editor` conforme o necessário.

---

## Mudar o role de um utilizador

1. App (como admin) → **👥 Utilizadores**.
2. No utilizador pretendido, escolher o novo role no dropdown (`admin` / `editor` / `viewer`).
3. A alteração é imediata e fica registada nos logs.

> Não é possível alterar o **próprio** role (proteção anti-bloqueio). Para isso, peça a outro admin ou edite o documento no Console.

---

## Ver os logs de auditoria

- App (como admin) → **📋 Logs**.
- Mostra os **últimos 100** registos por ordem decrescente.
- Filtros: utilizador (email), acção (`create`/`update`/`delete`/`import`/`user_role`), data.
- **Exportar CSV** para análise externa.
- Os logs são **imutáveis** (as regras impedem update/delete).

---

## Custos e limites — plano Spark (gratuito)

O plano gratuito **Spark** é largamente suficiente para esta utilização:

| Recurso | Limite diário (Spark) |
|---------|------------------------|
| Leituras de documentos | 50.000 / dia |
| Escritas de documentos | 20.000 / dia |
| Eliminações | 20.000 / dia |
| Armazenamento | 1 GiB |
| Authentication (email/password) | Gratuito, sem limite prático |

Para algumas dezenas de funcionários e 2-3 utilizadores, o consumo diário fica numa pequena fração destes limites.

### Quando considerar upgrade (plano Blaze, pré-pago)
- Centenas/milhares de funcionários **com** muitos acessos simultâneos diários.
- Necessidade de **Cloud Functions** (ex.: criar contas Auth automaticamente, emails personalizados).
- Exportações/backups automáticos agendados no servidor.
- Ultrapassar os limites diários de leitura/escrita de forma recorrente.

> O plano Blaze é pré-pago e, com este volume, o custo tenderia para ~0 €. Ativar só se houver necessidade real.

---

## Backup dos dados Firebase

- **Backup JSON** na app (botão 💾) — exporta o estado actual dos funcionários.
- **Export do Firestore** no Console (Firestore → Import/Export) para backups completos.
- Ver políticas em [BACKUP.md](BACKUP.md).

---

## Segurança — boas práticas

- A `apiKey` no `index.html` **não é secreta** (é um identificador público). A segurança real está nas **Firestore Rules** + Authentication.
- Manter as **Rules publicadas** e testá-las após qualquer alteração.
- Passwords fortes; reset via email.
- Acesso de `admin` apenas a quem gere RH.
