# OpenSpec Proposal: Sistema de Agendamento Full Stack (Vibe Coding Autônomo)

## 1. Visão Geral e Objetivo
Construir um sistema Full Stack monolítico e enxuto para gerenciamento de agendamentos, desenvolvido de forma autônoma via Vibe Coding[cite: 6, 7]. O projeto possui escopo de nível júnior, priorizando clareza, simplicidade e manutenibilidade através de uma Clean Architecture simplificada[cite: 6, 7, 8].

O sistema deve permitir as seguintes operações básicas (CRUD):
* Criar agendamento[cite: 6, 11]
* Listar agendamentos[cite: 6]
* Visualizar detalhes de um agendamento[cite: 6, 18]
* Editar agendamento[cite: 6, 18]
* Excluir agendamento[cite: 6, 18]

---

## 2. Pilares Arquiteturais e Filosofia
* **Filosofia:** Clareza > Sofisticação; Simplicidade > Abstrações; Código Explícito > Mágica; Poucas dependências; Funcionamento > Arquitetura exagerada[cite: 7].
* **Modelo:** Monolítico (repositório único, backend Express e frontend EJS integrados, sem microserviços ou Docker)[cite: 7, 8, 9].
* **Camadas (Clean Architecture Simplificada):**
  * `Domain`: Entidade pura de negócio (`Appointment.js`), sem dependências externas[cite: 13, 14].
  * `Application`: Casos de uso e contratos de repositórios[cite: 14, 15].
  * `Infrastructure`: Banco de dados SQLite (`better-sqlite3`) e implementações de repositório[cite: 16, 17].
  * `Presentation`: Controladores, rotas do Express, middlewares e views em EJS[cite: 17, 18, 19, 20].
  * `Main`: Composition Root, inicialização do aplicativo (`app.js`) e do servidor (`server.js`)[cite: 19].

---

## 3. Stack Tecnológica Obrigatória
* **Linguagem / Runtime:** JavaScript (CommonJS/ESM nativo) executado em Node.js (LTS)[cite: 8]. (Sem TypeScript)[cite: 8].
* **Backend:** Express.js[cite: 8].
* **Frontend:** EJS, HTML semântico, CSS puro e JavaScript básico no navegador[cite: 8, 9]. (Sem React, Vue, Tailwind ou Bootstrap)[cite: 9].
* **Banco de Dados:** SQLite via `better-sqlite3`[cite: 9]. O arquivo de dados reside em `./data/appointments.db` (não versionado)[cite: 9, 26].
* **Segurança e Utilitários:** `helmet` para segurança HTTP básica, `dotenv` para variáveis de ambiente e `nodemon` para desenvolvimento[cite: 9, 26].
* **Qualidade e Testes:** `node:test`, `node:assert`, `Supertest`, `ESLint` e `Prettier`[cite: 10].

---

## 4. Entidade e Regras de Negócio (Appointment)
### Campos
* `id`: String UUID gerada via `crypto.randomUUID()`[cite: 11].
* `clientName`: Nome do cliente (Obrigatório, com `trim()`)[cite: 11].
* `service`: Descrição do serviço (Obrigatório)[cite: 11].
* `appointmentDate`: Data no formato `YYYY-MM-DD` (Obrigatória)[cite: 11, 12].
* `appointmentTime`: Horário no formato `HH:mm` (Obrigatório)[cite: 12].
* `notes`: Observações opcionais (limite de 500 caracteres)[cite: 12].
* `createdAt` / `updatedAt`: Timestamps automáticos em formato ISO 8601[cite: 12].

### Restrições e RNs
* **RN-001 a RN-004:** Validação de obrigatoriedade dos campos principais (`clientName`, `service`, `appointmentDate`, `appointmentTime`)[cite: 12].
* **RN-005 & RN-006:** Validação estrita dos formatos de data (`YYYY-MM-DD`) e hora (`HH:mm`)[cite: 13].
* **RN-007:** Proibição de criação de agendamentos com data/hora no passado[cite: 13].
* **RN-008 & RN-009:** Proibição estrita de conflitos de horário (mesma data e horário). Na edição, o próprio registro deve ser desconsiderado na verificação[cite: 13]. Protegido também em nível de banco de dados via restrição `UNIQUE(appointment_date, appointment_time)`[cite: 16].
* **RN-010:** Limite de 500 caracteres para o campo `notes`[cite: 13].

---

## 5. Tratamento de Erros HTTP
Mapeamento de exceções da aplicação para códigos de status HTTP:
* `ValidationError` $\rightarrow$ `400 Bad Request`[cite: 22]
* `AppointmentNotFoundError` $\rightarrow$ `404 Not Found`[cite: 22]
* `AppointmentConflictError` $\rightarrow$ `409 Conflict`[cite: 22]
* Erros desconhecidos $\rightarrow$ `500 Internal Server Error` (protegendo informações internas do banco e stack trace)[cite: 22].

---

## 6. Critérios de Conclusão e Entrega (Definition of Done)
O projeto será considerado concluído e validado quando:
1. O servidor iniciar sem erros e o banco SQLite for criado automaticamente[cite: 30].
2. O fluxo completo de CRUD estiver funcional via interface web e persistindo os dados corretamente[cite: 30].
3. A regra de bloqueio de conflito de horários estiver ativa e testada[cite: 30].
4. Todos os conjuntos de testes (unitários, de integração com banco em memória `:memory:`, e HTTP com Supertest) passarem com sucesso[cite: 17, 23, 30].
5. As regras de lint (`ESLint`) e formatação estiverem estritamente atendidas[cite: 10, 30].
6. O arquivo `README.md` estiver completo com instruções claras de instalação, execução e limitações arquiteturais intencionais[cite: 27, 30, 31].