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

async function checkTasksSchema() {
  try {
    console.log('🔍 Verificando schema da tabela tasks...');
    
    // Tentar fazer uma query simples para ver a estrutura
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Erro ao consultar tabela tasks:', error);
      return;
    }

    console.log('✅ Query executada com sucesso!');
    
    if (data && data.length > 0) {
      console.log('📋 Colunas disponíveis na tabela tasks:');
      console.log(Object.keys(data[0]));
    } else {
      console.log('📋 Tabela tasks está vazia, verificando estrutura via RPC...');
      
      // Tentar obter informações da estrutura da tabela
      const { data: schemaData, error: schemaError } = await supabase
        .rpc('get_table_columns', { table_name: 'tasks' });
        
      if (schemaError) {
        console.log('⚠️ RPC não disponível, tentando inserção de teste...');
        
        // Tentar uma inserção simples para ver quais campos são aceitos
        const testData = {
          title: 'Test Task',
          description: 'Test Description',
          status: 'pending',
          priority: 'medium',
          assigned_to: null,
          created_by: 'test-user',
          due_date: null,
          tags: [],
        };
        
        const { data: insertData, error: insertError } = await supabase
          .from('tasks')
          .insert(testData)
          .select()
          .single();
          
        if (insertError) {
          console.error('❌ Erro na inserção de teste:', insertError);
          console.log('💡 Isso nos ajuda a entender a estrutura esperada');
        } else {
          console.log('✅ Inserção de teste bem-sucedida!');
          console.log('📋 Estrutura da tabela tasks:');
          console.log(Object.keys(insertData));
          
          // Limpar o registro de teste
          await supabase.from('tasks').delete().eq('id', insertData.id);
          console.log('🧹 Registro de teste removido');
        }
      } else {
        console.log('📋 Estrutura da tabela via RPC:');
        console.log(schemaData);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

checkTasksSchema();