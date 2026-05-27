# Changelog

Todas as alterações relevantes deste projeto são documentadas neste ficheiro.

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
