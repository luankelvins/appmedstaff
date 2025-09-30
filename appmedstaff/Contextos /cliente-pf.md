# 👤 MedStaff — User Rules: Cliente Pessoa Física (PF)

## 1. Objetivo
Definir papéis e permissões para o **cadastro e gestão de clientes PF** na plataforma interna MedStaff.

---

## 2. Estrutura do Card PF
Principais seções [oai_citation:1‡CARD PF.pdf](sediment://file_000000007f9461f7b0be1dc1469e46ef):

- Informações pessoais (nome, nascimento, estado civil, documentos, endereço).
- Dados profissionais (profissão, conselhos de classe, diplomas).
- Vínculos empregatícios e empresas relacionadas (PJ e tomadores).
- Certificado digital PF (arquivo, senha, prazo de renovação).
- Dados bancários (PIX, agência, conta).
- Contratos e serviços contratados (IRPF, benefícios, apoio doméstico, Duo Gourmet etc).
- Upload de documentos (RG, comprovantes, contratos, diplomas).
- Registro de interações com cliente.

---

## 3. Papéis & Permissões

### 3.1 Comercial
- Criar/editar cadastro PF: `clientpf.create|update`
- Gerenciar contratos/benefícios: `clientpf.contract.create|update`
- Registrar interações: `clientpf.interaction.create`

### 3.2 Operacional
- Upload/validação de documentos: `clientpf.docs.upload|validate`
- Gerenciar certificado digital PF: `clientpf.cert.manage`
- Manter vínculos com PJ/Tomadores: `clientpf.vinculo.update`

### 3.3 Financeiro
- Consultar dados bancários e repasses: `clientpf.finance.read`

### 3.4 RH
- Consultar/validar conselhos de classe e registros profissionais: `clientpf.professional.read|validate`

### 3.5 Auditoria
- Somente leitura em dados PF: `clientpf.read`

---

## 4. Regras Especiais
- Campos obrigatórios: Nome, CPF, Captação, Responsável.
- Upload de documentos deve validar formato e manter histórico.
- Renovação de certificado digital: notificar responsável em **D-30 e D-15**.
- Estado civil → exige anexos adicionais em certos casos (ex.: casamento → certidão).

---

## 5. Auditoria
Registrar:
- Criação/edição/exclusão de clientes PF.
- Alterações em certificado digital.
- Alterações em vínculos PJ/Tomadores.
- Upload/exclusão de documentos.