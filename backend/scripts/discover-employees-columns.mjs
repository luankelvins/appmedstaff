import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function discoverEmployeesColumns() {
  console.log('🔍 Descobrindo colunas da tabela employees...')
  
  try {
    // Tentar inserir um registro vazio para ver quais colunas são obrigatórias
    const { data, error } = await supabaseAdmin
      .from('employees')
      .insert({})
      .select()
    
    if (error) {
      console.log('❌ Erro esperado (nos ajuda a descobrir as colunas):')
      console.log(error.message)
      
      // Tentar com apenas email
      console.log('\n🔍 Tentando com apenas email...')
      const { data: data2, error: error2 } = await supabaseAdmin
        .from('employees')
        .insert({ email: 'test@test.com' })
        .select()
      
      if (error2) {
        console.log('❌ Erro com email:')
        console.log(error2.message)
        
        // Tentar com email e name
        console.log('\n🔍 Tentando com email e name...')
        const { data: data3, error: error3 } = await supabaseAdmin
          .from('employees')
          .insert({ 
            email: 'test@test.com',
            name: 'Test User'
          })
          .select()
        
        if (error3) {
          console.log('❌ Erro com email e name:')
          console.log(error3.message)
        } else {
          console.log('✅ Sucesso com email e name!')
          console.log('Colunas descobertas:', Object.keys(data3[0]))
          
          // Limpar registro de teste
          await supabaseAdmin
            .from('employees')
            .delete()
            .eq('email', 'test@test.com')
          console.log('🧹 Registro de teste removido')
        }
      } else {
        console.log('✅ Sucesso com apenas email!')
        console.log('Colunas descobertas:', Object.keys(data2[0]))
        
        // Limpar registro de teste
        await supabaseAdmin
          .from('employees')
          .delete()
          .eq('email', 'test@test.com')
        console.log('🧹 Registro de teste removido')
      }
    } else {
      console.log('✅ Sucesso com registro vazio!')
      console.log('Colunas descobertas:', Object.keys(data[0]))
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

discoverEmployeesColumns()