import pool from '../src/config/database.js'

async function checkTables() {
  console.log('🔍 Verificando tabelas existentes...')

  try {
    // Listar todas as tabelas
    const { rows } = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)

    console.log('\n📋 Tabelas encontradas:')
    if (rows.length === 0) {
      console.log('   ❌ Nenhuma tabela encontrada')
    } else {
      rows.forEach(row => {
        console.log(`   - ${row.table_name}`)
      })
    }

    // Verificar se existem dados nas tabelas principais
    const tablesToCheck = ['users', 'tasks', 'leads', 'contratos']
    
    console.log('\n📊 Contagem de registros:')
    for (const table of tablesToCheck) {
      try {
        const { rows: countRows } = await pool.query(`SELECT COUNT(*) as count FROM ${table}`)
        console.log(`   - ${table}: ${countRows[0].count} registros`)
      } catch (error) {
        console.log(`   - ${table}: ❌ Tabela não existe`)
      }
    }

  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error.message)
  } finally {
    await pool.end()
  }
}

checkTables()