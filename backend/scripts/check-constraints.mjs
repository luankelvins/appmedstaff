import pool from '../src/config/database.js'

async function checkConstraints() {
  console.log('🔍 Verificando constraints das tabelas...')

  try {
    // Verificar constraints de check
    const { rows } = await pool.query(`
      SELECT 
        tc.table_name,
        tc.constraint_name,
        cc.check_clause
      FROM information_schema.table_constraints tc
      JOIN information_schema.check_constraints cc 
        ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_schema = 'public'
        AND tc.constraint_type = 'CHECK'
      ORDER BY tc.table_name, tc.constraint_name
    `)

    console.log('\n📋 Constraints encontradas:')
    if (rows.length === 0) {
      console.log('   ❌ Nenhuma constraint encontrada')
    } else {
      rows.forEach(row => {
        console.log(`\n   📄 Tabela: ${row.table_name}`)
        console.log(`   🔒 Constraint: ${row.constraint_name}`)
        console.log(`   ✅ Condição: ${row.check_clause}`)
      })
    }

  } catch (error) {
    console.error('❌ Erro ao verificar constraints:', error.message)
  } finally {
    await pool.end()
  }
}

checkConstraints()