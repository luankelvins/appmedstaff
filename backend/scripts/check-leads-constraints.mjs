import pool from '../src/config/database.js'

async function checkLeadsConstraints() {
  console.log('🔍 Verificando constraints da tabela leads...')

  try {
    // Verificar constraints específicas da tabela leads
    const { rows } = await pool.query(`
      SELECT 
        tc.constraint_name,
        cc.check_clause
      FROM information_schema.table_constraints tc
      JOIN information_schema.check_constraints cc 
        ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_schema = 'public'
        AND tc.table_name = 'leads'
        AND tc.constraint_type = 'CHECK'
      ORDER BY tc.constraint_name
    `)

    console.log('\n📋 Constraints da tabela leads:')
    if (rows.length === 0) {
      console.log('   ❌ Nenhuma constraint encontrada')
    } else {
      rows.forEach(row => {
        console.log(`\n   🔒 Constraint: ${row.constraint_name}`)
        console.log(`   ✅ Condição: ${row.check_clause}`)
      })
    }

  } catch (error) {
    console.error('❌ Erro ao verificar constraints:', error.message)
  } finally {
    await pool.end()
  }
}

checkLeadsConstraints()