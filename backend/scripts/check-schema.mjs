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

async function checkSchema() {
  console.log('🔍 Verificando schema da tabela profiles...')
  
  try {
    // Tentar fazer uma query simples para ver quais colunas existem
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro ao consultar profiles:', error)
      return
    }
    
    console.log('✅ Query executada com sucesso!')
    
    if (data && data.length > 0) {
      console.log('📋 Colunas disponíveis na tabela profiles:')
      console.log(Object.keys(data[0]))
    } else {
      console.log('ℹ️  Tabela profiles está vazia, tentando inserir um registro de teste...')
      
      // Tentar inserir apenas com colunas básicas
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: '00000000-0000-0000-0000-000000000000',
          email: 'test@test.com',
          name: 'Test User'
        })
        .select()
      
      if (insertError) {
        console.log('❌ Erro ao inserir teste:', insertError.message)
        console.log('🔍 Isso nos ajuda a entender quais colunas existem')
      } else {
        console.log('✅ Inserção de teste bem-sucedida')
        console.log('📋 Colunas confirmadas:', Object.keys(insertData[0]))
        
        // Remover o registro de teste
        await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('id', '00000000-0000-0000-0000-000000000000')
      }
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

checkSchema()