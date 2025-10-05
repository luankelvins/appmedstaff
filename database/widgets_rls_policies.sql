-- Políticas RLS para Widgets do Dashboard MedStaff
-- Execute este script após o widgets_schema.sql

-- =====================================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

-- Produtividade
ALTER TABLE productivity_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_performance ENABLE ROW LEVEL SECURITY;

-- Sistema
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_status ENABLE ROW LEVEL SECURITY;

-- Vendas
ALTER TABLE sales_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_funnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE top_products ENABLE ROW LEVEL SECURITY;

-- Equipe
ALTER TABLE hr_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_wellbeing ENABLE ROW LEVEL SECURITY;

-- Financeiro
ALTER TABLE financial_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

-- Notificações
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FUNÇÃO AUXILIAR PARA VERIFICAR PERMISSÕES DE ADMIN
-- =====================================================

CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND (role = 'admin' OR position ILIKE '%admin%' OR position ILIKE '%gerente%' OR position ILIKE '%diretor%')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- POLÍTICAS PARA PRODUTIVIDADE
-- =====================================================

-- Productivity Metrics: usuários podem ver suas próprias métricas, admins veem tudo
CREATE POLICY "Users can view own productivity metrics" ON productivity_metrics 
  FOR SELECT USING (auth.uid() = user_id OR is_admin_user());

CREATE POLICY "Users can insert own productivity metrics" ON productivity_metrics 
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin_user());

CREATE POLICY "Users can update own productivity metrics" ON productivity_metrics 
  FOR UPDATE USING (auth.uid() = user_id OR is_admin_user());

-- Team Performance: apenas admins podem gerenciar
CREATE POLICY "Admins can manage team performance" ON team_performance 
  FOR ALL USING (is_admin_user());

CREATE POLICY "Authenticated users can view team performance" ON team_performance 
  FOR SELECT TO authenticated USING (true);

-- =====================================================
-- POLÍTICAS PARA SISTEMA
-- =====================================================

-- System Metrics: apenas admins podem gerenciar, todos podem visualizar
CREATE POLICY "Admins can manage system metrics" ON system_metrics 
  FOR ALL USING (is_admin_user());

CREATE POLICY "Authenticated users can view system metrics" ON system_metrics 
  FOR SELECT TO authenticated USING (true);

-- Service Status: apenas admins podem gerenciar, todos podem visualizar
CREATE POLICY "Admins can manage service status" ON service_status 
  FOR ALL USING (is_admin_user());

CREATE POLICY "Authenticated users can view service status" ON service_status 
  FOR SELECT TO authenticated USING (true);

-- =====================================================
-- POLÍTICAS PARA VENDAS
-- =====================================================

-- Sales Metrics: admins e usuários de vendas podem gerenciar
CREATE POLICY "Sales team can manage sales metrics" ON sales_metrics 
  FOR ALL USING (
    is_admin_user() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (department ILIKE '%vendas%' OR department ILIKE '%comercial%' OR position ILIKE '%vendas%')
    )
  );

CREATE POLICY "Authenticated users can view sales metrics" ON sales_metrics 
  FOR SELECT TO authenticated USING (true);

-- Sales Funnel: mesmas regras das métricas de vendas
CREATE POLICY "Sales team can manage sales funnel" ON sales_funnel 
  FOR ALL USING (
    is_admin_user() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (department ILIKE '%vendas%' OR department ILIKE '%comercial%' OR position ILIKE '%vendas%')
    )
  );

CREATE POLICY "Authenticated users can view sales funnel" ON sales_funnel 
  FOR SELECT TO authenticated USING (true);

-- Top Products: mesmas regras das métricas de vendas
CREATE POLICY "Sales team can manage top products" ON top_products 
  FOR ALL USING (
    is_admin_user() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (department ILIKE '%vendas%' OR department ILIKE '%comercial%' OR position ILIKE '%vendas%')
    )
  );

CREATE POLICY "Authenticated users can view top products" ON top_products 
  FOR SELECT TO authenticated USING (true);

-- =====================================================
-- POLÍTICAS PARA EQUIPE/RH
-- =====================================================

-- HR Metrics: apenas admins e RH podem gerenciar
CREATE POLICY "HR team can manage hr metrics" ON hr_metrics 
  FOR ALL USING (
    is_admin_user() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (department ILIKE '%rh%' OR department ILIKE '%recursos%' OR position ILIKE '%rh%')
    )
  );

CREATE POLICY "Authenticated users can view hr metrics" ON hr_metrics 
  FOR SELECT TO authenticated USING (true);

-- Team Attendance: usuários podem ver/editar própria presença, admins e RH veem tudo
CREATE POLICY "Users can manage own attendance" ON team_attendance 
  FOR ALL USING (
    auth.uid() = user_id OR 
    is_admin_user() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (department ILIKE '%rh%' OR department ILIKE '%recursos%' OR position ILIKE '%rh%')
    )
  );

-- Team Wellbeing: usuários podem gerenciar próprio bem-estar, admins e RH veem tudo
CREATE POLICY "Users can manage own wellbeing" ON team_wellbeing 
  FOR ALL USING (
    auth.uid() = user_id OR 
    is_admin_user() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (department ILIKE '%rh%' OR department ILIKE '%recursos%' OR position ILIKE '%rh%')
    )
  );

-- =====================================================
-- POLÍTICAS PARA FINANCEIRO
-- =====================================================

-- Financial Metrics: apenas admins e financeiro podem gerenciar
CREATE POLICY "Finance team can manage financial metrics" ON financial_metrics 
  FOR ALL USING (
    is_admin_user() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (department ILIKE '%financeiro%' OR department ILIKE '%contabil%' OR position ILIKE '%financeiro%')
    )
  );

CREATE POLICY "Authenticated users can view financial metrics" ON financial_metrics 
  FOR SELECT TO authenticated USING (true);

-- Financial Projections: mesmas regras das métricas financeiras
CREATE POLICY "Finance team can manage financial projections" ON financial_projections 
  FOR ALL USING (
    is_admin_user() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (department ILIKE '%financeiro%' OR department ILIKE '%contabil%' OR position ILIKE '%financeiro%')
    )
  );

CREATE POLICY "Authenticated users can view financial projections" ON financial_projections 
  FOR SELECT TO authenticated USING (true);

-- Expense Categories: mesmas regras das métricas financeiras
CREATE POLICY "Finance team can manage expense categories" ON expense_categories 
  FOR ALL USING (
    is_admin_user() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (department ILIKE '%financeiro%' OR department ILIKE '%contabil%' OR position ILIKE '%financeiro%')
    )
  );

CREATE POLICY "Authenticated users can view expense categories" ON expense_categories 
  FOR SELECT TO authenticated USING (true);

-- =====================================================
-- POLÍTICAS PARA NOTIFICAÇÕES
-- =====================================================

-- Notifications: usuários podem gerenciar apenas suas próprias notificações
CREATE POLICY "Users can view own notifications" ON notifications 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications 
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins podem criar notificações para qualquer usuário
CREATE POLICY "Admins can create notifications" ON notifications 
  FOR INSERT WITH CHECK (is_admin_user());

-- Sistema pode criar notificações (usando service role)
CREATE POLICY "System can create notifications" ON notifications 
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- FUNÇÕES AUXILIARES PARA WIDGETS
-- =====================================================

-- Função para obter métricas de produtividade por período
CREATE OR REPLACE FUNCTION get_productivity_metrics(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  efficiency_avg DECIMAL,
  tasks_completed_total INTEGER,
  satisfaction_avg DECIMAL,
  top_performers JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(pm.efficiency_score), 2) as efficiency_avg,
    SUM(pm.tasks_completed)::INTEGER as tasks_completed_total,
    ROUND(AVG(pm.satisfaction_score), 2) as satisfaction_avg,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'name', p.full_name,
            'efficiency', pm2.efficiency_score,
            'tasks_completed', pm2.tasks_completed
          )
        )
        FROM productivity_metrics pm2
        JOIN profiles p ON p.id = pm2.user_id
        WHERE pm2.date BETWEEN start_date AND end_date
        ORDER BY pm2.efficiency_score DESC
        LIMIT 5
      ),
      '[]'::jsonb
    ) as top_performers
  FROM productivity_metrics pm
  WHERE pm.date BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas do sistema
CREATE OR REPLACE FUNCTION get_system_stats()
RETURNS TABLE (
  cpu_avg DECIMAL,
  memory_avg DECIMAL,
  storage_avg DECIMAL,
  network_avg DECIMAL,
  active_users_current INTEGER,
  services_status JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(sm.cpu_usage), 2) as cpu_avg,
    ROUND(AVG(sm.memory_usage), 2) as memory_avg,
    ROUND(AVG(sm.storage_usage), 2) as storage_avg,
    ROUND(AVG(sm.network_usage), 2) as network_avg,
    (SELECT active_users FROM system_metrics ORDER BY timestamp DESC LIMIT 1) as active_users_current,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'name', service_name,
            'status', status,
            'uptime', uptime_percentage
          )
        )
        FROM service_status
      ),
      '[]'::jsonb
    ) as services_status
  FROM system_metrics sm
  WHERE sm.timestamp >= NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;