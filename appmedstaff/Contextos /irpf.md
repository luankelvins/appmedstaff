# 🧾 MedStaff — User Rules: Declaração de IRPF

## 1. Objetivo
Definir regras para captação de documentos e execução de serviços de **Declaração IRPF**.

---

## 2. Estrutura do Formulário
Baseado no documento de captação de IRPF [oai_citation:11‡CAPTAÇÃO - DECLARAÇÃO DO IMPOSTO DE RENDA - IRPF.docx](sediment://file_000000004e8461f5b54a40d44b74b567):

- Dados pessoais e dependentes.
- Documentos: RG, CPF, comprovante residência, declaração anterior.
- Comprovantes de saúde, educação, investimentos, imóveis, veículos.
- Informes de rendimentos (CLT, autônomo, previdência privada).
- Informações bancárias para restituição.
- Doações, consórcios, contratos sociais.
- Status da declaração: rascunho, em análise, entregue.

---

## 3. Papéis & Permissões

### Comercial
- Registrar cliente e abrir processo: `irpf.process.create`

### Operacional
- Validar documentos: `irpf.docs.validate`
- Preencher campos da declaração: `irpf.process.update`
- Marcar como entregue: `irpf.process.complete`

### Financeiro
- Conferir restituições vinculadas: `irpf.finance.read`

### Auditoria
- Acesso somente leitura: `irpf.read`

---

## 4. Regras Especiais
- Campos obrigatórios não podem ser ignorados (ex.: CPF, dependentes).
- Upload de comprovantes deve permitir múltiplos anexos por categoria.
- Datas de entrega devem ser controladas por alertas automáticos.

---

## 5. Auditoria
- Registro de upload de documentos.
- Registro de entregas de declarações.
- Histórico de revisões do processo IRPF.