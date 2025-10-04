-- Verificação de integridade dos relacionamentos entre tabelas
-- Execute este script no Supabase SQL Editor para validar os dados

-- 1. Verificar relacionamentos entre clientes_pf e declaracoes_irpf
SELECT 
  'clientes_pf -> declaracoes_irpf' as relacionamento,
  COUNT(d.id) as total_declaracoes,
  COUNT(DISTINCT d.cliente_id) as clientes_com_declaracoes,
  COUNT(DISTINCT c.id) as total_clientes_pf
FROM clientes_pf c
LEFT JOIN declaracoes_irpf d ON c.id = d.cliente_id;

-- 2. Verificar relacionamentos entre clientes_pj e servicos_especiais
SELECT 
  'clientes_pj -> servicos_especiais' as relacionamento,
  COUNT(s.id) as total_servicos,
  COUNT(DISTINCT s.cliente_id) as clientes_com_servicos,
  COUNT(DISTINCT c.id) as total_clientes_pj
FROM clientes_pj c
LEFT JOIN servicos_especiais s ON c.id = s.cliente_id;

-- 3. Verificar relacionamentos entre leads e pipelines
SELECT 
  'leads -> pipelines' as relacionamento,
  COUNT(p.id) as total_pipelines,
  COUNT(DISTINCT p.lead_id) as leads_com_pipelines,
  COUNT(DISTINCT l.id) as total_leads
FROM leads l
LEFT JOIN pipelines p ON l.id = p.lead_id;

-- 4. Verificar relacionamentos entre clientes_pj e pipelines
SELECT 
  'clientes_pj -> pipelines' as relacionamento,
  COUNT(p.id) as total_pipelines_clientes,
  COUNT(DISTINCT p.cliente_id) as clientes_em_pipelines,
  COUNT(DISTINCT c.id) as total_clientes_pj
FROM clientes_pj c
LEFT JOIN pipelines p ON c.id = p.cliente_id;

-- 5. Verificar consistência de dados entre pipelines e clientes
SELECT 
  'Inconsistências pipelines -> clientes' as verificacao,
  COUNT(*) as pipelines_inconsistentes
FROM pipelines p
LEFT JOIN clientes_pj c ON p.cliente_id = c.id
WHERE p.cliente_id IS NOT NULL 
  AND c.id IS NULL;

-- 6. Verificar consistência de dados entre pipelines e leads
SELECT 
  'Inconsistências pipelines -> leads' as verificacao,
  COUNT(*) as pipelines_inconsistentes
FROM pipelines p
LEFT JOIN leads l ON p.lead_id = l.id
WHERE p.lead_id IS NOT NULL 
  AND l.id IS NULL;

-- 7. Verificar consistência de nomes/emails entre pipelines e clientes
SELECT 
  'Inconsistências nome/email pipelines vs clientes' as verificacao,
  COUNT(*) as inconsistencias_encontradas
FROM pipelines p
INNER JOIN clientes_pj c ON p.cliente_id = c.id
WHERE p.nome_cliente != c.razao_social 
   OR p.email_cliente != c.email;

-- 8. Verificar consistência de nomes/emails entre pipelines e leads
SELECT 
  'Inconsistências nome/email pipelines vs leads' as verificacao,
  COUNT(*) as inconsistencias_encontradas
FROM pipelines p
INNER JOIN leads l ON p.lead_id = l.id
WHERE p.nome_cliente != l.nome 
   OR p.email_cliente != l.email;

-- 9. Verificar distribuição de status nas tabelas principais
SELECT 'Status leads' as tabela, status, COUNT(*) as quantidade
FROM leads 
GROUP BY status
UNION ALL
SELECT 'Status pipelines' as tabela, status, COUNT(*) as quantidade
FROM pipelines 
GROUP BY status
UNION ALL
SELECT 'Status clientes_pf' as tabela, status, COUNT(*) as quantidade
FROM clientes_pf 
GROUP BY status
UNION ALL
SELECT 'Status clientes_pj' as tabela, status, COUNT(*) as quantidade
FROM clientes_pj 
GROUP BY status
ORDER BY tabela, status;

-- 10. Verificar dados JSONB nas tabelas
SELECT 
  'servicos_especiais JSONB' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN dados_especificos IS NOT NULL THEN 1 END) as com_dados_jsonb,
  COUNT(CASE WHEN dados_especificos = '{}' THEN 1 END) as jsonb_vazio
FROM servicos_especiais
UNION ALL
SELECT 
  'pipelines servicos_interesse' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN servicos_interesse IS NOT NULL THEN 1 END) as com_dados_jsonb,
  COUNT(CASE WHEN servicos_interesse = '{}' THEN 1 END) as jsonb_vazio
FROM pipelines
UNION ALL
SELECT 
  'pipelines proposta_comercial' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN proposta_comercial IS NOT NULL THEN 1 END) as com_dados_jsonb,
  COUNT(CASE WHEN proposta_comercial = '{}' THEN 1 END) as jsonb_vazio
FROM pipelines
UNION ALL
SELECT 
  'pipelines historico' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN historico IS NOT NULL THEN 1 END) as com_dados_jsonb,
  COUNT(CASE WHEN historico = '{}' THEN 1 END) as jsonb_vazio
FROM pipelines;

-- 11. Verificar integridade temporal (created_at vs updated_at)
SELECT 
  'Registros com updated_at < created_at' as verificacao,
  COUNT(*) as problemas_temporais
FROM (
  SELECT created_at, updated_at FROM clientes_pf WHERE updated_at < created_at
  UNION ALL
  SELECT created_at, updated_at FROM clientes_pj WHERE updated_at < created_at
  UNION ALL
  SELECT created_at, updated_at FROM leads WHERE updated_at < created_at
  UNION ALL
  SELECT created_at, updated_at FROM pipelines WHERE updated_at < created_at
  UNION ALL
  SELECT created_at, updated_at FROM servicos_especiais WHERE updated_at < created_at
  UNION ALL
  SELECT created_at, updated_at FROM declaracoes_irpf WHERE updated_at < created_at
) as temporal_check;

-- 12. Resumo geral dos dados inseridos
SELECT 
  'clientes_pf' as tabela,
  COUNT(*) as total_registros,
  MIN(created_at) as primeiro_registro,
  MAX(created_at) as ultimo_registro
FROM clientes_pf
UNION ALL
SELECT 
  'clientes_pj' as tabela,
  COUNT(*) as total_registros,
  MIN(created_at) as primeiro_registro,
  MAX(created_at) as ultimo_registro
FROM clientes_pj
UNION ALL
SELECT 
  'leads' as tabela,
  COUNT(*) as total_registros,
  MIN(created_at) as primeiro_registro,
  MAX(created_at) as ultimo_registro
FROM leads
UNION ALL
SELECT 
  'pipelines' as tabela,
  COUNT(*) as total_registros,
  MIN(created_at) as primeiro_registro,
  MAX(created_at) as ultimo_registro
FROM pipelines
UNION ALL
SELECT 
  'servicos_especiais' as tabela,
  COUNT(*) as total_registros,
  MIN(created_at) as primeiro_registro,
  MAX(created_at) as ultimo_registro
FROM servicos_especiais
UNION ALL
SELECT 
  'declaracoes_irpf' as tabela,
  COUNT(*) as total_registros,
  MIN(created_at) as primeiro_registro,
  MAX(created_at) as ultimo_registro
FROM declaracoes_irpf
ORDER BY tabela;