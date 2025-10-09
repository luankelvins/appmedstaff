import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ VITE_SUPABASE_SERVICE_ROLE_KEY não encontrada no .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkEmployeesSchema() {
  console.log('🔍 Verificando schema da tabela employees...')
  
  try {
    // Verificar se a tabela employees existe tentando fazer uma query
    const { data: employeesTest, error: employeesError } = await supabase
      .from('employees')
      .select('*')
      .limit(1)
    
    if (employeesError) {
      console.error('❌ Erro ao acessar tabela employees:', employeesError.message)
      console.log('ℹ️ A tabela employees pode não existir ou não ter permissões adequadas')
    } else {
      console.log('✅ Tabela employees acessível')
      if (employeesTest && employeesTest.length > 0) {
        console.log('📋 Exemplo de registro employees:')
        console.log(Object.keys(employeesTest[0]))
      } else {
        console.log('ℹ️ Tabela employees está vazia')
      }
    }
    
    // Verificar se existe algum funcionário com o email
    console.log('\n🔍 Verificando funcionário existente...')
    const { data: existingEmployee, error: empError } = await supabase
      .from('employees')
      .select('*')
      .eq('email', 'Luankelvin@soumedstaff.com')
      .single()
    
    if (empError && empError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar funcionário:', empError.message)
    } else if (existingEmployee) {
      console.log('✅ Funcionário encontrado:')
      console.log(existingEmployee)
    } else {
      console.log('ℹ️ Funcionário não encontrado na tabela employees')
    }
    
    // Verificar perfil existente
    console.log('\n🔍 Verificando perfil existente...')
    const { data: existingProfile, error: profError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'Luankelvin@soumedstaff.com')
      .single()
    
    if (profError && profError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar perfil:', profError.message)
    } else if (existingProfile) {
      console.log('✅ Perfil encontrado:')
      console.log(existingProfile)
    } else {
      console.log('ℹ️ Perfil não encontrado na tabela profiles')
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

checkEmployeesSchema()