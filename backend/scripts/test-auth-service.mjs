// Teste do authServiceHttp
import fetch from 'node-fetch';

// Simular o comportamento do authServiceHttp
class AuthServiceHttpTest {
  constructor() {
    this.baseUrl = 'http://localhost:3001/api';
  }

  async login(data) {
    try {
      console.log('🔐 Testando login com authServiceHttp...');
      console.log('📤 URL:', `${this.baseUrl}/auth/login`);
      console.log('📤 Dados:', JSON.stringify(data, null, 2));
      
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('📡 Status:', response.status, response.statusText);
      console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('❌ Dados do erro:', errorData);
        throw new Error(errorData.message || 'Erro ao fazer login');
      }

      const authResponse = await response.json();
      console.log('✅ Resposta de sucesso:', JSON.stringify(authResponse, null, 2));
      return authResponse;
    } catch (error) {
      console.error('❌ Erro no login:', error.message);
      throw error;
    }
  }
}

// Função para mapear resposta (igual ao AuthContext)
const mapAuthResponseToUser = (authResponse) => {
  const basicPermissions = [
    'dashboard.view',
    'feed.view',
    'notifications.view',
    'tasks.view',
    'tasks.create',
    'tasks.update',
    'contacts.read',
    'profile.view',
    'profile.update'
  ];

  return {
    id: authResponse.user.id,
    name: authResponse.user.nome,
    email: authResponse.user.email,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(authResponse.user.nome)}&background=3b82f6&color=fff`,
    role: authResponse.user.role || 'user',
    permissions: basicPermissions,
    department: undefined,
    position: undefined
  };
};

async function testAuthFlow() {
  console.log('🚀 Iniciando teste do fluxo de autenticação...\n');
  
  const authService = new AuthServiceHttpTest();
  
  try {
    // Teste 1: Login com credenciais corretas
    console.log('1️⃣ Testando login com credenciais corretas...');
    const loginData = {
      email: 'luankelvin@soumedstaff.com',
      password: '123456'
    };
    
    const authResponse = await authService.login(loginData);
    
    // Teste 2: Mapear resposta para usuário
    console.log('\n2️⃣ Testando mapeamento da resposta...');
    const mappedUser = mapAuthResponseToUser(authResponse);
    console.log('👤 Usuário mapeado:', JSON.stringify(mappedUser, null, 2));
    
    // Teste 3: Simular salvamento no localStorage
    console.log('\n3️⃣ Simulando salvamento no localStorage...');
    const tokenToSave = authResponse.token;
    const userToSave = JSON.stringify(mappedUser);
    
    console.log('💾 Token a ser salvo:', tokenToSave.substring(0, 50) + '...');
    console.log('💾 Dados do usuário a serem salvos:', userToSave);
    
    console.log('\n✅ Fluxo de autenticação testado com sucesso!');
    
  } catch (error) {
    console.error('\n❌ Erro no fluxo de autenticação:', error.message);
    console.error('📋 Stack trace:', error.stack);
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Teste 4: Login com credenciais incorretas
  try {
    console.log('\n4️⃣ Testando login com credenciais incorretas...');
    const wrongLoginData = {
      email: 'luankelvin@soumedstaff.com',
      password: 'senhaerrada'
    };
    
    await authService.login(wrongLoginData);
    console.log('❌ Este login deveria ter falhado!');
    
  } catch (error) {
    console.log('✅ Erro esperado para credenciais incorretas:', error.message);
  }
}

testAuthFlow().catch(console.error);