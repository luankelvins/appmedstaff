-- Inserção de dados de exemplo para a tabela servicos_especiais
-- Execute este script no Supabase SQL Editor

INSERT INTO servicos_especiais (
  tipo_servico,
  cliente_id,
  cliente_nome,
  cliente_email,
  cliente_telefone,
  dados_especificos,
  status,
  responsavel_comercial,
  responsavel_operacional,
  data_inicio,
  previsao_conclusao,
  observacoes
) VALUES 
(
  'auxilio_moradia',
  'CLI-ESP-001',
  'Dr. Roberto Silva',
  'roberto.silva@email.com',
  '(11) 98765-4321',
  '{"valor_auxilio": 2500.00, "periodo_meses": 12, "tipo_moradia": "apartamento", "regiao": "zona_sul", "documentos_pendentes": ["comprovante_residencia", "declaracao_renda"]}'::jsonb,
  'documentacao',
  'Ana Costa',
  'Carlos Mendes',
  '2024-01-15',
  '2024-02-15',
  'Cliente médico especialista, primeira solicitação de auxílio moradia'
),
(
  'recuperacao_tributaria_pj',
  'CLI-ESP-002',
  'Clínica MedCenter Ltda',
  'financeiro@medcenter.com.br',
  '(11) 3456-7890',
  '{"periodo_recuperacao": "2020-2023", "tributos": ["IRPJ", "CSLL", "PIS", "COFINS"], "valor_estimado": 150000.00, "regime_tributario": "lucro_presumido", "documentos_analisados": ["balancetes", "dre", "livro_caixa"]}'::jsonb,
  'analise',
  'Pedro Santos',
  'Maria Oliveira',
  '2024-01-10',
  '2024-04-10',
  'Recuperação tributária para clínica com múltiplas unidades'
),
(
  'restituicao_previdenciaria_pf',
  'CLI-ESP-003',
  'Dra. Fernanda Lima',
  'fernanda.lima@email.com',
  '(11) 99887-6655',
  '{"periodo_contribuicao": "1995-2023", "tipo_beneficio": "aposentadoria_especial", "tempo_especial_anos": 25, "valor_estimado_restituicao": 85000.00, "documentos_necessarios": ["ppp", "ltcat", "ctps", "cnis"]}'::jsonb,
  'execucao',
  'Ana Costa',
  'João Ferreira',
  '2024-01-05',
  '2024-06-05',
  'Médica com direito a aposentadoria especial por insalubridade'
),
(
  'alteracao_pj',
  'CLI-ESP-004',
  'Hospital São Lucas S.A.',
  'juridico@saolucas.com.br',
  '(11) 2345-6789',
  '{"tipo_alteracao": "mudanca_endereco", "novo_endereco": {"logradouro": "Av. Paulista, 1000", "bairro": "Bela Vista", "cidade": "São Paulo", "cep": "01310-100"}, "documentos_alterados": ["contrato_social", "cartao_cnpj"], "junta_comercial": "JUCESP"}'::jsonb,
  'concluido',
  'Pedro Santos',
  'Lucas Silva',
  '2023-12-20',
  '2024-01-20',
  'Alteração de endereço da sede principal do hospital'
),
(
  'auxilio_moradia',
  'CLI-ESP-005',
  'Dr. Marcos Pereira',
  'marcos.pereira@email.com',
  '(11) 97654-3210',
  '{"valor_auxilio": 3000.00, "periodo_meses": 24, "tipo_moradia": "casa", "regiao": "zona_oeste", "documentos_pendentes": ["contrato_locacao"], "observacoes_especiais": "Médico residente em especialização"}'::jsonb,
  'iniciado',
  'Ana Costa',
  NULL,
  '2024-01-20',
  '2024-02-20',
  'Médico residente, segunda solicitação de auxílio moradia'
);

-- Verificar os dados inseridos
SELECT 
  id,
  tipo_servico,
  cliente_nome,
  status,
  responsavel_comercial,
  data_inicio,
  dados_especificos->>'valor_auxilio' as valor_auxilio,
  dados_especificos->>'valor_estimado' as valor_estimado
FROM servicos_especiais 
ORDER BY data_inicio DESC;