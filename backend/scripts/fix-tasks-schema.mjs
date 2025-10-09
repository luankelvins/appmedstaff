import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTasksSchema() {
  try {
    console.log('🔧 Verificando estrutura da tabela tasks...');
    
    // Tentar fazer uma query simples para ver quais colunas existem
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Erro ao consultar tabela tasks:', error);
      
      // Se a tabela não existe, vamos tentar criar
      if (error.code === 'PGRST106') {
        console.log('📋 Tabela tasks não encontrada, pode precisar ser criada');
      }
      return;
    }

    console.log('✅ Tabela tasks acessível!');
    
    if (data && data.length > 0) {
      console.log('📋 Colunas existentes na tabela tasks:');
      console.log(Object.keys(data[0]));
    } else {
      console.log('📋 Tabela tasks está vazia, testando inserção...');
    }

    // Testar inserção com estrutura mínima
    console.log('🧪 Testando inserção básica...');
    
    const basicTestData = {
      title: 'Teste Básico',
      description: 'Teste de inserção básica',
      status: 'pending',
      priority: 'medium'
    };

    const { data: basicInsert, error: basicError } = await supabase
      .from('tasks')
      .insert(basicTestData)
      .select()
      .single();

    if (basicError) {
      console.error('❌ Erro na inserção básica:', basicError);
    } else {
      console.log('✅ Inserção básica bem-sucedida!');
      console.log('📋 Estrutura retornada:', Object.keys(basicInsert));
      
      // Limpar o registro de teste
      await supabase.from('tasks').delete().eq('id', basicInsert.id);
      console.log('🧹 Registro de teste removido');
    }

    // Testar inserção com tags
    console.log('🧪 Testando inserção com tags...');
    
    const tagsTestData = {
      title: 'Teste com Tags',
      description: 'Teste de inserção com tags',
      status: 'pending',
      priority: 'medium',
      tags: ['teste', 'tag']
    };

    const { data: tagsInsert, error: tagsError } = await supabase
      .from('tasks')
      .insert(tagsTestData)
      .select()
      .single();

    if (tagsError) {
      console.error('❌ Erro na inserção com tags:', tagsError);
    } else {
      console.log('✅ Inserção com tags bem-sucedida!');
      
      // Limpar o registro de teste
      await supabase.from('tasks').delete().eq('id', tagsInsert.id);
      console.log('🧹 Registro de teste com tags removido');
    }

    // Testar inserção com metadata
    console.log('🧪 Testando inserção com metadata...');
    
    const metadataTestData = {
      title: 'Teste com Metadata',
      description: 'Teste de inserção com metadata',
      status: 'pending',
      priority: 'medium',
      metadata: {
        category: 'test',
        estimatedHours: 2
      }
    };

    const { data: metadataInsert, error: metadataError } = await supabase
      .from('tasks')
      .insert(metadataTestData)
      .select()
      .single();

    if (metadataError) {
      console.error('❌ Erro na inserção com metadata:', metadataError);
    } else {
      console.log('✅ Inserção com metadata bem-sucedida!');
      
      // Limpar o registro de teste
      await supabase.from('tasks').delete().eq('id', metadataInsert.id);
      console.log('🧹 Registro de teste com metadata removido');
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

fixTasksSchema();