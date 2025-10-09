# SecurityDashboard Component

## Visão Geral

O SecurityDashboard é um conjunto de componentes React para visualização de métricas de segurança em tempo real. Implementa lazy loading, cache inteligente e interface responsiva.

## Componentes

### SecurityDashboard (Principal)
Componente principal que coordena todos os outros componentes.

**Props**: Nenhuma

**Features**:
- Atualização automática a cada 30 segundos
- Cache inteligente com TTL de 5 minutos
- Lazy loading de subcomponentes
- Tratamento de erros

### SecurityChart
Componente de gráfico de barras para visualização de tendências.

**Props**:
```typescript
interface SecurityChartProps {
  data: Array<{ name: string; value: number }>;
  title: string;
  color?: string;
}
```

**Exemplo**:
```tsx
<SecurityChart
  data={[
    { name: '1h', value: 3 },
    { name: '6h', value: 10 },
    { name: '24h', value: 25 }
  ]}
  title="Alertas por Período"
  color="#ef4444"
/>
```

### SecurityFilters
Componente de filtros e ações do dashboard.

**Props**:
```typescript
interface SecurityFiltersProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  onExport: () => void;
}
```

**Períodos Disponíveis**: '1h', '6h', '24h', '7d', '30d'

### SecurityHistory
Componente de histórico de alertas.

**Props**:
```typescript
interface SecurityHistoryProps {
  period: string;
}
```

**Features**:
- Lista de alertas filtrada por período
- Ícones por tipo de alerta
- Status de resolução
- Timestamps formatados

## Hook Personalizado

### useSecurityMetrics
Hook para gerenciamento de dados de segurança com cache.

**Retorno**:
```typescript
interface UseSecurityMetricsReturn {
  data: SecurityMetrics | null;
  loading: boolean;
  error: string | null;
  isFromCache: boolean;
  refresh: () => Promise<void>;
  updatePeriod: (period: string) => Promise<void>;
}
```

**Exemplo**:
```tsx
const { data, loading, error, refresh } = useSecurityMetrics('24h');
```

## Instalação

```bash
# Instalar dependências
npm install lucide-react

# Importar componentes
import SecurityDashboard from './components/SecurityDashboard';
```

## Uso Básico

```tsx
import React from 'react';
import SecurityDashboard from './components/SecurityDashboard';

function App() {
  return (
    <div className="container mx-auto p-4">
      <SecurityDashboard />
    </div>
  );
}
```

## Customização

### Cores e Temas
Os componentes usam Tailwind CSS. Para customizar:

```css
/* Cores personalizadas */
.security-critical { @apply bg-red-100 text-red-800; }
.security-warning { @apply bg-yellow-100 text-yellow-800; }
.security-info { @apply bg-blue-100 text-blue-800; }
```

### Períodos Personalizados
Para adicionar novos períodos, edite o array em `SecurityFilters`:

```typescript
const periods = [
  { value: '1h', label: '1 Hora' },
  { value: '6h', label: '6 Horas' },
  { value: '24h', label: '24 Horas' },
  { value: '7d', label: '7 Dias' },
  { value: '30d', label: '30 Dias' },
  { value: '90d', label: '90 Dias' } // Novo período
];
```

## Performance

### Cache
- TTL padrão: 5 minutos
- Cache compartilhado entre instâncias
- Fallback para cache expirado

### Lazy Loading
- Componentes carregados sob demanda
- Suspense com fallbacks
- Redução do bundle inicial

### Otimizações
- Debounce em mudanças de filtro
- Cancelamento de requisições
- Memoização de componentes pesados

## Tipos TypeScript

```typescript
interface SecurityMetrics {
  timestamp: string;
  period: string;
  summary: {
    totalAlerts: number;
    criticalAlerts: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
    lastUpdate: string;
  };
  trends: {
    alertsLast1h: number;
    alertsLast6h: number;
    alertsLast24h: number;
  };
}

interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
  source: string;
}
```

## Testes

```bash
# Executar testes
npm run test

# Testes específicos
npm run test SecurityDashboard
```

### Exemplo de Teste
```typescript
import { render, screen } from '@testing-library/react';
import SecurityDashboard from './SecurityDashboard';

test('renders security dashboard', () => {
  render(<SecurityDashboard />);
  expect(screen.getByText('Dashboard de Segurança')).toBeInTheDocument();
});
```

## Troubleshooting

### Problemas Comuns

1. **Componentes não carregam**
   - Verificar se Suspense está configurado
   - Verificar imports dos componentes lazy

2. **Cache não funciona**
   - Verificar se hook está sendo usado corretamente
   - Verificar TTL do cache

3. **Gráficos não aparecem**
   - Verificar se dados estão no formato correto
   - Verificar props do SecurityChart

### Debug

```typescript
// Habilitar logs de debug
const { data, loading, error } = useSecurityMetrics('24h', { debug: true });
```

## Contribuição

1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente os testes
4. Faça commit das mudanças
5. Abra um Pull Request

## Licença

MIT License - veja LICENSE.md para detalhes.