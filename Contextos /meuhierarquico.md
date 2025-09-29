# 📘 MedStaff Plataforma Interna — User Rules & RBAC

## 1. Propósito
Este documento define as **regras de acesso** (RBAC) da plataforma interna **MedStaff**, garantindo:
- Controle seguro de permissões.
- Hierarquia clara de papéis e acessos.
- Segregação de responsabilidades por área (Comercial, Operacional, Financeiro, RH, etc.).
- Conformidade e rastreabilidade através de auditoria.

---

## 2. Estrutura Funcional (Menus)

Menus e submenus disponíveis [oai_citation:1‡Menus Hierárquicos- App MedStaff.docx](sediment://file_00000000dc6c61f787fa70c714b8c87b):

- **Dashboard**
- **Feed**
- **Tarefas**  
  - Visualização: Lista, Kanban, Calendário
- **Contatos**
  - Leads  
  - Clientes Pessoa Física  
  - Clientes Pessoa Jurídica  
  - Tomadores de Serviço  
  - Parceiros  
  - Time Interno (restrito a perfis específicos)  
- **Formulários de CRM**
- **Atividades**
  - Comercial  
    - Leads  
    - Gestão PJ  
    - Outros produtos  
  - Operacional  
    - Abertura de Empresa  
    - Alteração de Empresa  
    - Baixa de Empresa  
    - Emissão de Nota Fiscal  
    - Acompanhamento de Empresas  
    - IRPF  
  - Med Benefícios  
    - Duo Gourmet  
    - MedStaff + Saúde  
    - Apoio Doméstico  
  - Gestão de Negócios  
    - HeMet  
    - Consultoria Abertura de Clínicas  
  - Serviços com Parceiros  
    - Consultoria Financeira PF  
    - Restituição Previdenciária PF  
    - Auxílio Moradia Residência Médica  
    - Recuperação Tributária PJ  
- **Empresa**
  - Organograma  
  - Administrativo  
    - Documentos  
    - Ponto Interno  
  - Financeiro  
    - Cadastro de Despesas  
    - Lançamentos  
    - DRE  
  - Relacionamento  
    - Colaboradores  
    - Clientes  
    - SAC  
- **Notificações**
- **Chat Interno**
- **Perfil de Usuário**

---

## 3. Papéis Organizacionais (Roles)

### 3.1 Estratégicos
- **SuperAdmin** → acesso irrestrito, incluindo RBAC.
- **Diretoria** → visão consolidada de módulos Financeiro, Relatórios e Organograma.

### 3.2 Gerenciais
- **Gerente Comercial** → gestão de leads, clientes, parceiros e atividades comerciais.
- **Gerente Operacional** → gestão de serviços e fluxos operacionais.
- **Gerente Financeiro** → lançamentos, despesas, DRE.
- **Gerente RH** → ponto, documentos internos, colaboradores.

### 3.3 Táticos
- **Analista Comercial** → CRM, contatos, pipeline de leads.
- **Analista Operacional** → execução de tarefas (abertura/alteração/baixa empresa, NF).
- **Analista Financeiro** → despesas, lançamentos, relatórios financeiros.
- **Analista RH** → documentos internos, ponto, colaboradores.

### 3.4 Operacionais
- **Colaborador** → perfil próprio, tarefas atribuídas, notificações, chat.
- **Estagiário/Assistente** → acesso restrito (tarefas, feed).

### 3.5 Suporte & Auditoria
- **Suporte TI** → auditoria, logs, troubleshooting.
- **Auditor Interno** → somente leitura em dados críticos.

---

## 4. Permissões (Slugs)

### Gerais
- `dashboard.view`
- `feed.view`
- `tasks.view|create|update|delete`
- `notifications.view`
- `chat.view|send`
- `profile.view|update`

### Contatos
- `contacts.read|create|update|delete`
- `contacts.internal.view` (Time Interno restrito)

### CRM & Atividades
- `crm.forms.access`
- `activities.commercial.*`
- `activities.operational.*`
- `activities.benefits.*`
- `activities.business.*`
- `activities.partners.*`

### Empresa
- `org.chart.view`
- `admin.docs.read|upload|delete`
- `hr.attendance.read|update`
- `finance.expenses.create|update|delete`
- `finance.launches.create|update|delete`
- `finance.dre.view`
- `relationship.collaborators.read|update`
- `relationship.clients.read|update`
- `relationship.sac.read|respond`

### RBAC & Auditoria
- `rbac.role.manage`
- `rbac.user.manage`
- `audit.read`

---

## 5. Políticas de Acesso

- **SuperAdmin** → todas permissões.  
- **Gerentes** → `create|update` em seus módulos; `delete` restrito.  
- **Analistas** → acesso operacional dentro de escopo.  
- **Colaboradores** → perfil, tarefas, comunicação interna.  
- **Auditor** → apenas leitura (`read`).  

---

## 6. Regras Especiais

- **Time Interno**: visível apenas para RH, Gerência e SuperAdmin.  
- **Financeiro**: diretoria tem apenas leitura; operações restritas ao Financeiro.  
- **SAC**: apenas equipe de Relacionamento responde chamados.  
- **Tarefas**: todos visualizam; apenas criador e gestores editam/excluem.  

---

## 7. Auditoria

Todos os eventos críticos devem ser registrados em `audit_logs`:
- Usuário (actorId)  
- Ação (slug de permissão usada)  
- Entidade (ex.: `expense`, `contact`)  
- Entidade alvo (entityId)  
- Data/Hora  
- IP e UserAgent  
- Metadados (ex.: alterações feitas)

---

## 8. User Stories (Exemplos)

- **US-01**: Como **Gerente Comercial**, quero atribuir leads a analistas.  
- **US-02**: Como **Gerente Financeiro**, quero aprovar lançamentos para atualizar o DRE.  
- **US-03**: Como **Analista Operacional**, quero emitir NF e registrar no sistema.  
- **US-04**: Como **Colaborador**, quero visualizar minhas tarefas em Kanban.  
- **US-05**: Como **Auditor**, quero consultar relatórios financeiros em modo leitura.  

---

## 9. Critérios de Aceite (Definition of Done)

- Rotas protegidas via middleware `hasPermission`.  
- Usuário só enxerga módulos permitidos no menu.  
- Auditoria ativa em ações críticas (financeiro, documentos, SAC).  
- Seeds com papéis e permissões definidos.  
- Testes cobrindo fluxos críticos (financeiro, comercial, operacional).  