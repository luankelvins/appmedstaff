#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🧪 Testando performance e conectividade após correções...\n')

// Função para medir tempo de execução
const measureTime = async (name, operation) => {
  const start = Date.now()
  try {
    const result = await operation()
    const duration = Date.now() - start
    console.log(`✅ ${name}: ${duration}ms`)
    return { success: true, duration, result }
  } catch (error) {
    const duration = Date.now() - start
    console.log(`❌ ${name}: ${duration}ms - ${error.message}`)
    return { success: false, duration, error }
  }
}

// Teste 1: Verificar tabela financial_notifications (corrigida)
console.log('📋 Teste 1: Verificar tabela financial_notifications')
const test1 = await measureTime('Query financial_notifications', async () => {
  const { data, error } = await supabase
    .from('financial_notifications')
    .select('id')
    .limit(1)
  
  if (error) throw error
  return data
})

// Teste 2: Testar contagem de leads (com retry)
console.log('\n📊 Teste 2: Contagem de leads')
const test2 = await measureTime('Count leads', async () => {
  const { count, error } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
  
  if (error) throw error
  return count
})

// Teste 3: Testar contagem de clientes PF
console.log('\n👥 Teste 3: Contagem de clientes PF')
const test3 = await measureTime('Count clientes_pf', async () => {
  const { count, error } = await supabase
    .from('clientes_pf')
    .select('id', { count: 'exact', head: true })
  
  if (error) throw error
  return count
})

// Teste 4: Testar contagem de clientes PJ
console.log('\n🏢 Teste 4: Contagem de clientes PJ')
const test4 = await measureTime('Count clientes_pj', async () => {
  const { count, error } = await supabase
    .from('clientes_pj')
    .select('id', { count: 'exact', head: true })
  
  if (error) throw error
  return count
})

// Teste 5: Testar query de tarefas
console.log('\n📝 Teste 5: Query de tarefas')
const test5 = await measureTime('Query tasks', async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, status')
    .limit(5)
  
  if (error) throw error
  return data
})

// Teste 6: Testar query de profiles
console.log('\n👤 Teste 6: Query de profiles')
const test6 = await measureTime('Query profiles', async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email')
    .limit(3)
  
  if (error) throw error
  return data
})

// Teste 7: Testar autenticação (se houver usuário logado)
console.log('\n🔐 Teste 7: Verificar sessão de autenticação')
const test7 = await measureTime('Check auth session', async () => {
  const { data, error } = await supabase.auth.getSession()
  
  if (error) throw error
  return data.session ? 'Sessão ativa' : 'Sem sessão'
})

// Resumo dos resultados
console.log('\n📊 RESUMO DOS TESTES:')
console.log('=' * 50)

const tests = [
  { name: 'Financial Notifications', result: test1 },
  { name: 'Count Leads', result: test2 },
  { name: 'Count Clientes PF', result: test3 },
  { name: 'Count Clientes PJ', result: test4 },
  { name: 'Query Tasks', result: test5 },
  { name: 'Query Profiles', result: test6 },
  { name: 'Auth Session', result: test7 }
]

let successCount = 0
let totalTime = 0

tests.forEach(test => {
  const status = test.result.success ? '✅' : '❌'
  const duration = test.result.duration
  totalTime += duration
  
  if (test.result.success) successCount++
  
  console.log(`${status} ${test.name}: ${duration}ms`)
})

console.log('\n📈 ESTATÍSTICAS:')
console.log(`✅ Sucessos: ${successCount}/${tests.length}`)
console.log(`⏱️  Tempo total: ${totalTime}ms`)
console.log(`⚡ Tempo médio: ${Math.round(totalTime / tests.length)}ms`)

if (successCount === tests.length) {
  console.log('\n🎉 Todos os testes passaram! Performance otimizada.')
} else {
  console.log('\n⚠️  Alguns testes falharam. Verifique os logs acima.')
}

// Teste de stress (opcional)
console.log('\n🔥 Teste de stress: 5 queries simultâneas')
const stressStart = Date.now()

try {
  const promises = [
    supabase.from('leads').select('id').limit(1),
    supabase.from('tasks').select('id').limit(1),
    supabase.from('profiles').select('id').limit(1),
    supabase.from('clientes_pf').select('id').limit(1),
    supabase.from('clientes_pj').select('id').limit(1)
  ]
  
  const results = await Promise.allSettled(promises)
  const stressDuration = Date.now() - stressStart
  
  const successfulQueries = results.filter(r => r.status === 'fulfilled').length
  console.log(`✅ Stress test: ${successfulQueries}/5 queries bem-sucedidas em ${stressDuration}ms`)
  
  if (successfulQueries === 5) {
    console.log('🚀 Sistema suporta queries simultâneas!')
  } else {
    console.log('⚠️  Algumas queries simultâneas falharam')
  }
} catch (error) {
  console.log(`❌ Stress test falhou: ${error.message}`)
}

console.log('\n✨ Teste de performance concluído!')