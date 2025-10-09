# Dashboard de Segurança - MedStaff

## Visão Geral

O Dashboard de Segurança é um sistema completo de monitoramento e visualização de métricas de segurança em tempo real para a plataforma MedStaff. Ele fornece insights sobre alertas de segurança, tendências e atividades suspeitas.

## Funcionalidades

### 1. Visualização em Tempo Real
- **Métricas de Resumo**: Total de alertas, alertas críticos e status do sistema
- **Atualização Automática**: Dados atualizados automaticamente a cada 30 segundos
- **Indicadores Visuais**: Ícones e cores para diferentes tipos de alertas

### 2. Filtros e Períodos
- **Filtros de Período**: 1h, 6h, 24h, 7d, 30d
- **Seleção Dinâmica**: Mudança de período atualiza automaticamente os dados
- **Interface Intuitiva**: Badges clicáveis para seleção de período

### 3. Gráficos e Visualizações
- **Gráfico de Barras**: Distribuição de alertas por período
- **Cores Personalizáveis**: Diferentes cores para diferentes tipos de dados
- **Responsivo**: Adapta-se a diferentes tamanhos de tela

### 4. Histórico de Alertas
- **Lista Detalhada**: Histórico completo de alertas com timestamps
- **Filtros por Período**: Mostra apenas alertas do período selecionado
- **Status de Resolução**: Indica se alertas foram resolvidos
- **Categorização**: Crítico, Aviso, Info

### 5. Exportação de Dados
- **Formato JSON**: Exporta relatórios em formato JSON
- **Dados Completos**: Inclui métricas, período e metadados
- **Download Automático**: Gera arquivo para download

### 6. Otimizações de Performance
- **Cache Inteligente**: Cache de 5 minutos para reduzir requisições
- **Lazy Loading**: Componentes carregados sob demanda
- **Retry Automático**: Tentativas automáticas em caso de erro
- **Indicador de Cache**: Mostra quando dados vêm do cache

## Arquitetura

### Backend

#### Rotas
- `GET /api/security-dashboard/public-metrics`: Métricas públicas de segurança
- `GET /api/security-dashboard/overview`: Visão geral (requer autenticação)

#### Estrutura de Dados
```json
{
  "success": true,
  "data": {
    "timestamp": "2025-10-09T19:45:46.978Z",
    "period": "24h",
    "summary": {
      "totalAlerts": 0,
      "criticalAlerts": 0,
      "systemHealth": "critical",
      "lastUpdate": "2025-10-09T19:45:46.978Z"
    },
    "trends": {
      "alertsLast1h": 3,
      "alertsLast6h": 10,
      "alertsLast24h": 0
    }
  }
}
```

### Frontend

#### Componentes Principais

1. **SecurityDashboard.tsx**
   - Componente principal do dashboard
   - Gerencia estado global e coordena outros componentes
   - Implementa atualização automática

2. **SecurityChart.tsx**
   - Componente de gráfico de barras
   - Visualização de tendências de alertas
   - Responsivo e customizável

3. **SecurityFilters.tsx**
   - Filtros de período e ações
   - Interface para seleção de período
   - Botão de exportação

4. **SecurityHistory.tsx**
   - Histórico detalhado de alertas
   - Lista paginada e filtrada
   - Status de resolução

#### Hook Personalizado

**useSecurityMetrics.ts**
- Cache inteligente com TTL de 5 minutos
- Retry automático em caso de erro
- Cancelamento de requisições duplicadas
- Compartilhamento de cache entre instâncias

#### Otimizações

1. **Cache**
   - Cache global compartilhado
   - TTL configurável (5 minutos)
   - Fallback para cache expirado em caso de erro

2. **Lazy Loading**
   - Componentes carregados sob demanda
   - Suspense com fallbacks de loading
   - Redução do bundle inicial

3. **Performance**
   - Debounce em mudanças de filtro
   - Cancelamento de requisições
   - Memoização de componentes

## Configuração

### Variáveis de Ambiente

```bash
# Backend
PORT=3001
NODE_ENV=development

# Frontend
VITE_API_BASE_URL=http://localhost:3001
```

### Dependências

#### Backend
- Express.js
- CORS
- Helmet (segurança)
- Rate limiting

#### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Lucide React (ícones)
- Vite (build tool)

## Instalação e Execução

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Uso

### Acessando o Dashboard

1. Navegue para `/security` na aplicação
2. O dashboard carregará automaticamente as métricas
3. Use os filtros para alterar o período de análise
4. Clique em "Exportar Relatório" para baixar dados

### Interpretando as Métricas

- **Verde**: Sistema saudável, poucos alertas
- **Amarelo**: Alertas de aviso, atenção necessária
- **Vermelho**: Alertas críticos, ação imediata necessária

### Exportação de Dados

Os relatórios exportados incluem:
- Timestamp da geração
- Período analisado
- Métricas completas
- Metadados do sistema

## Segurança

### Medidas Implementadas

1. **Rate Limiting**: Proteção contra spam de requisições
2. **CORS**: Configuração adequada de origens permitidas
3. **Helmet**: Headers de segurança
4. **Validação**: Validação de entrada em todas as rotas

### Dados Sensíveis

- Métricas públicas não expõem dados sensíveis
- Rotas protegidas requerem autenticação
- Logs não contêm informações pessoais

## Monitoramento

### Métricas Coletadas

- Total de alertas por período
- Alertas críticos
- Status do sistema
- Tendências temporais

### Alertas Automáticos

- Sistema monitora automaticamente
- Alertas gerados em tempo real
- Notificações para administradores

## Troubleshooting

### Problemas Comuns

1. **Dashboard não carrega**
   - Verificar se backend está rodando
   - Verificar conectividade de rede
   - Verificar logs do console

2. **Dados desatualizados**
   - Clicar em "Atualizar" para forçar refresh
   - Verificar se cache está funcionando
   - Verificar logs do servidor

3. **Exportação não funciona**
   - Verificar permissões do navegador
   - Verificar se dados estão carregados
   - Verificar console para erros

### Logs

- Backend: Logs no console do servidor
- Frontend: Logs no console do navegador
- Erros de rede: Network tab das ferramentas de desenvolvedor

## Desenvolvimento

### Estrutura de Arquivos

```
backend/
├── src/
│   ├── routes/
│   │   └── securityDashboardRoutes.js
│   └── server.js
└── package.json

frontend/
├── src/
│   ├── components/
│   │   ├── SecurityDashboard.tsx
│   │   └── SecurityDashboard/
│   │       ├── SecurityChart.tsx
│   │       ├── SecurityFilters.tsx
│   │       ├── SecurityHistory.tsx
│   │       └── index.ts
│   ├── hooks/
│   │   └── useSecurityMetrics.ts
│   └── utils/
└── package.json
```

### Adicionando Novas Métricas

1. Atualizar interface `SecurityMetrics`
2. Modificar endpoint backend
3. Atualizar componentes frontend
4. Adicionar testes

### Testes

```bash
# Backend
npm test

# Frontend
npm run test
```

## Roadmap

### Próximas Funcionalidades

1. **Alertas em Tempo Real**
   - WebSocket para notificações
   - Push notifications
   - Email alerts

2. **Análise Avançada**
   - Machine learning para detecção de anomalias
   - Correlação de eventos
   - Predição de tendências

3. **Integração**
   - APIs externas de segurança
   - SIEM integration
   - Compliance reporting

4. **Mobile**
   - App mobile nativo
   - Notificações push
   - Interface otimizada

## Suporte

Para suporte técnico ou dúvidas:
- Documentação: `/docs`
- Issues: GitHub Issues
- Email: suporte@medstaff.com

---

**Versão**: 1.0.0  
**Última Atualização**: 09/10/2025  
**Autor**: Equipe de Desenvolvimento MedStaff