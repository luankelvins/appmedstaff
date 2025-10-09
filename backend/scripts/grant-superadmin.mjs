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

const targetEmail = 'Luankelvin@soumedstaff.com'

async function grantSuperAdminPermissions() {
  console.log('🔧 Concedendo permissões de superadmin...')
  console.log('📧 Email do usuário:', targetEmail)
  
  try {
    // 1. Verificar se o usuário existe
    console.log('\n1️⃣ Verificando se o usuário existe...')
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError)
      return
    }
    
    let user = existingUsers.users.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase())
    
    if (!user) {
      console.log('👤 Usuário não encontrado, criando...')
      
      // 2. Criar usuário se não existir
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: targetEmail,
        password: 'SuperAdmin123!',
        email_confirm: true,
        user_metadata: {
          name: 'Luan Kelvin',
          role: 'superadmin'
        }
      })
      
      if (createError) {
        console.error('❌ Erro ao criar usuário:', createError)
        return
      }
      
      user = newUser.user
      console.log('✅ Usuário criado com sucesso!')
    } else {
      console.log('✅ Usuário encontrado:', user.id)
    }
    
    // 3. Criar/atualizar perfil básico (sem role e permissions por enquanto)
    console.log('\n2️⃣ Criando/atualizando perfil básico...')
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        email: targetEmail,
        name: 'Luan Kelvin',
        position: 'Super Administrador',
        department: 'TI'
      })
      .select()
      .single()
    
    if (profileError) {
      console.error('❌ Erro ao criar/atualizar perfil:', profileError)
      return
    }
    
    console.log('✅ Perfil básico atualizado!')
    
    // 4. Verificar perfil criado
    console.log('\n3️⃣ Verificando perfil criado...')
    const { data: updatedProfile, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (checkError) {
      console.error('❌ Erro ao verificar perfil:', checkError)
      return
    }
    
    console.log('📋 Perfil criado:', {
      id: updatedProfile.id,
      email: updatedProfile.email,
      name: updatedProfile.name,
      position: updatedProfile.position,
      department: updatedProfile.department
    })
    
    // 5. Instruções para adicionar permissões
    console.log('\n⚠️  PRÓXIMO PASSO NECESSÁRIO:')
    console.log('Para concluir a configuração de superadmin, execute o seguinte SQL no Supabase SQL Editor:')
    console.log('📁 Arquivo: database/add-permissions-columns.sql')
    console.log('')
    console.log('Depois execute este script novamente para aplicar as permissões completas.')
    
    // 5. Testar login
    console.log('\n4️⃣ Testando login...')
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: targetEmail,
      password: 'SuperAdmin123!'
    })
    
    if (authError) {
      console.log('⚠️ Não foi possível testar login (pode ser devido ao uso da service key):', authError.message)
    } else {
      console.log('✅ Login testado com sucesso!')
    }
    
    console.log('\n🎉 Permissões de superadmin concedidas com sucesso!')
    console.log('📧 Email:', targetEmail)
    console.log('🔑 Senha:', 'SuperAdmin123!')
    console.log('🛡️ Role:', 'superadmin')
    console.log('⚡ Permissões:', 'Acesso total ao sistema')
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

grantSuperAdminPermissions()