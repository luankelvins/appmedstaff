-- Políticas RLS (Row Level Security)

-- Habilitar RLS em todas as tabelas
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes_pf ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes_pj ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE irpf ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Função para obter o usuário atual (simulação para PostgreSQL local)
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
    -- Para PostgreSQL local, retorna um UUID padrão ou obtém de configuração
    RETURN COALESCE(
        current_setting('app.current_user_id', true)::UUID,
        '00000000-0000-0000-0000-000000000000'::UUID
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role 
    FROM employees 
    WHERE id = get_current_user_id();
    
    RETURN COALESCE(user_role IN ('admin', 'superadmin'), false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para tabela employees
CREATE POLICY "employees_select_policy" ON employees
    FOR SELECT USING (
        is_admin() OR 
        id = get_current_user_id()
    );

CREATE POLICY "employees_insert_policy" ON employees
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "employees_update_policy" ON employees
    FOR UPDATE USING (
        is_admin() OR 
        id = get_current_user_id()
    );

CREATE POLICY "employees_delete_policy" ON employees
    FOR DELETE USING (is_admin());

-- Políticas para tabela tasks
CREATE POLICY "tasks_select_policy" ON tasks
    FOR SELECT USING (
        is_admin() OR 
        assigned_to = get_current_user_id() OR
        created_by = get_current_user_id()
    );

CREATE POLICY "tasks_insert_policy" ON tasks
    FOR INSERT WITH CHECK (
        is_admin() OR 
        created_by = get_current_user_id()
    );

CREATE POLICY "tasks_update_policy" ON tasks
    FOR UPDATE USING (
        is_admin() OR 
        assigned_to = get_current_user_id() OR
        created_by = get_current_user_id()
    );

CREATE POLICY "tasks_delete_policy" ON tasks
    FOR DELETE USING (
        is_admin() OR 
        created_by = get_current_user_id()
    );

-- Políticas para tabela leads
CREATE POLICY "leads_select_policy" ON leads
    FOR SELECT USING (
        is_admin() OR 
        responsavel = get_current_user_id()
    );

CREATE POLICY "leads_insert_policy" ON leads
    FOR INSERT WITH CHECK (
        is_admin() OR 
        responsavel = get_current_user_id()
    );

CREATE POLICY "leads_update_policy" ON leads
    FOR UPDATE USING (
        is_admin() OR 
        responsavel = get_current_user_id()
    );

CREATE POLICY "leads_delete_policy" ON leads
    FOR DELETE USING (is_admin());

-- Políticas para tabela clientes_pf
CREATE POLICY "clientes_pf_select_policy" ON clientes_pf
    FOR SELECT USING (
        is_admin() OR 
        responsavel = get_current_user_id()
    );

CREATE POLICY "clientes_pf_insert_policy" ON clientes_pf
    FOR INSERT WITH CHECK (
        is_admin() OR 
        responsavel = get_current_user_id()
    );

CREATE POLICY "clientes_pf_update_policy" ON clientes_pf
    FOR UPDATE USING (
        is_admin() OR 
        responsavel = get_current_user_id()
    );

CREATE POLICY "clientes_pf_delete_policy" ON clientes_pf
    FOR DELETE USING (is_admin());

-- Políticas para tabela clientes_pj
CREATE POLICY "clientes_pj_select_policy" ON clientes_pj
    FOR SELECT USING (
        is_admin() OR 
        responsavel = get_current_user_id()
    );

CREATE POLICY "clientes_pj_insert_policy" ON clientes_pj
    FOR INSERT WITH CHECK (
        is_admin() OR 
        responsavel = get_current_user_id()
    );

CREATE POLICY "clientes_pj_update_policy" ON clientes_pj
    FOR UPDATE USING (
        is_admin() OR 
        responsavel = get_current_user_id()
    );

CREATE POLICY "clientes_pj_delete_policy" ON clientes_pj
    FOR DELETE USING (is_admin());

-- Políticas para tabela contratos
CREATE POLICY "contratos_select_policy" ON contratos
    FOR SELECT USING (
        is_admin() OR 
        responsavel_comercial = get_current_user_id() OR
        responsavel_juridico = get_current_user_id()
    );

CREATE POLICY "contratos_insert_policy" ON contratos
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "contratos_update_policy" ON contratos
    FOR UPDATE USING (
        is_admin() OR 
        responsavel_comercial = get_current_user_id() OR
        responsavel_juridico = get_current_user_id()
    );

CREATE POLICY "contratos_delete_policy" ON contratos
    FOR DELETE USING (is_admin());

-- Políticas para tabela irpf
CREATE POLICY "irpf_select_policy" ON irpf
    FOR SELECT USING (
        is_admin() OR 
        responsavel = get_current_user_id()
    );

CREATE POLICY "irpf_insert_policy" ON irpf
    FOR INSERT WITH CHECK (
        is_admin() OR 
        responsavel = get_current_user_id()
    );

CREATE POLICY "irpf_update_policy" ON irpf
    FOR UPDATE USING (
        is_admin() OR 
        responsavel = get_current_user_id()
    );

CREATE POLICY "irpf_delete_policy" ON irpf
    FOR DELETE USING (is_admin());

-- Políticas para tabela notifications
CREATE POLICY "notifications_select_policy" ON notifications
    FOR SELECT USING (
        is_admin() OR 
        user_id = get_current_user_id()
    );

CREATE POLICY "notifications_insert_policy" ON notifications
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "notifications_update_policy" ON notifications
    FOR UPDATE USING (
        is_admin() OR 
        user_id = get_current_user_id()
    );

CREATE POLICY "notifications_delete_policy" ON notifications
    FOR DELETE USING (
        is_admin() OR 
        user_id = get_current_user_id()
    );

-- Políticas para tabelas administrativas (apenas admins)
CREATE POLICY "admin_documents_policy" ON admin_documents
    FOR ALL USING (is_admin());

CREATE POLICY "admin_reports_policy" ON admin_reports
    FOR ALL USING (is_admin());

CREATE POLICY "audit_logs_policy" ON audit_logs
    FOR SELECT USING (is_admin());

CREATE POLICY "system_settings_policy" ON system_settings
    FOR ALL USING (is_admin());

-- Políticas para tabela time_entries
CREATE POLICY "time_entries_select_policy" ON time_entries
    FOR SELECT USING (
        is_admin() OR 
        employee_id = get_current_user_id()
    );

CREATE POLICY "time_entries_insert_policy" ON time_entries
    FOR INSERT WITH CHECK (
        is_admin() OR 
        employee_id = get_current_user_id()
    );

CREATE POLICY "time_entries_update_policy" ON time_entries
    FOR UPDATE USING (
        is_admin() OR 
        employee_id = get_current_user_id()
    );

CREATE POLICY "time_entries_delete_policy" ON time_entries
    FOR DELETE USING (is_admin());

-- Políticas para tabela time_validations
CREATE POLICY "time_validations_policy" ON time_validations
    FOR ALL USING (is_admin());

-- Políticas para tabelas financeiras
CREATE POLICY "financial_categories_policy" ON financial_categories
    FOR ALL USING (is_admin());

CREATE POLICY "bank_accounts_policy" ON bank_accounts
    FOR ALL USING (is_admin());

CREATE POLICY "payment_methods_policy" ON payment_methods
    FOR ALL USING (is_admin());

CREATE POLICY "expenses_select_policy" ON expenses
    FOR SELECT USING (
        is_admin() OR 
        criado_por = get_current_user_id()
    );

CREATE POLICY "expenses_insert_policy" ON expenses
    FOR INSERT WITH CHECK (
        is_admin() OR 
        criado_por = get_current_user_id()
    );

CREATE POLICY "expenses_update_policy" ON expenses
    FOR UPDATE USING (
        is_admin() OR 
        criado_por = get_current_user_id()
    );

CREATE POLICY "expenses_delete_policy" ON expenses
    FOR DELETE USING (is_admin());