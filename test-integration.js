#!/usr/bin/env node

/**
 * Script de Teste de Integração - MedStaff
 * 
 * Este script testa a integração completa entre frontend e backend,
 * verificando endpoints, validações e funcionalidades principais.
 */

import fetch from 'node-fetch';
import { performance } from 'perf_hooks';

const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class IntegrationTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      tests: []
    };
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async test(name, testFn) {
    this.results.total++;
    const start = performance.now();
    
    try {
      await testFn();
      const duration = Math.round(performance.now() - start);
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASS', duration });
      this.log(`✅ ${name} (${duration}ms)`, 'green');
    } catch (error) {
      const duration = Math.round(performance.now() - start);
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAIL', duration, error: error.message });
      this.log(`❌ ${name} (${duration}ms): ${error.message}`, 'red');
    }
  }

  async makeRequest(url, options = {}) {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json().catch(() => ({}));
    return { response, data };
  }

  async runTests() {
    this.log('\n🚀 Iniciando Testes de Integração MedStaff\n', 'bold');

    // Testes de Conectividade
    this.log('📡 Testes de Conectividade', 'blue');
    
    await this.test('Backend Health Check', async () => {
      const { response } = await this.makeRequest(`${BACKEND_URL}/api/health/simple`);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
    });

    await this.test('Frontend Accessibility', async () => {
      const response = await fetch(FRONTEND_URL);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
    });

    await this.test('API Documentation', async () => {
      const response = await fetch(`${BACKEND_URL}/api/docs.json`);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
    });

    // Testes de Autenticação
    this.log('\n🔐 Testes de Autenticação', 'blue');

    await this.test('Login - Validação de Email Inválido', async () => {
      const { response, data } = await this.makeRequest(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
          password: '123'
        })
      });
      
      if (response.status !== 400) {
        throw new Error(`Esperado status 400, recebido ${response.status}`);
      }
      
      if (!data.error || !data.details) {
        throw new Error('Resposta de erro não contém detalhes de validação');
      }
    });

    await this.test('Login - Validação de Senha Fraca', async () => {
      const { response, data } = await this.makeRequest(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: '123'
        })
      });
      
      if (response.status !== 400) {
        throw new Error(`Esperado status 400, recebido ${response.status}`);
      }
      
      const passwordErrors = data.details?.filter(d => d.field === 'password');
      if (!passwordErrors || passwordErrors.length === 0) {
        throw new Error('Validação de senha não funcionou');
      }
    });

    await this.test('Login - Credenciais Inexistentes', async () => {
      const { response } = await this.makeRequest(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'ValidPassword123!'
        })
      });
      
      if (response.status !== 401) {
        throw new Error(`Esperado status 401, recebido ${response.status}`);
      }
    });

    // Testes de Dashboard
    this.log('\n📊 Testes de Dashboard', 'blue');

    await this.test('Dashboard - Acesso Sem Autenticação', async () => {
      const { response } = await this.makeRequest(`${BACKEND_URL}/api/dashboard/quick-stats`);
      
      if (response.status !== 401) {
        throw new Error(`Esperado status 401, recebido ${response.status}`);
      }
    });

    // Testes de 2FA
    this.log('\n🔒 Testes de 2FA', 'blue');

    await this.test('2FA Status - Sem Autenticação', async () => {
      const { response } = await this.makeRequest(`${BACKEND_URL}/api/2fa/status`);
      
      if (response.status !== 401) {
        throw new Error(`Esperado status 401, recebido ${response.status}`);
      }
    });

    // Testes de Rate Limiting
    this.log('\n⚡ Testes de Rate Limiting', 'blue');

    await this.test('Rate Limiting - Login', async () => {
      const promises = [];
      
      // Fazer múltiplas tentativas de login rapidamente
      for (let i = 0; i < 10; i++) {
        promises.push(
          this.makeRequest(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
              email: 'test@example.com',
              password: 'test123'
            })
          })
        );
      }
      
      const results = await Promise.all(promises);
      const rateLimited = results.some(({ response }) => response.status === 429);
      
      if (!rateLimited) {
        throw new Error('Rate limiting não foi ativado');
      }
    });

    // Testes de Segurança
    this.log('\n🛡️ Testes de Segurança', 'blue');

    await this.test('Proteção XSS - Headers', async () => {
      const { response } = await this.makeRequest(`${BACKEND_URL}/api/health/simple`);
      
      const xssProtection = response.headers.get('x-xss-protection');
      if (!xssProtection) {
        throw new Error('Header X-XSS-Protection não encontrado');
      }
    });

    await this.test('Content Security Policy', async () => {
      const { response } = await this.makeRequest(`${BACKEND_URL}/api/health/simple`);
      
      const csp = response.headers.get('content-security-policy');
      if (!csp) {
        throw new Error('Header Content-Security-Policy não encontrado');
      }
    });

    // Testes de Performance
    this.log('\n⚡ Testes de Performance', 'blue');

    await this.test('Tempo de Resposta - Health Check', async () => {
      const start = performance.now();
      await this.makeRequest(`${BACKEND_URL}/api/health/simple`);
      const duration = performance.now() - start;
      
      if (duration > 1000) {
        throw new Error(`Resposta muito lenta: ${Math.round(duration)}ms`);
      }
    });

    await this.test('Compressão de Resposta', async () => {
      const response = await fetch(`${BACKEND_URL}/api/health/simple`, {
        headers: {
          'Accept-Encoding': 'gzip, deflate'
        }
      });
      
      const encoding = response.headers.get('content-encoding');
      if (!encoding || !encoding.includes('gzip')) {
        throw new Error('Compressão gzip não está ativa');
      }
    });

    // Relatório Final
    this.generateReport();
  }

  generateReport() {
    this.log('\n📋 Relatório de Testes', 'bold');
    this.log('═'.repeat(50), 'blue');
    
    this.log(`Total de Testes: ${this.results.total}`, 'blue');
    this.log(`✅ Passou: ${this.results.passed}`, 'green');
    this.log(`❌ Falhou: ${this.results.failed}`, 'red');
    
    const successRate = Math.round((this.results.passed / this.results.total) * 100);
    this.log(`📊 Taxa de Sucesso: ${successRate}%`, successRate >= 80 ? 'green' : 'red');
    
    if (this.results.failed > 0) {
      this.log('\n❌ Testes que Falharam:', 'red');
      this.results.tests
        .filter(test => test.status === 'FAIL')
        .forEach(test => {
          this.log(`  • ${test.name}: ${test.error}`, 'red');
        });
    }
    
    this.log('\n⏱️ Performance dos Testes:', 'blue');
    const sortedTests = [...this.results.tests].sort((a, b) => b.duration - a.duration);
    sortedTests.slice(0, 5).forEach(test => {
      const color = test.duration > 500 ? 'red' : test.duration > 200 ? 'yellow' : 'green';
      this.log(`  • ${test.name}: ${test.duration}ms`, color);
    });
    
    this.log('\n🎯 Resumo:', 'bold');
    if (successRate >= 90) {
      this.log('🟢 Sistema funcionando perfeitamente!', 'green');
    } else if (successRate >= 70) {
      this.log('🟡 Sistema funcionando com algumas questões menores', 'yellow');
    } else {
      this.log('🔴 Sistema com problemas significativos', 'red');
    }
    
    this.log('\n✨ Teste de Integração Concluído!', 'bold');
  }
}

// Executar testes
const tester = new IntegrationTester();
tester.runTests().catch(error => {
  console.error('Erro fatal nos testes:', error);
  process.exit(1);
});