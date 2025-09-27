# 🤝 MedStaff — User Rules: Parceiros

## 1. Objetivo
Definir papéis, permissões e políticas para o **cadastro e gestão de parceiros** da MedStaff.

---

## 2. Estrutura do Cadastro
Campos principais [oai_citation:2‡Cadastro de parceiros - App MedStaff.docx](sediment://file_000000009a1461f78703bf7cd8846333):

- Identificação: ID do parceiro, Razão Social, Nome Fantasia, CNPJ.
- Contatos: endereço, telefone, e-mail, representante legal.
- Data de início da parceria.
- Condições comerciais.
- Benefício ofertado: nome, descrição, forma de acesso.
- Validade da oferta.
- Condições de elegibilidade.

---

## 3. Papéis & Permissões

### 3.1 Comercial
- Criar/editar cadastro de parceiro: `partner.create|update`
- Definir benefícios ofertados: `partner.benefit.create|update`
- Alterar condições comerciais: `partner.conditions.update`

### 3.2 Operacional
- Validar elegibilidade de clientes para benefícios: `partner.eligibility.validate`

### 3.3 Financeiro
- Acessar condições comerciais para conferência: `partner.finance.read`

### 3.4 Auditoria
- Somente leitura em todos os registros de parceiros: `partner.read`

---

## 4. Regras Especiais
- Alteração em benefícios ou condições comerciais exige aprovação de **Gerente Comercial**.
- Benefícios devem ter validade definida; não podem ser cadastrados “indeterminados”.
- Encerramento de parceria só pode ser feito por **SuperAdmin** ou **Gerente Comercial**.

---

## 5. Auditoria
Registrar:
- Criação/edição de cadastro de parceiro.
- Alterações em condições comerciais.
- Inclusão/alteração de benefícios.
- Encerramento de parceria.