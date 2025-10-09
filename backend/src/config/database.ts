import { Pool } from 'pg';

// Configuração do banco PostgreSQL
const dbConfig = {
  host: process.env.VITE_DB_HOST || 'localhost',
  port: parseInt(process.env.VITE_DB_PORT || '5432'),
  database: process.env.VITE_DB_NAME || 'appmedstaff',
  user: process.env.VITE_DB_USER || 'postgres',
  password: process.env.VITE_DB_PASSWORD || 'postgres',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // máximo de conexões no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Pool de conexões
const pool = new Pool(dbConfig);

// Função para testar conexão
const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Conexão com PostgreSQL estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com PostgreSQL:', error);
    return false;
  }
};

// Função para executar queries
const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executada:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Erro na query:', { text, error });
    throw error;
  }
};

// Função para transações
const transaction = async (callback: (client: any) => Promise<any>) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Função para fechar pool (cleanup)
const closePool = async () => {
  await pool.end();
};

// Configuração de autenticação JWT
const jwtConfig = {
  secret: process.env.VITE_JWT_SECRET || 'medstaff_super_secret_jwt_key_2024',
  expiresIn: process.env.VITE_JWT_EXPIRES_IN || '7d',
};

// Exportações nomeadas
export { pool, testConnection, query, transaction, closePool, jwtConfig };

// Exportação default
const db = { query, transaction, testConnection };
export default db;