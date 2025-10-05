-- =====================================================
-- FUNÇÕES RPC NECESSÁRIAS PARA O SISTEMA
-- =====================================================

-- Função para obter informações das tabelas
CREATE OR REPLACE FUNCTION get_tables_info()
RETURNS TABLE (
  table_name text,
  table_schema text,
  table_type text,
  column_count bigint,
  row_count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::text,
    t.table_schema::text,
    t.table_type::text,
    (
      SELECT COUNT(*)
      FROM information_schema.columns c
      WHERE c.table_name = t.table_name 
      AND c.table_schema = t.table_schema
    ) as column_count,
    CASE 
      WHEN t.table_type = 'BASE TABLE' THEN
        (
          SELECT 
            CASE 
              WHEN c.reltuples >= 0 THEN c.reltuples::bigint
              ELSE 0
            END
          FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE c.relname = t.table_name
          AND n.nspname = t.table_schema
        )
      ELSE 0
    END as row_count
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
  AND t.table_type IN ('BASE TABLE', 'VIEW')
  ORDER BY t.table_name;
END;
$$;

-- Função para executar SQL (limitada para segurança)
CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  query_type text;
BEGIN
  -- Extrair o tipo de query (primeira palavra)
  query_type := upper(split_part(trim(sql_query), ' ', 1));
  
  -- Permitir apenas queries SELECT para segurança
  IF query_type NOT IN ('SELECT', 'WITH') THEN
    RAISE EXCEPTION 'Apenas queries SELECT são permitidas através desta função';
  END IF;
  
  -- Executar a query e retornar como JSON
  EXECUTE format('SELECT json_agg(row_to_json(t)) FROM (%s) t', sql_query) INTO result;
  
  RETURN COALESCE(result, '[]'::json);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', true,
      'message', SQLERRM,
      'code', SQLSTATE
    );
END;
$$;

-- Função para registrar ações de auditoria
CREATE OR REPLACE FUNCTION log_audit_action(
  p_user_id uuid,
  p_action text,
  p_entity text,
  p_entity_id text DEFAULT NULL,
  p_details jsonb DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_id uuid;
  user_profile record;
BEGIN
  -- Gerar ID único para o log
  audit_id := gen_random_uuid();
  
  -- Buscar informações do usuário
  SELECT id, full_name, email, role
  INTO user_profile
  FROM profiles
  WHERE id = p_user_id;
  
  -- Inserir log de auditoria
  INSERT INTO audit_logs (
    id,
    user_id,
    user_name,
    user_email,
    user_role,
    action,
    entity,
    entity_id,
    details,
    ip_address,
    user_agent,
    timestamp
  ) VALUES (
    audit_id,
    p_user_id,
    COALESCE(user_profile.full_name, 'Usuário Desconhecido'),
    COALESCE(user_profile.email, 'email@desconhecido.com'),
    COALESCE(user_profile.role, 'user'),
    p_action,
    p_entity,
    p_entity_id,
    COALESCE(p_details, '{}'::jsonb),
    p_ip_address,
    p_user_agent,
    now()
  );
  
  RETURN audit_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, ainda retornar um ID para não quebrar o fluxo
    RAISE WARNING 'Erro ao registrar auditoria: %', SQLERRM;
    RETURN gen_random_uuid();
END;
$$;

-- Função para obter estatísticas de auditoria
CREATE OR REPLACE FUNCTION get_audit_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats json;
BEGIN
  SELECT json_build_object(
    'total_logs', (SELECT COUNT(*) FROM audit_logs),
    'logs_today', (
      SELECT COUNT(*) 
      FROM audit_logs 
      WHERE DATE(timestamp) = CURRENT_DATE
    ),
    'logs_this_week', (
      SELECT COUNT(*) 
      FROM audit_logs 
      WHERE timestamp >= DATE_TRUNC('week', CURRENT_DATE)
    ),
    'logs_this_month', (
      SELECT COUNT(*) 
      FROM audit_logs 
      WHERE timestamp >= DATE_TRUNC('month', CURRENT_DATE)
    ),
    'unique_users_today', (
      SELECT COUNT(DISTINCT user_id) 
      FROM audit_logs 
      WHERE DATE(timestamp) = CURRENT_DATE
    ),
    'most_common_actions', (
      SELECT json_agg(
        json_build_object(
          'action', action,
          'count', count
        )
      )
      FROM (
        SELECT action, COUNT(*) as count
        FROM audit_logs
        WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY action
        ORDER BY count DESC
        LIMIT 5
      ) top_actions
    ),
    'recent_activity', (
      SELECT json_agg(
        json_build_object(
          'user_name', user_name,
          'action', action,
          'entity', entity,
          'timestamp', timestamp
        )
      )
      FROM (
        SELECT user_name, action, entity, timestamp
        FROM audit_logs
        ORDER BY timestamp DESC
        LIMIT 10
      ) recent
    )
  ) INTO stats;
  
  RETURN COALESCE(stats, '{}'::json);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', true,
      'message', SQLERRM,
      'total_logs', 0,
      'logs_today', 0,
      'logs_this_week', 0,
      'logs_this_month', 0,
      'unique_users_today', 0
    );
END;
$$;

-- Função para limpeza automática de logs antigos
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(days_to_keep integer DEFAULT 90)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM audit_logs 
  WHERE timestamp < (CURRENT_DATE - INTERVAL '1 day' * days_to_keep);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Registrar a limpeza
  INSERT INTO audit_logs (
    id, user_id, user_name, user_email, user_role,
    action, entity, details, timestamp
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
    'Sistema',
    'sistema@medstaff.com',
    'system',
    'CLEANUP_AUDIT_LOGS',
    'audit_logs',
    json_build_object('deleted_count', deleted_count, 'days_kept', days_to_keep)::jsonb,
    now()
  );
  
  RETURN deleted_count;
END;
$$;

-- Função para obter logs de auditoria com filtros
CREATE OR REPLACE FUNCTION get_audit_logs(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_user_id uuid DEFAULT NULL,
  p_action text DEFAULT NULL,
  p_entity text DEFAULT NULL,
  p_start_date timestamp DEFAULT NULL,
  p_end_date timestamp DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  user_name text,
  user_email text,
  user_role text,
  action text,
  entity text,
  entity_id text,
  details jsonb,
  ip_address text,
  user_agent text,
  timestamp timestamp with time zone,
  error_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.user_id,
    al.user_name,
    al.user_email,
    al.user_role,
    al.action,
    al.entity,
    al.entity_id,
    al.details,
    al.ip_address,
    al.user_agent,
    al.timestamp,
    al.error_message
  FROM audit_logs al
  WHERE 
    (p_user_id IS NULL OR al.user_id = p_user_id)
    AND (p_action IS NULL OR al.action ILIKE '%' || p_action || '%')
    AND (p_entity IS NULL OR al.entity ILIKE '%' || p_entity || '%')
    AND (p_start_date IS NULL OR al.timestamp >= p_start_date)
    AND (p_end_date IS NULL OR al.timestamp <= p_end_date)
  ORDER BY al.timestamp DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Conceder permissões para usuários autenticados
GRANT EXECUTE ON FUNCTION get_tables_info() TO authenticated;
GRANT EXECUTE ON FUNCTION execute_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION log_audit_action(uuid, text, text, text, jsonb, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_audit_logs(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_logs(integer, integer, uuid, text, text, timestamp, timestamp) TO authenticated;

-- Comentários para documentação
COMMENT ON FUNCTION get_tables_info() IS 'Retorna informações sobre todas as tabelas do schema public';
COMMENT ON FUNCTION execute_sql(text) IS 'Executa queries SELECT de forma segura e retorna resultado em JSON';
COMMENT ON FUNCTION log_audit_action(uuid, text, text, text, jsonb, text, text) IS 'Registra uma ação de auditoria no sistema';
COMMENT ON FUNCTION get_audit_stats() IS 'Retorna estatísticas resumidas dos logs de auditoria';
COMMENT ON FUNCTION cleanup_old_audit_logs(integer) IS 'Remove logs de auditoria mais antigos que o número especificado de dias';
COMMENT ON FUNCTION get_audit_logs(integer, integer, uuid, text, text, timestamp, timestamp) IS 'Busca logs de auditoria com filtros e paginação';