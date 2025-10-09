import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente necessárias não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupTestProfile() {
  console.log('🔧 Configurando perfil de teste...')

  try {
    // Verificar estrutura da tabela profiles
    console.log('🔍 Verificando estrutura da tabela profiles...')
    
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (profilesError) {
      console.error('❌ Erro ao acessar tabela profiles:', profilesError)
      return
    }

    console.log('✅ Tabela profiles acessível')

    // Verificar se já existe algum perfil
    const { data: existingProfiles, error: existingError } = await supabase
      .from('profiles')
      .select('*')

    if (existingError) {
      console.error('❌ Erro ao verificar perfis existentes:', existingError)
      return
    }

    console.log(`📋 Perfis existentes: ${existingProfiles?.length || 0}`)

    if (existingProfiles && existingProfiles.length > 0) {
      console.log('✅ Já existem perfis na tabela')
      console.log('📋 Primeiro perfil:', existingProfiles[0])
      return existingProfiles[0]
    }

    // Criar um perfil de teste
    console.log('📝 Criando perfil de teste...')
    
    const testProfile = {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'test@medstaff.com',
      full_name: 'Sistema de Teste',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert(testProfile)
      .select()

    if (createError) {
      console.error('❌ Erro ao criar perfil de teste:', createError)
      
      // Tentar com um UUID diferente
      const alternativeProfile = {
        email: 'test@medstaff.com',
        full_name: 'Sistema de Teste',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: altProfile, error: altError } = await supabase
        .from('profiles')
        .insert(alternativeProfile)
        .select()

      if (altError) {
        console.error('❌ Erro ao criar perfil alternativo:', altError)
        return null
      }

      console.log('✅ Perfil alternativo criado:', altProfile)
      return altProfile[0]
    }

    console.log('✅ Perfil de teste criado:', newProfile)
    return newProfile[0]

  } catch (error) {
    console.error('❌ Erro geral:', error)
    return null
  }
}

async function testTaskCreation(profileId) {
  console.log('🧪 Testando criação de task com perfil válido...')

  try {
    const testTask = {
      title: 'Task de Teste',
      description: 'Testando criação com perfil válido',
      status: 'todo',
      priority: 'medium',
      created_by: profileId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .insert(testTask)
      .select()

    if (taskError) {
      console.error('❌ Erro ao criar task:', taskError)
      return false
    }

    console.log('✅ Task criada com sucesso:', taskData)

    // Limpar a task de teste
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskData[0].id)

    if (deleteError) {
      console.log('⚠️ Erro ao limpar task de teste:', deleteError)
    } else {
      console.log('✅ Task de teste removida')
    }

    return true

  } catch (error) {
    console.error('❌ Erro ao testar criação de task:', error)
    return false
  }
}

// Executar
async function main() {
  const profile = await setupTestProfile()
  
  if (profile) {
    await testTaskCreation(profile.id)
  }
}

main()