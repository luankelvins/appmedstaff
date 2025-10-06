import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const SUPERADMIN_EMAIL = 'Luankelvin@soumedstaff.com';

async function applySuperadminPermissions() {
  try {
    console.log('🔍 Verificando se as colunas existem...');
    
    // Tentar buscar um perfil para verificar se as colunas existem
    const { data: testProfile, error: testError } = await supabase
      .from('profiles')
      .select('id, email, role, permissions, full_name')
      .limit(1)
      .single();

    if (testError && testError.message.includes('column')) {
      console.error('❌ As colunas role, permissions ou full_name ainda não existem.');
      console.log('📋 Execute primeiro o SQL em: database/add-superadmin-columns.sql');
      console.log('   no Supabase SQL Editor: https://supabase.com/dashboard/project/[seu-projeto]/sql');
      return;
    }

    console.log('✅ Colunas verificadas com sucesso');

    // Buscar o perfil do superadmin
    console.log(`🔍 Buscando perfil para: ${SUPERADMIN_EMAIL}`);
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', SUPERADMIN_EMAIL)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError.message);
      return;
    }

    if (!profile) {
      console.error('❌ Perfil não encontrado');
      return;
    }

    console.log('✅ Perfil encontrado:', profile.id);

    // Definir permissões de superadmin
    const superadminPermissions = [
      'users:read',
      'users:write',
      'users:delete',
      'employees:read',
      'employees:write',
      'employees:delete',
      'departments:read',
      'departments:write',
      'departments:delete',
      'reports:read',
      'reports:write',
      'settings:read',
      'settings:write',
      'system:admin'
    ];

    // Atualizar o perfil com permissões de superadmin
    console.log('🔧 Aplicando permissões de superadmin...');
    
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'super_admin',
        permissions: superadminPermissions,
        full_name: profile.name || 'Luan Kelvin'
      })
      .eq('id', profile.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro ao atualizar perfil:', updateError.message);
      return;
    }

    console.log('✅ Permissões de superadmin aplicadas com sucesso!');
    console.log('📊 Perfil atualizado:');
    console.log('   - ID:', updatedProfile.id);
    console.log('   - Email:', updatedProfile.email);
    console.log('   - Nome:', updatedProfile.full_name);
    console.log('   - Cargo:', updatedProfile.role);
    console.log('   - Permissões:', updatedProfile.permissions.length, 'permissões');

    // Verificar se o funcionário está vinculado
    console.log('🔍 Verificando vinculação com funcionário...');
    
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('email', SUPERADMIN_EMAIL)
      .single();

    if (employee) {
      console.log('✅ Funcionário vinculado encontrado:', employee.id);
      
      // Verificar se o profile tem employee_id
      if (profile.employee_id !== employee.id) {
        console.log('🔧 Vinculando perfil ao funcionário...');
        
        const { error: linkError } = await supabase
          .from('profiles')
          .update({ employee_id: employee.id })
          .eq('id', profile.id);

        if (linkError) {
          console.error('❌ Erro ao vincular funcionário:', linkError.message);
        } else {
          console.log('✅ Perfil vinculado ao funcionário com sucesso!');
        }
      } else {
        console.log('✅ Perfil já está vinculado ao funcionário');
      }
    } else {
      console.log('⚠️ Funcionário não encontrado - isso pode estar correto se foi criado em outra sessão');
    }

    console.log('\n🎉 Configuração de superadmin concluída!');
    console.log('📋 Próximos passos:');
    console.log('   1. Teste o login com:', SUPERADMIN_EMAIL);
    console.log('   2. Verifique se todas as funcionalidades administrativas estão acessíveis');
    console.log('   3. Confirme que as permissões estão funcionando corretamente');

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

applySuperadminPermissions();