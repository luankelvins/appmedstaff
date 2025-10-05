-- Dados de Demonstração para Widgets do Dashboard MedStaff
-- Execute este script após widgets_schema.sql e widgets_rls_policies.sql

-- =====================================================
-- DADOS DE PRODUTIVIDADE
-- =====================================================

-- Inserir métricas de produtividade para os últimos 30 dias
INSERT INTO productivity_metrics (user_id, efficiency_score, tasks_completed, satisfaction_score, date) 
SELECT 
  p.id,
  ROUND((RANDOM() * 40 + 60)::NUMERIC, 2), -- Eficiência entre 60-100%
  FLOOR(RANDOM() * 15 + 5)::INTEGER, -- Tarefas entre 5-20
  ROUND((RANDOM() * 3 + 7)::NUMERIC, 1), -- Satisfação entre 7-10
  CURRENT_DATE - (generate_series(0, 29) || ' days')::INTERVAL
FROM profiles p
WHERE p.role != 'admin'
CROSS JOIN generate_series(0, 29);

-- Inserir performance da equipe
INSERT INTO team_performance (team_name, efficiency_avg, tasks_completed, satisfaction_avg, date) VALUES
('Desenvolvimento', 87.5, 156, 8.2, CURRENT_DATE),
('Vendas', 92.3, 89, 8.7, CURRENT_DATE),
('Suporte', 85.1, 234, 7.9, CURRENT_DATE),
('Marketing', 88.9, 67, 8.4, CURRENT_DATE),
('RH', 91.2, 45, 8.6, CURRENT_DATE);

-- =====================================================
-- DADOS DO SISTEMA
-- =====================================================

-- Inserir métricas do sistema para as últimas 24 horas
INSERT INTO system_metrics (cpu_usage, memory_usage, storage_usage, network_usage, active_users, timestamp)
SELECT 
  ROUND((RANDOM() * 30 + 20)::NUMERIC, 2), -- CPU 20-50%
  ROUND((RANDOM() * 40 + 40)::NUMERIC, 2), -- Memória 40-80%
  ROUND((RANDOM() * 20 + 60)::NUMERIC, 2), -- Storage 60-80%
  ROUND((RANDOM() * 50 + 10)::NUMERIC, 2), -- Network 10-60%
  FLOOR(RANDOM() * 50 + 20)::INTEGER, -- Usuários ativos 20-70
  NOW() - (generate_series(0, 23) || ' hours')::INTERVAL
FROM generate_series(0, 23);

-- Inserir status dos serviços
INSERT INTO service_status (service_name, status, uptime_percentage, last_check) VALUES
('API Principal', 'online', 99.8, NOW()),
('Banco de Dados', 'online', 99.9, NOW()),
('Sistema de Autenticação', 'online', 99.7, NOW()),
('Serviço de Email', 'online', 98.5, NOW()),
('CDN', 'online', 99.6, NOW()),
('Backup', 'maintenance', 95.2, NOW() - INTERVAL '2 hours');

-- =====================================================
-- DADOS DE VENDAS
-- =====================================================

-- Inserir métricas de vendas para os últimos 12 meses
INSERT INTO sales_metrics (revenue, leads_generated, conversion_rate, avg_deal_size, period_start, period_end)
SELECT 
  ROUND((RANDOM() * 200000 + 300000)::NUMERIC, 2), -- Receita 300k-500k
  FLOOR(RANDOM() * 100 + 150)::INTEGER, -- Leads 150-250
  ROUND((RANDOM() * 15 + 15)::NUMERIC, 2), -- Conversão 15-30%
  ROUND((RANDOM() * 5000 + 8000)::NUMERIC, 2), -- Ticket médio 8k-13k
  DATE_TRUNC('month', CURRENT_DATE - (generate_series(0, 11) || ' months')::INTERVAL),
  DATE_TRUNC('month', CURRENT_DATE - (generate_series(0, 11) || ' months')::INTERVAL) + INTERVAL '1 month' - INTERVAL '1 day'
FROM generate_series(0, 11);

-- Inserir funil de vendas
INSERT INTO sales_funnel (stage, count, value, conversion_rate) VALUES
('Leads', 450, 3600000, 100.0),
('Qualificados', 280, 2240000, 62.2),
('Propostas', 120, 960000, 42.9),
('Negociação', 65, 520000, 54.2),
('Fechados', 35, 280000, 53.8);

-- Inserir produtos mais vendidos
INSERT INTO top_products (product_name, sales_count, revenue, growth_rate) VALUES
('Consultoria Médica Premium', 45, 450000, 15.2),
('Plano Básico de Saúde', 120, 360000, 8.7),
('Telemedicina Empresarial', 78, 312000, 22.1),
('Exames Preventivos', 200, 280000, 5.3),
('Consultoria Nutricional', 95, 190000, 18.9);

-- =====================================================
-- DADOS DE EQUIPE/RH
-- =====================================================

-- Inserir métricas de RH
INSERT INTO hr_metrics (total_employees, new_hires, turnover_rate, satisfaction_avg, training_hours, period_start, period_end) VALUES
(125, 8, 3.2, 8.4, 240, DATE_TRUNC('month', CURRENT_DATE), CURRENT_DATE);

-- Inserir dados de presença da equipe
INSERT INTO team_attendance (user_id, date, status, hours_worked, overtime_hours)
SELECT 
  p.id,
  CURRENT_DATE - (generate_series(0, 6) || ' days')::INTERVAL,
  CASE 
    WHEN RANDOM() < 0.9 THEN 'present'
    WHEN RANDOM() < 0.95 THEN 'late'
    ELSE 'absent'
  END,
  CASE 
    WHEN RANDOM() < 0.9 THEN ROUND((RANDOM() * 2 + 7)::NUMERIC, 1) -- 7-9 horas
    ELSE 0
  END,
  CASE 
    WHEN RANDOM() < 0.3 THEN ROUND((RANDOM() * 3)::NUMERIC, 1) -- 0-3 horas extras
    ELSE 0
  END
FROM profiles p
WHERE p.role != 'admin'
CROSS JOIN generate_series(0, 6);

-- Inserir dados de bem-estar da equipe
INSERT INTO team_wellbeing (user_id, stress_level, satisfaction_score, work_life_balance, feedback, date)
SELECT 
  p.id,
  FLOOR(RANDOM() * 5 + 1)::INTEGER, -- Stress 1-5
  ROUND((RANDOM() * 3 + 7)::NUMERIC, 1), -- Satisfação 7-10
  FLOOR(RANDOM() * 5 + 1)::INTEGER, -- Work-life balance 1-5
  CASE 
    WHEN RANDOM() < 0.3 THEN 'Ambiente de trabalho muito positivo'
    WHEN RANDOM() < 0.6 THEN 'Gostaria de mais flexibilidade no horário'
    ELSE NULL
  END,
  CURRENT_DATE
FROM profiles p
WHERE p.role != 'admin';

-- =====================================================
-- DADOS FINANCEIROS
-- =====================================================

-- Inserir métricas financeiras para os últimos 12 meses
INSERT INTO financial_metrics (revenue, expenses, profit, cash_flow, period_start, period_end)
SELECT 
  ROUND((RANDOM() * 200000 + 400000)::NUMERIC, 2), -- Receita 400k-600k
  ROUND((RANDOM() * 150000 + 250000)::NUMERIC, 2), -- Despesas 250k-400k
  0, -- Será calculado via trigger
  ROUND((RANDOM() * 100000 + 50000)::NUMERIC, 2), -- Fluxo de caixa 50k-150k
  DATE_TRUNC('month', CURRENT_DATE - (generate_series(0, 11) || ' months')::INTERVAL),
  DATE_TRUNC('month', CURRENT_DATE - (generate_series(0, 11) || ' months')::INTERVAL) + INTERVAL '1 month' - INTERVAL '1 day'
FROM generate_series(0, 11);

-- Atualizar lucro baseado na receita e despesas
UPDATE financial_metrics SET profit = revenue - expenses;

-- Inserir projeções financeiras
INSERT INTO financial_projections (period_start, period_end, projected_revenue, projected_expenses, projected_profit, confidence_level) VALUES
(DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month'), DATE_TRUNC('month', CURRENT_DATE + INTERVAL '2 months') - INTERVAL '1 day', 520000, 380000, 140000, 85),
(DATE_TRUNC('month', CURRENT_DATE + INTERVAL '2 months'), DATE_TRUNC('month', CURRENT_DATE + INTERVAL '3 months') - INTERVAL '1 day', 545000, 390000, 155000, 80),
(DATE_TRUNC('month', CURRENT_DATE + INTERVAL '3 months'), DATE_TRUNC('month', CURRENT_DATE + INTERVAL '4 months') - INTERVAL '1 day', 580000, 410000, 170000, 75);

-- Inserir categorias de despesas
INSERT INTO expense_categories (category_name, amount, percentage, budget_limit) VALUES
('Salários e Benefícios', 180000, 45.0, 200000),
('Infraestrutura e TI', 60000, 15.0, 70000),
('Marketing e Vendas', 40000, 10.0, 50000),
('Operacional', 80000, 20.0, 90000),
('Outros', 40000, 10.0, 45000);

-- =====================================================
-- DADOS DE NOTIFICAÇÕES
-- =====================================================

-- Inserir notificações de exemplo para todos os usuários
INSERT INTO notifications (user_id, title, message, type, priority, is_read, action_url)
SELECT 
  p.id,
  'Bem-vindo ao novo dashboard!',
  'Explore os novos widgets e funcionalidades disponíveis.',
  'system',
  'medium',
  false,
  '/dashboard'
FROM profiles p;

-- Inserir notificações específicas para admins
INSERT INTO notifications (user_id, title, message, type, priority, is_read, action_url)
SELECT 
  p.id,
  'Relatório mensal disponível',
  'O relatório de performance do mês está pronto para análise.',
  'info',
  'high',
  false,
  '/reports/monthly'
FROM profiles p
WHERE p.role = 'admin' OR p.position ILIKE '%admin%' OR p.position ILIKE '%gerente%';

-- Inserir algumas notificações de tarefas
INSERT INTO notifications (user_id, title, message, type, priority, is_read)
SELECT 
  p.id,
  'Nova tarefa atribuída',
  'Você tem uma nova tarefa pendente para revisão.',
  'task',
  'medium',
  RANDOM() < 0.3 -- 30% já lidas
FROM profiles p
WHERE RANDOM() < 0.6; -- 60% dos usuários recebem

-- Inserir notificações de sistema
INSERT INTO notifications (user_id, title, message, type, priority, is_read)
SELECT 
  p.id,
  'Manutenção programada',
  'Haverá manutenção no sistema no próximo domingo das 2h às 4h.',
  'warning',
  'high',
  false
FROM profiles p;

-- =====================================================
-- ATUALIZAR TIMESTAMPS
-- =====================================================

-- Atualizar alguns registros para ter timestamps variados
UPDATE productivity_metrics 
SET updated_at = created_at + (RANDOM() * INTERVAL '1 day')
WHERE RANDOM() < 0.3;

UPDATE notifications 
SET created_at = NOW() - (RANDOM() * INTERVAL '7 days'),
    updated_at = NOW() - (RANDOM() * INTERVAL '7 days')
WHERE RANDOM() < 0.5;

-- =====================================================
-- VERIFICAÇÕES E ESTATÍSTICAS
-- =====================================================

-- Verificar dados inseridos
DO $$
BEGIN
  RAISE NOTICE 'Dados inseridos com sucesso:';
  RAISE NOTICE '- Métricas de produtividade: % registros', (SELECT COUNT(*) FROM productivity_metrics);
  RAISE NOTICE '- Performance da equipe: % registros', (SELECT COUNT(*) FROM team_performance);
  RAISE NOTICE '- Métricas do sistema: % registros', (SELECT COUNT(*) FROM system_metrics);
  RAISE NOTICE '- Status dos serviços: % registros', (SELECT COUNT(*) FROM service_status);
  RAISE NOTICE '- Métricas de vendas: % registros', (SELECT COUNT(*) FROM sales_metrics);
  RAISE NOTICE '- Funil de vendas: % registros', (SELECT COUNT(*) FROM sales_funnel);
  RAISE NOTICE '- Produtos top: % registros', (SELECT COUNT(*) FROM top_products);
  RAISE NOTICE '- Métricas de RH: % registros', (SELECT COUNT(*) FROM hr_metrics);
  RAISE NOTICE '- Presença da equipe: % registros', (SELECT COUNT(*) FROM team_attendance);
  RAISE NOTICE '- Bem-estar da equipe: % registros', (SELECT COUNT(*) FROM team_wellbeing);
  RAISE NOTICE '- Métricas financeiras: % registros', (SELECT COUNT(*) FROM financial_metrics);
  RAISE NOTICE '- Projeções financeiras: % registros', (SELECT COUNT(*) FROM financial_projections);
  RAISE NOTICE '- Categorias de despesas: % registros', (SELECT COUNT(*) FROM expense_categories);
  RAISE NOTICE '- Notificações: % registros', (SELECT COUNT(*) FROM notifications);
END $$;