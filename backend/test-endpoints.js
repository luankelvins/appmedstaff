import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';

// Função para fazer login e obter token
async function login() {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@medstaff.com',
        password: 'Admin123!@#'
      })
    });

    if (!response.ok) {
      console.log('❌ Login falhou:', response.status);
      return null;
    }

    const data = await response.json();
    console.log('✅ Login realizado com sucesso');
    return data.token;
  } catch (error) {
    console.log('❌ Erro no login:', error.message);
    return null;
  }
}

// Função para testar endpoints
async function testEndpoint(endpoint, token, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    
    if (response.ok) {
      console.log(`✅ ${method} ${endpoint} - Status: ${response.status}`);
      return true;
    } else {
      console.log(`❌ ${method} ${endpoint} - Status: ${response.status}`);
      const errorText = await response.text();
      console.log(`   Erro: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${method} ${endpoint} - Erro: ${error.message}`);
    return false;
  }
}

// Função principal de teste
async function runTests() {
  console.log('🚀 Iniciando testes dos endpoints...\n');

  // Fazer login
  const token = await login();
  if (!token) {
    console.log('❌ Não foi possível obter token de autenticação');
    return;
  }

  console.log('\n📊 Testando endpoints do Dashboard:');
  await testEndpoint('/dashboard/quick-stats', token);
  await testEndpoint('/dashboard/tasks-metrics', token);
  await testEndpoint('/dashboard/leads-metrics', token);
  await testEndpoint('/dashboard/financial-metrics', token);
  await testEndpoint('/dashboard/system-metrics', token);
  await testEndpoint('/dashboard/notifications', token);

  console.log('\n👥 Testando endpoints de Employees:');
  await testEndpoint('/v1/employees', token);
  await testEndpoint('/v1/employees/stats', token);

  console.log('\n📋 Testando endpoints de Tasks:');
  await testEndpoint('/v1/tasks', token);
  await testEndpoint('/v1/tasks/stats', token);

  console.log('\n🎯 Testando endpoints de Leads:');
  await testEndpoint('/v1/leads', token);
  await testEndpoint('/v1/leads/stats', token);
  await testEndpoint('/v1/leads/follow-up', token);

  console.log('\n👤 Testando endpoints de Clientes PF:');
  await testEndpoint('/v1/clientes-pf', token);
  await testEndpoint('/v1/clientes-pf/stats', token);

  console.log('\n🏢 Testando endpoints de Clientes PJ:');
  await testEndpoint('/v1/clientes-pj', token);
  await testEndpoint('/v1/clientes-pj/stats', token);

  console.log('\n🔔 Testando endpoints de Notifications:');
  await testEndpoint('/v1/notifications', token);

  console.log('\n💰 Testando endpoints de Expenses:');
  await testEndpoint('/v1/expenses', token);
  await testEndpoint('/v1/expenses/overdue', token);
  await testEndpoint('/v1/expenses/due-soon', token);

  console.log('\n✅ Testes concluídos!');
}

// Executar testes
runTests().catch(console.error);