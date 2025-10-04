#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Carrega variáveis de ambiente
config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupFeedDatabase() {
  console.log('🚀 Configurando banco de dados do Feed...')

  try {
    // Verificar se as tabelas existem
    const { data: tables, error: tablesError } = await supabase
      .from('feed_items')
      .select('id')
      .limit(1)

    if (tablesError) {
      console.log('⚠️  Tabelas do feed não encontradas. Execute primeiro o script SQL create-feed-tables.sql no Supabase Dashboard.')
      console.log('📋 Caminho do script: scripts/create-feed-tables.sql')
      return
    }

    console.log('✅ Tabelas do feed encontradas')

    // Verificar se já existem dados
    const { data: existingItems, error: checkError } = await supabase
      .from('feed_items')
      .select('id')

    if (checkError) {
      console.error('❌ Erro ao verificar dados existentes:', checkError.message)
      return
    }

    if (existingItems && existingItems.length > 0) {
      console.log(`ℹ️  Já existem ${existingItems.length} itens no feed. Pulando inserção de dados de exemplo.`)
      return
    }

    // Inserir dados de exemplo
    console.log('📝 Inserindo dados de exemplo...')

    // 1. Comunicados
    const announcements = [
      {
        title: 'Nova Política de Home Office',
        description: 'A partir de segunda-feira, implementaremos uma nova política de trabalho remoto. Todos os colaboradores poderão trabalhar de casa até 3 dias por semana, mediante aprovação do gestor direto.',
        type: 'announcement',
        priority: 'high',
        author: 'admin',
        author_name: 'Administrador',
        department: 'RH',
        tags: ['política', 'home-office', 'trabalho-remoto'],
        is_public: true,
        metadata: {}
      },
      {
        title: 'Manutenção do Sistema - Sábado',
        description: 'O sistema ficará indisponível no sábado das 02:00 às 06:00 para manutenção preventiva. Planejem suas atividades considerando esta janela.',
        type: 'announcement',
        priority: 'medium',
        author: 'ti',
        author_name: 'Equipe TI',
        department: 'TI',
        tags: ['manutenção', 'sistema', 'indisponibilidade'],
        is_public: true,
        metadata: {}
      }
    ]

    // 2. Atividades
    const activities = [
      {
        title: 'Treinamento de Vendas - Q1 2024',
        description: 'Treinamento intensivo sobre técnicas de vendas e relacionamento com clientes. Será abordado o novo CRM e estratégias de conversão.',
        type: 'activity',
        priority: 'high',
        author: 'comercial',
        author_name: 'Gerente Comercial',
        department: 'Comercial',
        tags: ['treinamento', 'vendas', 'crm'],
        is_public: true,
        metadata: {}
      },
      {
        title: 'Workshop de Inovação',
        description: 'Workshop colaborativo para gerar ideias inovadoras para nossos produtos e serviços. Metodologia Design Thinking será aplicada.',
        type: 'activity',
        priority: 'medium',
        author: 'admin',
        author_name: 'Administrador',
        department: 'Geral',
        tags: ['workshop', 'inovação', 'design-thinking'],
        is_public: true,
        metadata: {}
      }
    ]

    // 3. Eventos
    const events = [
      {
        title: 'Reunião Mensal de Resultados',
        description: 'Apresentação dos resultados do mês e planejamento para o próximo período. Participação obrigatória para gestores.',
        type: 'event',
        priority: 'high',
        author: 'admin',
        author_name: 'Administrador',
        department: 'Geral',
        tags: ['reunião', 'resultados', 'gestores'],
        is_public: false,
        target_audience: ['gestores'],
        metadata: {}
      },
      {
        title: 'Happy Hour da Equipe',
        description: 'Confraternização mensal da equipe. Local: Restaurante do João. Bebidas e petiscos por conta da empresa!',
        type: 'event',
        priority: 'low',
        author: 'rh',
        author_name: 'Recursos Humanos',
        department: 'RH',
        tags: ['confraternização', 'happy-hour', 'equipe'],
        is_public: true,
        metadata: {}
      }
    ]

    // Inserir itens do feed
    const allFeedItems = [...announcements, ...activities, ...events]
    
    for (const item of allFeedItems) {
      const { data: feedItem, error: feedError } = await supabase
        .from('feed_items')
        .insert(item)
        .select()
        .single()

      if (feedError) {
        console.error(`❌ Erro ao inserir item "${item.title}":`, feedError.message)
        continue
      }

      console.log(`✅ Item criado: ${item.title}`)

      // Inserir dados específicos baseado no tipo
      if (item.type === 'announcement') {
        const announcementData = {
          feed_item_id: feedItem.id,
          category: item.title.includes('Política') ? 'policy' : 
                   item.title.includes('Sistema') ? 'system' : 'general',
          is_urgent: item.priority === 'high',
          acknowledgment_required: item.priority === 'high',
          expires_at: item.title.includes('Sistema') ? 
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null
        }

        const { error: announcementError } = await supabase
          .from('announcements')
          .insert(announcementData)

        if (announcementError) {
          console.error(`❌ Erro ao inserir comunicado:`, announcementError.message)
        }
      }

      if (item.type === 'activity') {
        const activityData = {
          feed_item_id: feedItem.id,
          status: 'planned',
          start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
          location: item.title.includes('Treinamento') ? 'Sala de Treinamento' : 'Sala de Reuniões',
          category: item.title.includes('Treinamento') ? 'training' : 'workshop',
          max_participants: item.title.includes('Treinamento') ? 20 : 15,
          requires_confirmation: true,
          instructions: 'Traga notebook e material de anotação.'
        }

        const { error: activityError } = await supabase
          .from('activities')
          .insert(activityData)

        if (activityError) {
          console.error(`❌ Erro ao inserir atividade:`, activityError.message)
        }
      }

      if (item.type === 'event') {
        const eventData = {
          feed_item_id: feedItem.id,
          status: 'scheduled',
          start_date: item.title.includes('Reunião') ? 
            new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() :
            new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: item.title.includes('Reunião') ? 
            new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString() :
            new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
          is_all_day: false,
          location: item.title.includes('Reunião') ? 'Sala de Reuniões Principal' : 'Restaurante do João',
          organizer: item.author,
          category: item.title.includes('Reunião') ? 'meeting' : 'social',
          meeting_link: item.title.includes('Reunião') ? 'https://meet.google.com/abc-defg-hij' : null
        }

        const { error: eventError } = await supabase
          .from('calendar_events')
          .insert(eventData)

        if (eventError) {
          console.error(`❌ Erro ao inserir evento:`, eventError.message)
        }
      }
    }

    // Inserir configurações padrão do usuário
    const defaultUserSettings = {
      user_id: 'default',
      notifications: {
        email: true,
        push: true,
        inApp: true,
        types: {
          activities: true,
          announcements: true,
          events: true,
          reminders: true
        }
      },
      default_view: 'feed',
      calendar_view: 'month',
      auto_refresh: true,
      refresh_interval: 300,
      filters: {}
    }

    const { error: settingsError } = await supabase
      .from('feed_user_settings')
      .insert(defaultUserSettings)

    if (settingsError && !settingsError.message.includes('duplicate')) {
      console.error('❌ Erro ao inserir configurações padrão:', settingsError.message)
    } else {
      console.log('✅ Configurações padrão do usuário criadas')
    }

    // Verificar dados inseridos
    const { data: finalCount, error: countError } = await supabase
      .from('feed_items')
      .select('id, type')

    if (countError) {
      console.error('❌ Erro ao verificar dados finais:', countError.message)
      return
    }

    const typeCount = finalCount.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1
      return acc
    }, {})

    console.log('\n📊 Resumo dos dados inseridos:')
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} itens`)
    })

    console.log('\n🎉 Configuração do banco de dados do Feed concluída com sucesso!')
    console.log('🌐 O sistema de feed está pronto para uso em /feed')

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message)
    process.exit(1)
  }
}

// Executar configuração
setupFeedDatabase()