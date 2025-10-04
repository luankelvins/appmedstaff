-- Schema completo para o sistema financeiro do MedStaff
-- Execute este script no SQL Editor do Supabase

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabela de Categorias Financeiras
CREATE TABLE IF NOT EXISTS financial_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  color VARCHAR(7) NOT NULL DEFAULT '#6B7280', -- Hex color
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  parent_category_id UUID REFERENCES financial_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  updated_by UUID REFERENCES auth.users(id) NOT NULL,
  
  CONSTRAINT unique_category_name_per_type UNIQUE (name, type, parent_category_id)
);

-- 2. Tabela de Contas Bancárias
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  bank VARCHAR(100) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  agency VARCHAR(20) NOT NULL,
  account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('checking', 'savings', 'investment')),
  balance DECIMAL(15,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  updated_by UUID REFERENCES auth.users(id) NOT NULL,
  
  CONSTRAINT unique_account_number UNIQUE (bank, account_number, agency)
);

-- 3. Tabela de Formas de Pagamento
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'pix', 'check', 'other')),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  bank_account_id UUID REFERENCES bank_accounts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  updated_by UUID REFERENCES auth.users(id) NOT NULL,
  
  CONSTRAINT unique_payment_method_name UNIQUE (name)
);

-- 4. Tabela de Receitas
CREATE TABLE IF NOT EXISTS revenues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  received_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'overdue')),
  category_id UUID REFERENCES financial_categories(id) NOT NULL,
  payment_method_id UUID REFERENCES payment_methods(id) NOT NULL,
  bank_account_id UUID REFERENCES bank_accounts(id),
  
  -- Configuração de recorrência
  is_recurrent BOOLEAN DEFAULT false,
  recurrence_period VARCHAR(20) CHECK (recurrence_period IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semiannual', 'annual')),
  recurrence_interval INTEGER DEFAULT 1,
  recurrence_end_date DATE,
  max_occurrences INTEGER,
  next_due_date DATE,
  last_generated_date DATE,
  parent_transaction_id UUID REFERENCES revenues(id),
  
  -- Informações adicionais
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  client_id UUID,
  client_name VARCHAR(255),
  invoice_number VARCHAR(100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  updated_by UUID REFERENCES auth.users(id) NOT NULL
);

-- 5. Tabela de Despesas
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  paid_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'overdue')),
  category_id UUID REFERENCES financial_categories(id) NOT NULL,
  payment_method_id UUID REFERENCES payment_methods(id) NOT NULL,
  bank_account_id UUID REFERENCES bank_accounts(id),
  
  -- Configuração de recorrência
  is_recurrent BOOLEAN DEFAULT false,
  recurrence_period VARCHAR(20) CHECK (recurrence_period IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semiannual', 'annual')),
  recurrence_interval INTEGER DEFAULT 1,
  recurrence_end_date DATE,
  max_occurrences INTEGER,
  next_due_date DATE,
  last_generated_date DATE,
  parent_transaction_id UUID REFERENCES expenses(id),
  
  -- Informações adicionais
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  supplier_id UUID,
  supplier_name VARCHAR(255),
  invoice_number VARCHAR(100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  updated_by UUID REFERENCES auth.users(id) NOT NULL
);

-- 6. Tabela de Histórico de Alterações
CREATE TABLE IF NOT EXISTS financial_change_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('revenue', 'expense', 'category', 'payment_method', 'bank_account')),
  entity_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  field_name VARCHAR(100),
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  updated_by UUID REFERENCES auth.users(id) NOT NULL
);

-- 7. Tabela de Notificações Financeiras
CREATE TABLE IF NOT EXISTS financial_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(30) NOT NULL CHECK (type IN ('due_date', 'overdue', 'recurrence_confirmation', 'low_balance')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('revenue', 'expense', 'bank_account')),
  entity_id UUID NOT NULL,
  is_read BOOLEAN DEFAULT false,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  action_required BOOLEAN DEFAULT false,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  updated_by UUID REFERENCES auth.users(id) NOT NULL
);

-- 8. Tabela de Relatórios Financeiros
CREATE TABLE IF NOT EXISTS financial_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('cash_flow', 'profit_loss', 'category_analysis', 'payment_method_analysis', 'dre', 'custom')),
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,
  filters JSONB DEFAULT '{}',
  data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  generated_by UUID REFERENCES auth.users(id) NOT NULL
);

-- 9. Tabela de Configurações Financeiras
CREATE TABLE IF NOT EXISTS financial_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  default_currency VARCHAR(3) DEFAULT 'BRL',
  fiscal_year_start INTEGER DEFAULT 1 CHECK (fiscal_year_start BETWEEN 1 AND 12),
  notification_settings JSONB DEFAULT '{
    "dueDateReminder": 3,
    "overdueReminder": 1,
    "recurrenceConfirmation": true,
    "lowBalanceAlert": 1000
  }',
  auto_approval_limits JSONB DEFAULT '{
    "revenue": 10000,
    "expense": 5000
  }',
  backup_settings JSONB DEFAULT '{
    "autoBackup": true,
    "frequency": "weekly",
    "retentionDays": 90
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para otimização de performance
CREATE INDEX IF NOT EXISTS idx_financial_categories_type ON financial_categories(type);
CREATE INDEX IF NOT EXISTS idx_financial_categories_active ON financial_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_active ON bank_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON payment_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_methods_type ON payment_methods(type);

CREATE INDEX IF NOT EXISTS idx_revenues_status ON revenues(status);
CREATE INDEX IF NOT EXISTS idx_revenues_due_date ON revenues(due_date);
CREATE INDEX IF NOT EXISTS idx_revenues_category ON revenues(category_id);
CREATE INDEX IF NOT EXISTS idx_revenues_payment_method ON revenues(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_revenues_recurrent ON revenues(is_recurrent);
CREATE INDEX IF NOT EXISTS idx_revenues_created_at ON revenues(created_at);

CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_due_date ON expenses(due_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_payment_method ON expenses(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_expenses_recurrent ON expenses(is_recurrent);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at);

CREATE INDEX IF NOT EXISTS idx_financial_change_history_entity ON financial_change_history(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_financial_change_history_created_at ON financial_change_history(created_at);

CREATE INDEX IF NOT EXISTS idx_financial_notifications_read ON financial_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_financial_notifications_type ON financial_notifications(type);
CREATE INDEX IF NOT EXISTS idx_financial_notifications_priority ON financial_notifications(priority);

-- Triggers para atualização automática de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_financial_categories_updated_at BEFORE UPDATE ON financial_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_revenues_updated_at BEFORE UPDATE ON revenues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_notifications_updated_at BEFORE UPDATE ON financial_notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_settings_updated_at BEFORE UPDATE ON financial_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar saldo da conta bancária
CREATE OR REPLACE FUNCTION update_bank_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar saldo quando uma receita é confirmada
    IF TG_TABLE_NAME = 'revenues' THEN
        IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' AND NEW.bank_account_id IS NOT NULL THEN
            UPDATE bank_accounts 
            SET balance = balance + NEW.amount 
            WHERE id = NEW.bank_account_id;
        ELSIF OLD.status = 'confirmed' AND NEW.status != 'confirmed' AND NEW.bank_account_id IS NOT NULL THEN
            UPDATE bank_accounts 
            SET balance = balance - NEW.amount 
            WHERE id = NEW.bank_account_id;
        END IF;
    END IF;
    
    -- Atualizar saldo quando uma despesa é confirmada
    IF TG_TABLE_NAME = 'expenses' THEN
        IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' AND NEW.bank_account_id IS NOT NULL THEN
            UPDATE bank_accounts 
            SET balance = balance - NEW.amount 
            WHERE id = NEW.bank_account_id;
        ELSIF OLD.status = 'confirmed' AND NEW.status != 'confirmed' AND NEW.bank_account_id IS NOT NULL THEN
            UPDATE bank_accounts 
            SET balance = balance + NEW.amount 
            WHERE id = NEW.bank_account_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_balance_on_revenue_change AFTER UPDATE ON revenues FOR EACH ROW EXECUTE FUNCTION update_bank_account_balance();
CREATE TRIGGER update_balance_on_expense_change AFTER UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_bank_account_balance();

-- Função para verificar status de vencimento
CREATE OR REPLACE FUNCTION update_overdue_status()
RETURNS void AS $$
BEGIN
    -- Atualizar receitas vencidas
    UPDATE revenues 
    SET status = 'overdue' 
    WHERE status = 'pending' 
    AND due_date < CURRENT_DATE;
    
    -- Atualizar despesas vencidas
    UPDATE expenses 
    SET status = 'overdue' 
    WHERE status = 'pending' 
    AND due_date < CURRENT_DATE;
END;
$$ language 'plpgsql';

-- Comentários nas tabelas
COMMENT ON TABLE financial_categories IS 'Categorias para classificação de receitas e despesas';
COMMENT ON TABLE bank_accounts IS 'Contas bancárias da empresa';
COMMENT ON TABLE payment_methods IS 'Formas de pagamento disponíveis';
COMMENT ON TABLE revenues IS 'Receitas da empresa';
COMMENT ON TABLE expenses IS 'Despesas da empresa';
COMMENT ON TABLE financial_change_history IS 'Histórico de alterações nas entidades financeiras';
COMMENT ON TABLE financial_notifications IS 'Notificações relacionadas ao sistema financeiro';
COMMENT ON TABLE financial_reports IS 'Relatórios financeiros gerados';
COMMENT ON TABLE financial_settings IS 'Configurações do sistema financeiro por usuário';