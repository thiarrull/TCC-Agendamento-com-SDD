# Sistema de Agendamento

Aplicação web monolítica para criar e gerenciar agendamentos. O projeto usa JavaScript e Node.js, com Express, templates EJS e SQLite local. O escopo é intencionalmente pequeno e mantém as responsabilidades separadas em camadas simples.

## Requisitos

- Node.js LTS (testado com Node.js 22)
- npm

## Instalação e execução

```sh
npm install
cp .env.example .env
npm run dev
```

Abra `http://localhost:3000`. Para iniciar sem reinício automático durante o desenvolvimento, use `npm start`. A porta pode ser alterada pela variável `PORT`.

## Arquitetura

```text
Browser
  ↓
Express Route
  ↓
Controller
  ↓
Use Case
  ↓
AppointmentRepository
  ↑
SQLiteAppointmentRepository
  ↓
SQLite
```

- **Domain** (`src/domain/`) contém Appointment e as regras de validação; não conhece Express nem SQLite.
- **Application** (`src/application/`) contém os casos de uso, erros da aplicação e contrato do repositório; não conhece Express.
- **Infrastructure** (`src/infrastructure/`) implementa a persistência com SQLite e o schema SQL.
- **Presentation** (`src/presentation/` e `views/`) lida com rotas, controllers, erros HTTP e páginas EJS.
- **Main** (`src/main/`) conecta as dependências no Composition Root e inicia o servidor.

O navegador envia formulários HTML ao Express. As rotas chamam controllers, que executam casos de uso. Os casos de uso aplicam as regras e usam o contrato do repositório; sua implementação SQLite persiste os dados. O controller então renderiza EJS ou redireciona após a operação.

## Estrutura principal

```text
src/
  domain/
  application/
    errors/
    repositories/
    use-cases/
  infrastructure/
    database/
    repositories/
  presentation/
    controllers/
    middlewares/
    routes/
  main/
public/
  css/
  js/
views/
  appointments/
  partials/
tests/
  doubles/
  http/
  integration/
  unit/
data/
```

## Banco de dados

Na primeira inicialização, a aplicação cria o diretório de dados quando necessário, abre o arquivo definido por `DATABASE_FILE` e executa o schema. O caminho padrão é `./data/appointments.db`, relativo ao diretório de execução. O arquivo `.db` local não deve ser versionado.

O arquivo `.env.example` contém os valores iniciais:

```env
PORT=3000
DATABASE_FILE=./data/appointments.db
```

O banco de agendamentos é separado do banco usado pelo CRUD Python preservado no projeto. Não há migração ou importação de usuários. Os testes de integração usam SQLite `:memory:` e não alteram os dados locais.

## Rotas

| Método | Caminho                    | Ação                                 |
| ------ | -------------------------- | ------------------------------------ |
| GET    | `/`                        | Redireciona para a listagem          |
| GET    | `/appointments`            | Lista agendamentos                   |
| GET    | `/appointments/new`        | Abre formulário de criação           |
| POST   | `/appointments`            | Cria agendamento                     |
| GET    | `/appointments/:id`        | Exibe detalhes                       |
| GET    | `/appointments/:id/edit`   | Abre formulário de edição            |
| POST   | `/appointments/:id/update` | Atualiza agendamento                 |
| POST   | `/appointments/:id/delete` | Exclui após confirmação no navegador |

## Regras de negócio

- Nome do cliente, serviço, data e horário são obrigatórios.
- Nome do cliente é normalizado com `trim()`.
- Data deve existir e usar `YYYY-MM-DD`; horário deve usar `HH:mm`.
- Não se aceitam agendamentos no passado. Como não há campo de fuso no modelo, data e horário são comparados no fuso local do processo servidor.
- Não é permitido cadastrar dois agendamentos na mesma data e horário. A aplicação verifica o conflito e o SQLite mantém uma restrição `UNIQUE` como proteção adicional.
- A edição preserva o agendamento atual ao verificar conflitos e mantém o timestamp de criação.
- Observações são opcionais e limitadas a 500 caracteres.
- Erros de validação, ausência, conflito e falhas inesperadas resultam em respostas HTTP 400, 404, 409 e 500, respectivamente. A página de erro não mostra detalhes internos.

## Testes e qualidade

```sh
npm test
npm run lint
npm run check
npm run format
npx prettier --check .
```

Os testes usam `node:test` e `node:assert`. O Supertest exercita as rotas HTTP e os testes SQLite usam bancos em memória. `npm run check` executa ESLint e toda a suíte de testes.

## Segurança, acessibilidade e responsividade

Helmet aplica cabeçalhos HTTP básicos. A interface usa HTML semântico, campos com labels, foco visível, mensagens compreensíveis e estilos CSS adaptáveis para celular, tablet e desktop. A exclusão usa confirmação nativa do navegador.

O sistema não possui autenticação nem autorização.

## Limitações intencionais

Este CRUD não inclui usuários, funcionários, múltiplas agendas, autenticação, pagamentos, notificações, e-mail, WhatsApp, calendário avançado, integração com Google Calendar, paginação, relatórios, dashboard, permissões ou API externa.

## Arquivos Python preservados

`main.py`, `models.py` e `database.py` pertencem ao CRUD Python/FastAPI que já existia no diretório. Foram preservados sem alterações e não fazem parte da inicialização da aplicação Node. Seus dados não são importados para o banco de agendamentos.

## Validação desta entrega

Em 7 de outubro de 2026, `npm run check` concluiu com ESLint aprovado e 27 testes aprovados; `npx prettier --check .` também passou e `npm audit` reportou zero vulnerabilidades. A validação local pelo navegador cobriu listagem, criação, detalhes, edição, conflito HTTP 409, confirmação e exclusão, além da persistência após reinício do servidor. Em viewport de 375 px, a página de formulário não apresentou overflow horizontal do documento.
