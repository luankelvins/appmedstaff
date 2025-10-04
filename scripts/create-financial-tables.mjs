import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupFinancialData() {
  console.log('🚀 Configurando dados financeiros no Supabase...\n');

  try {
    // 1. Inserir categorias financeiras de exemplo
    console.log('📋 Inserindo categorias financeiras...');
    
    const { data: existingCategories } = await supabase
      .from('financial_categories')
      .select('name');

    if (!existingCategories || existingCategories.length === 0) {
      const { error: categoriesError } = await supabase
        .from('financial_categories')
        .insert([
          { 
            name: 'Vendas', 
            type: 'income', 
            color: '#10b981', 
            icon: 'TrendingUp',
            description: 'Receitas de vendas de produtos e serviços'
          },
          { 
            name: 'Serviços', 
            type: 'income', 
            color: '#3b82f6', 
            icon: 'Briefcase',
            description: 'Receitas de prestação de serviços'
          },
          { 
            name: 'Escritório', 
            type: 'expense', 
            color: '#ef4444', 
            icon: 'Building',
            description: 'Despesas com aluguel, energia, internet'
          },
          { 
            name: 'Marketing', 
            type: 'expense', 
            color: '#f59e0b', 
            icon: 'Megaphone',
            description: 'Despesas com publicidade e marketing'
          },
          { 
            name: 'Pessoal', 
            type: 'expense', 
            color: '#8b5cf6', 
            icon: 'Users',
            description: 'Salários, benefícios e encargos'
          }
        ]);

      if (categoriesError) {
        console.error('❌ Erro ao inserir categorias:', categoriesError.message);
      } else {
        console.log('✅ Categorias financeiras inseridas');
      }
    } else {
      console.log('✅ Categorias financeiras já existem');
    }

    // 2. Inserir contas bancárias de exemplo
    console.log('📋 Inserindo contas bancárias...');
    
    const { data: existingAccounts } = await supabase
      .from('bank_accounts')
      .select('name');

    if (!existingAccounts || existingAccounts.length === 0) {
      const { error: accountsError } = await supabase
        .from('bank_accounts')
        .insert([
          {
            name: 'Conta Principal',
            bank: 'Banco do Brasil',
            account_number: '12345-6',
            agency: '1234',
            account_type: 'checking',
            balance: 50000.00,
            description: 'Conta corrente principal da empresa'
          },
          {
            name: 'Conta Poupança',
            bank: 'Caixa Econômica Federal',
            account_number: '98765-4',
            agency: '5678',
            account_type: 'savings',
            balance: 25000.00,
            description: 'Conta poupança para reserva de emergência'
          }
        ]);

      if (accountsError) {
        console.error('❌ Erro ao inserir contas bancárias:', accountsError.message);
      } else {
        console.log('✅ Contas bancárias inseridas');
      }
    } else {
      console.log('✅ Contas bancárias já existem');
    }

    // 3. Inserir métodos de pagamento de exemplo
    console.log('📋 Inserindo métodos de pagamento...');
    
    const { data: existingPaymentMethods } = await supabase
      .from('payment_methods')
      .select('name');

    if (!existingPaymentMethods || existingPaymentMethods.length === 0) {
      const { error: paymentMethodsError } = await supabase
        .from('payment_methods')
        .insert([
          {
            name: 'Dinheiro',
            type: 'cash',
            description: 'Pagamentos em dinheiro'
          },
          {
            name: 'PIX',
            type: 'pix',
            description: 'Transferências via PIX'
          },
          {
            name: 'Cartão de Crédito',
            type: 'credit_card',
            description: 'Pagamentos com cartão de crédito'
          },
          {
            name: 'Transferência Bancária',
            type: 'bank_transfer',
            description: 'Transferências bancárias'
          }
        ]);

      if (paymentMethodsError) {
        console.error('❌ Erro ao inserir métodos de pagamento:', paymentMethodsError.message);
      } else {
        console.log('✅ Métodos de pagamento inseridos');
      }
    } else {
      console.log('✅ Métodos de pagamento já existem');
    }

    console.log('\n🎉 Configuração de dados financeiros concluída!');
    console.log('\n📊 Resumo:');
    console.log('   • Categorias financeiras configuradas');
    console.log('   • Contas bancárias configuradas');
    console.log('   • Métodos de pagamento configurados');
    console.log('\n💡 Agora você pode começar a usar o sistema financeiro!');

  } catch (error) {
    console.error('\n💥 Erro durante a configuração:', error.message);
    process.exit(1);
  }
}

// Executar a configuração
setupFinancialData();