import pool from '../config/database.js';

async function checkAdmin() {
  try {
    const result = await pool.query(
      'SELECT id, email, dados_pessoais, role, status, password_hash FROM employees WHERE email = $1', 
      ['admin@medstaff.com']
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('✅ Usuário admin encontrado:');
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Status:', user.status);
      console.log('Dados pessoais:', user.dados_pessoais);
      console.log('Password hash existe:', !!user.password_hash);
      console.log('Password hash length:', user.password_hash?.length || 0);
      
      if (user.password_hash) {
        console.log('Password hash preview:', user.password_hash.substring(0, 20) + '...');
      }
    } else {
      console.log('❌ Usuário admin não encontrado');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

checkAdmin();