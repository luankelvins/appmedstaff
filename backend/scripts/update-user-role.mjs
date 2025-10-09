#!/usr/bin/env node

import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Client } = pg

const client = new Client({
  host: process.env.VITE_DB_HOST || 'localhost',
  port: process.env.VITE_DB_PORT || 5432,
  database: process.env.VITE_DB_NAME || 'appmedstaff',
  user: process.env.VITE_DB_USER || 'postgres',
  password: process.env.VITE_DB_PASSWORD || 'postgres'
})

async function updateUserRole() {
  try {
    await client.connect()
    console.log('🔗 Conectado ao banco de dados')

    // Primeiro, verificar a estrutura da tabela e constraints
    const structure = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'employees'
    `)
    console.log('📋 Estrutura da tabela employees:')
    structure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`)
    })

    console.log('🔒 Valores permitidos para role: employee, admin, superadmin, manager, supervisor')

    // Verificar se o usuário existe
    const userCheck = await client.query(
      'SELECT * FROM employees WHERE email = $1',
      ['superadmin@medstaff.com']
    )

    if (userCheck.rows.length === 0) {
      console.log('❌ Usuário não encontrado')
      return
    }

    console.log('👤 Usuário encontrado:', userCheck.rows[0])

    // Atualizar o role do usuário superadmin@medstaff.com para superadmin
    const result = await client.query(
      'UPDATE employees SET role = $1 WHERE email = $2 RETURNING *',
      ['superadmin', 'superadmin@medstaff.com']
    )

    if (result.rows.length > 0) {
      console.log('✅ Usuário atualizado com sucesso:')
      console.log(result.rows[0])
    } else {
      console.log('❌ Falha na atualização')
    }

  } catch (error) {
    console.error('❌ Erro:', error.message)
  } finally {
    await client.end()
  }
}

updateUserRole()