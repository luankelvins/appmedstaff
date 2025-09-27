# ⚙️ MedStaff — User Rules: Serviços Especiais

## 1. Objetivo
Definir regras e permissões para serviços específicos ofertados pela MedStaff.

---

## 2. Estrutura dos Serviços
Baseado nos documentos de captação [oai_citation:12‡CAPTAÇÃO - RESTITUIÇÃO DE AUXÍLIO MORADIA (RESIDÊNCIA).docx](sediment://file_000000008250620a8d2a77baa15193a3) [oai_citation:13‡CAPTAÇÃO - RECUPERAÇÃO TRIBUTÁRIA DE PESSOA JURÍDICA .docx](sediment://file_00000000805861f484c58240d6938847) [oai_citation:14‡CAPTAÇÃO - RESTITUIÇÃO PREVIDENCIÁRIA DE PESSOA FÍSICA .docx](sediment://file_00000000515461f59a98ad5c36b3c0bc) [oai_citation:15‡CAPTAÇÃO - ALTERAÇÃO DE PJ.docx](sediment://file_00000000042c6246822ec57468de69a8):

- **Auxílio Moradia (Residência Médica)**
  - Dados pessoais do médico.
  - Contrato de residência.
  - Comprovantes de aluguel.
- **Recuperação Tributária PJ**
  - Dados da empresa.
  - Documentos fiscais e balanços.
  - Comprovantes de pagamentos indevidos.
- **Restituição Previdenciária PF**
  - Dados pessoais.
  - Documentos de contribuição.
  - Requerimento administrativo.
- **Alteração de PJ**
  - Dados da empresa.
  - Contrato social atualizado.
  - Documentos dos sócios.

---

## 3. Papéis & Permissões

### Comercial
- Abrir processos de serviço: `service.process.create`
- Coletar documentos do cliente: `service.docs.collect`

### Operacional
- Validar documentos e executar análises: `service.process.update`
- Finalizar etapas de serviço: `service.process.complete`

### Financeiro
- Consultar impactos fiscais/tributários: `service.finance.read`

### Auditoria
- Acesso somente leitura: `service.read`

---

## 4. Regras Especiais
- Cada serviço deve gerar um **card vinculado ao cliente**.
- Campos obrigatórios devem ser validados antes de prosseguir.
- Exclusão de processo só por **Gerente Operacional**.

---

## 5. Auditoria
- Registro de criação de processo.
- Alterações em documentos e status.
- Conclusão do serviço.