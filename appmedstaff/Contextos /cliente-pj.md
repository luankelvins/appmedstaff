# 🏢 MedStaff — User Rules: Cliente Pessoa Jurídica (PJ)

## 1. Objetivo
Definir as regras de acesso (RBAC), papéis e permissões para **cadastro e gestão de clientes PJ** na plataforma interna MedStaff.

---

## 2. Estrutura do Card PJ
Campos e seções principais [oai_citation:0‡CARD PJ.pdf](sediment://file_000000007e2461f7a410826381053658):

- Dados cadastrais básicos (Razão Social, Nome Fantasia, CNPJ, Endereço, Contato, Representante legal).
- Informações societárias e contratuais.
- Certificado digital PJ (arquivo, senha, prazo de renovação).
- Contratos e serviços contratados (abertura, alteração, gestão de PJ, BPO, benefícios).
- Documentos obrigatórios (certidões, comprovantes, contratos).
- Vínculos com clientes PF e tomadores de serviço.

---

## 3. Papéis & Permissões

### 3.1 Comercial
- Criar/editar cadastro de PJ: `clientpj.create|update`
- Gerenciar contratos e serviços: `clientpj.contract.create|update`
- Upload de documentos: `clientpj.docs.upload`

### 3.2 Operacional
- Alterar status (ativo/inativo/cancelado): `clientpj.status.update`
- Gerenciar certificados digitais (renovação e prazos): `clientpj.cert.manage`
- Atualizar vínculos com PF/Tomadores: `clientpj.vinculo.update`

### 3.3 Financeiro
- Consultar contratos e repasses: `clientpj.contract.read`
- Validar informações fiscais: `clientpj.fiscal.read`

### 3.4 Auditoria
- Somente leitura em todos os dados de PJ: `clientpj.read`

---

## 4. Regras Especiais
- Renovação de certificado digital deve disparar notificações em **D-30 e D-15**.
- Documentos anexados devem manter histórico de versão (não sobrescrever).
- Exclusão de PJ apenas por **SuperAdmin**.

---

## 5. Auditoria
Registrar:
- Criação/edição/exclusão de PJ.
- Alterações em certificado digital.
- Alterações em vínculos com PF/Tomadores.