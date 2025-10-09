// Configuração de banco que funciona tanto no frontend quanto no backend

// Detecta se está rodando no browser
const isBrowser = typeof window !== 'undefined';

// Interface comum para operações de banco
interface DatabaseClient {
  query: (text: string, params?: any[]) => Promise<any>;
  transaction: (callback: (client: any) => Promise<any>) => Promise<any>;
  testConnection: () => Promise<boolean>;
}

// Mock para o frontend
const mockDatabaseClient: DatabaseClient = {
  async query(text: string, params?: any[]) {
    console.warn('Database query called in browser context:', text, params);
    return { rows: [], rowCount: 0 };
  },
  
  async transaction(callback: (client: any) => Promise<any>) {
    console.warn('Database transaction called in browser context');
    return callback({
      query: this.query
    });
  },
  
  async testConnection() {
    console.warn('Database connection test called in browser context');
    return false;
  }
};

// Cliente real para o backend (só importa se não estiver no browser)
let realDatabaseClient: DatabaseClient | null = null;

if (!isBrowser) {
  try {
    // Importação dinâmica para evitar erros no browser
    const { default: db } = await import('./database');
    realDatabaseClient = db;
  } catch (error) {
    console.warn('Failed to load database client:', error);
  }
}

// Exporta o cliente apropriado
const db = isBrowser ? mockDatabaseClient : (realDatabaseClient || mockDatabaseClient);

export default db;

// Configuração JWT que funciona em ambos os ambientes
export const jwtConfig = {
  secret: (typeof import.meta !== 'undefined' && import.meta.env?.JWT_SECRET) || 'medstaff_super_secret_jwt_key_2024',
  expiresIn: (typeof import.meta !== 'undefined' && import.meta.env?.JWT_EXPIRES_IN) || '7d',
};