import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testTaskCreation() {
  console.log('🧪 Testando criação de tasks...')
  
  try {
    // Primeiro, vamos verificar a estrutura atual da tabela tasks
    console.log('\n🔍 Verificando estrutura da tabela tasks...')
    const { data: tasksTest, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .limit(1)
    
    if (tasksError) {
      console.error('❌ Erro ao acessar tabela tasks:', tasksError.message)
      return
    }
    
    console.log('✅ Tabela tasks acessível')
    
    // Testar criação de task básica (apenas com campos que existem)
    console.log('\n🧪 Testando criação de task básica...')
    const basicTaskData = {
      title: 'Teste de Task',
      description: 'Descrição de teste',
      status: 'pending',
      priority: 'medium'
    }
    
    const { data: basicTask, error: basicError } = await supabase
      .from('tasks')
      .insert(basicTaskData)
      .select()
      .single()
    
    if (basicError) {
      console.error('❌ Erro ao criar task básica:', basicError.message)
      console.error('Detalhes:', basicError)
    } else {
      console.log('✅ Task básica criada com sucesso:')
      console.log(basicTask)
      
      // Limpar o teste
      await supabase.from('tasks').delete().eq('id', basicTask.id)
      console.log('🧹 Task de teste removida')
    }
    
    // Verificar se podemos buscar employees para usar como responsáveis
    console.log('\n🔍 Verificando employees disponíveis...')
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id, email, dados_pessoais')
      .limit(5)
    
    if (empError) {
      console.error('❌ Erro ao buscar employees:', empError.message)
    } else {
      console.log('✅ Employees encontrados:', employees.length)
      if (employees.length > 0) {
        console.log('📋 Exemplo de employee:')
        console.log(employees[0])
      }
    }
    
    // Verificar profiles disponíveis
    console.log('\n🔍 Verificando profiles disponíveis...')
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .limit(5)
    
    if (profError) {
      console.error('❌ Erro ao buscar profiles:', profError.message)
    } else {
      console.log('✅ Profiles encontrados:', profiles.length)
      if (profiles.length > 0) {
        console.log('📋 Exemplo de profile:')
        console.log(profiles[0])
      }
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

testTaskCreation()