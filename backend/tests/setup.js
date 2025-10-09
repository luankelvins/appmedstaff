// Setup global para testes
import dotenv from 'dotenv';

// Carregar variáveis de ambiente para testes
dotenv.config({ path: '.env.test' });

// Configurar variáveis de ambiente padrão para testes
process.env.NODE_ENV = 'test';
process.env.VITE_JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.VITE_JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-only';
process.env.VITE_JWT_EXPIRES_IN = '1h';
process.env.VITE_JWT_REFRESH_EXPIRES_IN = '7d';

// Mock do console para testes mais limpos
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Mock do pool de banco de dados
jest.mock('../src/config/database.js', () => ({
  default: {
    query: jest.fn(),
  },
}));

// Configurar timeout global para testes
jest.setTimeout(10000);