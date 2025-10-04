-- Inserção de dados de exemplo para a tabela declaracoes_irpf
-- Execute este script no Supabase SQL Editor

-- Primeiro, vamos obter alguns IDs de clientes PF para usar nas declarações
-- Substitua pelos IDs reais dos clientes do seu sistema

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

-- Verificar os dados inseridos
SELECT 
  d.id,
  c.nome as cliente_nome,
  d.ano_exercicio,
  d.status,
  d.valor_devido,
  d.valor_restituicao,
  d.data_entrega,
  d.created_at
FROM declaracoes_irpf d
JOIN clientes_pf c ON d.cliente_id = c.id
ORDER BY d.ano_exercicio DESC, c.nome;