import bcrypt from 'bcrypt';
import pool from '../config/database.js';

async function updateAdminPassword() {
  try {
    console.log('🔐 Atualizando senha do usuário admin...');

    // Gerar hash da senha
    const password = 'Admin123!@#';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Atualizar o password_hash do usuário admin
    const updateQuery = `
      UPDATE employees 
      SET password_hash = $1, updated_at = NOW()
      WHERE email = $2
      RETURNING id, email, dados_pessoais->>'nome_completo' as nome
    `;

    const result = await pool.query(updateQuery, [hashedPassword, 'admin@medstaff.com']);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('✅ Senha do usuário admin atualizada com sucesso!');
      console.log('👤 Nome:', user.nome);
      console.log('📧 Email:', user.email);
      console.log('🔑 Senha:', password);
      console.log('🆔 ID:', user.id);
    } else {
      console.log('❌ Usuário admin não encontrado');
    }

  } catch (error) {
    console.error('❌ Erro ao atualizar senha do admin:', error);
  } finally {
    await pool.end();
  }
}

updateAdminPassword();