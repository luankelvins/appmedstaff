-- Schema para Widgets do Dashboard MedStaff
-- Execute este script no Supabase SQL Editor após o schema principal

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELAS PARA WIDGET DE PRODUTIVIDADE
-- =====================================================

-- Tabela de métricas de produtividade
CREATE TABLE IF NOT EXISTS productivity_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  efficiency_score DECIMAL(5,2) DEFAULT 0.00,
  tasks_completed INTEGER DEFAULT 0,
  tasks_assigned INTEGER DEFAULT 0,
  average_completion_time INTERVAL,
  satisfaction_score DECIMAL(3,2) DEFAULT 0.00,
  overtime_hours DECIMAL(4,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Tabela de performance da equipe
CREATE TABLE IF NOT EXISTS team_performance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID,
  team_name TEXT NOT NULL,
  date DATE NOT NULL,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  average_efficiency DECIMAL(5,2) DEFAULT 0.00,
  top_performer_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, date)
);

-- =====================================================
-- TABELAS PARA WIDGET DE SISTEMA
-- =====================================================

-- Tabela de métricas do sistema
CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cpu_usage DECIMAL(5,2) DEFAULT 0.00,
  memory_usage DECIMAL(5,2) DEFAULT 0.00,
  storage_usage DECIMAL(5,2) DEFAULT 0.00,
  network_usage DECIMAL(5,2) DEFAULT 0.00,
  active_users INTEGER DEFAULT 0,
  response_time DECIMAL(8,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de status dos serviços
CREATE TABLE IF NOT EXISTS service_status (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('online', 'offline', 'warning', 'maintenance')),
  last_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uptime_percentage DECIMAL(5,2) DEFAULT 100.00,
  response_time DECIMAL(8,2) DEFAULT 0.00,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(service_name)
);

-- =====================================================
-- TABELAS PARA WIDGET DE VENDAS
-- =====================================================

-- Tabela de métricas de vendas
CREATE TABLE IF NOT EXISTS sales_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL,
  revenue DECIMAL(12,2) DEFAULT 0.00,
  conversion_rate DECIMAL(5,2) DEFAULT 0.00,
  average_order_value DECIMAL(10,2) DEFAULT 0.00,
  new_customers INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  leads_converted INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- Tabela de funil de vendas
CREATE TABLE IF NOT EXISTS sales_funnel (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  stage TEXT NOT NULL CHECK (stage IN ('leads', 'prospects', 'proposals', 'negotiations', 'closed')),
  count INTEGER DEFAULT 0,
  value DECIMAL(12,2) DEFAULT 0.00,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(stage, date)
);

-- Tabela de produtos top
CREATE TABLE IF NOT EXISTS top_products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_name TEXT NOT NULL,
  sales_count INTEGER DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0.00,
  growth_rate DECIMAL(5,2) DEFAULT 0.00,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELAS PARA WIDGET DE EQUIPE
-- =====================================================

-- Tabela de métricas de RH
CREATE TABLE IF NOT EXISTS hr_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL,
  total_employees INTEGER DEFAULT 0,
  active_employees INTEGER DEFAULT 0,
  new_hires INTEGER DEFAULT 0,
  turnover_rate DECIMAL(5,2) DEFAULT 0.00,
  satisfaction_score DECIMAL(3,2) DEFAULT 0.00,
  training_hours DECIMAL(6,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- Tabela de presença da equipe
CREATE TABLE IF NOT EXISTS team_attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'remote', 'vacation', 'sick')),
  check_in_time TIME,
  check_out_time TIME,
  hours_worked DECIMAL(4,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Tabela de bem-estar da equipe
CREATE TABLE IF NOT EXISTS team_wellbeing (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 5),
  satisfaction_level INTEGER CHECK (satisfaction_level BETWEEN 1 AND 5),
  workload_level INTEGER CHECK (workload_level BETWEEN 1 AND 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- =====================================================
-- TABELAS PARA WIDGET FINANCEIRO
-- =====================================================

-- Tabela de métricas financeiras
CREATE TABLE IF NOT EXISTS financial_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL,
  revenue DECIMAL(12,2) DEFAULT 0.00,
  expenses DECIMAL(12,2) DEFAULT 0.00,
  profit DECIMAL(12,2) DEFAULT 0.00,
  cash_flow DECIMAL(12,2) DEFAULT 0.00,
  accounts_receivable DECIMAL(12,2) DEFAULT 0.00,
  accounts_payable DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- Tabela de projeções financeiras
CREATE TABLE IF NOT EXISTS financial_projections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  month DATE NOT NULL,
  projected_revenue DECIMAL(12,2) DEFAULT 0.00,
  projected_expenses DECIMAL(12,2) DEFAULT 0.00,
  projected_profit DECIMAL(12,2) DEFAULT 0.00,
  confidence_level DECIMAL(3,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month)
);

-- Tabela de categorias de despesas
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_name TEXT NOT NULL,
  amount DECIMAL(12,2) DEFAULT 0.00,
  percentage DECIMAL(5,2) DEFAULT 0.00,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELAS PARA NOTIFICAÇÕES AVANÇADAS
-- =====================================================

-- Tabela de notificações do sistema
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success', 'system')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para produtividade
CREATE INDEX IF NOT EXISTS idx_productivity_metrics_user_date ON productivity_metrics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_productivity_metrics_date ON productivity_metrics(date);
CREATE INDEX IF NOT EXISTS idx_team_performance_date ON team_performance(date);

-- Índices para sistema
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_service_status_service ON service_status(service_name);
CREATE INDEX IF NOT EXISTS idx_service_status_status ON service_status(status);

-- Índices para vendas
CREATE INDEX IF NOT EXISTS idx_sales_metrics_date ON sales_metrics(date);
CREATE INDEX IF NOT EXISTS idx_sales_funnel_date ON sales_funnel(date);
CREATE INDEX IF NOT EXISTS idx_top_products_date ON top_products(date);

-- Índices para equipe
CREATE INDEX IF NOT EXISTS idx_hr_metrics_date ON hr_metrics(date);
CREATE INDEX IF NOT EXISTS idx_team_attendance_user_date ON team_attendance(user_id, date);
CREATE INDEX IF NOT EXISTS idx_team_attendance_date ON team_attendance(date);
CREATE INDEX IF NOT EXISTS idx_team_wellbeing_user_date ON team_wellbeing(user_id, date);

-- Índices para financeiro
CREATE INDEX IF NOT EXISTS idx_financial_metrics_date ON financial_metrics(date);
CREATE INDEX IF NOT EXISTS idx_financial_projections_month ON financial_projections(month);
CREATE INDEX IF NOT EXISTS idx_expense_categories_date ON expense_categories(date);

-- Índices para notificações
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Aplicar trigger de updated_at em todas as novas tabelas
CREATE TRIGGER update_productivity_metrics_updated_at BEFORE UPDATE ON productivity_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_performance_updated_at BEFORE UPDATE ON team_performance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_metrics_updated_at BEFORE UPDATE ON system_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_status_updated_at BEFORE UPDATE ON service_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_metrics_updated_at BEFORE UPDATE ON sales_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_funnel_updated_at BEFORE UPDATE ON sales_funnel FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_top_products_updated_at BEFORE UPDATE ON top_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hr_metrics_updated_at BEFORE UPDATE ON hr_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_attendance_updated_at BEFORE UPDATE ON team_attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_wellbeing_updated_at BEFORE UPDATE ON team_wellbeing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_metrics_updated_at BEFORE UPDATE ON financial_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_projections_updated_at BEFORE UPDATE ON financial_projections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expense_categories_updated_at BEFORE UPDATE ON expense_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();