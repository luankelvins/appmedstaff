# Configuração do Banco de Dados Supabase

## Passos para configurar o Supabase

### 1. Criar projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha sua organização
5. Defina o nome do projeto (ex: "medstaff-app")
6. Defina uma senha forte para o banco de dados
7. Escolha a região mais próxima (ex: South America - São Paulo)
8. Clique em "Create new project"

### 2. Configurar variáveis de ambiente
1. No dashboard do Supabase, vá para Settings > API
2. Copie as seguintes informações:
   - **Project URL** (VITE_SUPABASE_URL)
   - **anon public** key (VITE_SUPABASE_ANON_KEY)
   - **service_role** key (VITE_SUPABASE_SERVICE_ROLE_KEY)

3. Crie um arquivo `.env` na raiz do projeto com:
```env
VITE_SUPABASE_URL=sua_url_do_projeto
VITE_SUPABASE_ANON_KEY=sua_chave_publica_anonima
VITE_SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=MedStaff
VITE_APP_VERSION=1.0.0
```

### 3. Executar o schema do banco
1. No dashboard do Supabase, vá para SQL Editor
2. Clique em "New query"
3. Copie todo o conteúdo do arquivo `schema.sql`
4. Cole no editor e clique em "Run"
5. Verifique se todas as tabelas foram criadas em Database > Tables

### 4. Configurar autenticação
1. Vá para Authentication > Settings
2. Configure os provedores de autenticação desejados:
   - **Email**: Já habilitado por padrão
   - **Google**: Configure se necessário
   - **Microsoft**: Configure se necessário

3. Configure as URLs de redirecionamento:
   - Site URL: `http://localhost:5173` (desenvolvimento)
   - Redirect URLs: `http://localhost:5173/**`

### 5. Configurar Storage (opcional)
Se precisar de upload de arquivos:
1. Vá para Storage
2. Crie buckets conforme necessário:
   - `avatars` (para fotos de perfil)
   - `documents` (para documentos)
   - `contracts` (para contratos)

### 6. Testar a conexão
Execute o projeto e verifique se a conexão está funcionando:
```bash
npm run dev
```

## Estrutura do Banco de Dados

### Tabelas Principais

#### `profiles`
- Perfis de usuário vinculados à autenticação
- Informações básicas do usuário

#### `employees`
- Dados completos dos membros do time interno
- Estrutura JSONB para flexibilidade

#### `tasks`
- Sistema de tarefas e atividades
- Atribuição e acompanhamento

#### `leads`
- Gestão de leads comerciais
- Pipeline de vendas

#### `clientes_pf` / `clientes_pj`
- Clientes pessoa física e jurídica
- Dados completos para gestão

#### `contratos`
- Contratos e acordos
- Versionamento e status

#### `irpf`
- Declarações de imposto de renda
- Dados estruturados por ano

### Recursos Implementados

- **RLS (Row Level Security)**: Políticas de segurança por linha
- **Triggers**: Atualização automática de timestamps
- **Índices**: Otimização de consultas
- **Função de perfil**: Criação automática de perfil ao registrar usuário

## Próximos Passos

1. Testar todas as operações CRUD
2. Implementar autenticação no frontend
3. Migrar dados mock existentes
4. Configurar backup automático
5. Implementar logs de auditoria

## Troubleshooting

### Erro de conexão
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o projeto Supabase está ativo

### Erro de permissão
- Verifique as políticas RLS
- Confirme se o usuário está autenticado

### Erro de schema
- Execute novamente o script SQL
- Verifique se todas as extensões estão habilitadas