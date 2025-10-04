-- Testes de consultas complexas e performance
-- Execute este script no Supabase SQL Editor para testar a performance

-- 1. Dashboard principal - métricas gerais (consulta complexa)
WITH dashboard_metrics AS (
  SELECT 
    -- Métricas de leads
    (SELECT COUNT(*) FROM leads WHERE status = 'novo') as leads_novos,
    (SELECT COUNT(*) FROM leads WHERE status IN ('contatado', 'qualificado', 'proposta', 'negociacao')) as leads_em_andamento,
    (SELECT COUNT(*) FROM leads WHERE status = 'ganho') as leads_convertidos,
    (SELECT COUNT(*) FROM leads WHERE status = 'perdido') as leads_perdidos,
    
    -- Métricas de pipelines
    (SELECT COUNT(*) FROM pipelines WHERE estagio = 'prospeccao') as pipelines_prospeccao,
    (SELECT COUNT(*) FROM pipelines WHERE estagio = 'qualificacao') as pipelines_qualificacao,
    (SELECT COUNT(*) FROM pipelines WHERE estagio = 'proposta') as pipelines_proposta,
    (SELECT COUNT(*) FROM pipelines WHERE estagio = 'negociacao') as pipelines_negociacao,
    (SELECT COUNT(*) FROM pipelines WHERE estagio = 'fechamento') as pipelines_fechamento,
    
    -- Métricas de clientes
    (SELECT COUNT(*) FROM clientes_pf WHERE status = 'ativo') as clientes_pf_ativos,
    (SELECT COUNT(*) FROM clientes_pj WHERE status = 'ativo') as clientes_pj_ativos,
    
    -- Métricas de serviços
    (SELECT COUNT(*) FROM servicos_especiais WHERE status = 'em_andamento') as servicos_em_andamento,
    (SELECT COUNT(*) FROM servicos_especiais WHERE status = 'concluido') as servicos_concluidos,
    (SELECT COUNT(*) FROM declaracoes_irpf WHERE status = 'em_andamento') as irpf_em_andamento,
    (SELECT COUNT(*) FROM declaracoes_irpf WHERE status = 'entregue') as irpf_entregues
)
SELECT * FROM dashboard_metrics;

-- 2. Análise de conversão de leads para clientes (JOIN complexo)
SELECT 
  l.origem,
  COUNT(l.id) as total_leads,
  COUNT(CASE WHEN l.status = 'ganho' THEN 1 END) as leads_convertidos,
  COUNT(p.id) as pipelines_criados,
  COUNT(CASE WHEN p.status = 'ganho' THEN 1 END) as pipelines_fechados,
  ROUND(
    (COUNT(CASE WHEN l.status = 'ganho' THEN 1 END) * 100.0 / NULLIF(COUNT(l.id), 0)), 2
  ) as taxa_conversao_leads,
  ROUND(
    (COUNT(CASE WHEN p.status = 'ganho' THEN 1 END) * 100.0 / NULLIF(COUNT(p.id), 0)), 2
  ) as taxa_conversao_pipelines
FROM leads l
LEFT JOIN pipelines p ON l.id = p.lead_id
GROUP BY l.origem
ORDER BY taxa_conversao_leads DESC;

-- 3. Análise temporal de performance (consulta com window functions)
SELECT 
  DATE_TRUNC('month', created_at) as mes,
  'leads' as tipo,
  COUNT(*) as total,
  COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', created_at)) as variacao_mensal,
  ROUND(
    ((COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', created_at))) * 100.0 / 
     NULLIF(LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', created_at)), 0)), 2
  ) as percentual_crescimento
FROM leads
GROUP BY DATE_TRUNC('month', created_at)
UNION ALL
SELECT 
  DATE_TRUNC('month', created_at) as mes,
  'pipelines' as tipo,
  COUNT(*) as total,
  COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', created_at)) as variacao_mensal,
  ROUND(
    ((COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', created_at))) * 100.0 / 
     NULLIF(LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', created_at)), 0)), 2
  ) as percentual_crescimento
FROM pipelines
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY mes, tipo;

-- 4. Análise de produtos/serviços mais demandados (consulta com arrays)
SELECT 
  unnest(produtos_interesse) as produto,
  COUNT(*) as demanda_leads,
  COUNT(CASE WHEN status = 'ganho' THEN 1 END) as conversoes,
  ROUND(
    (COUNT(CASE WHEN status = 'ganho' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
  ) as taxa_conversao
FROM leads
WHERE produtos_interesse IS NOT NULL
GROUP BY unnest(produtos_interesse)
ORDER BY demanda_leads DESC;

-- 5. Análise de responsáveis por performance (consulta com JOINs e agregações)
SELECT 
  COALESCE(u.email, 'Não atribuído') as responsavel,
  COUNT(l.id) as total_leads,
  COUNT(CASE WHEN l.status = 'ganho' THEN 1 END) as leads_convertidos,
  COUNT(p.id) as total_pipelines,
  COUNT(CASE WHEN p.status = 'ganho' THEN 1 END) as pipelines_fechados,
  ROUND(AVG(EXTRACT(DAYS FROM (l.updated_at - l.created_at))), 2) as tempo_medio_conversao_dias,
  ROUND(
    (COUNT(CASE WHEN l.status = 'ganho' THEN 1 END) * 100.0 / NULLIF(COUNT(l.id), 0)), 2
  ) as taxa_conversao_leads
FROM leads l
LEFT JOIN auth.users u ON l.responsavel = u.id
LEFT JOIN pipelines p ON l.id = p.lead_id AND p.responsavel = l.responsavel
GROUP BY u.email
ORDER BY taxa_conversao_leads DESC;

-- 6. Análise de clientes por valor e serviços (consulta com JSONB)
SELECT 
  c.razao_social,
  c.status,
  COUNT(s.id) as total_servicos,
  COUNT(CASE WHEN s.status = 'concluido' THEN 1 END) as servicos_concluidos,
  COUNT(CASE WHEN s.status = 'em_andamento' THEN 1 END) as servicos_em_andamento,
  ARRAY_AGG(DISTINCT s.tipo_servico) as tipos_servicos,
  -- Extrair informações do JSONB
  STRING_AGG(DISTINCT s.dados_especificos->>'valor', ', ') as valores_servicos,
  MAX(s.updated_at) as ultimo_servico
FROM clientes_pj c
LEFT JOIN servicos_especiais s ON c.id = s.cliente_id
GROUP BY c.id, c.razao_social, c.status
HAVING COUNT(s.id) > 0
ORDER BY COUNT(s.id) DESC;

-- 7. Análise de pipeline por estágio e tempo (consulta temporal complexa)
SELECT 
  estagio,
  COUNT(*) as total_pipelines,
  AVG(EXTRACT(DAYS FROM (updated_at - created_at))) as tempo_medio_estagio_dias,
  MIN(EXTRACT(DAYS FROM (updated_at - created_at))) as tempo_minimo_dias,
  MAX(EXTRACT(DAYS FROM (updated_at - created_at))) as tempo_maximo_dias,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(DAYS FROM (updated_at - created_at))) as mediana_dias
FROM pipelines
WHERE estagio IS NOT NULL
GROUP BY estagio
ORDER BY 
  CASE estagio
    WHEN 'prospeccao' THEN 1
    WHEN 'qualificacao' THEN 2
    WHEN 'proposta' THEN 3
    WHEN 'negociacao' THEN 4
    WHEN 'fechamento' THEN 5
    ELSE 6
  END;

-- 8. Análise de declarações IRPF por ano e status
SELECT 
  ano_exercicio,
  status,
  COUNT(*) as quantidade,
  COUNT(CASE WHEN valor_devido > 0 THEN 1 END) as com_imposto_devido,
  COUNT(CASE WHEN valor_restituicao > 0 THEN 1 END) as com_restituicao,
  ROUND(AVG(valor_devido), 2) as media_imposto_devido,
  ROUND(AVG(valor_restituicao), 2) as media_restituicao,
  SUM(valor_devido) as total_imposto_devido,
  SUM(valor_restituicao) as total_restituicao
FROM declaracoes_irpf
GROUP BY ano_exercicio, status
ORDER BY ano_exercicio DESC, status;

-- 9. Teste de performance com EXPLAIN ANALYZE (descomente para executar)
-- EXPLAIN ANALYZE
-- SELECT 
--   l.nome,
--   l.email,
--   l.status as status_lead,
--   p.estagio as estagio_pipeline,
--   c.razao_social,
--   COUNT(s.id) as total_servicos
-- FROM leads l
-- LEFT JOIN pipelines p ON l.id = p.lead_id
-- LEFT JOIN clientes_pj c ON p.cliente_id = c.id
-- LEFT JOIN servicos_especiais s ON c.id = s.cliente_id
-- WHERE l.created_at >= '2024-01-01'
-- GROUP BY l.id, l.nome, l.email, l.status, p.estagio, c.razao_social
-- ORDER BY l.created_at DESC;

-- 10. Análise de dados JSONB complexa (consulta com operadores JSONB)
SELECT 
  tipo_servico,
  COUNT(*) as total_servicos,
  -- Extrair e analisar dados específicos do JSONB
  COUNT(CASE WHEN dados_especificos ? 'valor' THEN 1 END) as com_valor,
  COUNT(CASE WHEN dados_especificos ? 'prazo' THEN 1 END) as com_prazo,
  COUNT(CASE WHEN dados_especificos ? 'observacoes' THEN 1 END) as com_observacoes,
  -- Valores médios quando disponíveis
  ROUND(AVG((dados_especificos->>'valor')::numeric), 2) as valor_medio,
  -- Prazos mais comuns
  MODE() WITHIN GROUP (ORDER BY dados_especificos->>'prazo') as prazo_mais_comum
FROM servicos_especiais
WHERE dados_especificos IS NOT NULL AND dados_especificos != '{}'
GROUP BY tipo_servico
ORDER BY total_servicos DESC;

-- 11. Relatório executivo consolidado
SELECT 
  'RESUMO EXECUTIVO' as secao,
  'Total de Leads' as metrica,
  COUNT(*)::text as valor
FROM leads
UNION ALL
SELECT 
  'RESUMO EXECUTIVO' as secao,
  'Taxa de Conversão Geral' as metrica,
  ROUND((COUNT(CASE WHEN status = 'ganho' THEN 1 END) * 100.0 / COUNT(*)), 2)::text || '%' as valor
FROM leads
UNION ALL
SELECT 
  'RESUMO EXECUTIVO' as secao,
  'Clientes Ativos (PF + PJ)' as metrica,
  (
    (SELECT COUNT(*) FROM clientes_pf WHERE status = 'ativo') +
    (SELECT COUNT(*) FROM clientes_pj WHERE status = 'ativo')
  )::text as valor
UNION ALL
SELECT 
  'RESUMO EXECUTIVO' as secao,
  'Serviços em Andamento' as metrica,
  (
    (SELECT COUNT(*) FROM servicos_especiais WHERE status = 'em_andamento') +
    (SELECT COUNT(*) FROM declaracoes_irpf WHERE status = 'em_andamento')
  )::text as valor
UNION ALL
SELECT 
  'RESUMO EXECUTIVO' as secao,
  'Pipelines Ativos' as metrica,
  COUNT(*)::text as valor
FROM pipelines
WHERE status NOT IN ('ganho', 'perdido')
ORDER BY secao, metrica;