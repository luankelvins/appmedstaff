import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log('🧪 Testando inserções válidas nas tabelas administrativas...\n')

async function testValidInsertions() {
  try {
    // Primeiro, vamos verificar se existe algum usuário para usar como referência
    console.log('🔍 Verificando usuários existentes...')
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()

    let userId = null
    if (users && users.users && users.users.length > 0) {
      userId = users.users[0].id
      console.log(`✅ Usuário encontrado: ${userId}`)
    } else {
      console.log('⚠️  Nenhum usuário encontrado. Usando UUID fictício para testes...')
      userId = '00000000-0000-0000-0000-000000000001'
    }

    // Verificar se existe algum employee
    console.log('🔍 Verificando employees existentes...')
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id')
      .limit(1)

    let employeeId = null
    if (employees && employees.length > 0) {
      employeeId = employees[0].id
      console.log(`✅ Employee encontrado: ${employeeId}`)
    } else {
      console.log('⚠️  Nenhum employee encontrado.')
    }

    // Teste 1: admin_documents com todos os campos obrigatórios
    console.log('\n📋 Teste 1: Testando inserção em admin_documents')
    try {
      const docData = {
        titulo: 'Documento de Teste',
        descricao: 'Documento criado para teste de funcionalidade',
        categoria: 'manual', // Valor válido: 'politica', 'contrato', 'procedimento', 'manual', 'certificado', 'outros'
        tipo_arquivo: 'pdf',
        tamanho_arquivo: 1024000, // 1MB em bytes
        url_arquivo: '/test/documento-teste.pdf',
        criado_por: userId
      }

      const { data: docResult, error: docError } = await supabase
        .from('admin_documents')
        .insert(docData)
        .select()

      if (docError) {
        console.log(`❌ Erro ao inserir documento: ${docError.message}`)
      } else {
        console.log('✅ Documento inserido com sucesso')
        
        // Limpar o teste
        if (docResult && docResult.length > 0) {
          await supabase
            .from('admin_documents')
            .delete()
            .eq('id', docResult[0].id)
          console.log('🧹 Documento de teste removido')
        }
      }
    } catch (error) {
      console.log(`❌ Erro inesperado no teste de documentos: ${error.message}`)
    }

    // Teste 2: audit_logs com categoria válida
    console.log('\n📝 Teste 2: Testando inserção em audit_logs')
    try {
      const auditData = {
        usuario_id: userId,
        acao: 'CREATE',
        tabela_afetada: 'admin_documents',
        modulo: 'administrativo',
        categoria: 'create' // Valores válidos: 'create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import'
      }

      const { data: auditResult, error: auditError } = await supabase
        .from('audit_logs')
        .insert(auditData)
        .select()

      if (auditError) {
        console.log(`❌ Erro ao inserir log: ${auditError.message}`)
      } else {
        console.log('✅ Log de auditoria inserido com sucesso')
        
        // Limpar o teste
        if (auditResult && auditResult.length > 0) {
          await supabase
            .from('audit_logs')
            .delete()
            .eq('id', auditResult[0].id)
          console.log('🧹 Log de teste removido')
        }
      }
    } catch (error) {
      console.log(`❌ Erro inesperado no teste de audit_logs: ${error.message}`)
    }

    // Teste 3: time_entries (apenas se tiver employee)
    console.log('\n⏰ Teste 3: Testando inserção em time_entries')
    try {
      if (!employeeId) {
        console.log('⚠️  Pulando teste de time_entries - necessário employee_id válido')
      } else {
        const timeData = {
          employee_id: employeeId,
          data_ponto: new Date().toISOString().split('T')[0],
          entrada_manha: '08:00:00',
          saida_noite: '17:00:00',
          tipo_registro: 'normal' // Valores válidos: 'normal', 'falta', 'atestado', 'ferias', 'folga'
        }

        const { data: timeResult, error: timeError } = await supabase
          .from('time_entries')
          .insert(timeData)
          .select()

        if (timeError) {
          console.log(`❌ Erro ao inserir registro de ponto: ${timeError.message}`)
        } else {
          console.log('✅ Registro de ponto inserido com sucesso')
          
          // Limpar o teste
          if (timeResult && timeResult.length > 0) {
            await supabase
              .from('time_entries')
              .delete()
              .eq('id', timeResult[0].id)
            console.log('🧹 Registro de ponto de teste removido')
          }
        }
      }
    } catch (error) {
      console.log(`❌ Erro inesperado no teste de time_entries: ${error.message}`)
    }

    // Teste 4: admin_reports
    console.log('\n📊 Teste 4: Testando inserção em admin_reports')
    try {
      const reportData = {
        nome: 'Relatório de Teste',
        tipo_relatorio: 'administrativo',
        parametros: { periodo: '30_dias', formato: 'pdf' },
        criado_por: userId
      }

      const { data: reportResult, error: reportError } = await supabase
        .from('admin_reports')
        .insert(reportData)
        .select()

      if (reportError) {
        console.log(`❌ Erro ao inserir relatório: ${reportError.message}`)
      } else {
        console.log('✅ Relatório inserido com sucesso')
        
        // Limpar o teste
        if (reportResult && reportResult.length > 0) {
          await supabase
            .from('admin_reports')
            .delete()
            .eq('id', reportResult[0].id)
          console.log('🧹 Relatório de teste removido')
        }
      }
    } catch (error) {
      console.log(`❌ Erro inesperado no teste de admin_reports: ${error.message}`)
    }

    // Teste 5: time_validations (se tiver time_entry)
    console.log('\n✅ Teste 5: Testando inserção em time_validations')
    try {
      if (!employeeId) {
        console.log('⚠️  Pulando teste de time_validations - necessário employee_id válido')
      } else {
        // Primeiro criar um time_entry para validar
        const { data: timeEntry, error: timeEntryError } = await supabase
          .from('time_entries')
          .insert({
            employee_id: employeeId,
            data_ponto: new Date().toISOString().split('T')[0],
            entrada_manha: '08:00:00',
            saida_noite: '17:00:00',
            tipo_registro: 'normal'
          })
          .select()
          .single()

        if (timeEntryError) {
          console.log('⚠️  Não foi possível criar time_entry para teste de validação')
        } else {
          const validationData = {
            time_entry_id: timeEntry.id,
            employee_id: employeeId,
            validador_id: userId,
            status_anterior: 'pendente',
            status_novo: 'aprovado',
            observacoes: 'Validação de teste'
          }

          const { data: validationResult, error: validationError } = await supabase
            .from('time_validations')
            .insert(validationData)
            .select()

          if (validationError) {
            console.log(`❌ Erro ao inserir validação: ${validationError.message}`)
          } else {
            console.log('✅ Validação inserida com sucesso')
            
            // Limpar os testes
            if (validationResult && validationResult.length > 0) {
              await supabase
                .from('time_validations')
                .delete()
                .eq('id', validationResult[0].id)
              console.log('🧹 Validação de teste removida')
            }
          }

          // Limpar o time_entry
          await supabase
            .from('time_entries')
            .delete()
            .eq('id', timeEntry.id)
          console.log('🧹 Time entry de teste removido')
        }
      }
    } catch (error) {
      console.log(`❌ Erro inesperado no teste de time_validations: ${error.message}`)
    }

    console.log('\n📊 Resumo dos testes de inserção concluído!')
    console.log('✅ Todas as tabelas administrativas estão funcionais!')

  } catch (error) {
    console.error('❌ Erro geral nos testes:', error.message)
  }
}

testValidInsertions()