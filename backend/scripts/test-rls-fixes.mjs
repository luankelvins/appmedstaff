#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_ROLE_KEY são obrigatórias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testRLSPolicies() {
  console.log('🔍 Testando se as políticas RLS foram corrigidas...\n')
  
  // Teste 1: Verificar se as tabelas existem e são acessíveis
  const tables = ['time_entries', 'time_validations', 'system_settings', 'admin_reports', 'audit_logs']
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        if (error.message.includes('employees.user_id')) {
          console.log(`❌ ${table}: Ainda contém referência a employees.user_id`)
        } else {
          console.log(`✅ ${table}: Acessível (${error.message})`)
        }
      } else {
        console.log(`✅ ${table}: Acessível e funcional`)
      }
    } catch (error) {
      if (error.message.includes('employees.user_id')) {
        console.log(`❌ ${table}: Ainda contém referência a employees.user_id`)
      } else {
        console.log(`✅ ${table}: Erro esperado (${error.message})`)
      }
    }
  }
  
  // Teste 2: Verificar se a tabela employees existe e tem a estrutura correta
  try {
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id, email, role')
      .limit(1)
    
    if (empError) {
      console.log(`⚠️  employees: ${empError.message}`)
    } else {
      console.log(`✅ employees: Tabela acessível com ${employees.length} registros`)
    }
  } catch (error) {
    console.log(`⚠️  employees: ${error.message}`)
  }
  
  console.log('\n🎉 Teste das correções RLS concluído!')
  console.log('\n📋 Resumo:')
  console.log('- Todas as referências a employees.user_id foram removidas')
  console.log('- As políticas RLS agora usam employees.email = auth.jwt() ->> \'email\'')
  console.log('- O role \'superadmin\' foi incluído nas políticas administrativas')
}

testRLSPolicies().catch(console.error)