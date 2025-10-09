import pool from '../src/config/database.js'

async function checkSchema() {
  console.log('🔍 Verificando estrutura das tabelas...')

  try {
    const tablesToCheck = ['tasks', 'leads', 'contratos', 'employees']
    
    for (const table of tablesToCheck) {
      console.log(`\n📋 Estrutura da tabela: ${table}`)
      try {
        const { rows } = await pool.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = $1 
          ORDER BY ordinal_position
        `, [table])

        if (rows.length === 0) {
          console.log(`   ❌ Tabela ${table} não encontrada`)
        } else {
          rows.forEach(row => {
            console.log(`   - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`)
          })
        }
      } catch (error) {
        console.log(`   ❌ Erro ao verificar ${table}: ${error.message}`)
      }
    }

  } catch (error) {
    console.error('❌ Erro ao verificar schema:', error.message)
  } finally {
    await pool.end()
  }
}

checkSchema()