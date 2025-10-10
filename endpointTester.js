import axios from 'axios';
import chalk from 'chalk';

class EndpointTester {
  constructor(baseURL = 'http://localhost:3001') {
    this.baseURL = baseURL;
    this.token = null;
    this.results = [];
  }

  async authenticate() {
    try {
      console.log(chalk.blue('🔐 Autenticando...'));
      console.log(chalk.gray(`URL: ${this.baseURL}/api/auth/login`));
      
      const response = await axios.post(`${this.baseURL}/api/auth/login`, {
        email: 'admin@medstaff.com',
        password: 'Admin123!@#'
      });

      console.log(chalk.gray(`Status: ${response.status}`));
      console.log(chalk.gray(`Response:`, JSON.stringify(response.data, null, 2)));

      if (response.data.token) {
        this.token = response.data.token;
        console.log(chalk.green('✅ Autenticação bem-sucedida'));
        return true;
      } else {
        console.log(chalk.red('❌ Falha na autenticação - token não encontrado'));
        console.log(chalk.red('Estrutura da resposta:', Object.keys(response.data)));
        return false;
      }
    } catch (error) {
      console.log(chalk.red(`❌ Erro na autenticação:`));
      console.log(chalk.red(`Status: ${error.response?.status}`));
      console.log(chalk.red(`Message: ${error.response?.data?.message || error.message}`));
      console.log(chalk.red(`Data:`, JSON.stringify(error.response?.data, null, 2)));
      return false;
    }
  }

  async testEndpoint(method, path, description) {
    try {
      const config = {
        method: method.toLowerCase(),
        url: `${this.baseURL}${path}`,
        headers: {}
      };

      // Adicionar token para rotas protegidas
      if (path.startsWith('/api/v1/')) {
        if (!this.token) {
          throw new Error('Token não disponível para rota protegida');
        }
        config.headers.Authorization = `Bearer ${this.token}`;
      }

      const response = await axios(config);
      
      const result = {
        method,
        path,
        description,
        status: response.status,
        success: true,
        message: 'OK',
        responseTime: response.headers['x-response-time'] || 'N/A'
      };

      console.log(chalk.green(`✅ ${method} ${path} - ${description} (${response.status})`));
      this.results.push(result);
      return result;

    } catch (error) {
      const result = {
        method,
        path,
        description,
        status: error.response?.status || 0,
        success: false,
        message: error.response?.data?.message || error.message,
        responseTime: 'N/A'
      };

      console.log(chalk.red(`❌ ${method} ${path} - ${description} (${error.response?.status || 'ERROR'}): ${result.message}`));
      this.results.push(result);
      return result;
    }
  }

  async runTests() {
    console.log(chalk.yellow('🚀 Iniciando testes dos endpoints...\n'));

    // Primeiro, autenticar
    const authSuccess = await this.authenticate();
    if (!authSuccess) {
      console.log(chalk.red('❌ Não foi possível autenticar. Abortando testes.'));
      return;
    }

    console.log(''); // Linha em branco

    // Endpoints para testar
    const endpoints = [
      { method: 'GET', path: '/api/health', description: 'Health Check' },
      { method: 'GET', path: '/api/v1/employees', description: 'Listar funcionários' },
      { method: 'GET', path: '/api/v1/employees/stats', description: 'Estatísticas de funcionários' },
      { method: 'GET', path: '/api/v1/tasks', description: 'Listar tarefas' },
      { method: 'GET', path: '/api/v1/tasks/stats', description: 'Estatísticas de tarefas' },
      { method: 'GET', path: '/api/v1/leads', description: 'Listar leads' },
      { method: 'GET', path: '/api/v1/leads/stats', description: 'Estatísticas de leads' },
      { method: 'GET', path: '/api/v1/clientes-pf', description: 'Listar clientes PF' },
      { method: 'GET', path: '/api/v1/clientes-pj', description: 'Listar clientes PJ' },
      { method: 'GET', path: '/api/v1/notifications', description: 'Listar notificações' },
      { method: 'GET', path: '/api/v1/expenses', description: 'Listar despesas' }
    ];

    // Executar testes
    for (const endpoint of endpoints) {
      await this.testEndpoint(endpoint.method, endpoint.path, endpoint.description);
      await new Promise(resolve => setTimeout(resolve, 100)); // Pequena pausa entre requests
    }

    // Gerar relatório
    this.generateReport();
  }

  generateReport() {
    console.log('\n' + chalk.yellow('📊 RELATÓRIO DE TESTES') + '\n');
    
    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);
    
    console.log(chalk.green(`✅ Sucessos: ${successful.length}/${this.results.length}`));
    console.log(chalk.red(`❌ Falhas: ${failed.length}/${this.results.length}`));
    
    if (failed.length > 0) {
      console.log('\n' + chalk.red('FALHAS DETALHADAS:'));
      failed.forEach(result => {
        console.log(chalk.red(`  • ${result.method} ${result.path}: ${result.message}`));
      });
    }

    // Categorizar por tipo de endpoint
    const healthCheck = this.results.filter(r => r.path === '/api/health');
    const protectedRoutes = this.results.filter(r => r.path.startsWith('/api/v1/'));
    
    console.log('\n' + chalk.blue('RESUMO POR CATEGORIA:'));
    console.log(`  Health Check: ${healthCheck.filter(r => r.success).length}/${healthCheck.length}`);
    console.log(`  Rotas Protegidas: ${protectedRoutes.filter(r => r.success).length}/${protectedRoutes.length}`);
    
    const successRate = ((successful.length / this.results.length) * 100).toFixed(1);
    console.log('\n' + chalk.yellow(`Taxa de Sucesso Geral: ${successRate}%`));
  }
}

// Executar testes
const tester = new EndpointTester();
tester.runTests().catch(console.error);