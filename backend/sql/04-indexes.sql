-- Índices para otimização de performance

-- Índices para tabela employees
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_departamento ON employees(departamento);
CREATE INDEX IF NOT EXISTS idx_employees_cargo ON employees(cargo);

-- Índices para tabela tasks
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Índices para tabela leads
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_responsavel ON leads(responsavel);
CREATE INDEX IF NOT EXISTS idx_leads_origem ON leads(origem);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Índices para tabela clientes_pf
CREATE INDEX IF NOT EXISTS idx_clientes_pf_cpf ON clientes_pf(cpf);
CREATE INDEX IF NOT EXISTS idx_clientes_pf_email ON clientes_pf(email);
CREATE INDEX IF NOT EXISTS idx_clientes_pf_status ON clientes_pf(status);
CREATE INDEX IF NOT EXISTS idx_clientes_pf_responsavel ON clientes_pf(responsavel);

-- Índices para tabela clientes_pj
CREATE INDEX IF NOT EXISTS idx_clientes_pj_cnpj ON clientes_pj(cnpj);
CREATE INDEX IF NOT EXISTS idx_clientes_pj_email ON clientes_pj(email);
CREATE INDEX IF NOT EXISTS idx_clientes_pj_status ON clientes_pj(status);
CREATE INDEX IF NOT EXISTS idx_clientes_pj_responsavel ON clientes_pj(responsavel);

-- Índices para tabela contratos
CREATE INDEX IF NOT EXISTS idx_contratos_cliente_id ON contratos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_contratos_tipo_cliente ON contratos(tipo_cliente);
CREATE INDEX IF NOT EXISTS idx_contratos_status ON contratos(status);
CREATE INDEX IF NOT EXISTS idx_contratos_data_inicio ON contratos(data_inicio);
CREATE INDEX IF NOT EXISTS idx_contratos_data_fim ON contratos(data_fim);
CREATE INDEX IF NOT EXISTS idx_contratos_responsavel_comercial ON contratos(responsavel_comercial);

-- Índices para tabela irpf
CREATE INDEX IF NOT EXISTS idx_irpf_cliente_id ON irpf(cliente_id);
CREATE INDEX IF NOT EXISTS idx_irpf_tipo_cliente ON irpf(tipo_cliente);
CREATE INDEX IF NOT EXISTS idx_irpf_ano_calendario ON irpf(ano_calendario);
CREATE INDEX IF NOT EXISTS idx_irpf_status ON irpf(status);
CREATE INDEX IF NOT EXISTS idx_irpf_responsavel ON irpf(responsavel);

-- Índices para tabela notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Índices para tabela admin_documents
CREATE INDEX IF NOT EXISTS idx_admin_documents_tipo ON admin_documents(tipo);
CREATE INDEX IF NOT EXISTS idx_admin_documents_status ON admin_documents(status);
CREATE INDEX IF NOT EXISTS idx_admin_documents_criado_por ON admin_documents(criado_por);
CREATE INDEX IF NOT EXISTS idx_admin_documents_created_at ON admin_documents(created_at);

-- Índices para tabela time_entries
CREATE INDEX IF NOT EXISTS idx_time_entries_employee_id ON time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_data ON time_entries(data);
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON time_entries(status);

-- Índices para tabela admin_reports
CREATE INDEX IF NOT EXISTS idx_admin_reports_tipo ON admin_reports(tipo);
CREATE INDEX IF NOT EXISTS idx_admin_reports_status ON admin_reports(status);
CREATE INDEX IF NOT EXISTS idx_admin_reports_criado_por ON admin_reports(criado_por);

-- Índices para tabela audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tabela ON audit_logs(tabela);
CREATE INDEX IF NOT EXISTS idx_audit_logs_acao ON audit_logs(acao);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Índices para tabela expenses
CREATE INDEX IF NOT EXISTS idx_expenses_categoria_id ON expenses(categoria_id);
CREATE INDEX IF NOT EXISTS idx_expenses_conta_bancaria_id ON expenses(conta_bancaria_id);
CREATE INDEX IF NOT EXISTS idx_expenses_metodo_pagamento_id ON expenses(metodo_pagamento_id);
CREATE INDEX IF NOT EXISTS idx_expenses_data_vencimento ON expenses(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_criado_por ON expenses(criado_por);

-- Índices compostos para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_tasks_status_assigned ON tasks(status, assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_priority_due_date ON tasks(priority, due_date);
CREATE INDEX IF NOT EXISTS idx_leads_status_responsavel ON leads(status, responsavel);
CREATE INDEX IF NOT EXISTS idx_contratos_status_data ON contratos(status, data_inicio);
CREATE INDEX IF NOT EXISTS idx_expenses_status_data ON expenses(status, data_vencimento);