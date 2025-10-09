import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🔍 Testando API diretamente...\n');
  
  // Teste 1: Health check
  try {
    console.log('1️⃣ Testando health check...');
    const healthResponse = await fetch(`${API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
  } catch (error) {
    console.log('❌ Health check falhou:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Teste 2: Login com credenciais corretas
  try {
    console.log('2️⃣ Testando login com credenciais corretas...');
    const loginData = {
      email: 'luankelvin@soumedstaff.com',
      password: '123456'
    };
    
    console.log('📤 Enviando:', JSON.stringify(loginData, null, 2));
    
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });
    
    console.log('📡 Status da resposta:', loginResponse.status, loginResponse.statusText);
    console.log('📋 Headers da resposta:', Object.fromEntries(loginResponse.headers.entries()));
    
    const loginResult = await loginResponse.json();
    console.log('📦 Dados da resposta:', JSON.stringify(loginResult, null, 2));
    
    if (loginResponse.ok) {
      console.log('✅ Login bem-sucedido!');
    } else {
      console.log('❌ Login falhou!');
    }
    
  } catch (error) {
    console.log('❌ Erro no teste de login:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Teste 3: Login com credenciais incorretas
  try {
    console.log('3️⃣ Testando login com credenciais incorretas...');
    const wrongLoginData = {
      email: 'luankelvin@soumedstaff.com',
      password: 'senhaerrada'
    };
    
    console.log('📤 Enviando:', JSON.stringify(wrongLoginData, null, 2));
    
    const wrongLoginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(wrongLoginData),
    });
    
    console.log('📡 Status da resposta:', wrongLoginResponse.status, wrongLoginResponse.statusText);
    
    const wrongLoginResult = await wrongLoginResponse.json();
    console.log('📦 Dados da resposta:', JSON.stringify(wrongLoginResult, null, 2));
    
    if (!wrongLoginResponse.ok) {
      console.log('✅ Erro esperado para credenciais incorretas!');
    } else {
      console.log('❌ Login deveria ter falhado!');
    }
    
  } catch (error) {
    console.log('❌ Erro no teste de login incorreto:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Teste 4: Verificar estrutura da resposta
  try {
    console.log('4️⃣ Verificando estrutura da resposta de login...');
    const testLoginData = {
      email: 'admin@appmedstaff.com',
      password: '123456'
    };
    
    const testResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testLoginData),
    });
    
    if (testResponse.ok) {
      const testResult = await testResponse.json();
      
      console.log('🔍 Analisando estrutura da resposta:');
      console.log('- Tem propriedade "user"?', 'user' in testResult);
      console.log('- Tem propriedade "token"?', 'token' in testResult);
      console.log('- Tem propriedade "expires_in"?', 'expires_in' in testResult);
      
      if (testResult.user) {
        console.log('- user.id:', testResult.user.id);
        console.log('- user.email:', testResult.user.email);
        console.log('- user.nome:', testResult.user.nome);
        console.log('- user.role:', testResult.user.role);
      }
      
      console.log('✅ Estrutura da resposta verificada!');
    } else {
      console.log('❌ Não foi possível verificar a estrutura - login falhou');
    }
    
  } catch (error) {
    console.log('❌ Erro na verificação da estrutura:', error.message);
  }
}

testAPI().catch(console.error);