# Design

## Context

Ver `proposal.md` para a motivação e o escopo. O diretório atualmente contém `main.py`, `models.py` e `database.py`, que implementam um CRUD Python/FastAPI de usuários. Não há `package.json`, frontend HTML ou código Node existente. O novo sistema Node será a aplicação principal acionada pelos scripts npm; os arquivos Python e qualquer banco de usuários existente permanecerão inalterados, fora do runtime novo.

Os requisitos observáveis estão em `specs/appointment-management/spec.md`. A aplicação é monolítica e local: Express renderiza EJS, e um arquivo SQLite exclusivo mantém os dados de agendamento.

## Goals / Non-Goals

**Goals:**
- Converter a raiz atual em um projeto executável Node.js, preservando os ativos legados fora da inicialização do novo sistema.
- Manter uma separação de camadas explícita e pequena, sem contêiner de injeção ou abstrações adicionais.
- Fornecer operação local simples, persistência SQLite automática e testes isolados que não usem o banco real.

**Non-Goals:**
- Importar usuários ou migrar dados do CRUD Python.
- Manter duas aplicações integradas, adicionar autenticação ou fornecer API REST separada.
- Adicionar frameworks frontend, serviços externos, Docker ou recursos além do CRUD especificado.

## Decisions

### Aplicação Node na raiz e preservação dos arquivos legados

`package.json` na raiz definirá scripts para iniciar o novo servidor Express. O código Python existente continuará em seu caminho atual e não será invocado nem alterado por esses scripts. O banco de agendamentos será um arquivo independente `data/appointments.db`; não reutilizará nem sobrescreverá o banco de usuários. Arquivos `.db` e `.env` serão ignorados pelo Git, com `.env.example` sem segredos.

Alternativa considerada: mover o CRUD Python para uma pasta de legado. Rejeitada porque mover arquivos é desnecessário para estabelecer o runtime principal e aumenta o risco de quebrar instruções ou referências existentes.

### CommonJS e Clean Architecture simplificada

Usar CommonJS (`require`/`module.exports`), coerente com os exemplos do pedido, sem definir `"type": "module"`. Domain manterá a entidade e validações puras; Application conterá erros, contrato do repositório e casos de uso; Infrastructure implementará SQLite; Presentation conterá controller, rotas, middleware HTTP e templates; Main criará as dependências e iniciará o servidor. O Composition Root fará a injeção manual.

Alternativa considerada: ESM. Rejeitada para evitar divergir dos exemplos CommonJS já fornecidos e reduzir decisões de configuração.

### Persistência e restrição de concorrência

Usar `better-sqlite3` com schema executado na inicialização e `UNIQUE(appointment_date, appointment_time)`. O caso de uso consulta o repositório antes de persistir para fornecer erro de domínio claro; a restrição SQL permanece como proteção final contra tentativas concorrentes. O repositório usará consultas parametrizadas e será testado com bancos `:memory:`.

Alternativa considerada: ORM/migrations. Rejeitada pelo escopo júnior, local e de schema único.

### Datas locais e validação

Interpretar data e horário de agendamento como horário civil local do servidor, pois o modelo solicitado não contém campo de fuso. Validar o formato e a existência real da data antes de comparar o par data/horário com o horário local atual. Centralizar regras no domínio/casos de uso; o controller apenas converte entrada HTTP, chama o caso de uso e escolhe a resposta.

Alternativa considerada: comparar datas como UTC. Rejeitada porque não há fuso no modelo e a agenda representa horário local; assumir UTC alteraria a interpretação esperada do horário inserido.

### Interface HTML renderizada pelo servidor

Express/EJS fornecerá páginas de listagem, criação, detalhes, edição, erro e não encontrado. Formulários HTML tradicionais enviarão `application/x-www-form-urlencoded`; após sucesso, o controller redirecionará para evitar reenvio do formulário. A exclusão usará confirmação nativa do navegador e uma rota POST.

Alternativa considerada: criar frontend SPA ou API REST separada. Rejeitada porque adicionaria stack e contratos fora do pedido.

### Erros e testes

Mapear erro de validação para 400, registro ausente para 404, conflito para 409 e falha inesperada para 500. Um middleware comum renderizará mensagens seguras sem stack trace ou detalhe SQL. Usar `node:test`/`node:assert`, Supertest para HTTP, doubles em memória para unitários e SQLite `:memory:` para integração. `app.js` exportará a aplicação sem abrir porta, permitindo testes HTTP.

Alternativa considerada: Jest/Vitest. Rejeitada em favor do runner nativo solicitado.

## Risks / Trade-offs

- [Fuso do servidor pode não coincidir com o local físico da agenda] → Documentar a interpretação de horário local, usar comportamento determinístico nos testes e manter a aplicação voltada a uma agenda local; suporte a múltiplos fusos exigiria uma decisão de produto e dados adicionais.
- [A instalação de `better-sqlite3` pode depender de binários compatíveis com a versão de Node disponível] → Confirmar versão LTS instalada e testar instalação e abertura do banco antes de avançar para a interface.
- [Arquivos Python permanecem na raiz e podem confundir novos contribuidores] → Documentar claramente no README qual é o comando/runtime principal e quais arquivos são legados preservados.
- [Erros do banco podem chegar inesperadamente à camada HTTP] → Traduzir conflito de unicidade conhecido para conflito de aplicação e manter a resposta genérica para outras falhas, sem ocultar o erro nos logs do servidor.

## Migration Plan

1. Criar o projeto Node e os arquivos novos sem remover nem mover os arquivos Python ou dados existentes.
2. Instalar dependências locais e criar o banco novo em `data/appointments.db`; não executar migração de usuários.
3. Validar camadas, testes e comandos npm antes de considerar o runtime Node principal pronto.
4. Para rollback, parar de usar os scripts npm e continuar executando o CRUD Python existente conforme suas instruções atuais. Como os ativos legados não são alterados, o rollback não exige restauração de arquivos ou dados.
