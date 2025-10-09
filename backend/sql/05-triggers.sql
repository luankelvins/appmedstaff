-- Triggers para auditoria e validações automáticas

-- Triggers para updated_at em todas as tabelas
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_pf_updated_at
    BEFORE UPDATE ON clientes_pf
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_pj_updated_at
    BEFORE UPDATE ON clientes_pj
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contratos_updated_at
    BEFORE UPDATE ON contratos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_irpf_updated_at
    BEFORE UPDATE ON irpf
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_documents_updated_at
    BEFORE UPDATE ON admin_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at
    BEFORE UPDATE ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_validations_updated_at
    BEFORE UPDATE ON time_validations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_reports_updated_at
    BEFORE UPDATE ON admin_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_categories_updated_at
    BEFORE UPDATE ON financial_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_accounts_updated_at
    BEFORE UPDATE ON bank_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Função para auditoria automática
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, acao, tabela, dados_antigos, ip_address, user_agent)
        VALUES (
            COALESCE(current_setting('app.current_user_id', true)::UUID, NULL),
            'DELETE',
            TG_TABLE_NAME,
            row_to_json(OLD),
            COALESCE(current_setting('app.client_ip', true)::INET, '127.0.0.1'::INET),
            current_setting('app.user_agent', true)
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, acao, tabela, dados_antigos, dados_novos, ip_address, user_agent)
        VALUES (
            COALESCE(current_setting('app.current_user_id', true)::UUID, NULL),
            'UPDATE',
            TG_TABLE_NAME,
            row_to_json(OLD),
            row_to_json(NEW),
            COALESCE(current_setting('app.client_ip', true)::INET, '127.0.0.1'::INET),
            current_setting('app.user_agent', true)
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, acao, tabela, dados_novos, ip_address, user_agent)
        VALUES (
            COALESCE(current_setting('app.current_user_id', true)::UUID, NULL),
            'INSERT',
            TG_TABLE_NAME,
            row_to_json(NEW),
            COALESCE(current_setting('app.client_ip', true)::INET, '127.0.0.1'::INET),
            current_setting('app.user_agent', true)
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers de auditoria para tabelas críticas
CREATE TRIGGER audit_employees_trigger
    AFTER INSERT OR UPDATE OR DELETE ON employees
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_tasks_trigger
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_contratos_trigger
    AFTER INSERT OR UPDATE OR DELETE ON contratos
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_irpf_trigger
    AFTER INSERT OR UPDATE OR DELETE ON irpf
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_expenses_trigger
    AFTER INSERT OR UPDATE OR DELETE ON expenses
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Função para validação de CPF
CREATE OR REPLACE FUNCTION validate_cpf(cpf TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    cpf_clean TEXT;
    sum1 INTEGER := 0;
    sum2 INTEGER := 0;
    i INTEGER;
    digit1 INTEGER;
    digit2 INTEGER;
BEGIN
    -- Remove caracteres não numéricos
    cpf_clean := regexp_replace(cpf, '[^0-9]', '', 'g');
    
    -- Verifica se tem 11 dígitos
    IF length(cpf_clean) != 11 THEN
        RETURN FALSE;
    END IF;
    
    -- Verifica se todos os dígitos são iguais
    IF cpf_clean ~ '^(\d)\1{10}$' THEN
        RETURN FALSE;
    END IF;
    
    -- Calcula primeiro dígito verificador
    FOR i IN 1..9 LOOP
        sum1 := sum1 + (substring(cpf_clean, i, 1)::INTEGER * (11 - i));
    END LOOP;
    
    digit1 := 11 - (sum1 % 11);
    IF digit1 >= 10 THEN
        digit1 := 0;
    END IF;
    
    -- Calcula segundo dígito verificador
    FOR i IN 1..10 LOOP
        sum2 := sum2 + (substring(cpf_clean, i, 1)::INTEGER * (12 - i));
    END LOOP;
    
    digit2 := 11 - (sum2 % 11);
    IF digit2 >= 10 THEN
        digit2 := 0;
    END IF;
    
    -- Verifica se os dígitos calculados conferem
    RETURN (substring(cpf_clean, 10, 1)::INTEGER = digit1 AND 
            substring(cpf_clean, 11, 1)::INTEGER = digit2);
END;
$$ LANGUAGE plpgsql;

-- Função para validação de CNPJ
CREATE OR REPLACE FUNCTION validate_cnpj(cnpj TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    cnpj_clean TEXT;
    sum1 INTEGER := 0;
    sum2 INTEGER := 0;
    i INTEGER;
    digit1 INTEGER;
    digit2 INTEGER;
    weights1 INTEGER[] := ARRAY[5,4,3,2,9,8,7,6,5,4,3,2];
    weights2 INTEGER[] := ARRAY[6,5,4,3,2,9,8,7,6,5,4,3,2];
BEGIN
    -- Remove caracteres não numéricos
    cnpj_clean := regexp_replace(cnpj, '[^0-9]', '', 'g');
    
    -- Verifica se tem 14 dígitos
    IF length(cnpj_clean) != 14 THEN
        RETURN FALSE;
    END IF;
    
    -- Verifica se todos os dígitos são iguais
    IF cnpj_clean ~ '^(\d)\1{13}$' THEN
        RETURN FALSE;
    END IF;
    
    -- Calcula primeiro dígito verificador
    FOR i IN 1..12 LOOP
        sum1 := sum1 + (substring(cnpj_clean, i, 1)::INTEGER * weights1[i]);
    END LOOP;
    
    digit1 := sum1 % 11;
    IF digit1 < 2 THEN
        digit1 := 0;
    ELSE
        digit1 := 11 - digit1;
    END IF;
    
    -- Calcula segundo dígito verificador
    FOR i IN 1..13 LOOP
        sum2 := sum2 + (substring(cnpj_clean, i, 1)::INTEGER * weights2[i]);
    END LOOP;
    
    digit2 := sum2 % 11;
    IF digit2 < 2 THEN
        digit2 := 0;
    ELSE
        digit2 := 11 - digit2;
    END IF;
    
    -- Verifica se os dígitos calculados conferem
    RETURN (substring(cnpj_clean, 13, 1)::INTEGER = digit1 AND 
            substring(cnpj_clean, 14, 1)::INTEGER = digit2);
END;
$$ LANGUAGE plpgsql;