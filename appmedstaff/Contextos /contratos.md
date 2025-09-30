# 📑 MedStaff — User Rules: Contratos

## 1. Objetivo
Regras para elaboração, versionamento e gestão de contratos vinculados a clientes e serviços.

---

## 2. Estrutura do Contrato
Baseado no documento de elaboração de contrato [oai_citation:10‡CAPTAÇÃO - ELABORAÇÃO DE CONTRATO MEDSTAFF.docx](sediment://file_00000000c1e061fa83b82862c814a15b):

- Dados do cliente (PF ou PJ).
- Número do contrato e validade.
- Serviços contratados.
- Condições comerciais e cláusulas jurídicas.
- Documentos anexos.
- Status: rascunho, ativo, suspenso, encerrado.

---

## 3. Papéis & Permissões

### Comercial
- Criar contratos vinculados a propostas: `contract.create`
- Editar condições comerciais: `contract.update.commercial`

### Jurídico
- Revisar cláusulas e aprovar: `contract.approve.legal`
- Controlar versões de contrato: `contract.version.manage`

### Financeiro
- Consultar condições comerciais para faturamento: `contract.finance.read`

### Auditoria
- Somente leitura em todos os contratos: `contract.read`

---

## 4. Regras Especiais
- Contrato só entra em vigor após aprovação do Jurídico.
- Toda alteração gera nova versão (não sobrescrever).
- Contratos vencidos devem ser sinalizados no dashboard.

---

## 5. Auditoria
- Criação e versões de contrato.
- Aprovação ou rejeição de cláusulas.
- Alterações em condições comerciais.