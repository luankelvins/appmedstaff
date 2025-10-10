import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';

async function createAdminUser() {
  try {
    console.log('🚀 Criando usuário administrador...');

    // Verificar se já existe um usuário admin
    const existingAdmin = await pool.query(
      "SELECT id FROM employees WHERE email = $1",
      ['admin@medstaff.com']
    );

    if (existingAdmin.rows.length > 0) {
      console.log('✅ Usuário admin já existe!');
      return;
    }

    // Gerar hash da senha
    const password = 'Admin123!@#';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Dados do usuário admin
    const adminData = {
      id: uuidv4(),
      email: 'admin@medstaff.com',
      dados_pessoais: {
        nome_completo: 'Administrador do Sistema',
        cpf: '00000000000',
        telefone: '(11) 99999-9999',
        data_nascimento: '1990-01-01',
        endereco: {
          cep: '01000-000',
          logradouro: 'Rua Principal',
          numero: '123',
          cidade: 'São Paulo',
          estado: 'SP'
        }
      },
      dados_profissionais: {
        cargo: 'Administrador do Sistema',
        departamento: 'TI',
        data_admissao: new Date().toISOString().split('T')[0],
        salario: 10000.00,
        tipo_contrato: 'clt',
        carga_horaria: 40
      },
      role: 'superadmin',
      status: 'ativo',
      password_hash: hashedPassword,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Inserir usuário admin
    const insertQuery = `
      INSERT INTO employees (
        id, email, dados_pessoais, dados_profissionais, role, status, 
        password_hash, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, dados_pessoais->>'nome_completo' as nome, email, role
    `;

    const result = await pool.query(insertQuery, [
      adminData.id,
      adminData.email,
      JSON.stringify(adminData.dados_pessoais),
      JSON.stringify(adminData.dados_profissionais),
      adminData.role,
      adminData.status,
      adminData.password_hash,
      adminData.created_at,
      adminData.updated_at
    ]);

    const createdUser = result.rows[0];

    console.log('✅ Usuário administrador criado com sucesso!');
    console.log('📧 Email:', createdUser.email);
    console.log('🔑 Senha:', password);
    console.log('👤 Nome:', createdUser.nome);
    console.log('🛡️ Role:', createdUser.role);
    console.log('🆔 ID:', createdUser.id);

    console.log('\n⚠️  IMPORTANTE: Altere a senha padrão após o primeiro login!');

  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
    
    if (error.code === '23505') {
      console.log('ℹ️  Usuário admin já existe (conflito de email ou CPF)');
    } else if (error.code === '42P01') {
      console.log('❌ Tabela "employees" não encontrada. Execute as migrations primeiro.');
    } else {
      console.log('❌ Detalhes do erro:', error.message);
    }
  }
}

// Função para criar usuários de teste adicionais
async function createTestUsers() {
  try {
    console.log('\n🧪 Criando usuários de teste...');

    const testUsers = [
      {
        nome: 'João Silva',
        email: 'joao.silva@medstaff.com',
        cpf: '11111111111',
        cargo: 'Analista RH',
        departamento: 'Recursos Humanos',
        role: 'employee'
      },
      {
        nome: 'Maria Santos',
        email: 'maria.santos@medstaff.com',
        cpf: '22222222222',
        cargo: 'Gerente Comercial',
        departamento: 'Comercial',
        role: 'manager'
      },
      {
        nome: 'Pedro Oliveira',
        email: 'pedro.oliveira@medstaff.com',
        cpf: '33333333333',
        cargo: 'Analista Comercial',
        departamento: 'Comercial',
        role: 'employee'
      }
    ];

    const password = 'Teste123!@#';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    for (const userData of testUsers) {
      // Verificar se usuário já existe
      const existing = await pool.query(
        "SELECT id FROM employees WHERE email = $1",
        [userData.email]
      );

      if (existing.rows.length > 0) {
        console.log(`⏭️  Usuário ${userData.email} já existe, pulando...`);
        continue;
      }

      const testUserData = {
        id: uuidv4(),
        email: userData.email,
        dados_pessoais: {
          nome_completo: userData.nome,
          cpf: userData.cpf,
          telefone: '(11) 98888-8888'
        },
        dados_profissionais: {
          cargo: userData.cargo,
          departamento: userData.departamento,
          data_admissao: new Date().toISOString().split('T')[0],
          salario: 5000.00,
          tipo_contrato: 'clt',
          carga_horaria: 40
        },
        role: userData.role,
        status: 'ativo',
        password_hash: hashedPassword,
        created_at: new Date(),
        updated_at: new Date()
      };

      const insertQuery = `
        INSERT INTO employees (
          id, email, dados_pessoais, dados_profissionais, role, status, 
          password_hash, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING dados_pessoais->>'nome_completo' as nome, email
      `;

      const result = await pool.query(insertQuery, [
        testUserData.id,
        testUserData.email,
        JSON.stringify(testUserData.dados_pessoais),
        JSON.stringify(testUserData.dados_profissionais),
        testUserData.role,
        testUserData.status,
        testUserData.password_hash,
        testUserData.created_at,
        testUserData.updated_at
      ]);

      console.log(`✅ Usuário criado: ${result.rows[0].nome} (${result.rows[0].email})`);
    }

    console.log('\n✅ Usuários de teste criados com sucesso!');
    console.log('🔑 Senha padrão para todos:', password);

  } catch (error) {
    console.error('❌ Erro ao criar usuários de teste:', error);
  }
}

// Executar script
async function main() {
  const createTests = process.argv.includes('--with-test-users');
  
  try {
    await createAdminUser();
    
    if (createTests) {
      await createTestUsers();
    }
    
    console.log('\n🎉 Script concluído!');
  } catch (error) {
    console.error('❌ Erro durante execução:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Permitir execução direta
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { createAdminUser, createTestUsers };