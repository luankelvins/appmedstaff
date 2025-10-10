import axios from 'axios';
import { config } from '../config/environment.js';

class EndpointTester {
  constructor(baseURL = `http://localhost:${config.port || 3001}`) {
    this.baseURL = baseURL;
    this.authToken = null;
    this.testResults = [];
  }

  // Fazer login para obter token de autenticação
  async authenticate(email = 'admin@medstaff.com', password = 'Admin123!@#') {
    try {
      const response = await axios.post(`${this.baseURL}/api/auth/login`, {
        email,
        password
      });

      if (response.data.success && response.data.data.token) {
        this.authToken = response.data.data.token;
        console.log('✅ Autenticação realizada com sucesso');
        return true;
      }
      
      console.log('❌ Falha na autenticação:', response.data.message);
      return false;
    } catch (error) {
      console.log('❌ Erro na autenticação:', error.message);
      return false;
    }
  }

  // Fazer requisição com autenticação
  async makeRequest(method, endpoint, data = null, headers = {}) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
          ...headers
        }
      };

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.data = data;
      }

      const response = await axios(config);
      return {
        success: true,
        status: response.status,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || error.message,
        data: error.response?.data
      };
    }
  }

  // Testar endpoint específico
  async testEndpoint(name, method, endpoint, data = null, expectedStatus = 200) {
    console.log(`\n🧪 Testando: ${name}`);
    console.log(`   ${method.toUpperCase()} ${endpoint}`);

    const result = await this.makeRequest(method, endpoint, data);
    
    const testResult = {
      name,
      method: method.toUpperCase(),
      endpoint,
      success: result.success && result.status === expectedStatus,
      status: result.status,
      expectedStatus,
      message: result.message || 'OK',
      timestamp: new Date().toISOString()
    };

    this.testResults.push(testResult);

    if (testResult.success) {
      console.log(`   ✅ Sucesso (${result.status})`);
    } else {
      console.log(`   ❌ Falha (${result.status}) - ${result.message}`);
    }

    return testResult;
  }

  // Testar todos os endpoints de funcionários
  async testEmployeeEndpoints() {
    console.log('\n📋 === TESTANDO ENDPOINTS DE FUNCIONÁRIOS ===');
    
    await this.testEndpoint('Listar funcionários', 'GET', '/api/v1/employees');
    await this.testEndpoint('Estatísticas de funcionários', 'GET', '/api/v1/employees/stats');
    await this.testEndpoint('Buscar funcionários', 'GET', '/api/v1/employees/search?search=admin');
    
    // Teste de criação (pode falhar se já existir)
    await this.testEndpoint('Criar funcionário', 'POST', '/api/v1/employees', {
      dados_pessoais: {
        nome: 'Teste Usuario',
        cpf: '12345678901',
        email: 'teste@medstaff.com'
      },
      dados_profissionais: {
        cargo: 'Analista',
        departamento: 'TI',
        data_admissao: '2024-01-01'
      },
      password: 'Teste123!@#'
    }, 201);
  }

  // Testar todos os endpoints de tarefas
  async testTaskEndpoints() {
    console.log('\n📋 === TESTANDO ENDPOINTS DE TAREFAS ===');
    
    await this.testEndpoint('Listar tarefas', 'GET', '/api/v1/tasks');
    await this.testEndpoint('Estatísticas de tarefas', 'GET', '/api/v1/tasks/stats');
    
    // Teste de criação
    await this.testEndpoint('Criar tarefa', 'POST', '/api/v1/tasks', {
      titulo: 'Tarefa de Teste',
      descricao: 'Descrição da tarefa de teste',
      usuario_criador_id: '550e8400-e29b-41d4-a716-446655440000', // UUID fictício
      prioridade: 'media'
    }, 201);
  }

  // Testar todos os endpoints de leads
  async testLeadEndpoints() {
    console.log('\n📋 === TESTANDO ENDPOINTS DE LEADS ===');
    
    await this.testEndpoint('Listar leads', 'GET', '/api/v1/leads');
    await this.testEndpoint('Estatísticas de leads', 'GET', '/api/v1/leads/stats');
    await this.testEndpoint('Leads para follow-up', 'GET', '/api/v1/leads/follow-up');
    
    // Teste de criação
    await this.testEndpoint('Criar lead', 'POST', '/api/v1/leads', {
      nome: 'Lead de Teste',
      email: 'lead@teste.com',
      telefone: '(11) 99999-9999',
      empresa: 'Empresa Teste'
    }, 201);
  }

  // Testar todos os endpoints de clientes PF
  async testClientePFEndpoints() {
    console.log('\n📋 === TESTANDO ENDPOINTS DE CLIENTES PF ===');
    
    await this.testEndpoint('Listar clientes PF', 'GET', '/api/v1/clientes-pf');
    await this.testEndpoint('Estatísticas de clientes PF', 'GET', '/api/v1/clientes-pf/stats');
    
    // Teste de criação
    await this.testEndpoint('Criar cliente PF', 'POST', '/api/v1/clientes-pf', {
      nome: 'Cliente PF Teste',
      cpf: '98765432100',
      email: 'clientepf@teste.com'
    }, 201);
  }

  // Testar todos os endpoints de clientes PJ
  async testClientePJEndpoints() {
    console.log('\n📋 === TESTANDO ENDPOINTS DE CLIENTES PJ ===');
    
    await this.testEndpoint('Listar clientes PJ', 'GET', '/api/v1/clientes-pj');
    await this.testEndpoint('Estatísticas de clientes PJ', 'GET', '/api/v1/clientes-pj/stats');
    
    // Teste de criação
    await this.testEndpoint('Criar cliente PJ', 'POST', '/api/v1/clientes-pj', {
      razao_social: 'Empresa Teste LTDA',
      cnpj: '12345678000195',
      email: 'empresa@teste.com'
    }, 201);
  }

  // Testar todos os endpoints de notificações
  async testNotificationEndpoints() {
    console.log('\n📋 === TESTANDO ENDPOINTS DE NOTIFICAÇÕES ===');
    
    await this.testEndpoint('Listar notificações', 'GET', '/api/v1/notifications');
    
    // Teste de criação
    await this.testEndpoint('Criar notificação', 'POST', '/api/v1/notifications', {
      usuario_id: '550e8400-e29b-41d4-a716-446655440000',
      titulo: 'Notificação de Teste',
      mensagem: 'Esta é uma notificação de teste para verificar o funcionamento do endpoint'
    }, 201);
  }

  // Testar todos os endpoints de despesas
  async testExpenseEndpoints() {
    console.log('\n📋 === TESTANDO ENDPOINTS DE DESPESAS ===');
    
    await this.testEndpoint('Listar despesas', 'GET', '/api/v1/expenses');
    await this.testEndpoint('Despesas vencidas', 'GET', '/api/v1/expenses/overdue');
    await this.testEndpoint('Despesas vencendo', 'GET', '/api/v1/expenses/due-soon');
    
    // Teste de criação
    await this.testEndpoint('Criar despesa', 'POST', '/api/v1/expenses', {
      descricao: 'Despesa de Teste',
      valor: 100.50,
      data_vencimento: '2024-12-31',
      fornecedor: 'Fornecedor Teste'
    }, 201);
  }

  // Executar todos os testes
  async runAllTests() {
    console.log('🚀 === INICIANDO TESTES DE ENDPOINTS ===\n');
    
    // Autenticar primeiro
    const authenticated = await this.authenticate();
    if (!authenticated) {
      console.log('❌ Não foi possível autenticar. Abortando testes.');
      return;
    }

    // Executar todos os testes
    await this.testEmployeeEndpoints();
    await this.testTaskEndpoints();
    await this.testLeadEndpoints();
    await this.testClientePFEndpoints();
    await this.testClientePJEndpoints();
    await this.testNotificationEndpoints();
    await this.testExpenseEndpoints();

    // Gerar relatório final
    this.generateReport();
  }

  // Gerar relatório dos testes
  generateReport() {
    console.log('\n📊 === RELATÓRIO FINAL DOS TESTES ===');
    
    const totalTests = this.testResults.length;
    const successfulTests = this.testResults.filter(test => test.success).length;
    const failedTests = totalTests - successfulTests;
    const successRate = ((successfulTests / totalTests) * 100).toFixed(2);

    console.log(`\n📈 Resumo:`);
    console.log(`   Total de testes: ${totalTests}`);
    console.log(`   Sucessos: ${successfulTests}`);
    console.log(`   Falhas: ${failedTests}`);
    console.log(`   Taxa de sucesso: ${successRate}%`);

    if (failedTests > 0) {
      console.log(`\n❌ Testes que falharam:`);
      this.testResults
        .filter(test => !test.success)
        .forEach(test => {
          console.log(`   • ${test.name} (${test.status}) - ${test.message}`);
        });
    }

    console.log('\n✅ Testes concluídos!');
    
    return {
      total: totalTests,
      successful: successfulTests,
      failed: failedTests,
      successRate: parseFloat(successRate),
      results: this.testResults
    };
  }

  // Testar endpoint específico por nome
  async testSpecificEndpoint(endpointName) {
    const authenticated = await this.authenticate();
    if (!authenticated) {
      console.log('❌ Não foi possível autenticar.');
      return;
    }

    switch (endpointName.toLowerCase()) {
      case 'employees':
        await this.testEmployeeEndpoints();
        break;
      case 'tasks':
        await this.testTaskEndpoints();
        break;
      case 'leads':
        await this.testLeadEndpoints();
        break;
      case 'clientes-pf':
        await this.testClientePFEndpoints();
        break;
      case 'clientes-pj':
        await this.testClientePJEndpoints();
        break;
      case 'notifications':
        await this.testNotificationEndpoints();
        break;
      case 'expenses':
        await this.testExpenseEndpoints();
        break;
      default:
        console.log(`❌ Endpoint '${endpointName}' não encontrado.`);
        return;
    }

    this.generateReport();
  }
}

export default EndpointTester;

// Permitir execução direta do arquivo
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new EndpointTester();
  
  const endpointName = process.argv[2];
  if (endpointName) {
    await tester.testSpecificEndpoint(endpointName);
  } else {
    await tester.runAllTests();
  }
}