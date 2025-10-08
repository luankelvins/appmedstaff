#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_ROLE_KEY são obrigatórias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupLeadComments() {
  try {
    console.log('🚀 Iniciando configuração das tabelas de comentários...')

    // Ler o arquivo SQL
    const sqlPath = join(__dirname, '../sql/lead_comments_structure.sql')
    const sqlContent = readFileSync(sqlPath, 'utf8')

    // Dividir o SQL em comandos individuais
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('/*'))

    console.log(`📝 Executando ${sqlCommands.length} comandos SQL...`)

    // Executar cada comando SQL
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i]
      if (command.trim()) {
        try {
          console.log(`⏳ Executando comando ${i + 1}/${sqlCommands.length}...`)
          const { error } = await supabase.rpc('exec_sql', { sql: command })
          
          if (error) {
            console.warn(`⚠️ Aviso no comando ${i + 1}: ${error.message}`)
          } else {
            console.log(`✅ Comando ${i + 1} executado com sucesso`)
          }
        } catch (err) {
          console.warn(`⚠️ Erro no comando ${i + 1}: ${err.message}`)
        }
      }
    }

    // Verificar se as tabelas foram criadas
    console.log('🔍 Verificando se as tabelas foram criadas...')
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['lead_comments', 'lead_comment_attachments'])

    if (tablesError) {
      console.error('❌ Erro ao verificar tabelas:', tablesError)
      return
    }

    const tableNames = tables.map(t => t.table_name)
    
    if (tableNames.includes('lead_comments')) {
      console.log('✅ Tabela lead_comments criada com sucesso')
    } else {
      console.log('❌ Tabela lead_comments não foi criada')
    }

    if (tableNames.includes('lead_comment_attachments')) {
      console.log('✅ Tabela lead_comment_attachments criada com sucesso')
    } else {
      console.log('❌ Tabela lead_comment_attachments não foi criada')
    }

    // Configurar RLS (Row Level Security)
    console.log('🔒 Configurando políticas RLS...')
    
    const rlsPolicies = [
      {
        name: 'enable_rls_lead_comments',
        sql: 'ALTER TABLE lead_comments ENABLE ROW LEVEL SECURITY'
      },
      {
        name: 'enable_rls_lead_comment_attachments', 
        sql: 'ALTER TABLE lead_comment_attachments ENABLE ROW LEVEL SECURITY'
      },
      {
        name: 'lead_comments_select_policy',
        sql: `CREATE POLICY "Users can view lead comments" ON lead_comments FOR SELECT USING (true)`
      },
      {
        name: 'lead_comments_insert_policy',
        sql: `CREATE POLICY "Users can insert lead comments" ON lead_comments FOR INSERT WITH CHECK (true)`
      },
      {
        name: 'lead_comments_update_policy',
        sql: `CREATE POLICY "Users can update their own lead comments" ON lead_comments FOR UPDATE USING (auth.uid() = author_id)`
      },
      {
        name: 'lead_comments_delete_policy',
        sql: `CREATE POLICY "Users can delete their own lead comments" ON lead_comments FOR DELETE USING (auth.uid() = author_id)`
      }
    ]

    for (const policy of rlsPolicies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy.sql })
        if (error) {
          console.warn(`⚠️ Aviso na política ${policy.name}: ${error.message}`)
        } else {
          console.log(`✅ Política ${policy.name} configurada`)
        }
      } catch (err) {
        console.warn(`⚠️ Erro na política ${policy.name}: ${err.message}`)
      }
    }

    console.log('🎉 Configuração das tabelas de comentários concluída!')

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error)
    process.exit(1)
  }
}

// Executar o script
setupLeadComments()