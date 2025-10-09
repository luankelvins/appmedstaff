#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createEmployeeSuperadmin() {
  console.log('👤 Criando funcionário superadmin...')
  
  try {
    // Dados do funcionário Luan Kelvin
    const employeeData = {
      email: 'Luankelvin@soumedstaff.com',
      dados_pessoais: {
        nome_completo: 'Luan Kelvin',
        cpf: '000.000.000-00', // Placeholder - deve ser atualizado com dados reais
        rg: '0000000',
        data_nascimento: '1990-01-01',
        estado_civil: 'solteiro',
        nacionalidade: 'brasileira',
        endereco: {
          cep: '00000-000',
          logradouro: 'Rua Exemplo, 123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP'
        },
        contato: {
          telefone: '(11) 99999-9999',
          email_pessoal: 'Luankelvin@soumedstaff.com'
        }
      },
      dados_profissionais: {
        cargo: 'Desenvolvedor Full Stack',
        departamento: 'Tecnologia',
        data_admissao: '2024-01-01',
        tipo_contrato: 'CLT',
        carga_horaria: '40h semanais',
        nivel_acesso: 'superadmin',
        responsabilidades: [
          'Desenvolvimento de sistemas',
          'Administração do sistema',
          'Gestão de usuários',
          'Manutenção da infraestrutura'
        ]
      },
      dados_financeiros: {
        salario_base: 8000.00,
        beneficios: [
          'Vale refeição',
          'Vale transporte',
          'Plano de saúde',
          'Plano odontológico'
        ],
        conta_bancaria: {
          banco: '001',
          agencia: '0000',
          conta: '00000-0',
          tipo: 'corrente'
        }
      },
      status: 'ativo'
    }

    // Verificar se o funcionário já existe
    const { data: existingEmployee, error: checkError } = await supabase
      .from('employees')
      .select('*')
      .eq('email', 'Luankelvin@soumedstaff.com')
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar funcionário existente:', checkError.message)
      return
    }

    if (existingEmployee) {
      console.log('ℹ️ Funcionário já existe na tabela employees:')
      console.log(`ID: ${existingEmployee.id}`)
      console.log(`Email: ${existingEmployee.email}`)
      console.log(`Status: ${existingEmployee.status}`)
      console.log(`Nome: ${existingEmployee.dados_pessoais?.nome_completo}`)
      console.log(`Cargo: ${existingEmployee.dados_profissionais?.cargo}`)
      
      // Atualizar o perfil com o employee_id
      await linkEmployeeToProfile(existingEmployee.id)
      return
    }

    // Criar novo funcionário
    console.log('📝 Criando novo funcionário...')
    const { data: newEmployee, error: createError } = await supabase
      .from('employees')
      .insert([employeeData])
      .select()
      .single()

    if (createError) {
      console.error('❌ Erro ao criar funcionário:', createError.message)
      return
    }

    console.log('✅ Funcionário criado com sucesso!')
    console.log(`ID: ${newEmployee.id}`)
    console.log(`Email: ${newEmployee.email}`)
    console.log(`Nome: ${newEmployee.dados_pessoais.nome_completo}`)
    console.log(`Cargo: ${newEmployee.dados_profissionais.cargo}`)

    // Vincular funcionário ao perfil
    await linkEmployeeToProfile(newEmployee.id)

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

async function linkEmployeeToProfile(employeeId) {
  console.log('\n🔗 Vinculando funcionário ao perfil...')
  
  try {
    // Atualizar o perfil com o employee_id
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        employee_id: employeeId,
        name: 'Luan Kelvin',
        position: 'Desenvolvedor Full Stack',
        department: 'Tecnologia'
      })
      .eq('email', 'Luankelvin@soumedstaff.com')
      .select()
      .single()

    if (updateError) {
      console.error('❌ Erro ao vincular funcionário ao perfil:', updateError.message)
      return
    }

    console.log('✅ Funcionário vinculado ao perfil com sucesso!')
    console.log(`Profile ID: ${updatedProfile.id}`)
    console.log(`Employee ID: ${updatedProfile.employee_id}`)
    console.log(`Nome: ${updatedProfile.name}`)
    console.log(`Cargo: ${updatedProfile.position}`)

  } catch (error) {
    console.error('❌ Erro ao vincular funcionário:', error.message)
  }
}

// Executar o script
createEmployeeSuperadmin()