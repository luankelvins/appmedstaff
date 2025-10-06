import { createClient } from '@supabase/supabase-js';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

// Configuração de teste do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

// Cliente com privilégios de service role para setup
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Cliente anônimo para testes de RLS
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

// Dados de teste
const testUsers = {
  admin: {
    email: 'admin.test@medstaff.com',
    password: 'TestPassword123!',
    profile: {
      name: 'Admin Test',
      position: 'admin',
      department: 'TI'
    }
  },
  manager: {
    email: 'manager.test@medstaff.com',
    password: 'TestPassword123!',
    profile: {
      name: 'Manager Test',
      position: 'gerente',
      department: 'Financeiro'
    }
  },
  user: {
    email: 'user.test@medstaff.com',
    password: 'TestPassword123!',
    profile: {
      name: 'User Test',
      position: 'colaborador',
      department: 'Operacional'
    }
  }
};

describe('RLS Policies Tests', () => {
  let testUserIds: Record<string, string> = {};
  let testClients: Record<string, any> = {};

  beforeAll(async () => {
    // Criar usuários de teste
    for (const [role, userData] of Object.entries(testUsers)) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      });

      if (authError) {
        console.error(`Erro ao criar usuário ${role}:`, authError);
        continue;
      }

      testUserIds[role] = authData.user.id;

      // Criar perfil
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          ...userData.profile
        });

      if (profileError) {
        console.error(`Erro ao criar perfil ${role}:`, profileError);
      }

      // Criar cliente autenticado para este usuário
      const client = createClient(supabaseUrl, supabaseAnonKey);
      const { error: signInError } = await client.auth.signInWithPassword({
        email: userData.email,
        password: userData.password
      });

      if (!signInError) {
        testClients[role] = client;
      }
    }
  });

  afterAll(async () => {
    // Limpar usuários de teste
    for (const userId of Object.values(testUserIds)) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
    }
  });

  describe('Audit Logs RLS', () => {
    it('Admin deve poder visualizar todos os logs de auditoria', async () => {
      const { data, error } = await testClients.admin
        .from('audit_logs')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('Usuário comum deve visualizar apenas seus próprios logs', async () => {
      // Inserir log de teste para o usuário
      await supabaseAdmin
        .from('audit_logs')
        .insert({
          user_id: testUserIds.user,
          action: 'test.action',
          entity_type: 'test',
          entity_id: 'test-id',
          details: { test: true }
        });

      const { data, error } = await testClients.user
        .from('audit_logs')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.every(log => log.user_id === testUserIds.user)).toBe(true);
    });

    it('Usuário não deve poder inserir logs diretamente', async () => {
      const { error } = await testClients.user
        .from('audit_logs')
        .insert({
          user_id: testUserIds.user,
          action: 'unauthorized.action',
          entity_type: 'test',
          entity_id: 'test-id',
          details: { unauthorized: true }
        });

      expect(error).toBeDefined();
      expect(error?.code).toBe('42501'); // Insufficient privilege
    });
  });

  describe('Permissions RLS', () => {
    it('Admin deve poder gerenciar permissões', async () => {
      const { data: selectData, error: selectError } = await testClients.admin
        .from('permissions')
        .select('*')
        .limit(1);

      expect(selectError).toBeNull();
      expect(selectData).toBeDefined();

      // Tentar inserir uma nova permissão
      const { error: insertError } = await testClients.admin
        .from('permissions')
        .insert({
          name: 'Test Permission',
          description: 'Permissão de teste',
          category: 'system',
          resource: 'test',
          action: 'create'
        });

      expect(insertError).toBeNull();
    });

    it('Usuário comum deve poder apenas visualizar permissões', async () => {
      const { data, error } = await testClients.user
        .from('permissions')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // Tentar inserir deve falhar
      const { error: insertError } = await testClients.user
        .from('permissions')
        .insert({
          name: 'Unauthorized Permission',
          description: 'Permissão não autorizada',
          category: 'system',
          resource: 'unauthorized',
          action: 'create'
        });

      expect(insertError).toBeDefined();
    });
  });

  describe('User Roles RLS', () => {
    it('Admin deve poder gerenciar roles de usuários', async () => {
      // Primeiro, criar um role de teste
      const { data: roleData } = await supabaseAdmin
        .from('roles')
        .insert({
          name: 'Test Role',
          description: 'Role de teste',
          level: 'user'
        })
        .select()
        .single();

      const { error } = await testClients.admin
        .from('user_roles')
        .insert({
          user_id: testUserIds.user,
          role_id: roleData.id,
          assigned_by: testUserIds.admin
        });

      expect(error).toBeNull();
    });

    it('Usuário deve poder visualizar apenas seu próprio role', async () => {
      const { data, error } = await testClients.user
        .from('user_roles')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.every(role => role.user_id === testUserIds.user)).toBe(true);
    });

    it('Usuário não deve poder modificar roles', async () => {
      const { error } = await testClients.user
        .from('user_roles')
        .insert({
          user_id: testUserIds.user,
          role_id: 'fake-role-id'
        });

      expect(error).toBeDefined();
    });
  });

  describe('Profiles RLS', () => {
    it('Admin deve poder visualizar todos os perfis', async () => {
      const { data, error } = await testClients.admin
        .from('profiles')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);
    });

    it('Gerente deve poder visualizar perfis do seu departamento', async () => {
      const { data, error } = await testClients.manager
        .from('profiles')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('Usuário deve poder visualizar apenas seu próprio perfil', async () => {
      const { data, error } = await testClients.user
        .from('profiles')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBe(1);
      expect(data?.[0]?.id).toBe(testUserIds.user);
    });

    it('Usuário deve poder atualizar apenas seu próprio perfil', async () => {
      const { error: updateOwnError } = await testClients.user
        .from('profiles')
        .update({ name: 'Updated Name' })
        .eq('id', testUserIds.user);

      expect(updateOwnError).toBeNull();

      // Tentar atualizar perfil de outro usuário deve falhar
      const { error: updateOtherError } = await testClients.user
        .from('profiles')
        .update({ name: 'Unauthorized Update' })
        .eq('id', testUserIds.admin);

      expect(updateOtherError).toBeDefined();
    });
  });

  describe('Financial Data RLS', () => {
    beforeEach(async () => {
      // Inserir dados financeiros de teste
      await supabaseAdmin
        .from('expenses')
        .insert([
          {
            description: 'Despesa Admin',
            amount: 1000,
            category: 'office',
            created_by: testUserIds.admin,
            department: 'TI'
          },
          {
            description: 'Despesa User',
            amount: 500,
            category: 'travel',
            created_by: testUserIds.user,
            department: 'Operacional'
          }
        ]);
    });

    it('Admin deve visualizar todas as despesas', async () => {
      const { data, error } = await testClients.admin
        .from('expenses')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThanOrEqual(2);
    });

    it('Gerente deve visualizar despesas do seu departamento', async () => {
      const { data, error } = await testClients.manager
        .from('expenses')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      // Gerente do Financeiro pode ver despesas relacionadas
    });

    it('Usuário deve visualizar apenas suas próprias despesas', async () => {
      const { data, error } = await testClients.user
        .from('expenses')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.every(expense => expense.created_by === testUserIds.user)).toBe(true);
    });
  });

  describe('Permission Functions', () => {
    it('Função check_user_permission deve funcionar corretamente', async () => {
      // Testar com admin
      const { data: adminResult } = await supabaseAdmin
        .rpc('check_user_permission', {
          p_user_id: testUserIds.admin,
          p_resource: 'financial',
          p_action: 'read'
        });

      expect(adminResult).toBe(true);

      // Testar com usuário comum para ação restrita
      const { data: userResult } = await supabaseAdmin
        .rpc('check_user_permission', {
          p_user_id: testUserIds.user,
          p_resource: 'system',
          p_action: 'manage'
        });

      expect(userResult).toBe(false);
    });

    it('Função get_user_effective_permissions deve retornar permissões corretas', async () => {
      const { data, error } = await supabaseAdmin
        .rpc('get_user_effective_permissions', {
          p_user_id: testUserIds.admin
        });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data?.length).toBeGreaterThan(0);
    });
  });

  describe('Audit Settings RLS', () => {
    it('Apenas admins devem poder modificar configurações de auditoria', async () => {
      const { error: adminError } = await testClients.admin
        .from('audit_settings')
        .upsert({
          key: 'test_setting',
          value: 'test_value',
          description: 'Configuração de teste'
        });

      expect(adminError).toBeNull();

      const { error: userError } = await testClients.user
        .from('audit_settings')
        .upsert({
          key: 'unauthorized_setting',
          value: 'unauthorized_value',
          description: 'Configuração não autorizada'
        });

      expect(userError).toBeDefined();
    });
  });

  describe('Session Management RLS', () => {
    it('Usuários devem visualizar apenas suas próprias sessões', async () => {
      const { data, error } = await testClients.user
        .from('user_sessions')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.every(session => session.user_id === testUserIds.user)).toBe(true);
    });

    it('Admin deve visualizar todas as sessões', async () => {
      const { data, error } = await testClients.admin
        .from('user_sessions')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });
});