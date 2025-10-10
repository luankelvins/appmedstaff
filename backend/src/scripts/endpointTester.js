import axios from 'axios';

class EndpointTester {
  constructor(baseURL = 'http://localhost:3001') {
    this.baseURL = baseURL;
    this.token = null;
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type];
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async authenticate() {
    try {
      this.log('Tentando autenticar com admin@medstaff.com...');
      const response = await axios.post(`${this.baseURL}/api/auth/login`, {
        email: 'admin@medstaff.com',
        password: 'Admin123!@#'
      });

      if (response.data.token) {
        this.token = response.data.token;
        this.log('Autenticação realizada com sucesso!', 'success');
        return true;
      }
      return false;
    } catch (error) {
      this.log(`Erro na autenticação: ${error.response?.data?.message || error.message}`, 'error');
      return false;
    }
  }

  async makeRequest(method, endpoint, data = null, requiresAuth = true) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {}
      };

      if (requiresAuth && this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }

      if (data) {
        config.data = data;
        config.headers['Content-Type'] = 'application/json';
      }

      const response = await axios(config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status || 500
      };
    }
  }

  recordTest(name, success, details = '') {
    this.results.total++;
    if (success) {
      this.results.passed++;
      this.log(`${name} - PASSOU`, 'success');
    } else {
      this.results.failed++;
      this.log(`${name} - FALHOU: ${details}`, 'error');
    }
    
    this.results.tests.push({
      name,
      success,
      details,
      timestamp: new Date().toISOString()
    });
  }

  async testEmployeeEndpoints() {
    this.log('🧑‍💼 Testando endpoints de funcionários...');

    // GET /api/v1/employees
    const listResult = await this.makeRequest('GET', '/api/v1/employees');
    this.recordTest(
      'GET /api/v1/employees',
      listResult.success && listResult.status === 200,
      listResult.error || `Status: ${listResult.status}`
    );

    // POST /api/v1/employees
    const newEmployee = {
      email: 'teste.funcionario@medstaff.com',
      dados_pessoais: {
        nome_completo: 'Funcionário Teste',
        cpf: '111.222.333-44',
        telefone: '(11) 99999-9999'
      },
      dados_profissionais: {
        cargo: 'Analista de Teste',
        departamento: 'QA',
        data_admissao: '2024-01-15'
      },
      role: 'employee'
    };

    const createResult = await this.makeRequest('POST', '/api/v1/employees', newEmployee);
    this.recordTest(
      'POST /api/v1/employees',
      createResult.success && createResult.status === 201,
      createResult.error || `Status: ${createResult.status}`
    );

    let employeeId = null;
    if (createResult.success && createResult.data?.employee?.id) {
      employeeId = createResult.data.employee.id;

      // GET /api/v1/employees/:id
      const getResult = await this.makeRequest('GET', `/api/v1/employees/${employeeId}`);
      this.recordTest(
        'GET /api/v1/employees/:id',
        getResult.success && getResult.status === 200,
        getResult.error || `Status: ${getResult.status}`
      );

      // PUT /api/v1/employees/:id
      const updateData = {
        dados_profissionais: {
          ...newEmployee.dados_profissionais,
          cargo: 'Senior Analista de Teste'
        }
      };

      const updateResult = await this.makeRequest('PUT', `/api/v1/employees/${employeeId}`, updateData);
      this.recordTest(
        'PUT /api/v1/employees/:id',
        updateResult.success && updateResult.status === 200,
        updateResult.error || `Status: ${updateResult.status}`
      );
    }
  }

  async testTaskEndpoints() {
    this.log('📋 Testando endpoints de tarefas...');

    // GET /api/v1/tasks
    const listResult = await this.makeRequest('GET', '/api/v1/tasks');
    this.recordTest(
      'GET /api/v1/tasks',
      listResult.success && listResult.status === 200,
      listResult.error || `Status: ${listResult.status}`
    );

    // POST /api/v1/tasks
    const newTask = {
      title: 'Tarefa de Teste',
      description: 'Esta é uma tarefa criada para teste dos endpoints',
      priority: 'medium',
      status: 'pending',
      due_date: '2024-12-31T23:59:59Z'
    };

    const createResult = await this.makeRequest('POST', '/api/v1/tasks', newTask);
    this.recordTest(
      'POST /api/v1/tasks',
      createResult.success && createResult.status === 201,
      createResult.error || `Status: ${createResult.status}`
    );

    let taskId = null;
    if (createResult.success && createResult.data?.task?.id) {
      taskId = createResult.data.task.id;

      // GET /api/v1/tasks/:id
      const getResult = await this.makeRequest('GET', `/api/v1/tasks/${taskId}`);
      this.recordTest(
        'GET /api/v1/tasks/:id',
        getResult.success && getResult.status === 200,
        getResult.error || `Status: ${getResult.status}`
      );

      // PUT /api/v1/tasks/:id
      const updateData = {
        status: 'in_progress',
        priority: 'high'
      };

      const updateResult = await this.makeRequest('PUT', `/api/v1/tasks/${taskId}`, updateData);
      this.recordTest(
        'PUT /api/v1/tasks/:id',
        updateResult.success && updateResult.status === 200,
        updateResult.error || `Status: ${updateResult.status}`
      );
    }
  }

  async testLeadEndpoints() {
    this.log('🎯 Testando endpoints de leads...');

    // GET /api/v1/leads
    const listResult = await this.makeRequest('GET', '/api/v1/leads');
    this.recordTest(
      'GET /api/v1/leads',
      listResult.success && listResult.status === 200,
      listResult.error || `Status: ${listResult.status}`
    );

    // POST /api/v1/leads
    const newLead = {
      nome: 'Lead de Teste',
      telefone: '(11) 98765-4321',
      email: 'lead.teste@empresa.com',
      empresa: 'Empresa Teste Ltda',
      cargo: 'Gerente de RH',
      cidade: 'São Paulo',
      estado: 'SP',
      origem: 'site',
      status: 'novo'
    };

    const createResult = await this.makeRequest('POST', '/api/v1/leads', newLead);
    this.recordTest(
      'POST /api/v1/leads',
      createResult.success && createResult.status === 201,
      createResult.error || `Status: ${createResult.status}`
    );

    let leadId = null;
    if (createResult.success && createResult.data?.lead?.id) {
      leadId = createResult.data.lead.id;

      // GET /api/v1/leads/:id
      const getResult = await this.makeRequest('GET', `/api/v1/leads/${leadId}`);
      this.recordTest(
        'GET /api/v1/leads/:id',
        getResult.success && getResult.status === 200,
        getResult.error || `Status: ${getResult.status}`
      );

      // PUT /api/v1/leads/:id
      const updateData = {
        status: 'contatado',
        observacoes: 'Primeiro contato realizado com sucesso'
      };

      const updateResult = await this.makeRequest('PUT', `/api/v1/leads/${leadId}`, updateData);
      this.recordTest(
        'PUT /api/v1/leads/:id',
        updateResult.success && updateResult.status === 200,
        updateResult.error || `Status: ${updateResult.status}`
      );
    }
  }

  async testClientePFEndpoints() {
    this.log('👤 Testando endpoints de clientes PF...');

    // GET /api/v1/clientes-pf
    const listResult = await this.makeRequest('GET', '/api/v1/clientes-pf');
    this.recordTest(
      'GET /api/v1/clientes-pf',
      listResult.success && listResult.status === 200,
      listResult.error || `Status: ${listResult.status}`
    );

    // POST /api/v1/clientes-pf
    const newClientePF = {
      dados_pessoais: {
        nome_completo: 'Cliente PF Teste',
        cpf: '123.456.789-00',
        rg: '12.345.678-9',
        data_nascimento: '1990-05-15'
      },
      endereco: {
        logradouro: 'Rua Teste, 123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567'
      },
      contato: {
        telefone: '(11) 99999-8888',
        email: 'cliente.pf@teste.com'
      }
    };

    const createResult = await this.makeRequest('POST', '/api/v1/clientes-pf', newClientePF);
    this.recordTest(
      'POST /api/v1/clientes-pf',
      createResult.success && createResult.status === 201,
      createResult.error || `Status: ${createResult.status}`
    );
  }

  async testClientePJEndpoints() {
    this.log('🏢 Testando endpoints de clientes PJ...');

    // GET /api/v1/clientes-pj
    const listResult = await this.makeRequest('GET', '/api/v1/clientes-pj');
    this.recordTest(
      'GET /api/v1/clientes-pj',
      listResult.success && listResult.status === 200,
      listResult.error || `Status: ${listResult.status}`
    );

    // POST /api/v1/clientes-pj
    const newClientePJ = {
      razao_social: 'Empresa Teste Ltda',
      nome_fantasia: 'Teste Corp',
      cnpj: '12.345.678/0001-90',
      endereco: {
        logradouro: 'Av. Empresarial, 456',
        bairro: 'Centro Empresarial',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567'
      }
    };

    const createResult = await this.makeRequest('POST', '/api/v1/clientes-pj', newClientePJ);
    this.recordTest(
      'POST /api/v1/clientes-pj',
      createResult.success && createResult.status === 201,
      createResult.error || `Status: ${createResult.status}`
    );
  }

  async testNotificationEndpoints() {
    this.log('🔔 Testando endpoints de notificações...');

    // GET /api/v1/notifications
    const listResult = await this.makeRequest('GET', '/api/v1/notifications');
    this.recordTest(
      'GET /api/v1/notifications',
      listResult.success && listResult.status === 200,
      listResult.error || `Status: ${listResult.status}`
    );
  }

  async testExpenseEndpoints() {
    this.log('💰 Testando endpoints de despesas...');

    // GET /api/v1/expenses
    const listResult = await this.makeRequest('GET', '/api/v1/expenses');
    this.recordTest(
      'GET /api/v1/expenses',
      listResult.success && listResult.status === 200,
      listResult.error || `Status: ${listResult.status}`
    );
  }

  async testHealthEndpoints() {
    this.log('🏥 Testando endpoints de saúde...');

    // GET /api/health
    const healthResult = await this.makeRequest('GET', '/api/health', null, false);
    this.recordTest(
      'GET /api/health',
      healthResult.success && healthResult.status === 200,
      healthResult.error || `Status: ${healthResult.status}`
    );
  }

  generateReport() {
    this.log('\n📊 RELATÓRIO FINAL DE TESTES', 'info');
    this.log('='.repeat(50), 'info');
    this.log(`Total de testes: ${this.results.total}`, 'info');
    this.log(`Testes aprovados: ${this.results.passed}`, 'success');
    this.log(`Testes falharam: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'info');
    
    const successRate = this.results.total > 0 ? ((this.results.passed / this.results.total) * 100).toFixed(2) : 0;
    this.log(`Taxa de sucesso: ${successRate}%`, successRate >= 80 ? 'success' : 'warning');

    if (this.results.failed > 0) {
      this.log('\n❌ TESTES QUE FALHARAM:', 'error');
      this.results.tests
        .filter(test => !test.success)
        .forEach(test => {
          this.log(`  • ${test.name}: ${test.details}`, 'error');
        });
    }

    this.log('\n🎯 RESUMO POR CATEGORIA:', 'info');
    const categories = {};
    this.results.tests.forEach(test => {
      const endpoint = test.name.split(' ')[1];
      let category;
      
      if (endpoint === '/api/health') {
        category = '/api/health';
      } else if (endpoint && endpoint.startsWith('/api/v1/')) {
        const parts = endpoint.split('/');
        category = parts.slice(0, 4).join('/'); // /api/v1/resource
      } else {
        category = endpoint || 'Outros';
      }
      
      if (!categories[category]) {
        categories[category] = { total: 0, passed: 0 };
      }
      categories[category].total++;
      if (test.success) categories[category].passed++;
    });

    Object.entries(categories).forEach(([category, stats]) => {
      const rate = ((stats.passed / stats.total) * 100).toFixed(0);
      this.log(`  ${category}: ${stats.passed}/${stats.total} (${rate}%)`, 'info');
    });
  }

  async runAllTests() {
    this.log('🚀 Iniciando testes completos da API MedStaff...', 'info');
    this.log('='.repeat(60), 'info');

    // Autenticação
    const authSuccess = await this.authenticate();
    if (!authSuccess) {
      this.log('❌ Falha na autenticação. Abortando testes.', 'error');
      return;
    }

    // Executar todos os testes
    await this.testHealthEndpoints();
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
}

// Executar testes se o arquivo for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new EndpointTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Erro durante execução dos testes:', error);
    process.exit(1);
  });
}

export default EndpointTester;