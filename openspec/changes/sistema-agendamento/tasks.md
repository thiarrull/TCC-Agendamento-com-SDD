# Tasks

## 1. Bootstrap do projeto e proteção do legado

- [x] 1.1 Confirmar a versão LTS de Node.js/npm disponível e identificar os arquivos Python e eventual banco de usuários que devem permanecer intocados; verificar que não há `package.json` preexistente.
- [x] 1.2 Criar `package.json` com scripts `dev`, `start`, `test`, `lint`, `format` e `check`, instalar somente as dependências definidas no design e confirmar que `npm install` termina sem erro.
- [x] 1.3 Adicionar `.gitignore`, `.env.example`, configuração simples de ESLint/Prettier e `data/.gitkeep`; verificar que `.env` e arquivos `.db` são ignorados e que nenhuma configuração contém segredos.

## 2. Domain e Application

- [x] 2.1 Criar entidade Appointment e erros de aplicação para validação, ausência e conflito; adicionar testes unitários de obrigatoriedade, trim do nome, datas/horários reais, passado e limite de observações e confirmar que `node --test` passa.
- [x] 2.2 Criar contrato de repositório, repositório em memória exclusivo dos testes e casos de uso de criação, leitura, listagem, atualização e exclusão; adicionar testes unitários para ordenação, UUID/timestamps, inexistência, conflito e preservação de `createdAt`, e confirmar que `node --test` passa.
- [x] 2.3 Executar `npm run lint` e formatar os arquivos Domain/Application; confirmar que o lint passa sem desativar regras.

## 3. Persistência SQLite

- [x] 3.1 Criar schema e inicialização automática do banco com caminho configurável, diretório criado quando necessário e restrição única de data/horário; verificar inicialização sem banco pré-criado e sem tocar no banco legado.
- [x] 3.2 Implementar o repositório SQLite com consultas parametrizadas; adicionar testes de integração em `:memory:` para criação, busca, listagem ordenada, conflito único, atualização e exclusão, e confirmar que `node --test` passa.
- [x] 3.3 Executar `npm run lint` e atualizar instruções técnicas do README sobre o arquivo de banco, inicialização automática e isolamento dos dados legados; verificar os exemplos documentados contra a configuração criada.

## 4. Camada HTTP e Composition Root

- [x] 4.1 Implementar controller, rotas HTML e middleware de erro para os códigos 400, 404, 409 e 500; adicionar testes HTTP com Supertest para rotas de listagem, formulário, detalhe, edição, exclusão e respostas de erro, confirmando que `node --test` passa.
- [x] 4.2 Criar Composition Root, `app.js` exportável para testes e `server.js` com porta configurável; confirmar por testes HTTP que a aplicação pode ser importada sem abrir uma porta e que `GET /` redireciona para `/appointments`.
- [x] 4.3 Verificar que respostas de erro inesperado não expõem stack trace, SQL, caminho interno ou dados do banco; confirmar o cenário com teste HTTP e executar `npm run lint`.

## 5. Views e experiência web

- [x] 5.1 Criar templates EJS para listagem vazia/preenchida, formulário novo/edição, detalhes, 404 e erro; verificar por testes HTTP o conteúdo principal, mensagens de validação e redirecionamentos após sucesso.
- [x] 5.2 Criar CSS responsivo e JavaScript mínimo para confirmação de exclusão; verificar que os formulários têm labels e controles date/time, que o foco é visível e que a interface permanece utilizável em viewport móvel.
- [x] 5.3 Completar README com objetivo, stack, arquitetura, estrutura, instalação, execução, testes, banco, rotas, regras de negócio, limitações e identificação explícita dos arquivos Python preservados como legado; verificar que cada comando documentado corresponde a um script npm existente.

## 6. Verificação integrada

- [x] 6.1 Executar `npm run check`, `npx prettier --check .` e a suíte completa `npm test`; corrigir falhas na causa e repetir até todos os comandos terminarem com sucesso.
- [x] 6.2 Iniciar o servidor e validar via navegador quando disponível ou requisições HTTP reais, cobrindo listagem vazia, criação, detalhe, edição, conflito, exclusão e persistência após reinício; registrar os resultados observados sem afirmar interações não executadas.
- [x] 6.3 Confirmar que o banco de agendamentos é criado no caminho configurado, que `.env`/bancos não são versionados e que os arquivos/dados do CRUD Python continuam inalterados; finalizar a documentação com os resultados reais das verificações.
