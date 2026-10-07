# Spec Delta

## Purpose

Esta capacidade permite que visitantes gerenciem agendamentos em uma aplicação web simples, com dados persistentes e horários sem sobreposição. Ela cobre o fluxo completo de cadastro, consulta, alteração e remoção, bem como as validações e respostas observáveis.

## ADDED Requirements

### Requirement: Gerenciar agendamentos pela interface web
O sistema SHALL permitir criar, listar, visualizar, editar e excluir agendamentos por páginas HTML renderizadas pelo servidor.

#### Scenario: Abrir a listagem
- **WHEN** o visitante acessa `GET /appointments`
- **THEN** o sistema apresenta os agendamentos ordenados por data e horário crescentes

#### Scenario: Listagem sem registros
- **WHEN** não há agendamentos cadastrados
- **THEN** o sistema apresenta a mensagem "Nenhum agendamento encontrado."

#### Scenario: Abrir formulários e detalhes
- **WHEN** o visitante acessa `GET /appointments/new`, `GET /appointments/{id}`, ou `GET /appointments/{id}/edit` para um agendamento existente
- **THEN** o sistema apresenta, respectivamente, formulário de criação, detalhes ou formulário de edição

#### Scenario: Criar, atualizar e excluir
- **WHEN** o visitante envia um formulário válido a `POST /appointments`, `POST /appointments/{id}/update` ou `POST /appointments/{id}/delete`
- **THEN** o sistema aplica a operação e redireciona para uma página apropriada após a conclusão

#### Scenario: Acessar a página inicial
- **WHEN** o visitante acessa `GET /`
- **THEN** o sistema redireciona para `/appointments`

### Requirement: Validar dados de agendamento
O sistema SHALL exigir nome do cliente, serviço, data e horário válidos e SHALL limitar as observações a 500 caracteres.

#### Scenario: Receber dados válidos
- **WHEN** o visitante envia nome do cliente, serviço, data `YYYY-MM-DD` e horário `HH:mm` válidos, com observações opcionais
- **THEN** o sistema aceita os dados e remove espaços extras no início e fim do nome do cliente

#### Scenario: Receber dados obrigatórios ausentes ou malformados
- **WHEN** o visitante envia um campo obrigatório vazio, data inexistente ou fora de `YYYY-MM-DD`, horário inválido ou fora de `HH:mm`
- **THEN** o sistema não grava o agendamento e apresenta uma mensagem de validação compreensível

#### Scenario: Exceder limite das observações
- **WHEN** o visitante envia observações com mais de 500 caracteres
- **THEN** o sistema não grava a operação e informa o limite permitido

#### Scenario: Agendar no passado
- **WHEN** o visitante tenta criar ou editar agendamento cuja data e horário já passaram no fuso horário local do servidor
- **THEN** o sistema rejeita os dados com erro de validação

### Requirement: Impedir conflitos de horário
O sistema SHALL impedir que dois agendamentos ocupem a mesma data e horário e SHALL preservar essa restrição ao editar.

#### Scenario: Criar horário já ocupado
- **WHEN** o visitante tenta criar um agendamento para uma data e horário já ocupados
- **THEN** o sistema não cria o registro e informa o conflito

#### Scenario: Editar para horário ocupado por outro registro
- **WHEN** o visitante altera um agendamento para a data e horário de outro agendamento
- **THEN** o sistema rejeita a alteração e mantém os dados existentes

#### Scenario: Manter o mesmo horário ao editar
- **WHEN** o visitante edita um agendamento sem conflitar com outro registro, inclusive mantendo sua própria data e horário
- **THEN** o sistema salva a alteração sem tratar o próprio agendamento como conflito

### Requirement: Persistir e identificar agendamentos
O sistema SHALL atribuir identificador único a cada agendamento, registrar datas de criação e alteração e preservar registros entre reinicializações do servidor.

#### Scenario: Registrar agendamento
- **WHEN** um agendamento válido é criado
- **THEN** o sistema persiste seus campos, um identificador UUID e timestamps ISO 8601 de criação e atualização

#### Scenario: Atualizar agendamento
- **WHEN** um agendamento existente é editado
- **THEN** o sistema preserva o identificador e timestamp de criação e atualiza o timestamp de alteração

#### Scenario: Reiniciar o servidor
- **WHEN** o servidor é encerrado e iniciado novamente com o mesmo arquivo de dados
- **THEN** os agendamentos previamente gravados continuam disponíveis

### Requirement: Comunicar falhas sem expor detalhes internos
O sistema SHALL comunicar erros de validação, ausência e conflito com respostas apropriadas e SHALL ocultar stack traces e detalhes internos de falhas inesperadas.

#### Scenario: Recurso inexistente
- **WHEN** o visitante solicita detalhes, edição ou exclusão de um identificador inexistente
- **THEN** o sistema responde com página de não encontrado e status HTTP 404

#### Scenario: Submissão inválida ou conflitante
- **WHEN** uma requisição de criação ou edição contém dados inválidos ou horário ocupado
- **THEN** o sistema responde com status HTTP 400 para validação ou 409 para conflito e mensagem compreensível

#### Scenario: Falha inesperada
- **WHEN** ocorre erro não previsto durante uma requisição
- **THEN** o sistema responde com status HTTP 500 sem mostrar stack trace, caminho interno ou detalhes do banco

### Requirement: Oferecer formulários acessíveis e layout responsivo
O sistema SHALL apresentar controles de formulário rotulados, navegação compreensível, foco visível e layout utilizável em telas móveis, tablets e desktops.

#### Scenario: Usar formulário de agendamento
- **WHEN** o visitante abre formulário de criação ou edição
- **THEN** os campos têm rótulos associados e controles apropriados para data, horário e observações

#### Scenario: Usar interface em tela pequena
- **WHEN** o visitante acessa as páginas em viewport de celular
- **THEN** conteúdo e ações permanecem utilizáveis sem exigir rolagem horizontal descontrolada

#### Scenario: Confirmar exclusão
- **WHEN** o visitante inicia a exclusão de um agendamento
- **THEN** o navegador solicita confirmação antes de enviar a operação
