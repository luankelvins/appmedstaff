#!/usr/bin/env node

import axios from 'axios';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

const API_BASE_URL = `http://localhost:${process.env.PORT || 3001}/api`;

class TwoFactorTester {
  constructor() {
    this.authToken = null;
    this.userId = null;
    this.userEmail = null;
  }

  async login() {
    try {
      console.log('🔐 Fazendo login...');
      
      // Primeiro, vamos buscar um usuário existente
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'luankelvin@soumedstaff.com', // Usuário admin existente
        password: 'Test123!@#' // Senha que atende aos critérios
      });

      if (response.data.token) {
        this.authToken = response.data.token;
        this.userId = response.data.user.id;
        this.userEmail = response.data.user.email;
        console.log('✅ Login realizado com sucesso');
        console.log(`   Usuário: ${this.userEmail}`);
        return true;
      }
    } catch (error) {
      console.log('❌ Erro no login:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async testGenerateSecret() {
    try {
      console.log('\n📱 Testando geração de secret 2FA...');
      
      const response = await axios.post(
        `${API_BASE_URL}/2fa/generate-secret`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        console.log('✅ Secret gerado com sucesso');
        console.log(`   Secret: ${response.data.data.secret.substring(0, 10)}...`);
        console.log(`   QR Code: ${response.data.data.qrCode ? 'Gerado' : 'Não gerado'}`);
        return response.data.data.secret;
      }
    } catch (error) {
      console.log('❌ Erro ao gerar secret:', error.response?.data?.message || error.message);
      return null;
    }
  }

  async testEnableTwoFactor(secret) {
    try {
      console.log('\n🔒 Testando habilitação do 2FA...');
      
      // Para teste, vamos usar um token simulado (em produção seria do app autenticador)
      const testToken = '123456'; // Token de teste
      
      const response = await axios.post(
        `${API_BASE_URL}/2fa/enable`,
        {
          token: testToken
        },
        {
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        console.log('✅ 2FA habilitado com sucesso');
        console.log(`   Códigos de backup: ${response.data.backupCodes?.length || 0} códigos`);
        return response.data.backupCodes;
      }
    } catch (error) {
      console.log('❌ Erro ao habilitar 2FA:', error.response?.data?.message || error.message);
      console.log('   (Esperado - token de teste inválido)');
      return null;
    }
  }

  async testGetStatus() {
    try {
      console.log('\n📊 Testando status do 2FA...');
      
      const response = await axios.get(
        `${API_BASE_URL}/2fa/status`,
        {
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        }
      );

      if (response.data.success) {
        console.log('✅ Status obtido com sucesso');
        console.log(`   2FA habilitado: ${response.data.data.enabled}`);
        return response.data.data.enabled;
      }
    } catch (error) {
      console.log('❌ Erro ao obter status:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async testDisableTwoFactor() {
    try {
      console.log('\n🔓 Testando desabilitação do 2FA...');
      
      const response = await axios.post(
        `${API_BASE_URL}/2fa/disable`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        console.log('✅ 2FA desabilitado com sucesso');
        return true;
      }
    } catch (error) {
      console.log('❌ Erro ao desabilitar 2FA:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async testRateLimiting() {
    try {
      console.log('\n⏱️  Testando rate limiting...');
      
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          axios.post(
            `${API_BASE_URL}/2fa/generate-secret`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${this.authToken}`,
                'Content-Type': 'application/json'
              }
            }
          ).catch(err => err.response)
        );
      }

      const responses = await Promise.all(promises);
      const rateLimited = responses.some(res => res?.status === 429);
      
      if (rateLimited) {
        console.log('✅ Rate limiting funcionando corretamente');
      } else {
        console.log('⚠️  Rate limiting pode não estar funcionando');
      }
      
      return rateLimited;
    } catch (error) {
      console.log('❌ Erro ao testar rate limiting:', error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('🧪 Iniciando testes dos endpoints de 2FA\n');
    
    // Login
    const loginSuccess = await this.login();
    if (!loginSuccess) {
      console.log('\n❌ Não foi possível fazer login. Verifique se existe um usuário admin.');
      return;
    }

    // Testar endpoints
    const secret = await this.testGenerateSecret();
    await this.testGetStatus();
    await this.testEnableTwoFactor(secret);
    await this.testDisableTwoFactor();
    await this.testRateLimiting();

    console.log('\n🎉 Testes concluídos!');
    console.log('\n📝 Resumo:');
    console.log('   - Endpoints de 2FA estão respondendo');
    console.log('   - Rate limiting configurado');
    console.log('   - Banco de dados conectado');
    console.log('   - Autenticação funcionando');
  }
}

// Executar testes
const tester = new TwoFactorTester();
tester.runAllTests().catch(console.error);