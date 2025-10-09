import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTablesAndProvideInstructions() {
  console.log('🚀 Verificando tabelas financeiras no Supabase...\n');

  try {
    // Tentar acessar a tabela financial_categories
    const { error: testError } = await supabase
      .from('financial_categories')
      .select('id')
      .limit(1);

    if (testError && (testError.message.includes('does not exist') || testError.message.includes('schema cache'))) {
      console.log('❌ As tabelas financeiras não existem no Supabase.');
      console.log('\n📋 INSTRUÇÕES PARA CRIAR AS TABELAS:');
      console.log('=' .repeat(80));
      console.log('1. Acesse o Supabase Dashboard:');
      console.log('   🔗 https://supabase.com/dashboard/project/okhnuikljprxavymnlkn/editor');
      console.log('\n2. Clique em "SQL Editor" no menu lateral');
      console.log('\n3. Cole e execute o SQL abaixo:');
      console.log('=' .repeat(80));
      console.log(getCompleteSQL());
      console.log('=' .repeat(80));
      console.log('\n4. Após executar o SQL, execute este script novamente:');
      console.log('   📝 npm run setup-db');
      console.log('=' .repeat(80));
    } else if (testError) {
      console.error('❌ Erro ao verificar tabelas:', testError.message);
    } else {
      console.log('✅ Tabelas já existem! Inserindo dados de exemplo...');
      await insertSampleData();
    }

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error.message);
  }
}

function getCompleteSQL() {
  return `-- ========================================
-- SCRIPT DE CRIAÇÃO DAS TABELAS FINANCEIRAS
-- ========================================

-- Criar tabela de categorias financeiras
CREATE TABLE IF NOT EXISTS financial_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
  icon VARCHAR(50),
  parent_category_id UUID REFERENCES financial_categories(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Criar índices para categorias
CREATE INDEX IF NOT EXISTS idx_financial_categories_type ON financial_categories(type);
CREATE INDEX IF NOT EXISTS idx_financial_categories_active ON financial_categories(is_active);

-- Criar tabela de contas bancárias
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  created_by UUID,
  updated_by UUID
);

-- Criar índices para contas bancárias
CREATE INDEX IF NOT EXISTS idx_bank_accounts_active ON bank_accounts(is_active);

-- Criar tabela de métodos de pagamento
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'pix', 'check', 'other')),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  bank_account_id UUID REFERENCES bank_accounts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Criar índices para métodos de pagamento
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON payment_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_methods_type ON payment_methods(type);

-- Criar tabela de receitas
CREATE TABLE IF NOT EXISTS revenues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  due_date DATE NOT NULL,
  received_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'overdue')),
  category_id UUID NOT NULL REFERENCES financial_categories(id),
  payment_method_id UUID NOT NULL REFERENCES payment_methods(id),
  bank_account_id UUID REFERENCES bank_accounts(id),
  is_recurrent BOOLEAN DEFAULT false,
  recurrence_config JSONB,
  client_name VARCHAR(200),
  invoice_number VARCHAR(100),
  notes TEXT,
  tags TEXT[],
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Criar índices para receitas
CREATE INDEX IF NOT EXISTS idx_revenues_status ON revenues(status);
CREATE INDEX IF NOT EXISTS idx_revenues_due_date ON revenues(due_date);
CREATE INDEX IF NOT EXISTS idx_revenues_category ON revenues(category_id);

-- Criar tabela de despesas
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'overdue')),
  category_id UUID NOT NULL REFERENCES financial_categories(id),
  payment_method_id UUID NOT NULL REFERENCES payment_methods(id),
  bank_account_id UUID REFERENCES bank_accounts(id),
  is_recurrent BOOLEAN DEFAULT false,
  recurrence_config JSONB,
  supplier_name VARCHAR(200),
  invoice_number VARCHAR(100),
  notes TEXT,
  tags TEXT[],
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Criar índices para despesas
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_due_date ON expenses(due_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_financial_categories_updated_at BEFORE UPDATE ON financial_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_revenues_updated_at BEFORE UPDATE ON revenues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- INSERIR DADOS DE EXEMPLO
-- ========================================

-- Inserir categorias de exemplo
INSERT INTO financial_categories (name, type, color, icon, description) VALUES
('Vendas', 'income', '#10b981', 'TrendingUp', 'Receitas de vendas'),
('Serviços', 'income', '#3b82f6', 'Briefcase', 'Receitas de serviços'),
('Consultoria', 'income', '#8b5cf6', 'Users', 'Receitas de consultoria'),
('Escritório', 'expense', '#ef4444', 'Building', 'Despesas de escritório'),
('Marketing', 'expense', '#f59e0b', 'Megaphone', 'Despesas de marketing'),
('Tecnologia', 'expense', '#06b6d4', 'Monitor', 'Despesas com tecnologia');

-- Inserir contas bancárias de exemplo
INSERT INTO bank_accounts (name, bank, account_number, agency, account_type, balance, description) VALUES
('Conta Principal', 'Banco do Brasil', '12345-6', '1234', 'checking', 50000.00, 'Conta corrente principal da empresa'),
('Conta Poupança', 'Caixa Econômica', '98765-4', '5678', 'savings', 25000.00, 'Conta poupança para reservas');

-- Inserir métodos de pagamento de exemplo
INSERT INTO payment_methods (name, type, description) VALUES
('Dinheiro', 'cash', 'Pagamentos em dinheiro'),
('PIX', 'pix', 'Transferências via PIX'),
('Cartão de Crédito', 'credit_card', 'Pagamentos com cartão de crédito'),
('Cartão de Débito', 'debit_card', 'Pagamentos com cartão de débito'),
('Transferência Bancária', 'bank_transfer', 'Transferências bancárias'),
('Boleto', 'other', 'Pagamentos via boleto bancário');`;
}

async function insertSampleData() {
  console.log('\n📄 Verificando dados de exemplo...');
  
  try {
    // Verificar se já existem categorias
    const { data: existingCategories, error: categoriesError } = await supabase
      .from('financial_categories')
      .select('id')
      .limit(1);

    if (categoriesError) {
      console.error('❌ Erro ao acessar financial_categories:', categoriesError.message);
      return;
    }

    if (existingCategories && existingCategories.length > 0) {
      console.log('✅ Dados já existem no banco!');
      
      // Mostrar estatísticas
      const { data: categoriesCount } = await supabase
        .from('financial_categories')
        .select('id', { count: 'exact' });
      
      const { data: accountsCount } = await supabase
        .from('bank_accounts')
        .select('id', { count: 'exact' });
        
      const { data: paymentMethodsCount } = await supabase
        .from('payment_methods')
        .select('id', { count: 'exact' });

      console.log('\n📊 Estatísticas do banco:');
      console.log(`   📂 Categorias: ${categoriesCount?.length || 0}`);
      console.log(`   🏦 Contas bancárias: ${accountsCount?.length || 0}`);
      console.log(`   💳 Métodos de pagamento: ${paymentMethodsCount?.length || 0}`);
      
      console.log('\n🎉 Sistema financeiro configurado e pronto para uso!');
      return;
    }

    console.log('📝 Tabelas existem mas estão vazias. Inserindo dados de exemplo...');
    
    // Inserir categorias
    console.log('📂 Inserindo categorias...');
    const { error: categoriesInsertError } = await supabase
      .from('financial_categories')
      .insert([
        { name: 'Vendas', type: 'income', color: '#10b981', icon: 'TrendingUp', description: 'Receitas de vendas' },
        { name: 'Serviços', type: 'income', color: '#3b82f6', icon: 'Briefcase', description: 'Receitas de serviços' },
        { name: 'Consultoria', type: 'income', color: '#8b5cf6', icon: 'Users', description: 'Receitas de consultoria' },
        { name: 'Escritório', type: 'expense', color: '#ef4444', icon: 'Building', description: 'Despesas de escritório' },
        { name: 'Marketing', type: 'expense', color: '#f59e0b', icon: 'Megaphone', description: 'Despesas de marketing' },
        { name: 'Tecnologia', type: 'expense', color: '#06b6d4', icon: 'Monitor', description: 'Despesas com tecnologia' }
      ]);

    if (categoriesInsertError) {
      console.error('❌ Erro ao inserir categorias:', categoriesInsertError.message);
    } else {
      console.log('✅ Categorias inseridas com sucesso!');
    }

    // Inserir contas bancárias
    console.log('🏦 Inserindo contas bancárias...');
    const { error: accountsInsertError } = await supabase
      .from('bank_accounts')
      .insert([
        {
          name: 'Conta Principal',
          bank: 'Banco do Brasil',
          account_number: '12345-6',
          agency: '1234',
          account_type: 'checking',
          balance: 50000.00,
          description: 'Conta corrente principal da empresa'
        },
        {
          name: 'Conta Poupança',
          bank: 'Caixa Econômica',
          account_number: '98765-4',
          agency: '5678',
          account_type: 'savings',
          balance: 25000.00,
          description: 'Conta poupança para reservas'
        }
      ]);

    if (accountsInsertError) {
      console.error('❌ Erro ao inserir contas bancárias:', accountsInsertError.message);
    } else {
      console.log('✅ Contas bancárias inseridas com sucesso!');
    }

    // Inserir métodos de pagamento
    console.log('💳 Inserindo métodos de pagamento...');
    const { error: paymentInsertError } = await supabase
      .from('payment_methods')
      .insert([
        { name: 'Dinheiro', type: 'cash', description: 'Pagamentos em dinheiro' },
        { name: 'PIX', type: 'pix', description: 'Transferências via PIX' },
        { name: 'Cartão de Crédito', type: 'credit_card', description: 'Pagamentos com cartão de crédito' },
        { name: 'Cartão de Débito', type: 'debit_card', description: 'Pagamentos com cartão de débito' },
        { name: 'Transferência Bancária', type: 'bank_transfer', description: 'Transferências bancárias' },
        { name: 'Boleto', type: 'other', description: 'Pagamentos via boleto bancário' }
      ]);

    if (paymentInsertError) {
      console.error('❌ Erro ao inserir métodos de pagamento:', paymentInsertError.message);
    } else {
      console.log('✅ Métodos de pagamento inseridos com sucesso!');
    }

    console.log('\n🎉 Dados de exemplo inseridos com sucesso!');
    console.log('🚀 Sistema financeiro configurado e pronto para uso!');

  } catch (error) {
    console.error('❌ Erro ao verificar/inserir dados:', error.message);
  }
}

// Executar a verificação
checkTablesAndProvideInstructions();