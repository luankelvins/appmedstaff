# Resumo da Migração - Separação Frontend/Backend

## Estrutura Anterior
O projeto estava organizado em uma estrutura monolítica com frontend e backend misturados na pasta `src/`.

## Nova Estrutura

### Frontend (`/frontend/`)
```
frontend/
├── src/
│   ├── components/     # Componentes React
│   ├── pages/         # Páginas da aplicação
│   ├── hooks/         # Custom hooks
│   ├── contexts/      # Contextos React
│   ├── stores/        # Stores de estado
│   ├── types/         # Definições de tipos TypeScript
│   ├── utils/         # Utilitários e serviços do frontend
│   ├── config/        # Configurações do frontend
│   └── assets/        # Assets estáticos
│       ├── styles/    # Arquivos CSS
│       ├── images/    # Imagens
│       └── icons/     # Ícones
├── public/            # Arquivos públicos
├── package.json       # Dependências do frontend
├── vite.config.ts     # Configuração do Vite
└── tsconfig.json      # Configuração TypeScript
```

### Backend (`/backend/`)
```
backend/
├── src/
│   ├── controllers/   # Controladores das rotas
│   ├── routes/        # Definições de rotas
│   ├── services/      # Lógica de negócio
│   ├── middlewares/   # Middlewares Express
│   ├── models/        # Modelos de dados
│   ├── config/        # Configurações do backend
│   ├── database/      # Configurações e schemas do banco
│   ├── utils/         # Utilitários do backend
│   └── types/         # Tipos TypeScript do backend
├── scripts/           # Scripts de setup e manutenção
├── package.json       # Dependências do backend
└── .env.example       # Exemplo de variáveis de ambiente
```

### Raiz do Projeto
```
/
├── frontend/          # Aplicação frontend
├── backend/           # API backend
├── package.json       # Scripts para gerenciar ambos
└── README.md          # Documentação principal
```

## Comandos Principais

### Desenvolvimento
```bash
# Executar ambos simultaneamente
npm run dev

# Executar apenas frontend
npm run dev:frontend

# Executar apenas backend
npm run dev:backend
```

### Build
```bash
# Build de ambos
npm run build

# Build apenas frontend
npm run build:frontend

# Build apenas backend
npm run build:backend
```

### Instalação
```bash
# Instalar dependências de ambos
npm run install:all
```

## Principais Mudanças

1. **Separação de Responsabilidades**: Frontend e backend agora são projetos independentes
2. **Estrutura Modular**: Cada parte tem sua própria estrutura organizada
3. **Configurações Independentes**: Cada projeto tem suas próprias dependências e configurações
4. **Scripts Centralizados**: O package.json da raiz gerencia ambos os ambientes
5. **Serviços Reorganizados**: Serviços de frontend movidos para `frontend/src/utils/`

## Benefícios

- **Escalabilidade**: Facilita o crescimento independente de cada parte
- **Manutenibilidade**: Código mais organizado e fácil de manter
- **Deploy Independente**: Possibilidade de fazer deploy separado
- **Desenvolvimento em Equipe**: Times podem trabalhar independentemente
- **Clareza de Responsabilidades**: Separação clara entre frontend e backend

## URLs de Desenvolvimento

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health
- **Auth Endpoints**: http://localhost:3001/api/auth/*

## Próximos Passos Recomendados

1. Configurar variáveis de ambiente específicas para cada ambiente
2. Implementar testes separados para frontend e backend
3. Configurar CI/CD independente para cada projeto
4. Documentar APIs do backend
5. Otimizar builds para produção