import pool from '../src/config/database.js'

async function createSampleData() {
  console.log('🚀 Criando dados de exemplo...')

  try {
    // Verificar se já existem dados
    const { rows: existingEmployees } = await pool.query('SELECT COUNT(*) as count FROM employees')
    const { rows: existingTasks } = await pool.query('SELECT COUNT(*) as count FROM tasks')
    const { rows: existingLeads } = await pool.query('SELECT COUNT(*) as count FROM leads')
    const { rows: existingContratos } = await pool.query('SELECT COUNT(*) as count FROM contratos')

    console.log(`📊 Dados existentes:`)
    console.log(`   - Funcionários: ${existingEmployees[0].count}`)
    console.log(`   - Tarefas: ${existingTasks[0].count}`)
    console.log(`   - Leads: ${existingLeads[0].count}`)
    console.log(`   - Contratos: ${existingContratos[0].count}`)

    // Criar funcionários de exemplo se não existirem muitos
    if (parseInt(existingEmployees[0].count) < 5) {
      console.log('👥 Criando funcionários de exemplo...')
      
      const employees = [
        { 
          email: 'joao@medstaff.com', 
          dados_pessoais: { nome: 'João Silva', telefone: '11999999999' },
          dados_profissionais: { cargo: 'Desenvolvedor', departamento: 'TI' }
        },
        { 
          email: 'maria@medstaff.com', 
          dados_pessoais: { nome: 'Maria Santos', telefone: '11888888888' },
          dados_profissionais: { cargo: 'Designer', departamento: 'Marketing' }
        },
        { 
          email: 'pedro@medstaff.com', 
          dados_pessoais: { nome: 'Pedro Costa', telefone: '11777777777' },
          dados_profissionais: { cargo: 'Gerente', departamento: 'Vendas' }
        },
        { 
          email: 'ana@medstaff.com', 
          dados_pessoais: { nome: 'Ana Oliveira', telefone: '11666666666' },
          dados_profissionais: { cargo: 'Analista', departamento: 'Financeiro' }
        },
        { 
          email: 'carlos@medstaff.com', 
          dados_pessoais: { nome: 'Carlos Mendes', telefone: '11555555555' },
          dados_profissionais: { cargo: 'Consultor', departamento: 'Consultoria' },
          status: 'inativo'
        }
      ]

      for (const employee of employees) {
        await pool.query(
          'INSERT INTO employees (email, dados_pessoais, dados_profissionais, status) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
          [employee.email, JSON.stringify(employee.dados_pessoais), JSON.stringify(employee.dados_profissionais), employee.status || 'ativo']
        )
      }
      console.log(`✅ ${employees.length} funcionários processados`)
    }

    // Criar tarefas de exemplo se não existirem
    if (parseInt(existingTasks[0].count) === 0) {
      console.log('📋 Criando tarefas de exemplo...')
      
      const tasks = [
        { title: 'Configurar ambiente de desenvolvimento', status: 'completed', priority: 'high' },
        { title: 'Revisar documentação do projeto', status: 'in_progress', priority: 'medium' },
        { title: 'Implementar testes unitários', status: 'pending', priority: 'medium' },
        { title: 'Otimizar performance da aplicação', status: 'completed', priority: 'low' },
        { title: 'Corrigir bugs reportados', status: 'pending', priority: 'high' },
        { title: 'Atualizar dependências', status: 'in_progress', priority: 'medium' },
        { title: 'Criar documentação da API', status: 'pending', priority: 'medium' },
        { title: 'Configurar CI/CD', status: 'completed', priority: 'high' },
        { title: 'Revisar código legacy', status: 'pending', priority: 'low' },
        { title: 'Implementar autenticação', status: 'completed', priority: 'high' }
      ]

      for (const task of tasks) {
        await pool.query(
          'INSERT INTO tasks (title, status, priority, due_date) VALUES ($1, $2, $3, NOW() + INTERVAL \'7 days\')',
          [task.title, task.status, task.priority]
        )
      }
      console.log(`✅ ${tasks.length} tarefas criadas`)
    }

    // Criar leads de exemplo se não existirem
    if (parseInt(existingLeads[0].count) === 0) {
      console.log('🎯 Criando leads de exemplo...')
      
      const leads = [
        { nome: 'Hospital São Lucas', empresa: 'São Lucas Ltda', email: 'contato@saolucas.com.br', telefone: '11999999999', origem: 'site' },
        { nome: 'Clínica Vida', empresa: 'Vida Saúde', email: 'contato@vidasaude.com.br', telefone: '11888888888', origem: 'indicacao' },
        { nome: 'Dr. Carlos Mendes', empresa: 'Consultório Particular', email: 'carlos@consultorio.com.br', telefone: '11777777777', origem: 'redes_sociais' },
        { nome: 'Hospital Central', empresa: 'Central Saúde', email: 'contato@central.com.br', telefone: '11666666666', origem: 'site' },
        { nome: 'Clínica Esperança', empresa: 'Esperança Médica', email: 'contato@esperanca.com.br', telefone: '11555555555', origem: 'indicacao' },
        { nome: 'Laboratório Exato', empresa: 'Exato Diagnósticos', email: 'contato@exato.com.br', telefone: '11444444444', origem: 'google' },
        { nome: 'Clínica Bem Estar', empresa: 'Bem Estar Ltda', email: 'contato@bemestar.com.br', telefone: '11333333333', origem: 'evento' }
      ]

      for (const lead of leads) {
        await pool.query(
          'INSERT INTO leads (nome, empresa, email, telefone, origem) VALUES ($1, $2, $3, $4, $5)',
          [lead.nome, lead.empresa, lead.email, lead.telefone, lead.origem]
        )
      }
      console.log(`✅ ${leads.length} leads criados`)
    }

    // Criar contratos de exemplo se não existirem
    if (parseInt(existingContratos[0].count) === 0) {
      console.log('📄 Criando contratos de exemplo...')
      
      const contratos = [
        { 
          numero_contrato: 'CONT-2024-001', 
          tipo_contrato: 'pj', 
          cliente_nome: 'Hospital São Lucas',
          data_inicio: '2024-01-01',
          data_vencimento: '2024-12-31',
          status: 'ativo'
        },
        { 
          numero_contrato: 'CONT-2024-002', 
          tipo_contrato: 'pj', 
          cliente_nome: 'Clínica Esperança',
          data_inicio: '2024-02-01',
          data_vencimento: '2024-08-01',
          status: 'ativo'
        },
        { 
          numero_contrato: 'CONT-2024-003', 
          tipo_contrato: 'pj', 
          cliente_nome: 'Clínica Bem Estar',
          data_inicio: '2024-03-01',
          data_vencimento: '2025-03-01',
          status: 'ativo'
        },
        { 
          numero_contrato: 'CONT-2024-004', 
          tipo_contrato: 'pf', 
          cliente_nome: 'Laboratório Beta',
          data_inicio: '2024-04-01',
          data_vencimento: '2024-10-01',
          status: 'rascunho'
        },
        { 
          numero_contrato: 'CONT-2023-005', 
          tipo_contrato: 'pj', 
          cliente_nome: 'Hospital Norte',
          data_inicio: '2023-01-01',
          data_vencimento: '2023-12-31',
          status: 'encerrado'
        }
      ]

      for (const contrato of contratos) {
        // Gerar um UUID fictício para cliente_id
        const clienteId = '00000000-0000-0000-0000-000000000001'
        
        await pool.query(
          'INSERT INTO contratos (numero_contrato, tipo_contrato, cliente_id, cliente_nome, data_inicio, data_vencimento, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [contrato.numero_contrato, contrato.tipo_contrato, clienteId, contrato.cliente_nome, contrato.data_inicio, contrato.data_vencimento, contrato.status]
        )
      }
      console.log(`✅ ${contratos.length} contratos criados`)
    }

    // Verificar dados finais
    const { rows: finalEmployees } = await pool.query('SELECT COUNT(*) as count FROM employees')
    const { rows: finalTasks } = await pool.query('SELECT COUNT(*) as count FROM tasks')
    const { rows: finalLeads } = await pool.query('SELECT COUNT(*) as count FROM leads')
    const { rows: finalContratos } = await pool.query('SELECT COUNT(*) as count FROM contratos')

    console.log('\n📊 Dados finais:')
    console.log(`   - Funcionários: ${finalEmployees[0].count}`)
    console.log(`   - Tarefas: ${finalTasks[0].count}`)
    console.log(`   - Leads: ${finalLeads[0].count}`)
    console.log(`   - Contratos: ${finalContratos[0].count}`)

    console.log('\n✅ Dados de exemplo criados com sucesso!')

  } catch (error) {
    console.error('❌ Erro ao criar dados de exemplo:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await pool.end()
  }
}

createSampleData()