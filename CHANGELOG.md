# Changelog

Todas as alterações relevantes deste projeto são documentadas neste ficheiro.

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
