-- Schema para Sistema de Permissões Granulares
-- Execute este script no SQL Editor do Supabase

-- 1. Tabela de Permissões
CREATE TABLE IF NOT EXISTS permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'financial', 'hr', 'administrative', 'security', 
    'compliance', 'system', 'reports', 'contacts', 'activities'
  )),
  resource TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN (
    'create', 'read', 'update', 'delete', 'approve', 
    'export', 'import', 'manage', 'view_sensitive', 'bulk_operations'
  )),
  conditions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(resource, action)
);

-- 2. Tabela de Roles
CREATE TABLE IF NOT EXISTS roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('user', 'supervisor', 'manager', 'admin', 'superadmin')),
  is_system_role BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Associação Role-Permissões
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- 4. Tabela de Roles de Usuário
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 5. Tabela de Permissões Adicionais de Usuário
CREATE TABLE IF NOT EXISTS user_additional_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  reason TEXT,
  UNIQUE(user_id, permission_id)
);

-- 6. Tabela de Permissões Restritas de Usuário
CREATE TABLE IF NOT EXISTS user_restricted_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  restricted_by UUID REFERENCES auth.users(id),
  restricted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT NOT NULL,
  UNIQUE(user_id, permission_id)
);

-- 7. Tabela de Templates de Permissão
CREATE TABLE IF NOT EXISTS permission_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  role_level TEXT NOT NULL CHECK (role_level IN ('user', 'supervisor', 'manager', 'admin', 'superadmin')),
  permissions TEXT[] NOT NULL, -- Array de permission IDs
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabela de Log de Auditoria de Permissões
CREATE TABLE IF NOT EXISTS permission_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL CHECK (action IN ('grant', 'revoke', 'modify')),
  permission_id UUID REFERENCES permissions(id),
  previous_value JSONB,
  new_value JSONB,
  reason TEXT NOT NULL,
  approved_by UUID REFERENCES auth.users(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para Performance
CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);
CREATE INDEX IF NOT EXISTS idx_permissions_resource_action ON permissions(resource, action);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_additional_permissions_user_id ON user_additional_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_restricted_permissions_user_id ON user_restricted_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_logs_user_id ON permission_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_logs_timestamp ON permission_audit_logs(timestamp);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permission_templates_updated_at BEFORE UPDATE ON permission_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para verificar permissões de usuário
CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id UUID,
  p_resource TEXT,
  p_action TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN := FALSE;
BEGIN
  -- Verificar se o usuário tem a permissão através do role
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
      AND p.resource = p_resource
      AND p.action = p_action
  ) INTO has_permission;
  
  -- Se não tem através do role, verificar permissões adicionais
  IF NOT has_permission THEN
    SELECT EXISTS (
      SELECT 1
      FROM user_additional_permissions uap
      JOIN permissions p ON uap.permission_id = p.id
      WHERE uap.user_id = p_user_id
        AND p.resource = p_resource
        AND p.action = p_action
        AND (uap.expires_at IS NULL OR uap.expires_at > NOW())
    ) INTO has_permission;
  END IF;
  
  -- Verificar se a permissão não está restrita
  IF has_permission THEN
    SELECT NOT EXISTS (
      SELECT 1
      FROM user_restricted_permissions urp
      JOIN permissions p ON urp.permission_id = p.id
      WHERE urp.user_id = p_user_id
        AND p.resource = p_resource
        AND p.action = p_action
    ) INTO has_permission;
  END IF;
  
  RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter permissões efetivas de um usuário
CREATE OR REPLACE FUNCTION get_user_effective_permissions(p_user_id UUID)
RETURNS TABLE (
  permission_id UUID,
  name TEXT,
  description TEXT,
  category TEXT,
  resource TEXT,
  action TEXT,
  source TEXT
) AS $$
BEGIN
  RETURN QUERY
  -- Permissões do role
  SELECT 
    p.id,
    p.name,
    p.description,
    p.category,
    p.resource,
    p.action,
    'role'::TEXT as source
  FROM user_roles ur
  JOIN role_permissions rp ON ur.role_id = rp.role_id
  JOIN permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = p_user_id
  
  UNION
  
  -- Permissões adicionais
  SELECT 
    p.id,
    p.name,
    p.description,
    p.category,
    p.resource,
    p.action,
    'additional'::TEXT as source
  FROM user_additional_permissions uap
  JOIN permissions p ON uap.permission_id = p.id
  WHERE uap.user_id = p_user_id
    AND (uap.expires_at IS NULL OR uap.expires_at > NOW())
  
  -- Excluir permissões restritas
  EXCEPT
  
  SELECT 
    p.id,
    p.name,
    p.description,
    p.category,
    p.resource,
    p.action,
    'restricted'::TEXT as source
  FROM user_restricted_permissions urp
  JOIN permissions p ON urp.permission_id = p.id
  WHERE urp.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilitar RLS
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_additional_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_restricted_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para Permissões
CREATE POLICY "Admins can manage permissions" ON permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND position IN ('admin', 'superadmin', 'gerente', 'diretor')
    )
  );

CREATE POLICY "Users can view permissions" ON permissions
  FOR SELECT USING (true);

-- Políticas RLS para Roles
CREATE POLICY "Admins can manage roles" ON roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND position IN ('admin', 'superadmin', 'gerente', 'diretor')
    )
  );

CREATE POLICY "Users can view roles" ON roles
  FOR SELECT USING (true);

-- Políticas RLS para Role Permissions
CREATE POLICY "Admins can manage role permissions" ON role_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND position IN ('admin', 'superadmin', 'gerente', 'diretor')
    )
  );

CREATE POLICY "Users can view role permissions" ON role_permissions
  FOR SELECT USING (true);

-- Políticas RLS para User Roles
CREATE POLICY "Admins can manage user roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND position IN ('admin', 'superadmin', 'gerente', 'diretor')
    )
  );

CREATE POLICY "Users can view their own role" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Políticas RLS para User Additional Permissions
CREATE POLICY "Admins can manage additional permissions" ON user_additional_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND position IN ('admin', 'superadmin', 'gerente', 'diretor')
    )
  );

CREATE POLICY "Users can view their additional permissions" ON user_additional_permissions
  FOR SELECT USING (user_id = auth.uid());

-- Políticas RLS para User Restricted Permissions
CREATE POLICY "Admins can manage restricted permissions" ON user_restricted_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND position IN ('admin', 'superadmin', 'gerente', 'diretor')
    )
  );

CREATE POLICY "Users can view their restricted permissions" ON user_restricted_permissions
  FOR SELECT USING (user_id = auth.uid());

-- Políticas RLS para Permission Templates
CREATE POLICY "Admins can manage templates" ON permission_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND position IN ('admin', 'superadmin', 'gerente', 'diretor')
    )
  );

CREATE POLICY "Users can view templates" ON permission_templates
  FOR SELECT USING (true);

-- Políticas RLS para Permission Audit Logs
CREATE POLICY "Admins can view all audit logs" ON permission_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND position IN ('admin', 'superadmin', 'gerente', 'diretor')
    )
  );

CREATE POLICY "Users can view their audit logs" ON permission_audit_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert audit logs" ON permission_audit_logs
  FOR INSERT WITH CHECK (true);

-- Inserir permissões padrão do sistema
INSERT INTO permissions (name, description, category, resource, action) VALUES
-- Financeiro
('Visualizar Financeiro', 'Visualizar dados financeiros básicos', 'financial', 'financial', 'read'),
('Criar Financeiro', 'Criar novos registros financeiros', 'financial', 'financial', 'create'),
('Editar Financeiro', 'Editar registros financeiros', 'financial', 'financial', 'update'),
('Excluir Financeiro', 'Excluir registros financeiros', 'financial', 'financial', 'delete'),
('Aprovar Financeiro', 'Aprovar transações financeiras', 'financial', 'financial', 'approve'),
('Exportar Financeiro', 'Exportar dados financeiros', 'financial', 'financial', 'export'),
('Visualizar Dados Sensíveis Financeiros', 'Visualizar informações financeiras sensíveis', 'financial', 'financial', 'view_sensitive'),

-- RH
('Visualizar RH', 'Visualizar dados de RH básicos', 'hr', 'hr', 'read'),
('Criar RH', 'Criar novos registros de RH', 'hr', 'hr', 'create'),
('Editar RH', 'Editar registros de RH', 'hr', 'hr', 'update'),
('Excluir RH', 'Excluir registros de RH', 'hr', 'hr', 'delete'),
('Visualizar Salários', 'Visualizar informações salariais', 'hr', 'hr', 'view_sensitive'),
('Gerenciar Presença', 'Gerenciar controle de presença', 'hr', 'hr', 'manage'),

-- Administrativo
('Visualizar Administrativo', 'Visualizar dados administrativos', 'administrative', 'admin', 'read'),
('Gerenciar Documentos', 'Gerenciar documentos administrativos', 'administrative', 'admin', 'manage'),
('Configurar Sistema', 'Configurar parâmetros do sistema', 'administrative', 'admin', 'manage'),
('Gerenciar Usuários', 'Gerenciar usuários do sistema', 'administrative', 'admin', 'manage'),

-- Segurança
('Visualizar Logs', 'Visualizar logs de segurança', 'security', 'security', 'read'),
('Gerenciar Roles', 'Gerenciar roles de usuários', 'security', 'security', 'manage'),
('Gerenciar Permissões', 'Gerenciar permissões de usuários', 'security', 'security', 'manage'),
('Visualizar Auditoria', 'Visualizar logs de auditoria', 'security', 'security', 'read'),

-- Relatórios
('Visualizar Relatórios', 'Visualizar relatórios básicos', 'reports', 'reports', 'read'),
('Criar Relatórios', 'Criar novos relatórios', 'reports', 'reports', 'create'),
('Exportar Relatórios', 'Exportar relatórios', 'reports', 'reports', 'export'),
('Agendar Relatórios', 'Agendar geração de relatórios', 'reports', 'reports', 'manage'),

-- Sistema
('Backup Sistema', 'Realizar backup do sistema', 'system', 'system', 'manage'),
('Manutenção Sistema', 'Realizar manutenção do sistema', 'system', 'system', 'manage'),
('Monitorar Sistema', 'Monitorar performance do sistema', 'system', 'system', 'read')

ON CONFLICT (resource, action) DO NOTHING;

-- Inserir roles padrão
INSERT INTO roles (name, description, level, is_system_role) VALUES
('Usuário', 'Role padrão para usuários básicos', 'user', true),
('Supervisor', 'Role para supervisores de equipe', 'supervisor', true),
('Gerente', 'Role para gerentes de departamento', 'manager', true),
('Administrador', 'Role para administradores do sistema', 'admin', true),
('Super Administrador', 'Role com acesso total ao sistema', 'superadmin', true)

ON CONFLICT (name) DO NOTHING;

-- Configurar permissões para roles padrão
DO $$
DECLARE
  user_role_id UUID;
  supervisor_role_id UUID;
  manager_role_id UUID;
  admin_role_id UUID;
  superadmin_role_id UUID;
BEGIN
  -- Obter IDs dos roles
  SELECT id INTO user_role_id FROM roles WHERE name = 'Usuário';
  SELECT id INTO supervisor_role_id FROM roles WHERE name = 'Supervisor';
  SELECT id INTO manager_role_id FROM roles WHERE name = 'Gerente';
  SELECT id INTO admin_role_id FROM roles WHERE name = 'Administrador';
  SELECT id INTO superadmin_role_id FROM roles WHERE name = 'Super Administrador';
  
  -- Permissões para Usuário (básicas de visualização)
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT user_role_id, id FROM permissions 
  WHERE action = 'read' AND category IN ('financial', 'hr', 'administrative', 'reports')
  ON CONFLICT DO NOTHING;
  
  -- Permissões para Supervisor (visualização + criação limitada)
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT supervisor_role_id, id FROM permissions 
  WHERE (action IN ('read', 'create', 'update') AND category IN ('financial', 'hr', 'administrative', 'reports'))
     OR (action = 'manage' AND resource = 'hr')
  ON CONFLICT DO NOTHING;
  
  -- Permissões para Gerente (mais amplas, incluindo aprovação)
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT manager_role_id, id FROM permissions 
  WHERE action IN ('read', 'create', 'update', 'approve', 'export', 'manage')
    AND category IN ('financial', 'hr', 'administrative', 'reports', 'security')
  ON CONFLICT DO NOTHING;
  
  -- Permissões para Admin (quase todas, exceto sistema crítico)
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT admin_role_id, id FROM permissions 
  WHERE category != 'system' OR (category = 'system' AND action = 'read')
  ON CONFLICT DO NOTHING;
  
  -- Permissões para SuperAdmin (todas)
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT superadmin_role_id, id FROM permissions
  ON CONFLICT DO NOTHING;
END $$;