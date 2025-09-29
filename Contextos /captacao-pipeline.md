# 📊 MedStaff — User Rules: Captação & Pipeline Comercial

## 1. Objetivo
Definir regras para uso dos **Formulários de CRM** e automações do pipeline comercial.

---

## 2. Estrutura dos Formulários
Baseado nos documentos de captação [oai_citation:1‡CAPTAÇÃO - RESTITUIÇÃO DE AUXÍLIO MORADIA (RESIDÊNCIA).docx](sediment://file_000000008250620a8d2a77baa15193a3) [oai_citation:2‡CAPTAÇÃO DE DOCUMENTOS PARA ELABORAÇÃO DE PROPOSTA COMERCIAL PARA GESTÃO DE PESSOAS JURÍDICAS.docx](sediment://file_000000006d8861f8a235ad5a337da37b) [oai_citation:3‡CAPTAÇÃO - RECUPERAÇÃO TRIBUTÁRIA DE PESSOA JURÍDICA .docx](sediment://file_00000000805861f484c58240d6938847) [oai_citation:4‡CAPTAÇÃO - ABERTURA DE PJ COM OU SEM BPO .docx](sediment://file_000000006f2061f6a8874ad817f139ad) [oai_citation:5‡CAPTAÇÃO - RESTITUIÇÃO PREVIDENCIÁRIA DE PESSOA FÍSICA .docx](sediment://file_00000000515461f59a98ad5c36b3c0bc) [oai_citation:6‡CAPTAÇÃO - ALTERAÇÃO DE PJ.docx](sediment://file_00000000042c6246822ec57468de69a8) [oai_citation:7‡CAPTAÇÃO - ELABORAÇÃO DE CONTRATO MEDSTAFF.docx](sediment://file_00000000c1e061fa83b82862c814a15b) [oai_citation:8‡CAPTAÇÃO - DECLARAÇÃO DO IMPOSTO DE RENDA - IRPF.docx](sediment://file_000000004e8461f5b54a40d44b74b567) [oai_citation:9‡Automações - Pipeline COMERCIAL.docx](sediment://file_0000000098c461f48a6d7b724794c849):

- Propostas comerciais (PJ, PF, Alterações, Abertura).
- Contratos e serviços vinculados.
- Documentos obrigatórios (IRPF, comprovantes, certidões).
- Pipeline automatizado:
  - Captação → Proposta → Contrato → Execução → Encerramento.
- Automação: tarefas, notificações, geração de cards de cliente.

---

## 3. Papéis & Permissões

### Comercial
- Criar/editar formulários de captação: `pipeline.form.create|update`
- Gerar propostas comerciais: `pipeline.proposal.create`
- Vincular leads/clientes: `pipeline.link.contact`

### Operacional
- Validar documentos recebidos: `pipeline.docs.validate`
- Atualizar status do pipeline: `pipeline.stage.update`

### TI/Automação
- Configurar automações do pipeline: `pipeline.automation.manage`

### Auditoria
- Acesso somente leitura: `pipeline.read`

---

## 4. Regras Especiais
- Campos obrigatórios devem impedir avanço no pipeline.
- IDs de cliente e contrato vinculados automaticamente em cada etapa.
- Alteração manual de status só permitida a Gerente Comercial.

---

## 5. Auditoria
- Registro de cada avanço de etapa.
- Uploads de documentos vinculados ao card de cliente.
- Geração de contratos a partir de propostas.