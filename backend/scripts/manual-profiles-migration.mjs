import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkProfilesTable() {
  console.log('🔍 Verificando se a tabela profiles existe...')
  
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .limit(1)

    if (error) {
      if (error.message.includes('relation "public.profiles" does not exist')) {
        console.log('ℹ️  Tabela profiles não existe - já foi removida')
        return { exists: false, data: null }
      }
      throw error
    }

    console.log('✅ Tabela profiles existe')
    return { exists: true, data }
  } catch (error) {
    console.error('❌ Erro ao verificar tabela profiles:', error.message)
    return { exists: false, data: null }
  }
}

async function backupProfilesData() {
  console.log('💾 Fazendo backup dos dados da tabela profiles...')
  
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')

    if (error) {
      throw error
    }

    console.log(`📊 Encontrados ${data.length} registros na tabela profiles`)
    
    if (data.length > 0) {
      // Salvar backup em arquivo JSON
      const fs = await import('fs')
      const backupData = {
        timestamp: new Date().toISOString(),
        table: 'profiles',
        records: data
      }
      
      const backupPath = `./backup-profiles-${Date.now()}.json`
      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2))
      console.log(`✅ Backup salvo em: ${backupPath}`)
    }

    return data
  } catch (error) {
    console.error('❌ Erro ao fazer backup:', error.message)
    return null
  }
}

async function createProfilesBackupTable(profilesData) {
  console.log('🗃️  Criando tabela profiles_backup...')
  
  try {
    // Verificar se a tabela backup já existe
    const { error: checkError } = await supabaseAdmin
      .from('profiles_backup')
      .select('id')
      .limit(1)

    if (!checkError) {
      console.log('ℹ️  Tabela profiles_backup já existe')
      return true
    }

    // Se chegou aqui, a tabela não existe
    console.log('⚠️  Não é possível criar tabela profiles_backup via script')
    console.log('📋 SQL para criar a tabela backup:')
    console.log(`
CREATE TABLE profiles_backup AS 
SELECT * FROM profiles;

-- Ou se a tabela profiles não existir mais, criar manualmente:
CREATE TABLE profiles_backup (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  employee_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
`)

    if (profilesData && profilesData.length > 0) {
      console.log('📋 Dados para inserir na tabela backup:')
      profilesData.forEach((profile, index) => {
        console.log(`INSERT INTO profiles_backup VALUES (
  '${profile.id}',
  '${profile.email}',
  '${profile.full_name || 'NULL'}',
  '${profile.avatar_url || 'NULL'}',
  '${profile.employee_id || 'NULL'}',
  '${profile.created_at}',
  '${profile.updated_at}'
);`)
      })
    }

    return false
  } catch (error) {
    console.error('❌ Erro ao criar tabela backup:', error.message)
    return false
  }
}

async function removeProfilesTable() {
  console.log('🗑️  Removendo tabela profiles...')
  
  try {
    // Verificar se a tabela ainda existe
    const { exists } = await checkProfilesTable()
    
    if (!exists) {
      console.log('ℹ️  Tabela profiles já foi removida')
      return true
    }

    console.log('⚠️  Não é possível remover tabela via script')
    console.log('📋 SQL para remover a tabela profiles:')
    console.log(`
-- Primeiro, remover políticas RLS
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Remover triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remover função se não for usada em outros lugares
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Remover índices
DROP INDEX IF EXISTS idx_profiles_email;
DROP INDEX IF EXISTS idx_profiles_employee_id;

-- Finalmente, remover a tabela
DROP TABLE IF EXISTS profiles CASCADE;
`)

    return false
  } catch (error) {
    console.error('❌ Erro ao remover tabela:', error.message)
    return false
  }
}

async function verifyTasksIntegrity() {
  console.log('🔗 Verificando integridade dos relacionamentos em tasks...')
  
  try {
    // Verificar tasks com assigned_to não nulo
    const { data: tasksWithAssignedTo, error: tasksError } = await supabaseAdmin
      .from('tasks')
      .select('id, title, assigned_to')
      .not('assigned_to', 'is', null)

    if (tasksError) {
      throw tasksError
    }

    console.log(`📊 Encontradas ${tasksWithAssignedTo.length} tasks com assigned_to`)
    
    if (tasksWithAssignedTo.length > 0) {
      console.log('⚠️  Tasks que referenciam usuários:')
      tasksWithAssignedTo.forEach(task => {
        console.log(`  - Task ${task.id}: "${task.title}" -> assigned_to: ${task.assigned_to}`)
      })
      
      console.log('\n💡 Recomendações:')
      console.log('1. Verificar se esses UUIDs correspondem a usuários válidos em auth.users')
      console.log('2. Considerar migrar para referenciar employees.id se apropriado')
      console.log('3. Ou definir assigned_to como NULL se não houver correspondência')
    }

    return tasksWithAssignedTo
  } catch (error) {
    console.error('❌ Erro ao verificar tasks:', error.message)
    return null
  }
}

async function main() {
  console.log('🚀 === MIGRAÇÃO MANUAL DA TABELA PROFILES ===\n')

  // 1. Verificar se profiles existe
  const { exists, data } = await checkProfilesTable()
  
  if (exists) {
    // 2. Fazer backup dos dados
    const profilesData = await backupProfilesData()
    
    // 3. Criar tabela backup
    await createProfilesBackupTable(profilesData)
    
    // 4. Remover tabela profiles
    await removeProfilesTable()
  }
  
  // 5. Verificar integridade das tasks
  await verifyTasksIntegrity()
  
  console.log('\n📋 === RESUMO ===')
  console.log('✅ Verificação da tabela profiles concluída')
  console.log('✅ Backup dos dados realizado (se existiam)')
  console.log('✅ SQLs fornecidos para execução manual')
  console.log('✅ Integridade das tasks verificada')
  
  console.log('\n🎯 PRÓXIMOS PASSOS:')
  console.log('1. Execute os SQLs fornecidos no SQL Editor do Supabase')
  console.log('2. Crie as tabelas notifications e irpf usando os SQLs anteriores')
  console.log('3. Verifique se a aplicação está funcionando corretamente')
}

main().catch(console.error)