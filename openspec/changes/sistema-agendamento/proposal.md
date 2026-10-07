# Proposal

## Why

O projeto atual é um CRUD de usuários em Python/FastAPI, enquanto o objetivo solicitado é um sistema web de agendamentos, monolítico e de nível júnior, em JavaScript/Node.js. Uma aplicação integrada com persistência local e regras explícitas de disponibilidade atenderá ao novo objetivo e permitirá demonstrar CRUD, separação simples de responsabilidades e testes executáveis.

## What Changes

- **BREAKING**: tornar o sistema de agendamento em Node.js, Express e EJS a aplicação principal, substituindo o CRUD de usuários no fluxo de execução.
- Adicionar cadastro, listagem, detalhes, edição e exclusão de agendamentos, com validações de campos, datas, horários e conflitos.
- Adotar SQLite local com proteção de unicidade por data e horário, templates EJS e interface responsiva acessível.
- Separar Domain, Application, Infrastructure, Presentation e Main de forma simples, com testes unitários, de integração e HTTP.
- Preservar sem alterações os arquivos-fonte Python existentes e o banco de usuários; não importar nem migrar esses dados para o novo sistema. Documentar que esses artefatos legados não fazem parte do runtime do sistema de agendamento.

## Capabilities

### New Capabilities

- `appointment-management`: gerenciar agendamentos por interface web, persistir dados localmente e aplicar validações, ordenação e prevenção de conflitos.

### Modified Capabilities

Nenhuma. O projeto ainda não possui especificações de capacidades registradas.

## Impact

- A aplicação principal passará a ser iniciada pelo `package.json` e por um servidor Express; os arquivos Python atuais permanecerão no diretório e fora da inicialização Node.js.
- Novos diretórios esperados incluem `src/`, `views/`, `public/`, `tests/` e `data/`; o banco SQLite de agendamentos será separado do banco de usuários existente e não será versionado.
- Adição das dependências previstas: Express, EJS, better-sqlite3, dotenv e Helmet; ferramentas de desenvolvimento/teste incluem nodemon, Supertest, ESLint e Prettier, usando também `node:test`.
- Novos endpoints HTML sob `/appointments`; a raiz redirecionará para a listagem.
- A comparação para impedir agendamentos no passado usará o fuso horário local do processo servidor. Essa é uma suposição operacional para datas e horários de agenda sem fuso explícito.
