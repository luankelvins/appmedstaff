-- SCRIPT CONSOLIDADO PARA CARGA DE DADOS - MEDSTAFF
-- Execute este script no Supabase SQL Editor
-- Ordem de execução: clientes_pf -> clientes_pj -> leads -> declaracoes_irpf -> servicos_especiais -> pipelines

-- =====================================================
-- 1. INSERÇÃO DE CLIENTES PESSOA FÍSICA
-- =====================================================

INSERT INTO clientes_pf (
  nome,
  cpf,
  rg,
  data_nascimento,
  telefone,
  email,
  endereco,
  numero,
  complemento,
  bairro,
  cidade,
  estado,
  cep,
  profissao,
  estado_civil,
  status,
  observacoes,
  criado_por
) VALUES 
(
  'Dr. João Silva Santos',
  '123.456.789-01',
  '12.345.678-9',
  '1980-05-15',
  '(11) 99999-1234',
  'joao.santos@email.com',
  'Rua das Flores',
  '123',
  'Apto 45',
  'Jardins',
  'São Paulo',
  'SP',
  '01234-567',
  'Médico',
  'casado',
  'ativo',
  'Cliente VIP, médico cardiologista',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Dra. Maria Oliveira Costa',
  '987.654.321-02',
  '98.765.432-1',
  '1975-08-22',
  '(11) 88888-5678',
  'maria.costa@email.com',
  'Avenida Paulista',
  '1000',
  'Conjunto 12',
  'Bela Vista',
  'São Paulo',
  'SP',
  '01310-100',
  'Médica',
  'solteira',
  'ativo',
  'Ginecologista, cliente há 5 anos',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Dr. Carlos Eduardo Mendes',
  '456.789.123-03',
  '45.678.912-3',
  '1982-12-10',
  '(11) 77777-9012',
  'carlos.mendes@email.com',
  'Rua Augusta',
  '500',
  NULL,
  'Consolação',
  'São Paulo',
  'SP',
  '01305-000',
  'Médico',
  'casado',
  'ativo',
  'Ortopedista, especialista em coluna',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Dra. Ana Paula Rodrigues',
  '789.123.456-04',
  '78.912.345-6',
  '1978-03-18',
  '(11) 66666-3456',
  'ana.rodrigues@email.com',
  'Alameda Santos',
  '800',
  'Sala 10',
  'Paraíso',
  'São Paulo',
  'SP',
  '01418-000',
  'Médica',
  'divorciada',
  'ativo',
  'Pediatra, atende em hospital e consultório',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Dr. Roberto Lima Ferreira',
  '321.654.987-05',
  '32.165.498-7',
  '1970-11-25',
  '(11) 55555-7890',
  'roberto.ferreira@email.com',
  'Rua Haddock Lobo',
  '300',
  'Apto 78',
  'Cerqueira César',
  'São Paulo',
  'SP',
  '01414-001',
  'Médico',
  'casado',
  'ativo',
  'Neurologista, cliente premium',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Dra. Fernanda Santos Almeida',
  '654.987.321-06',
  '65.498.732-1',
  '1985-07-08',
  '(11) 44444-2468',
  'fernanda.almeida@email.com',
  'Rua Oscar Freire',
  '1200',
  'Conjunto 5',
  'Jardins',
  'São Paulo',
  'SP',
  '01426-001',
  'Médica',
  'solteira',
  'ativo',
  'Dermatologista, especialista em estética',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Dr. Paulo Henrique Souza',
  '147.258.369-07',
  '14.725.836-9',
  '1983-09-14',
  '(11) 33333-1357',
  'paulo.souza@email.com',
  'Avenida Brigadeiro Luís Antônio',
  '2000',
  'Sala 45',
  'Bela Vista',
  'São Paulo',
  'SP',
  '01318-001',
  'Médico',
  'casado',
  'prospecto',
  'Urologista, interessado em nossos serviços',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Dra. Juliana Pereira Gomes',
  '258.369.147-08',
  '25.836.914-7',
  '1979-01-30',
  '(11) 22222-4680',
  'juliana.gomes@email.com',
  'Rua Pamplona',
  '600',
  'Andar 3',
  'Jardim Paulista',
  'São Paulo',
  'SP',
  '01405-000',
  'Médica',
  'casada',
  'ativo',
  'Oftalmologista, cliente há 3 anos',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Dr. Marcos Antônio Silva',
  '369.147.258-09',
  '36.914.725-8',
  '1968-06-12',
  '(11) 11111-9753',
  'marcos.silva@email.com',
  'Rua da Consolação',
  '1500',
  'Conjunto 20',
  'Consolação',
  'São Paulo',
  'SP',
  '01302-000',
  'Médico',
  'viúvo',
  'inativo',
  'Psiquiatra, cliente inativo desde 2023',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Dra. Beatriz Costa Martins',
  '741.852.963-10',
  '74.185.296-3',
  '1981-04-05',
  '(11) 99999-8642',
  'beatriz.martins@email.com',
  'Alameda Campinas',
  '900',
  'Sala 15',
  'Jardim Paulista',
  'São Paulo',
  'SP',
  '01404-001',
  'Médica',
  'casada',
  'ativo',
  'Endocrinologista, especialista em diabetes',
  (SELECT id FROM auth.users LIMIT 1)
);

-- =====================================================
-- 2. INSERÇÃO DE CLIENTES PESSOA JURÍDICA
-- =====================================================

INSERT INTO clientes_pj (
  razao_social,
  nome_fantasia,
  cnpj,
  inscricao_estadual,
  telefone,
  email,
  endereco,
  numero,
  complemento,
  bairro,
  cidade,
  estado,
  cep,
  atividade_principal,
  regime_tributario,
  responsavel_nome,
  responsavel_cpf,
  responsavel_cargo,
  status,
  observacoes,
  criado_por
) VALUES 
(
  'Clínica Médica Santos Ltda',
  'Clínica Santos',
  '12.345.678/0001-90',
  '123.456.789.123',
  '(11) 3333-1234',
  'contato@clinicasantos.com.br',
  'Avenida Paulista',
  '1500',
  'Conjunto 101',
  'Bela Vista',
  'São Paulo',
  'SP',
  '01310-100',
  'Atividades de atendimento hospitalar',
  'Lucro Presumido',
  'Dr. Ricardo Santos',
  '123.456.789-01',
  'Diretor Médico',
  'ativo',
  'Clínica com 5 médicos especialistas',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Hospital Regional S.A.',
  'Hospital Regional',
  '23.456.789/0001-01',
  '234.567.890.234',
  '(11) 2222-5678',
  'financeiro@hospitalregional.com.br',
  'Rua da Consolação',
  '2000',
  NULL,
  'Consolação',
  'São Paulo',
  'SP',
  '01302-000',
  'Atividades de atendimento hospitalar',
  'Lucro Real',
  'Maria Silva Oliveira',
  '987.654.321-02',
  'Diretora Financeira',
  'ativo',
  'Hospital de grande porte, 200 leitos',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Consultório Dr. Lima Ltda',
  'Consultório Dr. Lima',
  '34.567.890/0001-12',
  '345.678.901.345',
  '(11) 4444-9012',
  'secretaria@drlima.com.br',
  'Rua Augusta',
  '800',
  'Sala 45',
  'Consolação',
  'São Paulo',
  'SP',
  '01305-000',
  'Atividades de atendimento ambulatorial',
  'Simples Nacional',
  'Dr. Carlos Lima',
  '456.789.123-03',
  'Sócio Proprietário',
  'ativo',
  'Consultório de ortopedia',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Centro Médico Jardins Ltda',
  'Centro Médico Jardins',
  '45.678.901/0001-23',
  '456.789.012.456',
  '(11) 5555-3456',
  'administracao@centrojardins.com.br',
  'Rua Oscar Freire',
  '1200',
  'Andares 3 e 4',
  'Jardins',
  'São Paulo',
  'SP',
  '01426-001',
  'Atividades de atendimento ambulatorial',
  'Lucro Presumido',
  'Ana Paula Rodrigues',
  '789.123.456-04',
  'Administradora',
  'ativo',
  'Centro médico com múltiplas especialidades',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Clínica Bem Estar Ltda',
  'Clínica Bem Estar',
  '56.789.012/0001-34',
  '567.890.123.567',
  '(11) 6666-7890',
  'contato@clinicabemestar.com.br',
  'Alameda Santos',
  '500',
  'Conjunto 12',
  'Paraíso',
  'São Paulo',
  'SP',
  '01418-000',
  'Atividades de atendimento ambulatorial',
  'Simples Nacional',
  'Dra. Fernanda Almeida',
  '654.987.321-06',
  'Diretora Clínica',
  'ativo',
  'Clínica de estética e dermatologia',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Instituto Neurológico SP Ltda',
  'Instituto Neurológico',
  '67.890.123/0001-45',
  '678.901.234.678',
  '(11) 7777-2468',
  'instituto@neurologicosp.com.br',
  'Rua Haddock Lobo',
  '600',
  'Andar 8',
  'Cerqueira César',
  'São Paulo',
  'SP',
  '01414-001',
  'Atividades de atendimento ambulatorial',
  'Lucro Presumido',
  'Dr. Roberto Ferreira',
  '321.654.987-05',
  'Diretor Técnico',
  'ativo',
  'Instituto especializado em neurologia',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Clínica Oftalmológica Visão Ltda',
  'Clínica Visão',
  '78.901.234/0001-56',
  '789.012.345.789',
  '(11) 8888-1357',
  'atendimento@clinicavisao.com.br',
  'Avenida Brigadeiro Luís Antônio',
  '1800',
  'Sala 120',
  'Bela Vista',
  'São Paulo',
  'SP',
  '01318-001',
  'Atividades de atendimento ambulatorial',
  'Simples Nacional',
  'Dra. Juliana Gomes',
  '258.369.147-08',
  'Sócia Proprietária',
  'prospecto',
  'Clínica interessada em nossos serviços',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Centro de Endocrinologia Avançada Ltda',
  'Centro Endocrino',
  '89.012.345/0001-67',
  '890.123.456.890',
  '(11) 9999-4680',
  'centro@endocrinoavancado.com.br',
  'Rua Pamplona',
  '900',
  'Conjunto 15',
  'Jardim Paulista',
  'São Paulo',
  'SP',
  '01405-000',
  'Atividades de atendimento ambulatorial',
  'Lucro Presumido',
  'Dra. Beatriz Martins',
  '741.852.963-10',
  'Diretora Médica',
  'ativo',
  'Centro especializado em endocrinologia e diabetes',
  (SELECT id FROM auth.users LIMIT 1)
);

-- =====================================================
-- 3. INSERÇÃO DE LEADS
-- =====================================================

INSERT INTO leads (
  nome,
  telefone,
  email,
  empresa,
  cargo,
  cidade,
  estado,
  produtos_interesse,
  origem,
  origem_detalhes,
  observacoes,
  status,
  responsavel,
  data_contato,
  proxima_acao,
  data_proxima_acao,
  criado_por
) VALUES 
(
  'Dr. Alexandre Pereira',
  '(11) 99999-1111',
  'alexandre.pereira@clinicanova.com.br',
  'Clínica Nova Esperança',
  'Diretor Médico',
  'São Paulo',
  'SP',
  ARRAY['Contabilidade Médica', 'Consultoria Tributária'],
  'site',
  'Formulário de contato no site',
  'Interessado em serviços completos de contabilidade',
  'novo',
  'João Silva',
  '2024-01-15',
  'Ligar para apresentar serviços',
  '2024-01-17',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Dra. Camila Rodrigues',
  '(11) 88888-2222',
  'camila.rodrigues@email.com',
  'Consultório Próprio',
  'Médica Dermatologista',
  'São Paulo',
  'SP',
  ARRAY['Declaração IRPF', 'Planejamento Tributário'],
  'indicacao',
  'Indicação da Dra. Maria Costa',
  'Precisa regularizar situação fiscal',
  'qualificado',
  'Maria Santos',
  '2024-01-10',
  'Enviar proposta comercial',
  '2024-01-16',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Dr. Ricardo Mendes',
  '(11) 77777-3333',
  'ricardo.mendes@hospitalcentral.com.br',
  'Hospital Central',
  'Coordenador Médico',
  'São Paulo',
  'SP',
  ARRAY['Contabilidade Médica', 'Auditoria Fiscal'],
  'linkedin',
  'Contato via LinkedIn',
  'Hospital interessado em auditoria completa',
  'em_negociacao',
  'Carlos Lima',
  '2024-01-08',
  'Reunião para apresentação',
  '2024-01-18',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Dra. Patricia Silva',
  '(11) 66666-4444',
  'patricia.silva@clinicavida.com.br',
  'Clínica Vida Saudável',
  'Sócia Proprietária',
  'São Paulo',
  'SP',
  ARRAY['Consultoria Tributária', 'Planejamento Sucessório'],
  'google_ads',
  'Clique em anúncio Google Ads',
  'Clínica em expansão, precisa de planejamento',
  'proposta_enviada',
  'Ana Oliveira',
  '2024-01-12',
  'Follow-up da proposta',
  '2024-01-19',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Dr. Fernando Costa',
  '(11) 55555-5555',
  'fernando.costa@email.com',
  'Consultório Dr. Costa',
  'Médico Ortopedista',
  'São Paulo',
  'SP',
  ARRAY['Declaração IRPF'],
  'site',
  'Download de material sobre IRPF',
  'Médico autônomo, primeira declaração',
  'fechado',
  'Roberto Ferreira',
  '2024-01-05',
  'Iniciar processo de declaração',
  '2024-01-20',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Dra. Luciana Alves',
  '(11) 44444-6666',
  'luciana.alves@centromedico.com.br',
  'Centro Médico Alves',
  'Diretora Administrativa',
  'São Paulo',
  'SP',
  ARRAY['Contabilidade Médica', 'Gestão Financeira'],
  'evento',
  'Congresso de Administração Hospitalar',
  'Centro médico com 15 profissionais',
  'perdido',
  'Fernanda Santos',
  '2024-01-03',
  'Arquivar lead',
  NULL,
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Dr. Gustavo Oliveira',
  '(11) 33333-7777',
  'gustavo.oliveira@email.com',
  'Clínica Oliveira & Associados',
  'Sócio Fundador',
  'São Paulo',
  'SP',
  ARRAY['Auditoria Fiscal', 'Consultoria Tributária'],
  'indicacao',
  'Indicação do Dr. João Santos',
  'Clínica com problemas fiscais para resolver',
  'em_atendimento',
  'Paulo Souza',
  '2024-01-14',
  'Continuar auditoria',
  '2024-01-21',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Dra. Mariana Ferreira',
  '(11) 22222-8888',
  'mariana.ferreira@hospitalsaude.com.br',
  'Hospital Saúde Total',
  'Gerente Financeira',
  'São Paulo',
  'SP',
  ARRAY['Gestão Financeira', 'Planejamento Tributário'],
  'telefone',
  'Ligação direta para empresa',
  'Hospital interessado em otimização fiscal',
  'qualificado',
  'Juliana Gomes',
  '2024-01-11',
  'Agendar visita técnica',
  '2024-01-22',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Dr. Eduardo Santos',
  '(11) 11111-9999',
  'eduardo.santos@email.com',
  'Consultório Próprio',
  'Médico Cardiologista',
  'São Paulo',
  'SP',
  ARRAY['Declaração IRPF', 'Planejamento Previdenciário'],
  'site',
  'Cadastro para newsletter',
  'Médico próximo da aposentadoria',
  'novo',
  'Beatriz Martins',
  '2024-01-16',
  'Contato inicial',
  '2024-01-23',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Dra. Renata Lima',
  '(11) 99999-0000',
  'renata.lima@clinicaespecializada.com.br',
  'Clínica Especializada Lima',
  'Médica Ginecologista',
  'São Paulo',
  'SP',
  ARRAY['Contabilidade Médica'],
  'facebook',
  'Mensagem via Facebook',
  'Clínica nova, precisa estruturar contabilidade',
  'em_negociacao',
  'Marcos Silva',
  '2024-01-13',
  'Elaborar proposta detalhada',
  '2024-01-24',
  (SELECT id FROM auth.users LIMIT 1)
);

-- =====================================================
-- 4. INSERÇÃO DE DECLARAÇÕES IRPF
-- =====================================================

INSERT INTO declaracoes_irpf (
  cliente_id,
  ano_exercicio,
  ano_calendario,
  tipo_declaracao,
  status,
  data_entrega,
  numero_recibo,
  valor_devido,
  valor_restituicao,
  observacoes,
  criado_por
) VALUES 
-- Declarações para o primeiro cliente (Dr. João Silva Santos)
(
  (SELECT id FROM clientes_pf WHERE cpf = '123.456.789-01' LIMIT 1),
  2024,
  2023,
  'completa',
  'entregue',
  '2024-04-15',
  '2024051512345678901234567890123456789',
  0.00,
  2500.75,
  'Declaração entregue dentro do prazo, restituição já recebida',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  (SELECT id FROM clientes_pf WHERE cpf = '123.456.789-01' LIMIT 1),
  2023,
  2022,
  'completa',
  'entregue',
  '2023-04-20',
  '2023042012345678901234567890123456789',
  1200.50,
  0.00,
  'Imposto pago via DARF',
  (SELECT id FROM auth.users LIMIT 1)
),

-- Declarações para a segunda cliente (Dra. Maria Oliveira Costa)
(
  (SELECT id FROM clientes_pf WHERE cpf = '987.654.321-02' LIMIT 1),
  2024,
  2023,
  'completa',
  'entregue',
  '2024-03-30',
  '2024033098765432109876543210987654321',
  0.00,
  3200.80,
  'Restituição alta devido a gastos médicos',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  (SELECT id FROM clientes_pf WHERE cpf = '987.654.321-02' LIMIT 1),
  2023,
  2022,
  'completa',
  'entregue',
  '2023-04-10',
  '2023041098765432109876543210987654321',
  0.00,
  1800.25,
  'Declaração sem pendências',
  (SELECT id FROM auth.users LIMIT 1)
),

-- Declarações para o terceiro cliente (Dr. Carlos Eduardo Mendes)
(
  (SELECT id FROM clientes_pf WHERE cpf = '456.789.123-03' LIMIT 1),
  2024,
  2023,
  'completa',
  'em_andamento',
  NULL,
  NULL,
  0.00,
  0.00,
  'Declaração em preparação, aguardando documentos complementares',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  (SELECT id FROM clientes_pf WHERE cpf = '456.789.123-03' LIMIT 1),
  2023,
  2022,
  'completa',
  'entregue',
  '2023-04-28',
  '2023042845678912345678912345678912345',
  2800.90,
  0.00,
  'Imposto alto devido a rendimentos de aplicações',
  (SELECT id FROM auth.users LIMIT 1)
),

-- Declarações para a quarta cliente (Dra. Ana Paula Rodrigues)
(
  (SELECT id FROM clientes_pf WHERE cpf = '789.123.456-04' LIMIT 1),
  2024,
  2023,
  'completa',
  'entregue',
  '2024-04-05',
  '2024040578912345678912345678912345678',
  0.00,
  4100.60,
  'Restituição alta, declaração sem problemas',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  (SELECT id FROM clientes_pf WHERE cpf = '789.123.456-04' LIMIT 1),
  2023,
  2022,
  'simplificada',
  'entregue',
  '2023-03-15',
  '2023031578912345678912345678912345678',
  0.00,
  950.30,
  'Optou pela declaração simplificada',
  (SELECT id FROM auth.users LIMIT 1)
),

-- Declarações para o quinto cliente (Dr. Roberto Lima Ferreira)
(
  (SELECT id FROM clientes_pf WHERE cpf = '321.654.987-05' LIMIT 1),
  2024,
  2023,
  'completa',
  'entregue',
  '2024-04-25',
  '2024042532165498732165498732165498732',
  1500.40,
  0.00,
  'Cliente VIP, declaração complexa com múltiplas fontes de renda',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  (SELECT id FROM clientes_pf WHERE cpf = '321.654.987-05' LIMIT 1),
  2023,
  2022,
  'completa',
  'entregue',
  '2023-04-30',
  '2023043032165498732165498732165498732',
  3200.75,
  0.00,
  'Declaração entregue no último dia',
  (SELECT id FROM auth.users LIMIT 1)
),

-- Declarações para a sexta cliente (Dra. Fernanda Santos Almeida)
(
  (SELECT id FROM clientes_pf WHERE cpf = '654.987.321-06' LIMIT 1),
  2024,
  2023,
  'completa',
  'entregue',
  '2024-03-20',
  '2024032065498732165498732165498732165',
  0.00,
  2200.15,
  'Declaração entregue antecipadamente',
  (SELECT id FROM auth.users LIMIT 1)
),

-- Declarações para o sétimo cliente (Dr. Paulo Henrique Souza)
(
  (SELECT id FROM clientes_pf WHERE cpf = '147.258.369-07' LIMIT 1),
  2024,
  2023,
  'completa',
  'rascunho',
  NULL,
  NULL,
  0.00,
  0.00,
  'Cliente novo, primeira declaração conosco ainda em rascunho',
  (SELECT id FROM auth.users LIMIT 1)
),

-- Declarações para a oitava cliente (Dra. Juliana Pereira Gomes)
(
  (SELECT id FROM clientes_pf WHERE cpf = '258.369.147-08' LIMIT 1),
  2024,
  2023,
  'completa',
  'entregue',
  '2024-04-12',
  '2024041225836914725836914725836914725',
  0.00,
  1650.45,
  'Oftalmologista com equipamentos para dedução',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  (SELECT id FROM clientes_pf WHERE cpf = '258.369.147-08' LIMIT 1),
  2023,
  2022,
  'completa',
  'entregue',
  '2023-04-18',
  '2023041825836914725836914725836914725',
  800.20,
  0.00,
  'Pequeno imposto devido',
  (SELECT id FROM auth.users LIMIT 1)
),

-- Declarações para o nono cliente (Dr. Marcos Antônio Silva) - Cliente inativo
(
  (SELECT id FROM clientes_pf WHERE cpf = '369.147.258-09' LIMIT 1),
  2023,
  2022,
  'completa',
  'entregue',
  '2023-04-22',
  '2023042236914725836914725836914725836',
  0.00,
  1100.80,
  'Última declaração antes de ficar inativo',
  (SELECT id FROM auth.users LIMIT 1)
),

-- Declarações para a décima cliente (Dra. Beatriz Costa Martins)
(
  (SELECT id FROM clientes_pf WHERE cpf = '741.852.963-10' LIMIT 1),
  2024,
  2023,
  'completa',
  'entregue',
  '2024-04-08',
  '2024040874185296374185296374185296374',
  0.00,
  2800.90,
  'Endocrinologista com boa restituição',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  (SELECT id FROM clientes_pf WHERE cpf = '741.852.963-10' LIMIT 1),
  2023,
  2022,
  'simplificada',
  'entregue',
  '2023-03-25',
  '2023032574185296374185296374185296374',
  0.00,
  1200.35,
  'Optou pela simplificada em 2023',
  (SELECT id FROM auth.users LIMIT 1)
);

-- =====================================================
-- 5. INSERÇÃO DE SERVIÇOS ESPECIAIS
-- =====================================================

INSERT INTO servicos_especiais (
  cliente_id,
  tipo_cliente,
  tipo_servico,
  descricao,
  valor,
  status,
  data_inicio,
  data_conclusao,
  responsavel,
  detalhes,
  observacoes,
  criado_por
) VALUES 
-- Serviços para clientes PF
(
  (SELECT id FROM clientes_pf WHERE cpf = '123.456.789-01' LIMIT 1),
  'pf',
  'consultoria_tributaria',
  'Consultoria para otimização de impostos sobre rendimentos médicos',
  2500.00,
  'concluido',
  '2024-01-10',
  '2024-02-15',
  'Carlos Lima',
  '{"estrategias": ["pessoa_juridica", "previdencia_privada"], "economia_estimada": 15000.00}',
  'Cliente implementou PJ conforme orientação',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  (SELECT id FROM clientes_pf WHERE cpf = '987.654.321-02' LIMIT 1),
  'pf',
  'planejamento_sucessorio',
  'Planejamento sucessório para patrimônio médico',
  3500.00,
  'em_andamento',
  '2024-01-20',
  NULL,
  'Ana Oliveira',
  '{"patrimonio_total": 2500000.00, "herdeiros": 3, "instrumentos": ["holding", "previdencia"]}',
  'Estruturação de holding familiar em andamento',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  (SELECT id FROM clientes_pf WHERE cpf = '456.789.123-03' LIMIT 1),
  'pf',
  'auditoria_fiscal',
  'Auditoria preventiva dos últimos 5 anos',
  1800.00,
  'concluido',
  '2023-11-15',
  '2023-12-20',
  'Roberto Ferreira',
  '{"anos_auditados": [2018, 2019, 2020, 2021, 2022], "irregularidades": 0}',
  'Situação fiscal regularizada',
  (SELECT id FROM auth.users LIMIT 1)
),

-- Serviços para clientes PJ
(
  (SELECT id FROM clientes_pj WHERE cnpj = '12.345.678/0001-90' LIMIT 1),
  'pj',
  'gestao_financeira',
  'Implementação de sistema de gestão financeira completo',
  8500.00,
  'em_andamento',
  '2024-01-05',
  NULL,
  'Fernanda Santos',
  '{"modulos": ["fluxo_caixa", "contas_pagar", "contas_receber", "conciliacao"], "sistema": "ERP_Medico"}',
  'Primeira fase concluída, implementando módulo de conciliação',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  (SELECT id FROM clientes_pj WHERE cnpj = '23.456.789/0001-01' LIMIT 1),
  'pj',
  'consultoria_tributaria',
  'Revisão de regime tributário e otimização fiscal',
  12000.00,
  'concluido',
  '2023-10-01',
  '2023-12-15',
  'Paulo Souza',
  '{"regime_anterior": "lucro_real", "regime_novo": "lucro_presumido", "economia_anual": 180000.00}',
  'Mudança de regime resultou em economia significativa',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  (SELECT id FROM clientes_pj WHERE cnpj = '34.567.890/0001-12' LIMIT 1),
  'pj',
  'auditoria_fiscal',
  'Auditoria completa para preparação de venda',
  5500.00,
  'concluido',
  '2023-09-01',
  '2023-11-30',
  'Juliana Gomes',
  '{"finalidade": "due_diligence", "areas_auditadas": ["fiscal", "trabalhista", "previdenciaria"], "pendencias": 2}',
  'Auditoria para venda do consultório, pequenas pendências resolvidas',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  (SELECT id FROM clientes_pj WHERE cnpj = '45.678.901/0001-23' LIMIT 1),
  'pj',
  'planejamento_sucessorio',
  'Estruturação de holding para centro médico',
  15000.00,
  'em_andamento',
  '2024-02-01',
  NULL,
  'Beatriz Martins',
  '{"socios": 4, "patrimonio": 5000000.00, "estrutura": "holding_pura", "beneficios_fiscais": true}',
  'Holding em constituição, aguardando documentação dos sócios',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  (SELECT id FROM clientes_pj WHERE cnpj = '56.789.012/0001-34' LIMIT 1),
  'pj',
  'gestao_financeira',
  'Reestruturação financeira pós-pandemia',
  4200.00,
  'concluido',
  '2023-08-15',
  '2023-10-30',
  'Marcos Silva',
  '{"dividas_renegociadas": 350000.00, "reducao_custos": 25, "melhoria_fluxo": true}',
  'Clínica recuperou estabilidade financeira',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  (SELECT id FROM clientes_pj WHERE cnpj = '67.890.123/0001-45' LIMIT 1),
  'pj',
  'consultoria_tributaria',
  'Consultoria para expansão e abertura de filial',
  6800.00,
  'em_andamento',
  '2024-01-15',
  NULL,
  'João Silva',
  '{"nova_filial": "Campinas", "regime_tributario": "lucro_presumido", "projecao_economia": 95000.00}',
  'Planejamento tributário para expansão em andamento',
  (SELECT id FROM auth.users LIMIT 1)
);

-- =====================================================
-- 6. INSERÇÃO DE PIPELINES
-- =====================================================

INSERT INTO pipelines (
  tipo,
  lead_id,
  cliente_id,
  nome_cliente,
  email_cliente,
  telefone_cliente,
  servicos_interesse,
  estagio,
  proposta_comercial,
  proxima_acao,
  data_proxima_acao,
  responsavel,
  historico,
  status,
  motivo_perdido,
  observacoes,
  criado_por
) VALUES 
-- Pipeline baseado em lead
(
  'lead',
  (SELECT id FROM leads WHERE email = 'alexandre.pereira@clinicanova.com.br' LIMIT 1),
  NULL,
  'Dr. Alexandre Pereira',
  'alexandre.pereira@clinicanova.com.br',
  '(11) 99999-1111',
  '["Contabilidade Médica", "Consultoria Tributária"]',
  'qualificacao',
  '{"valor_proposto": 2500.00, "prazo_implementacao": "30 dias", "desconto": 10}',
  'Enviar proposta detalhada',
  '2024-01-18',
  'João Silva',
  '[{"data": "2024-01-15", "acao": "Primeiro contato", "responsavel": "João Silva", "observacao": "Cliente interessado em serviços completos"}]',
  'ativo',
  NULL,
  'Lead qualificado, alta probabilidade de fechamento',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'lead',
  (SELECT id FROM leads WHERE email = 'camila.rodrigues@email.com' LIMIT 1),
  NULL,
  'Dra. Camila Rodrigues',
  'camila.rodrigues@email.com',
  '(11) 88888-2222',
  '["Declaração IRPF", "Planejamento Tributário"]',
  'proposta',
  '{"valor_proposto": 1200.00, "prazo_implementacao": "15 dias", "desconto": 0}',
  'Follow-up da proposta enviada',
  '2024-01-19',
  'Maria Santos',
  '[{"data": "2024-01-10", "acao": "Contato inicial", "responsavel": "Maria Santos", "observacao": "Indicação da Dra. Maria Costa"}, {"data": "2024-01-16", "acao": "Proposta enviada", "responsavel": "Maria Santos", "observacao": "Proposta para IRPF e planejamento"}]',
  'ativo',
  NULL,
  'Proposta enviada, aguardando retorno',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'lead',
  (SELECT id FROM leads WHERE email = 'ricardo.mendes@hospitalcentral.com.br' LIMIT 1),
  NULL,
  'Dr. Ricardo Mendes',
  'ricardo.mendes@hospitalcentral.com.br',
  '(11) 77777-3333',
  '["Contabilidade Médica", "Auditoria Fiscal"]',
  'negociacao',
  '{"valor_proposto": 15000.00, "prazo_implementacao": "60 dias", "desconto": 15}',
  'Reunião para ajustes finais',
  '2024-01-20',
  'Carlos Lima',
  '[{"data": "2024-01-08", "acao": "Primeiro contato", "responsavel": "Carlos Lima", "observacao": "Hospital interessado em auditoria"}, {"data": "2024-01-12", "acao": "Apresentação técnica", "responsavel": "Carlos Lima", "observacao": "Apresentação bem recebida"}, {"data": "2024-01-18", "acao": "Negociação de valores", "responsavel": "Carlos Lima", "observacao": "Solicitaram desconto"}]',
  'ativo',
  NULL,
  'Em fase final de negociação',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'lead',
  (SELECT id FROM leads WHERE email = 'fernando.costa@email.com' LIMIT 1),
  NULL,
  'Dr. Fernando Costa',
  'fernando.costa@email.com',
  '(11) 55555-5555',
  '["Declaração IRPF"]',
  'fechamento',
  '{"valor_proposto": 800.00, "prazo_implementacao": "10 dias", "desconto": 0}',
  'Assinatura de contrato',
  '2024-01-21',
  'Roberto Ferreira',
  '[{"data": "2024-01-05", "acao": "Primeiro contato", "responsavel": "Roberto Ferreira", "observacao": "Médico autônomo"}, {"data": "2024-01-15", "acao": "Proposta aceita", "responsavel": "Roberto Ferreira", "observacao": "Cliente aprovou proposta"}]',
  'ativo',
  NULL,
  'Pronto para fechamento',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'lead',
  (SELECT id FROM leads WHERE email = 'luciana.alves@centromedico.com.br' LIMIT 1),
  NULL,
  'Dra. Luciana Alves',
  'luciana.alves@centromedico.com.br',
  '(11) 44444-6666',
  '["Contabilidade Médica", "Gestão Financeira"]',
  'qualificacao',
  NULL,
  'Arquivar lead',
  NULL,
  'Fernanda Santos',
  '[{"data": "2024-01-03", "acao": "Primeiro contato", "responsavel": "Fernanda Santos", "observacao": "Contato em evento"}, {"data": "2024-01-10", "acao": "Follow-up", "responsavel": "Fernanda Santos", "observacao": "Cliente não demonstrou interesse"}]',
  'perdido',
  'Optou por concorrente',
  'Lead perdido para concorrência',
  (SELECT id FROM auth.users LIMIT 1)
),

-- Pipeline baseado em cliente existente
(
  'cliente',
  NULL,
  (SELECT id FROM clientes_pf WHERE cpf = '123.456.789-01' LIMIT 1),
  'Dr. João Silva Santos',
  'joao.santos@email.com',
  '(11) 99999-1234',
  '["Planejamento Sucessório"]',
  'proposta',
  '{"valor_proposto": 5000.00, "prazo_implementacao": "45 dias", "desconto": 5}',
  'Apresentar proposta de holding',
  '2024-01-22',
  'Ana Oliveira',
  '[{"data": "2024-01-12", "acao": "Cliente solicitou planejamento", "responsavel": "Ana Oliveira", "observacao": "Interesse em estruturação patrimonial"}]',
  'ativo',
  NULL,
  'Cliente VIP interessado em planejamento sucessório',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'cliente',
  NULL,
  (SELECT id FROM clientes_pj WHERE cnpj = '12.345.678/0001-90' LIMIT 1),
  'Clínica Médica Santos Ltda',
  'contato@clinicasantos.com.br',
  '(11) 3333-1234',
  '["Auditoria Fiscal"]',
  'negociacao',
  '{"valor_proposto": 8000.00, "prazo_implementacao": "30 dias", "desconto": 10}',
  'Definir escopo da auditoria',
  '2024-01-23',
  'Paulo Souza',
  '[{"data": "2024-01-08", "acao": "Solicitação de auditoria", "responsavel": "Paulo Souza", "observacao": "Preparação para expansão"}, {"data": "2024-01-15", "acao": "Reunião técnica", "responsavel": "Paulo Souza", "observacao": "Definindo escopo"}]',
  'ativo',
  NULL,
  'Auditoria para preparação de expansão',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'cliente',
  NULL,
  (SELECT id FROM clientes_pf WHERE cpf = '987.654.321-02' LIMIT 1),
  'Dra. Maria Oliveira Costa',
  'maria.costa@email.com',
  '(11) 88888-5678',
  '["Consultoria Tributária"]',
  'fechamento',
  '{"valor_proposto": 3000.00, "prazo_implementacao": "20 dias", "desconto": 0}',
  'Assinatura de contrato',
  '2024-01-24',
  'Juliana Gomes',
  '[{"data": "2024-01-10", "acao": "Solicitação de consultoria", "responsavel": "Juliana Gomes", "observacao": "Otimização de impostos"}, {"data": "2024-01-18", "acao": "Proposta aprovada", "responsavel": "Juliana Gomes", "observacao": "Cliente aprovou proposta"}]',
  'ativo',
  NULL,
  'Pronto para assinatura',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'lead',
  (SELECT id FROM leads WHERE email = 'gustavo.oliveira@email.com' LIMIT 1),
  NULL,
  'Dr. Gustavo Oliveira',
  'gustavo.oliveira@email.com',
  '(11) 33333-7777',
  '["Auditoria Fiscal", "Consultoria Tributária"]',
  'atendimento',
  '{"valor_proposto": 12000.00, "prazo_implementacao": "90 dias", "desconto": 0}',
  'Continuar auditoria em andamento',
  '2024-01-25',
  'Beatriz Martins',
  '[{"data": "2024-01-14", "acao": "Início da auditoria", "responsavel": "Beatriz Martins", "observacao": "Auditoria fiscal iniciada"}, {"data": "2024-01-20", "acao": "Primeira fase concluída", "responsavel": "Beatriz Martins", "observacao": "Identificadas irregularidades"}]',
  'ativo',
  NULL,
  'Auditoria em andamento, irregularidades sendo corrigidas',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'lead',
  (SELECT id FROM leads WHERE email = 'mariana.ferreira@hospitalsaude.com.br' LIMIT 1),
  NULL,
  'Dra. Mariana Ferreira',
  'mariana.ferreira@hospitalsaude.com.br',
  '(11) 22222-8888',
  '["Gestão Financeira", "Planejamento Tributário"]',
  'qualificacao',
  '{"valor_proposto": 18000.00, "prazo_implementacao": "120 dias", "desconto": 12}',
  'Visita técnica ao hospital',
  '2024-01-26',
  'Marcos Silva',
  '[{"data": "2024-01-11", "acao": "Primeiro contato", "responsavel": "Marcos Silva", "observacao": "Hospital interessado em otimização"}, {"data": "2024-01-17", "acao": "Reunião inicial", "responsavel": "Marcos Silva", "observacao": "Apresentação dos serviços"}]',
  'ativo',
  NULL,
  'Hospital de grande porte, oportunidade significativa',
  (SELECT id FROM auth.users LIMIT 1)
);

-- =====================================================
-- VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar contagem de registros inseridos
SELECT 
  'clientes_pf' as tabela, 
  COUNT(*) as total_registros 
FROM clientes_pf
UNION ALL
SELECT 
  'clientes_pj' as tabela, 
  COUNT(*) as total_registros 
FROM clientes_pj
UNION ALL
SELECT 
  'leads' as tabela, 
  COUNT(*) as total_registros 
FROM leads
UNION ALL
SELECT 
  'declaracoes_irpf' as tabela, 
  COUNT(*) as total_registros 
FROM declaracoes_irpf
UNION ALL
SELECT 
  'servicos_especiais' as tabela, 
  COUNT(*) as total_registros 
FROM servicos_especiais
UNION ALL
SELECT 
  'pipelines' as tabela, 
  COUNT(*) as total_registros 
FROM pipelines;

-- Verificar integridade dos relacionamentos
SELECT 
  'Declarações IRPF sem cliente' as verificacao,
  COUNT(*) as problemas
FROM declaracoes_irpf d
LEFT JOIN clientes_pf c ON d.cliente_id = c.id
WHERE c.id IS NULL
UNION ALL
SELECT 
  'Serviços especiais PF sem cliente' as verificacao,
  COUNT(*) as problemas
FROM servicos_especiais s
LEFT JOIN clientes_pf c ON s.cliente_id = c.id
WHERE s.tipo_cliente = 'pf' AND c.id IS NULL
UNION ALL
SELECT 
  'Serviços especiais PJ sem cliente' as verificacao,
  COUNT(*) as problemas
FROM servicos_especiais s
LEFT JOIN clientes_pj c ON s.cliente_id = c.id
WHERE s.tipo_cliente = 'pj' AND c.id IS NULL
UNION ALL
SELECT 
  'Pipelines de lead sem lead' as verificacao,
  COUNT(*) as problemas
FROM pipelines p
LEFT JOIN leads l ON p.lead_id = l.id
WHERE p.tipo = 'lead' AND l.id IS NULL
UNION ALL
SELECT 
  'Pipelines de cliente PF sem cliente' as verificacao,
  COUNT(*) as problemas
FROM pipelines p
LEFT JOIN clientes_pf c ON p.cliente_id = c.id
WHERE p.tipo = 'cliente' AND p.cliente_id IS NOT NULL AND c.id IS NULL;