import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🚀 Configurando dados de teste...\n');

async function createTestProfile() {
  try {
    console.log('👤 Verificando perfis existentes...');
    
    const { data: existingProfiles, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Erro ao verificar perfis:', checkError.message);
      return null;
    }
    
    if (existingProfiles && existingProfiles.length > 0) {
      console.log('✅ Perfil existente encontrado:', existingProfiles[0].email);
      return existingProfiles[0];
    }
    
    console.log('📝 Criando perfil de teste...');
    
    const testProfile = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@medstaff.com',
      name: 'Administrador Teste',
      position: 'Administrador',
      department: 'TI',
      employee_id: 'ADM001',
      role: 'admin',
      permissions: ['read', 'write', 'admin'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('profiles')
      .insert(testProfile)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao criar perfil:', error.message);
      return null;
    }
    
    console.log('✅ Perfil de teste criado:', data.email);
    return data;
    
  } catch (err) {
    console.error('❌ Erro inesperado ao criar perfil:', err.message);
    return null;
  }
}

async function createTestTasks(profileId) {
  try {
    console.log('\n📋 Verificando tasks existentes...');
    
    const { data: existingTasks, error: checkError } = await supabase
      .from('tasks')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Erro ao verificar tasks:', checkError.message);
      return;
    }
    
    if (existingTasks && existingTasks.length > 0) {
      console.log('✅ Tasks existentes encontradas:', existingTasks.length);
      return;
    }
    
    console.log('📝 Criando tasks de teste...');
    
    const testTasks = [
      {
        title: 'Configurar ambiente de desenvolvimento',
        description: 'Configurar todas as ferramentas necessárias para desenvolvimento',
        status: 'todo',
        priority: 'high',
        created_by: profileId,
        assigned_to: profileId,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        title: 'Revisar documentação do projeto',
        description: 'Revisar e atualizar a documentação técnica',
        status: 'in_progress',
        priority: 'medium',
        created_by: profileId,
        assigned_to: profileId,
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        title: 'Implementar testes unitários',
        description: 'Criar testes unitários para os principais componentes',
        status: 'todo',
        priority: 'medium',
        created_by: profileId,
        assigned_to: profileId,
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 dias
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        title: 'Otimizar performance da aplicação',
        description: 'Identificar e corrigir gargalos de performance',
        status: 'completed',
        priority: 'low',
        created_by: profileId,
        assigned_to: profileId,
        completed_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias atrás
        updated_at: new Date().toISOString()
      }
    ];
    
    const { data, error } = await supabase
      .from('tasks')
      .insert(testTasks)
      .select();
    
    if (error) {
      console.error('❌ Erro ao criar tasks:', error.message);
      return;
    }
    
    console.log(`✅ ${data.length} tasks de teste criadas`);
    
  } catch (err) {
    console.error('❌ Erro inesperado ao criar tasks:', err.message);
  }
}

async function verifySetup() {
  try {
    console.log('\n🔍 Verificando configuração final...');
    
    // Verificar perfis
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (profileError) {
      console.error('❌ Erro ao verificar perfis:', profileError.message);
    } else {
      console.log(`📊 Total de perfis: ${profiles || 0}`);
    }
    
    // Verificar tasks
    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .select('count', { count: 'exact', head: true });
    
    if (taskError) {
      console.error('❌ Erro ao verificar tasks:', taskError.message);
    } else {
      console.log(`📊 Total de tasks: ${tasks || 0}`);
    }
    
    // Verificar tasks por status
    const { data: tasksByStatus, error: statusError } = await supabase
      .from('tasks')
      .select('status');
    
    if (!statusError && tasksByStatus) {
      const statusCount = tasksByStatus.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📈 Tasks por status:');
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`  - ${status}: ${count}`);
      });
    }
    
  } catch (err) {
    console.error('❌ Erro inesperado na verificação:', err.message);
  }
}

async function main() {
  const profile = await createTestProfile();
  
  if (profile) {
    await createTestTasks(profile.id);
    await verifySetup();
    
    console.log('\n✅ Configuração de dados de teste concluída!');
    console.log('\n💡 Dicas:');
    console.log('- Use o email "admin@medstaff.com" para fazer login');
    console.log('- As tasks de teste já estão disponíveis');
    console.log('- Você pode criar mais dados através da interface');
  } else {
    console.log('\n❌ Falha na configuração dos dados de teste');
  }
}

main().catch(console.error);