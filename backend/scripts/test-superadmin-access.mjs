import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY não encontrada no .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const testCredentials = {
  email: 'Luankelvin@soumedstaff.com',
  password: 'SuperAdmin123!'
}

async function testSuperAdminAccess() {
  console.log('🧪 Testando acesso de superadmin...')
  console.log('📧 Email:', testCredentials.email)
  
  try {
    // 1. Fazer login
    console.log('\n1️⃣ Fazendo login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword(testCredentials)
    
    if (authError) {
      console.error('❌ Erro no login:', authError.message)
      return
    }
    
    console.log('✅ Login realizado com sucesso!')
    console.log('👤 Usuário ID:', authData.user.id)
    
    // 2. Verificar perfil
    console.log('\n2️⃣ Verificando perfil...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError.message)
    } else {
      console.log('✅ Perfil encontrado:')
      console.log('  📛 Nome:', profile.name)
      console.log('  💼 Posição:', profile.position)
      console.log('  🏢 Departamento:', profile.department)
      console.log('  🛡️ Role:', profile.role || 'Não definido')
      console.log('  ⚡ Permissões:', profile.permissions?.length || 0, 'permissões')
    }
    
    // 3. Testar acesso a diferentes tabelas
    console.log('\n3️⃣ Testando acesso às tabelas...')
    
    // Testar profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, name')
      .limit(5)
    
    if (profilesError) {
      console.log('❌ Acesso negado à tabela profiles:', profilesError.message)
    } else {
      console.log('✅ Acesso à tabela profiles:', profiles.length, 'registros')
    }
    
    // Testar employees
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id, email')
      .limit(5)
    
    if (employeesError) {
      console.log('❌ Acesso negado à tabela employees:', employeesError.message)
    } else {
      console.log('✅ Acesso à tabela employees:', employees.length, 'registros')
    }
    
    // Testar tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title')
      .limit(5)
    
    if (tasksError) {
      console.log('❌ Acesso negado à tabela tasks:', tasksError.message)
    } else {
      console.log('✅ Acesso à tabela tasks:', tasks.length, 'registros')
    }
    
    // Testar leads
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, name')
      .limit(5)
    
    if (leadsError) {
      console.log('❌ Acesso negado à tabela leads:', leadsError.message)
    } else {
      console.log('✅ Acesso à tabela leads:', leads.length, 'registros')
    }
    
    // 4. Testar operações de escrita
    console.log('\n4️⃣ Testando operações de escrita...')
    
    // Testar criação de tarefa
    const { data: newTask, error: taskError } = await supabase
      .from('tasks')
      .insert({
        title: 'Teste de Superadmin',
        description: 'Tarefa criada para testar permissões de superadmin',
        status: 'pending',
        priority: 'low',
        created_by: authData.user.id
      })
      .select()
      .single()
    
    if (taskError) {
      console.log('❌ Erro ao criar tarefa:', taskError.message)
    } else {
      console.log('✅ Tarefa criada com sucesso:', newTask.id)
      
      // Limpar tarefa de teste
      await supabase
        .from('tasks')
        .delete()
        .eq('id', newTask.id)
      
      console.log('🧹 Tarefa de teste removida')
    }
    
    // 5. Fazer logout
    console.log('\n5️⃣ Fazendo logout...')
    const { error: logoutError } = await supabase.auth.signOut()
    
    if (logoutError) {
      console.error('❌ Erro no logout:', logoutError.message)
    } else {
      console.log('✅ Logout realizado com sucesso!')
    }
    
    console.log('\n🎉 Teste de acesso de superadmin concluído!')
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

testSuperAdminAccess()