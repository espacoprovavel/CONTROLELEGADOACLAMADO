# Gestão de Documentos (Cloudinary)

Os documentos anexados aos funcionários (JPG, PNG, PDF) são armazenados no **Cloudinary**. O **Legado RH** guarda apenas os **metadados** (URL, nome, tamanho, autor, data) no Firestore, numa subcolecção de cada funcionário.

- **Cloud Name:** `dlhbrckt6`
- **Upload Preset:** `legado_documentos` (Unsigned)
- **Pasta base:** `legado-aclamado/funcionarios/{idDoFuncionario}`

> Estas credenciais **não são secretas** — podem constar no código. A segurança dos dados está nas Firestore Rules + Authentication.

---

## O que é

O **Cloudinary** é um serviço de alojamento e entrega de imagens/ficheiros. Usamos o **Upload Widget** (carregado por CDN) para enviar ficheiros directamente do navegador para o Cloudinary, sem servidor próprio.

---

## Como funciona

1. Na ficha de um funcionário (botão **Ver**), secção **"Documentos Anexados"**.
2. **📎 Adicionar documento(s)** abre o widget do Cloudinary (vários ficheiros, câmara, idioma português, máx. **10 MB** por ficheiro, formatos **jpg/jpeg/png/pdf**).
3. Após o upload, o ficheiro fica no Cloudinary em `legado-aclamado/funcionarios/{idFuncionario}` e os **metadados** são gravados em:
   ```
   funcionarios/{idFuncionario}/documentos/{docId}
     ├── url, public_id, original_filename, format, bytes, resource_type
     ├── uploaded_at (timestamp)
     ├── uploaded_by_uid, uploaded_by_email
   ```
4. O contador `doc_count` do funcionário é incrementado (badge 📎 N na tabela principal).
5. Cada upload/eliminação fica registado nos **logs de auditoria** (`document_upload` / `document_delete`).

### Ver / Descarregar / Eliminar
- **👁 Ver** — imagens abrem em lightbox; PDFs abrem num visualizador interno (iframe).
- **⬇ Descarregar** — força o download via `fl_attachment` do Cloudinary.
- **🗑 Eliminar** (só admin, dupla confirmação) — remove os **metadados** do Firestore. ⚠️ O ficheiro **permanece no Cloudinary** (ver secção RGPD abaixo).
- **📦 Descarregar todos em ZIP** — empacota todos os documentos do funcionário num ZIP gerado no navegador.

---

## ⚠️ Activar entrega de PDFs (passo obrigatório)

Por predefinição, as contas Cloudinary **bloqueiam a entrega de ficheiros PDF e ZIP** por segurança. Sem isto, o **Ver** e o **Descarregar** de PDFs falham (erro 401).

**Como activar:**
1. Entrar no painel Cloudinary → **Settings (⚙️)** → **Security**.
2. Procurar **"PDF and ZIP files delivery"** (ou *"Allow delivery of PDF and ZIP files"*).
3. **Activar** a opção e **guardar**.

As imagens (JPG/PNG) funcionam sem esta definição.

---

## Eliminação e RGPD

A eliminação dentro do Legado RH remove apenas o **metadado** (o documento deixa de aparecer na ficha). O **ficheiro original continua no Cloudinary** — a eliminação física requer operações assinadas (backend), fora do âmbito desta aplicação.

**Para apagar definitivamente um ficheiro (ex.: pedido RGPD de apagamento):**
1. Painel Cloudinary → **Media Library**.
2. Navegar até `legado-aclamado/funcionarios/{idFuncionario}`.
3. Seleccionar o ficheiro → **Delete**.

> Recomenda-se uma revisão periódica da Media Library para remover ficheiros já eliminados no sistema.

---

## Rever uploads no painel Cloudinary

- **Media Library** → pasta `legado-aclamado/funcionarios` → uma subpasta por funcionário (ID).
- É possível pré-visualizar, descarregar e apagar ficheiros directamente no painel.

---

## Plano e limites (gratuito)

O plano gratuito do Cloudinary é suficiente para esta utilização:

| Recurso | Limite (plano gratuito) |
|---------|--------------------------|
| Armazenamento | ~25 GB |
| Largura de banda (entrega) | ~25 GB / mês |
| Transformações | Crédito mensal generoso |

Para dezenas de funcionários com alguns documentos cada, o consumo fica muito abaixo destes limites.

### Quando faz sentido fazer upgrade
- Armazenamento total a aproximar-se dos 25 GB.
- Tráfego de descarregamento mensal elevado (muitos acessos/downloads).
- Necessidade de eliminação automática (backend assinado) ou transformações avançadas.

---

## Resolução de problemas

| Problema | Causa provável | Solução |
|----------|----------------|---------|
| PDF não abre no "Ver" | Entrega de PDF desactivada | Activar "PDF and ZIP delivery" (ver acima) |
| "Serviço de upload indisponível" | Widget (CDN) não carregou | Verificar Internet e recarregar |
| Upload rejeitado | Formato/tamanho inválido | Só jpg/png/pdf, máx. 10 MB |
| ZIP de documentos vazio | Falha ao obter ficheiros (CORS/rede) | Verificar ligação; tentar novamente |
| Documento eliminado ainda no Cloudinary | Eliminação só remove metadados | Apagar manualmente na Media Library |
