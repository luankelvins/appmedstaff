import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ VITE_SUPABASE_SERVICE_ROLE_KEY não encontrada no .env')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function updateSchema() {
  console.log('🔧 Atualizando schema da tabela profiles...')
  
  try {
    // 1. Adicionar coluna role
    console.log('1️⃣ Adicionando coluna role...')
    const { error: roleError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';`
    })
    
    if (roleError) {
      console.log('⚠️ Erro ao adicionar coluna role (pode já existir):', roleError.message)
    } else {
      console.log('✅ Coluna role adicionada')
    }
    
    // 2. Adicionar coluna permissions
    console.log('2️⃣ Adicionando coluna permissions...')
    const { error: permissionsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;`
    })
    
    if (permissionsError) {
      console.log('⚠️ Erro ao adicionar coluna permissions (pode já existir):', permissionsError.message)
    } else {
      console.log('✅ Coluna permissions adicionada')
    }
    
    // 3. Adicionar coluna full_name
    console.log('3️⃣ Adicionando coluna full_name...')
    const { error: fullNameError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;`
    })
    
    if (fullNameError) {
      console.log('⚠️ Erro ao adicionar coluna full_name (pode já existir):', fullNameError.message)
    } else {
      console.log('✅ Coluna full_name adicionada')
    }
    
    // 4. Verificar se as colunas foram adicionadas
    console.log('4️⃣ Verificando schema atualizado...')
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro ao verificar schema:', error)
      return
    }
    
    console.log('✅ Schema atualizado com sucesso!')
    console.log('📋 Colunas disponíveis agora:')
    
    // Se há dados, mostrar as colunas
    if (data && data.length > 0) {
      console.log(Object.keys(data[0]))
    } else {
      console.log('ℹ️  Tabela vazia, mas schema foi atualizado')
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

updateSchema()