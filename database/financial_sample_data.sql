-- Dados de exemplo para o sistema financeiro
-- Execute após criar o schema principal

-- Função para inserir dados de exemplo
CREATE OR REPLACE FUNCTION insert_financial_sample_data()
RETURNS void AS $$
DECLARE
    user_id UUID;
    category_income_consultoria UUID;
    category_income_servicos UUID;
    category_expense_escritorio UUID;
    category_expense_marketing UUID;
    category_expense_pessoal UUID;
    bank_account_bb UUID;
    bank_account_itau UUID;
    payment_pix UUID;
    payment_cartao UUID;
    payment_transferencia UUID;
    payment_dinheiro UUID;
BEGIN
    -- Obter um usuário existente ou usar um ID padrão
    SELECT id INTO user_id FROM auth.users LIMIT 1;
    IF user_id IS NULL THEN
        user_id := '00000000-0000-0000-0000-000000000000';
    END IF;

    -- Inserir categorias de receita
    INSERT INTO financial_categories (id, name, description, type, color, icon, is_active, created_by, updated_by)
    VALUES 
        (gen_random_uuid(), 'Consultoria Médica', 'Receitas de consultoria e assessoria médica', 'income', '#10B981', 'stethoscope', true, user_id, user_id),
        (gen_random_uuid(), 'Serviços Especializados', 'Receitas de serviços médicos especializados', 'income', '#3B82F6', 'heart', true, user_id, user_id),
        (gen_random_uuid(), 'Treinamentos', 'Receitas de cursos e treinamentos', 'income', '#8B5CF6', 'graduation-cap', true, user_id, user_id),
        (gen_random_uuid(), 'Parcerias', 'Receitas de parcerias estratégicas', 'income', '#F59E0B', 'handshake', true, user_id, user_id)
    ON CONFLICT (name, type, parent_category_id) DO NOTHING;

    -- Inserir categorias de despesa
    INSERT INTO financial_categories (id, name, description, type, color, icon, is_active, created_by, updated_by)
    VALUES 
        (gen_random_uuid(), 'Escritório', 'Despesas de aluguel, energia, internet', 'expense', '#EF4444', 'building', true, user_id, user_id),
        (gen_random_uuid(), 'Marketing', 'Despesas com publicidade e marketing', 'expense', '#F97316', 'megaphone', true, user_id, user_id),
        (gen_random_uuid(), 'Pessoal', 'Salários, benefícios e encargos', 'expense', '#6366F1', 'users', true, user_id, user_id),
        (gen_random_uuid(), 'Tecnologia', 'Software, hardware e infraestrutura', 'expense', '#06B6D4', 'laptop', true, user_id, user_id),
        (gen_random_uuid(), 'Jurídico', 'Despesas legais e contábeis', 'expense', '#84CC16', 'scale', true, user_id, user_id)
    ON CONFLICT (name, type, parent_category_id) DO NOTHING;

    -- Obter IDs das categorias criadas
    SELECT id INTO category_income_consultoria FROM financial_categories WHERE name = 'Consultoria Médica' AND type = 'income';
    SELECT id INTO category_income_servicos FROM financial_categories WHERE name = 'Serviços Especializados' AND type = 'income';
    SELECT id INTO category_expense_escritorio FROM financial_categories WHERE name = 'Escritório' AND type = 'expense';
    SELECT id INTO category_expense_marketing FROM financial_categories WHERE name = 'Marketing' AND type = 'expense';
    SELECT id INTO category_expense_pessoal FROM financial_categories WHERE name = 'Pessoal' AND type = 'expense';

    -- Inserir contas bancárias
    INSERT INTO bank_accounts (id, name, bank, account_number, agency, account_type, balance, is_active, description, created_by, updated_by)
    VALUES 
        (gen_random_uuid(), 'Conta Corrente Principal', 'Banco do Brasil', '12345-6', '1234', 'checking', 150000.00, true, 'Conta principal para operações', user_id, user_id),
        (gen_random_uuid(), 'Conta Poupança', 'Itaú', '98765-4', '5678', 'savings', 75000.00, true, 'Conta para reserva de emergência', user_id, user_id),
        (gen_random_uuid(), 'Conta Investimento', 'Nubank', '11111-1', '0001', 'investment', 200000.00, true, 'Conta para investimentos', user_id, user_id)
    ON CONFLICT (bank, account_number, agency) DO NOTHING;

    -- Obter IDs das contas criadas
    SELECT id INTO bank_account_bb FROM bank_accounts WHERE bank = 'Banco do Brasil' AND account_number = '12345-6';
    SELECT id INTO bank_account_itau FROM bank_accounts WHERE bank = 'Itaú' AND account_number = '98765-4';

    -- Inserir formas de pagamento
    INSERT INTO payment_methods (id, name, type, description, is_active, bank_account_id, created_by, updated_by)
    VALUES 
        (gen_random_uuid(), 'PIX', 'pix', 'Pagamento via PIX', true, bank_account_bb, user_id, user_id),
        (gen_random_uuid(), 'Cartão de Crédito', 'credit_card', 'Pagamento via cartão de crédito', true, NULL, user_id, user_id),
        (gen_random_uuid(), 'Transferência Bancária', 'bank_transfer', 'Transferência entre contas', true, bank_account_bb, user_id, user_id),
        (gen_random_uuid(), 'Dinheiro', 'cash', 'Pagamento em espécie', true, NULL, user_id, user_id),
        (gen_random_uuid(), 'Cartão de Débito', 'debit_card', 'Pagamento via cartão de débito', true, bank_account_bb, user_id, user_id)
    ON CONFLICT (name) DO NOTHING;

    -- Obter IDs das formas de pagamento
    SELECT id INTO payment_pix FROM payment_methods WHERE name = 'PIX';
    SELECT id INTO payment_cartao FROM payment_methods WHERE name = 'Cartão de Crédito';
    SELECT id INTO payment_transferencia FROM payment_methods WHERE name = 'Transferência Bancária';
    SELECT id INTO payment_dinheiro FROM payment_methods WHERE name = 'Dinheiro';

    -- Inserir receitas de exemplo
    INSERT INTO revenues (description, amount, due_date, received_date, status, category_id, payment_method_id, bank_account_id, 
                         is_recurrent, client_name, invoice_number, notes, tags, created_by, updated_by)
    VALUES 
        ('Consultoria Hospital São Paulo', 25000.00, CURRENT_DATE + INTERVAL '15 days', NULL, 'pending', 
         category_income_consultoria, payment_transferencia, bank_account_bb, false, 'Hospital São Paulo', 'INV-2024-001', 
         'Consultoria para implementação de novo sistema', '["consultoria", "hospital"]', user_id, user_id),
        
        ('Treinamento Equipe Médica', 15000.00, CURRENT_DATE + INTERVAL '30 days', NULL, 'pending', 
         category_income_servicos, payment_pix, bank_account_bb, false, 'Clínica Santos', 'INV-2024-002', 
         'Treinamento para 20 profissionais', '["treinamento", "capacitacao"]', user_id, user_id),
        
        ('Consultoria Mensal - Cliente A', 8000.00, CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE - INTERVAL '25 days', 'confirmed', 
         category_income_consultoria, payment_transferencia, bank_account_bb, true, 'Cliente A', 'INV-2024-003', 
         'Consultoria mensal recorrente', '["mensal", "recorrente"]', user_id, user_id),
        
        ('Serviço Especializado', 12000.00, CURRENT_DATE - INTERVAL '5 days', NULL, 'overdue', 
         category_income_servicos, payment_cartao, bank_account_bb, false, 'Hospital Regional', 'INV-2024-004', 
         'Serviço especializado em cardiologia', '["especializado", "cardiologia"]', user_id, user_id);

    -- Inserir despesas de exemplo
    INSERT INTO expenses (description, amount, due_date, paid_date, status, category_id, payment_method_id, bank_account_id, 
                         is_recurrent, supplier_name, invoice_number, notes, tags, created_by, updated_by)
    VALUES 
        ('Aluguel Escritório', 5000.00, CURRENT_DATE + INTERVAL '10 days', NULL, 'pending', 
         category_expense_escritorio, payment_transferencia, bank_account_bb, true, 'Imobiliária Central', 'ALU-2024-01', 
         'Aluguel mensal do escritório', '["aluguel", "mensal"]', user_id, user_id),
        
        ('Campanha Google Ads', 3000.00, CURRENT_DATE + INTERVAL '20 days', NULL, 'pending', 
         category_expense_marketing, payment_cartao, NULL, false, 'Google', 'ADS-2024-001', 
         'Campanha de marketing digital', '["marketing", "digital"]', user_id, user_id),
        
        ('Salários Equipe', 45000.00, CURRENT_DATE + INTERVAL '25 days', NULL, 'pending', 
         category_expense_pessoal, payment_transferencia, bank_account_bb, true, 'Folha de Pagamento', 'SAL-2024-01', 
         'Salários da equipe técnica', '["salarios", "mensal"]', user_id, user_id),
        
        ('Energia Elétrica', 800.00, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '1 day', 'confirmed', 
         category_expense_escritorio, payment_transferencia, bank_account_bb, true, 'CPFL Energia', 'ENE-2024-001', 
         'Conta de energia do escritório', '["energia", "utilidades"]', user_id, user_id);

    -- Inserir configurações financeiras padrão
    INSERT INTO financial_settings (user_id, default_currency, fiscal_year_start, notification_settings, auto_approval_limits, backup_settings)
    VALUES (
        user_id,
        'BRL',
        1,
        '{
            "dueDateReminder": 3,
            "overdueReminder": 1,
            "recurrenceConfirmation": true,
            "lowBalanceAlert": 5000
        }',
        '{
            "revenue": 50000,
            "expense": 25000
        }',
        '{
            "autoBackup": true,
            "frequency": "weekly",
            "retentionDays": 90
        }'
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- Inserir algumas notificações de exemplo
    INSERT INTO financial_notifications (type, title, message, entity_type, entity_id, is_read, priority, action_required, due_date, created_by, updated_by)
    SELECT 
        'due_date',
        'Receita vencendo em breve',
        'A receita "' || description || '" vence em ' || (due_date - CURRENT_DATE) || ' dias.',
        'revenue',
        id,
        false,
        CASE WHEN (due_date - CURRENT_DATE) <= 3 THEN 'high' ELSE 'medium' END,
        true,
        due_date,
        user_id,
        user_id
    FROM revenues 
    WHERE status = 'pending' AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days';

    INSERT INTO financial_notifications (type, title, message, entity_type, entity_id, is_read, priority, action_required, due_date, created_by, updated_by)
    SELECT 
        'overdue',
        'Receita em atraso',
        'A receita "' || description || '" está em atraso há ' || (CURRENT_DATE - due_date) || ' dias.',
        'revenue',
        id,
        false,
        'high',
        true,
        due_date,
        user_id,
        user_id
    FROM revenues 
    WHERE status = 'overdue';

    RAISE NOTICE 'Dados de exemplo inseridos com sucesso!';
END;
$$ language 'plpgsql';

-- Executar a função para inserir os dados
SELECT insert_financial_sample_data();