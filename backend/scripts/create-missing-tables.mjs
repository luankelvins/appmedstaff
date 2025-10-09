import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ VITE_SUPABASE_SERVICE_ROLE_KEY não encontrada no .env')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createNotificationsTable() {
  console.log('🔔 Criando tabela notifications...')
  
  try {
    // Criar tabela básica primeiro
    const { error: tableError } = await supabaseAdmin
      .from('notifications')
      .select('id')
      .limit(1)

    if (!tableError) {
      console.log('ℹ️  Tabela notifications já existe')
      return true
    }

    // Se a tabela não existe, vamos criá-la usando uma abordagem mais simples
    console.log('⚠️  Tabela notifications não existe. Será necessário criar via SQL Editor do Supabase.')
    console.log('📋 SQL para criar a tabela:')
    console.log(`
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  category TEXT NOT NULL CHECK (category IN ('system', 'task', 'commercial', 'operational', 'financial', 'hr', 'audit')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  read BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_url TEXT,
  action_label TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_category ON notifications(category);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications 
  FOR SELECT USING (auth.uid() = user_id);
`)
    
    return false
  } catch (error) {
    console.error('❌ Erro ao verificar tabela notifications:', error.message)
    return false
  }
}

async function createIrpfTable() {
  console.log('💰 Criando tabela irpf...')
  
  try {
    // Verificar se a tabela já existe
    const { error: tableError } = await supabaseAdmin
      .from('irpf')
      .select('id')
      .limit(1)

    if (!tableError) {
      console.log('ℹ️  Tabela irpf já existe')
      return true
    }

    // Se a tabela não existe, mostrar SQL para criar
    console.log('⚠️  Tabela irpf não existe. Será necessário criar via SQL Editor do Supabase.')
    console.log('📋 SQL para criar a tabela:')
    console.log(`
CREATE TABLE irpf (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes_pf(id) ON DELETE CASCADE,
  ano_calendario INTEGER NOT NULL,
  tipo_declaracao TEXT NOT NULL CHECK (tipo_declaracao IN ('completa', 'simplificada')),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'entregue', 'retificada')),
  valor_devido DECIMAL(10,2),
  valor_restituicao DECIMAL(10,2),
  data_entrega DATE,
  numero_recibo TEXT,
  observacoes TEXT,
  documentos_recebidos BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cliente_id, ano_calendario)
);

CREATE INDEX idx_irpf_cliente_id ON irpf(cliente_id);
CREATE INDEX idx_irpf_ano_calendario ON irpf(ano_calendario);
CREATE INDEX idx_irpf_status ON irpf(status);

ALTER TABLE irpf ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view irpf" ON irpf FOR SELECT USING (true);
CREATE POLICY "Users can insert irpf" ON irpf FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update irpf" ON irpf FOR UPDATE USING (true);
`)
    
    return false
  } catch (error) {
    console.error('❌ Erro ao verificar tabela irpf:', error.message)
    return false
  }
}

async function createMissingTables() {
  console.log('🏗️  === CRIANDO TABELAS FALTANTES ===')
  console.log(`Conectando em: ${supabaseUrl}`)
  
  const results = {
    notifications: false,
    irpf: false
  }

  // Criar tabela notifications
  results.notifications = await createNotificationsTable()
  
  // Criar tabela irpf
  results.irpf = await createIrpfTable()

  // Resumo
  console.log('\n📋 === RESUMO DA CRIAÇÃO ===')
  Object.entries(results).forEach(([table, success]) => {
    const status = success ? '✅ Criada' : '❌ Falhou'
    console.log(`${table.padEnd(15)}: ${status}`)
  })

  return results
}

// Executar criação
createMissingTables()
  .then((results) => {
    const allSuccess = Object.values(results).every(Boolean)
    if (allSuccess) {
      console.log('\n✅ Todas as tabelas foram criadas com sucesso!')
      process.exit(0)
    } else {
      console.log('\n⚠️  Algumas tabelas falharam ao ser criadas')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('\n❌ Erro durante criação das tabelas:', error)
    process.exit(1)
  })