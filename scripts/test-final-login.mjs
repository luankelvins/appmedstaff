#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Carregar variáveis do .env
try {
  const envPath = join(__dirname, '..', '.env')
  const envContent = readFileSync(envPath, 'utf8')
  const envLines = envContent.split('\n')
  
  envLines.forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
      process.env[key.trim()] = value.trim()
    }
  })
} catch (error) {
  console.log('⚠️  Não foi possível carregar .env:', error.message)
}

// Simular o supabaseService
class SupabaseService {
  constructor() {
    this.supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  }

  async signIn(email, password) {
    console.log('[SupabaseService] Tentando fazer login...')
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  }

  async getProfile(userId) {
    console.log('[SupabaseService] Buscando perfil para userId:', userId)
    try {
      console.log('[SupabaseService] Executando query no Supabase (tabela employees)...')
      
      const { data, error } = await this.supabase
        .from('employees')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('[SupabaseService] Query executada, resultado:', { data, error })

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('[SupabaseService] Perfil não encontrado (PGRST116)')
          return null
        }
        console.error('[SupabaseService] Erro ao buscar perfil:', error)
        throw error
      }

      console.log('[SupabaseService] Mapeando perfil...')
      const mappedProfile = this.mapEmployeeToProfile(data)
      console.log('[SupabaseService] Perfil mapeado:', mappedProfile)
      return mappedProfile
    } catch (err) {
      console.error('[SupabaseService] Exceção ao buscar perfil:', err)
      throw err
    }
  }

  mapEmployeeToProfile(data) {
    console.log('[SupabaseService] mapEmployeeToProfile - dados recebidos:', data)
    
    const dadosPessoais = data.dados_pessoais || {}
    const dadosProfissionais = data.dados_profissionais || {}
    
    let role = 'user'
    if (dadosProfissionais.nivel_acesso === 'superadmin') {
      role = 'super_admin'
    } else if (dadosProfissionais.nivel_acesso === 'admin') {
      role = 'admin'
    } else if (dadosProfissionais.nivel_acesso === 'manager') {
      role = 'manager'
    }
    
    let permissions = dadosProfissionais.permissions || []
    if (role === 'super_admin' && !permissions.includes('*')) {
      console.log('[SupabaseService] Super admin detectado, adicionando permissão total (*)')
      permissions = ['*']
    }
    
    return {
      id: data.id,
      name: dadosPessoais.nome_completo || dadosPessoais.name || data.email.split('@')[0],
      email: data.email,
      avatar: dadosPessoais.avatar || dadosPessoais.avatar_url || undefined,
      phone: dadosPessoais.contato?.telefone || dadosPessoais.phone || undefined,
      document: dadosPessoais.cpf || dadosPessoais.document || undefined,
      birthDate: dadosPessoais.data_nascimento || dadosPessoais.birth_date || undefined,
      address: dadosPessoais.endereco ? 
        `${dadosPessoais.endereco.logradouro}, ${dadosPessoais.endereco.cidade} - ${dadosPessoais.endereco.estado}` : 
        undefined,
      role: role,
      department: dadosProfissionais.departamento || dadosProfissionais.department || '',
      position: dadosProfissionais.cargo || dadosProfissionais.position || '',
      hireDate: dadosProfissionais.data_admissao || dadosProfissionais.hire_date || data.created_at,
      manager: dadosProfissionais.gerente || dadosProfissionais.manager || undefined,
      permissions,
      isActive: data.status === 'ativo' || data.status === 'active',
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }
}

async function testFinalLogin() {
  try {
    console.log('🎯 Teste Final - Simulando Frontend Completo')
    console.log('=' .repeat(50))

    const supabaseService = new SupabaseService()

    console.log('\n1️⃣ Fazendo login...')
    const loginData = await supabaseService.signIn('luankelvin@soumedstaff.com', '123456')
    console.log('✅ Login bem-sucedido!')
    console.log('   User ID:', loginData.user.id)

    console.log('\n2️⃣ Buscando perfil...')
    const profile = await supabaseService.getProfile(loginData.user.id)
    
    if (profile) {
      console.log('✅ Perfil encontrado!')
      console.log('   Nome:', profile.name)
      console.log('   Email:', profile.email)
      console.log('   Role:', profile.role)
      console.log('   Departamento:', profile.department)
      console.log('   Cargo:', profile.position)
      console.log('   Permissões:', profile.permissions)
      console.log('   Ativo:', profile.isActive)
    } else {
      console.log('❌ Perfil não encontrado')
    }

    console.log('\n🎉 Teste final concluído com sucesso!')
    console.log('O login deve funcionar no frontend agora.')

  } catch (error) {
    console.error('❌ Erro no teste final:', error)
  }
}

testFinalLogin()
