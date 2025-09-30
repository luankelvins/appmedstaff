# 👥 MedStaff — User Rules: Time Interno

## 1. Objetivo
Definir papéis, permissões e políticas para o **cadastro e gestão do Time Interno** (colaboradores da MedStaff).

---

## 2. Estrutura do Card (Time Interno)
Baseado no documento oficial [oai_citation:0‡TIME INTERNO.pdf](sediment://file_00000000b8c061f4929ecf0eda9943f6):

- Dados pessoais: nome, CPF, RG, data de nascimento, endereço, contato.
- Dados profissionais: cargo, departamento, gestor responsável.
- Jornada de trabalho: escala, carga horária, regime.
- ASO (Atestado de Saúde Ocupacional): admissional, periódico, demissional.
- Dependentes: nome, grau de parentesco, data de nascimento.
- Dados financeiros: salário, benefícios, dados bancários.
- Documentos: contrato de trabalho, comprovantes, certificados.

---

## 3. Papéis & Permissões

### RH
- Criar/editar colaborador: `employee.create|update`
- Gerenciar documentos: `employee.docs.upload|update`
- Atualizar jornada e ASO: `employee.attendance.update`
- Atualizar benefícios e salário: `employee.finance.update`

### Gestor de Área
- Consultar dados de sua equipe: `employee.read.team`
- Validar ponto interno: `employee.attendance.validate`

### Financeiro
- Consultar dados bancários e salariais: `employee.finance.read`

### Auditoria
- Somente leitura em todos os dados: `employee.read`

---

## 4. Regras Especiais
- Alteração salarial exige aprovação de Gerente RH + registro em auditoria.
- ASO deve ter validade vinculada ao calendário do eSocial.
- Exclusão de colaborador apenas via desligamento formal (soft delete).

---

## 5. Auditoria
Registrar:
- Criação/edição de colaborador.
- Alterações financeiras.
- Alterações em jornada ou ASO.