-- Dados iniciais necessários para o sistema

-- Inserir configurações do sistema
INSERT INTO system_settings (categoria, chave, valor, descricao, tipo_valor) VALUES
('app', 'app_name', 'AppMedStaff', 'Nome da aplicação', 'string'),
('app', 'app_version', '1.0.0', 'Versão da aplicação', 'string'),
('security', 'max_login_attempts', '5', 'Máximo de tentativas de login', 'number'),
('security', 'session_timeout', '3600', 'Timeout da sessão em segundos', 'number'),
('backup', 'backup_retention_days', '30', 'Dias de retenção de backup', 'number'),
('notifications', 'email_notifications', 'true', 'Habilitar notificações por email', 'boolean'),
('system', 'maintenance_mode', 'false', 'Modo de manutenção', 'boolean'),
('localization', 'default_language', 'pt-BR', 'Idioma padrão do sistema', 'string'),
('localization', 'timezone', 'America/Sao_Paulo', 'Fuso horário padrão', 'string'),
('financial', 'currency', 'BRL', 'Moeda padrão', 'string'),
('localization', 'date_format', 'DD/MM/YYYY', 'Formato de data padrão', 'string'),
('financial', 'decimal_places', '2', 'Casas decimais para valores monetários', 'number')
ON CONFLICT (categoria, chave) DO NOTHING;

-- Inserir categorias financeiras padrão
INSERT INTO financial_categories (nome, tipo, descricao, cor, ativo) VALUES
('Salários', 'receita', 'Pagamento de salários e benefícios', '#4CAF50', true),
('Impostos', 'despesa', 'Impostos e taxas governamentais', '#F44336', true),
('Aluguel', 'despesa', 'Aluguel de escritório e instalações', '#FF9800', true),
('Energia Elétrica', 'despesa', 'Conta de energia elétrica', '#2196F3', true),
('Internet/Telefone', 'despesa', 'Serviços de telecomunicações', '#9C27B0', true),
('Material de Escritório', 'despesa', 'Materiais e suprimentos de escritório', '#607D8B', true),
('Software/Licenças', 'despesa', 'Licenças de software e sistemas', '#795548', true),
('Marketing', 'despesa', 'Despesas com marketing e publicidade', '#E91E63', true),
('Treinamento', 'despesa', 'Cursos e treinamentos para funcionários', '#00BCD4', true),
('Manutenção', 'despesa', 'Manutenção de equipamentos e instalações', '#FFC107', true),
('Serviços Profissionais', 'receita', 'Receita de serviços prestados', '#8BC34A', true),
('Consultoria', 'receita', 'Receita de consultoria', '#CDDC39', true);

-- Inserir métodos de pagamento padrão
INSERT INTO payment_methods (nome, tipo, ativo, detalhes) VALUES
('Dinheiro', 'dinheiro', true, '{"taxa_percentual": 0.00, "taxa_fixa": 0.00}'::jsonb),
('PIX', 'pix', true, '{"taxa_percentual": 0.00, "taxa_fixa": 0.00}'::jsonb),
('Cartão de Débito', 'cartao_debito', true, '{"taxa_percentual": 1.50, "taxa_fixa": 0.00}'::jsonb),
('Cartão de Crédito', 'cartao_credito', true, '{"taxa_percentual": 3.50, "taxa_fixa": 0.00}'::jsonb),
('Transferência Bancária', 'transferencia', true, '{"taxa_percentual": 0.50, "taxa_fixa": 2.00}'::jsonb),
('Boleto Bancário', 'boleto', true, '{"taxa_percentual": 0.00, "taxa_fixa": 3.50}'::jsonb);

-- Inserir conta bancária padrão (exemplo)
INSERT INTO bank_accounts (nome, banco, agencia, conta, tipo_conta, saldo_inicial, ativo) VALUES
('Conta Corrente Principal', 'Banco do Brasil', '1234-5', '12345-6', 'corrente', 0.00, true),
('Conta Poupança', 'Caixa Econômica Federal', '5678-9', '98765-4', 'poupanca', 0.00, true);

-- Criar usuário administrador padrão
INSERT INTO employees (
    id,
    email,
    dados_pessoais,
    dados_profissionais,
    role,
    status
) VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID,
    'admin@appmedstaff.com',
    '{"nome": "Administrador", "telefone": "(11) 99999-9999"}'::JSONB,
    '{"cargo": "Administrador do Sistema", "departamento": "TI", "data_admissao": "2024-01-01"}'::JSONB,
    'superadmin',
    'ativo'
) ON CONFLICT (email) DO NOTHING;

-- Inserir algumas notificações de exemplo para o admin
INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    read
) VALUES
(
    '00000000-0000-0000-0000-000000000001'::UUID,
    'Bem-vindo ao AppMedStaff!',
    'Sistema configurado com sucesso. Você pode começar a usar todas as funcionalidades.',
    'info',
    false
),
(
    '00000000-0000-0000-0000-000000000001'::UUID,
    'Configuração Inicial',
    'Lembre-se de configurar as informações da empresa e criar outros usuários.',
    'warning',
    false
);

-- Inserir alguns documentos administrativos de exemplo
INSERT INTO admin_documents (
    nome,
    tipo,
    categoria,
    descricao,
    status,
    criado_por
) VALUES
(
    'Manual do Usuário',
    'manual',
    'documentacao',
    'Este é o manual básico do sistema AppMedStaff...',
    'ativo',
    '00000000-0000-0000-0000-000000000001'::UUID
),
(
    'Política de Privacidade',
    'politica',
    'juridico',
    'Política de privacidade e proteção de dados...',
    'ativo',
    '00000000-0000-0000-0000-000000000001'::UUID
);

-- Inserir alguns relatórios administrativos de exemplo
INSERT INTO admin_reports (
    nome,
    tipo_relatorio,
    descricao,
    configuracao,
    criado_por
) VALUES
(
    'Relatório de Funcionários',
    'personalizado',
    'Relatório completo de todos os funcionários',
    '{"query": "SELECT * FROM employees WHERE status = ''ativo''", "campos": ["nome", "email", "status"]}'::jsonb,
    '00000000-0000-0000-0000-000000000001'::UUID
),
(
    'Relatório de Tarefas',
    'tarefas',
    'Relatório de tarefas por período',
    '{"periodo": "30_dias", "status": "todas", "campos": ["titulo", "status", "created_at"]}'::jsonb,
    '00000000-0000-0000-0000-000000000001'::UUID
);