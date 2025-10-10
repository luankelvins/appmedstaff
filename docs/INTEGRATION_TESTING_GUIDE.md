# Guia de Testes de Integração - Sistema de Segurança e Auditoria

## Visão Geral

Este guia descreve como executar e implementar testes de integração para as funcionalidades de segurança e auditoria da plataforma MedStaff.

## Estrutura de Testes

### 1. Configuração do Ambiente de Teste

#### Pré-requisitos
```bash
# Instalar dependências de teste
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev pg  # PostgreSQL client
npm install --save-dev msw  # Mock Service Worker para APIs
```

#### Configuração do Banco de Teste
```sql
-- Criar banco de dados de teste
CREATE DATABASE medstaff_test;

-- Aplicar schemas
\i database/audit_schema.sql
\i database/security_schema.sql
```

### 2. Testes de Integração Implementados

#### 2.1 Testes do Sistema de Auditoria

##### Arquivo: `tests/integration/audit-integration.test.ts`

```typescript
describe('Sistema de Auditoria - Integração', () => {
  beforeEach(async () => {
    // Limpar dados de teste
    await pool.query('DELETE FROM audit_logs WHERE id != $1', ['00000000-0000-0000-0000-000000000000'])
  })

  test('Deve registrar ação e recuperar logs', async () => {
    // Registrar ação
    await auditService.logAction({
      action: 'finance.expenses.create',
      details: { amount: 1000, description: 'Teste' },
      userId: 'test-user-id'
    })

    // Verificar se foi registrado
    const logs = await auditService.getAuditLogs({ limit: 10 })
    expect(logs.data).toHaveLength(1)
    expect(logs.data[0].action).toBe('finance.expenses.create')
  })

  test('Deve aplicar filtros corretamente', async () => {
    // Registrar múltiplas ações
    await Promise.all([
      auditService.logAction({ action: 'finance.expenses.create', userId: 'user1' }),
      auditService.logAction({ action: 'hr.employee.create', userId: 'user2' }),
      auditService.logAction({ action: 'finance.expenses.update', userId: 'user1' })
    ])

    // Filtrar por usuário
    const userLogs = await auditService.getAuditLogs({ 
      userId: 'user1',
      limit: 10 
    })
    expect(userLogs.data).toHaveLength(2)

    // Filtrar por ação
    const actionLogs = await auditService.getAuditLogs({
      action: 'finance.expenses.create',
      limit: 10
    })
    expect(actionLogs.data).toHaveLength(1)
  })
})
```

#### 2.2 Testes do Sistema de Segurança

##### Arquivo: `tests/integration/security-integration.test.ts`

```typescript
describe('Sistema de Segurança - Integração', () => {
  let securityService: SecurityValidationService

  beforeEach(() => {
    securityService = new SecurityValidationService()
  })

  test('Deve detectar múltiplas tentativas de login', async () => {
    // Simular múltiplas tentativas falhadas
    for (let i = 0; i < 6; i++) {
      await auditService.logAction({
        action: 'auth.login.failed',
        userId: 'test-user',
        metadata: { ip: '192.168.1.1' }
      })
    }

    // Executar análise de segurança
    const alerts = await securityService.analyzeSecurityEvents()
    
    expect(alerts).toContainEqual(
      expect.objectContaining({
        type: 'suspicious_activity',
        severity: 'high',
        title: expect.stringContaining('Múltiplas tentativas de login')
      })
    )
  })

  test('Deve detectar atividade em horário incomum', async () => {
    // Simular atividade às 2h da manhã
    const nightTime = new Date()
    nightTime.setHours(2, 0, 0, 0)

    await auditService.logAction({
      action: 'finance.expenses.create',
      userId: 'test-user',
      timestamp: nightTime
    })

    const alerts = await securityService.analyzeSecurityEvents()
    
    expect(alerts).toContainEqual(
      expect.objectContaining({
        type: 'suspicious_activity',
        title: expect.stringContaining('Atividade em horário incomum')
      })
    )
  })
})
```

#### 2.3 Testes de Conformidade

##### Arquivo: `tests/integration/compliance-integration.test.ts`

```typescript
describe('Sistema de Conformidade - Integração', () => {
  test('Deve verificar conformidade LGPD', async () => {
    // Simular acesso a dados pessoais sem consentimento
    await auditService.logAction({
      action: 'data.personal.access',
      userId: 'test-user',
      metadata: { 
        dataType: 'personal',
        hasConsent: false,
        purpose: 'marketing'
      }
    })

    const violations = await securityService.checkComplianceViolations()
    
    expect(violations).toContainEqual(
      expect.objectContaining({
        regulation: 'LGPD',
        violation: 'Acesso a dados pessoais sem consentimento'
      })
    )
  })

  test('Deve verificar retenção de dados', async () => {
    // Simular dados antigos que deveriam ser removidos
    const oldDate = new Date()
    oldDate.setFullYear(oldDate.getFullYear() - 8) // 8 anos atrás

    await auditService.logAction({
      action: 'data.personal.collect',
      userId: 'test-user',
      timestamp: oldDate,
      metadata: { dataType: 'personal' }
    })

    const violations = await securityService.checkDataRetention()
    
    expect(violations).toContainEqual(
      expect.objectContaining({
        type: 'data_retention',
        message: expect.stringContaining('Dados retidos além do período permitido')
      })
    )
  })
})
```

### 3. Testes de Interface

#### 3.1 Testes do SecurityDashboard

##### Arquivo: `tests/integration/security-dashboard.test.tsx`

```typescript
describe('SecurityDashboard - Integração', () => {
  test('Deve exibir alertas de segurança', async () => {
    // Mock de dados
    const mockAlerts = [
      {
        id: '1',
        type: 'suspicious_activity',
        severity: 'high',
        title: 'Múltiplas tentativas de login',
        description: 'Detectadas 6 tentativas falhadas',
        timestamp: new Date(),
        resolved: false
      }
    ]

    // Mock do hook
    jest.mocked(useSecurityValidation).mockReturnValue({
      alerts: mockAlerts,
      loading: false,
      error: null,
      // ... outros métodos
    })

    render(<SecurityDashboard />)

    expect(screen.getByText('Múltiplas tentativas de login')).toBeInTheDocument()
    expect(screen.getByText('high')).toBeInTheDocument()
  })

  test('Deve permitir resolver alertas', async () => {
    const mockResolveAlert = jest.fn()
    
    jest.mocked(useSecurityValidation).mockReturnValue({
      alerts: [/* mock alert */],
      resolveAlert: mockResolveAlert,
      // ... outros métodos
    })

    render(<SecurityDashboard />)
    
    // Clicar no alerta e depois no botão resolver
    fireEvent.click(screen.getByText('Múltiplas tentativas de login'))
    fireEvent.click(screen.getByText('Resolver Alerta'))

    expect(mockResolveAlert).toHaveBeenCalledWith('1', expect.any(String))
  })
})
```

### 4. Testes de Performance

#### 4.1 Testes de Carga

##### Arquivo: `tests/integration/performance.test.ts`

```typescript
describe('Performance - Sistema de Auditoria', () => {
  test('Deve processar 1000 logs em menos de 5 segundos', async () => {
    const startTime = Date.now()
    
    // Gerar 1000 logs
    const promises = Array.from({ length: 1000 }, (_, i) => 
      auditService.logAction({
        action: 'finance.expenses.create',
        userId: `user-${i}`,
        details: { amount: Math.random() * 1000 }
      })
    )

    await Promise.all(promises)
    
    const endTime = Date.now()
    const duration = endTime - startTime

    expect(duration).toBeLessThan(5000) // 5 segundos
  })

  test('Deve consultar logs com filtros rapidamente', async () => {
    // Inserir dados de teste
    await insertTestData(10000) // 10k logs

    const startTime = Date.now()
    
    const result = await auditService.getAuditLogs({
      action: 'finance.expenses.create',
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // últimas 24h
      limit: 100
    })

    const endTime = Date.now()
    const duration = endTime - startTime

    expect(duration).toBeLessThan(1000) // 1 segundo
    expect(result.data.length).toBeGreaterThan(0)
  })
})
```

### 5. Testes End-to-End

#### 5.1 Fluxo Completo de Segurança

##### Arquivo: `tests/e2e/security-flow.test.ts`

```typescript
describe('Fluxo E2E - Segurança', () => {
  test('Fluxo completo: detecção → alerta → resolução', async () => {
    // 1. Simular atividade suspeita
    await simulateSuspiciousActivity()

    // 2. Verificar se alerta foi gerado
    await waitFor(async () => {
      const alerts = await securityService.getSecurityAlerts()
      expect(alerts.length).toBeGreaterThan(0)
    })

    // 3. Verificar se aparece no dashboard
    render(<SecurityDashboard />)
    await waitFor(() => {
      expect(screen.getByText(/atividade suspeita/i)).toBeInTheDocument()
    })

    // 4. Resolver o alerta
    fireEvent.click(screen.getByText(/atividade suspeita/i))
    fireEvent.click(screen.getByText('Resolver Alerta'))

    // 5. Verificar se foi resolvido
    await waitFor(async () => {
      const alerts = await securityService.getSecurityAlerts()
      const unresolvedAlerts = alerts.filter(a => !a.resolved)
      expect(unresolvedAlerts.length).toBe(0)
    })
  })
})
```

### 6. Configuração de CI/CD

#### 6.1 GitHub Actions

##### Arquivo: `.github/workflows/integration-tests.yml`

```yaml
name: Integration Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: medstaff_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Setup test database
      run: |
        psql -h localhost -U postgres -d medstaff_test -f database/audit_schema.sql
        psql -h localhost -U postgres -d medstaff_test -f database/security_schema.sql
      env:
        PGPASSWORD: postgres
    
    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/medstaff_test
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
```

### 7. Scripts de Teste

#### 7.1 Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "vitest run tests/e2e",
    "test:performance": "vitest run tests/performance",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch",
    "test:security": "npm run test:integration && npm run test:e2e"
  }
}
```

#### 7.2 Script de Setup de Teste

##### Arquivo: `scripts/setup-test-env.sh`

```bash
#!/bin/bash

# Setup do ambiente de teste
echo "Configurando ambiente de teste..."

# Criar banco de teste
createdb medstaff_test

# Aplicar schemas
psql -d medstaff_test -f database/audit_schema.sql
psql -d medstaff_test -f database/security_schema.sql

# Inserir dados de teste
psql -d medstaff_test -f tests/fixtures/test-data.sql

echo "Ambiente de teste configurado com sucesso!"
```

### 8. Dados de Teste (Fixtures)

#### 8.1 Dados de Auditoria

##### Arquivo: `tests/fixtures/audit-data.sql`

```sql
-- Inserir usuários de teste
INSERT INTO auth.users (id, email) VALUES 
  ('test-user-1', 'user1@test.com'),
  ('test-user-2', 'user2@test.com'),
  ('admin-user', 'admin@test.com');

-- Inserir logs de auditoria de teste
INSERT INTO audit_logs (action, user_id, details, ip_address) VALUES
  ('finance.expenses.create', 'test-user-1', '{"amount": 1000}', '192.168.1.1'),
  ('hr.employee.create', 'admin-user', '{"name": "João Silva"}', '192.168.1.2'),
  ('auth.login.failed', 'test-user-2', '{"reason": "invalid_password"}', '192.168.1.3');

-- Inserir regras de conformidade
INSERT INTO compliance_rules (name, regulation, rule_config) VALUES
  ('LGPD - Consentimento', 'LGPD', '{"requires_consent": true, "data_types": ["personal"]}'),
  ('GDPR - Retenção', 'GDPR', '{"max_retention_days": 2555, "data_types": ["personal"]}');
```

### 9. Monitoramento de Testes

#### 9.1 Métricas de Qualidade

```typescript
// Configuração de cobertura mínima
export default {
  test: {
    coverage: {
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
}
```

### 10. Troubleshooting

#### 10.1 Problemas Comuns

##### Erro de Conexão com Banco
```bash
# Verificar se o PostgreSQL está rodando
pg_isready -h localhost -p 5432

# Verificar permissões
psql -h localhost -U postgres -c "SELECT version();"
```

##### Testes Lentos
```typescript
// Usar transações para rollback automático
beforeEach(async () => {
  await pool.query('BEGIN')
})

afterEach(async () => {
  await pool.query('ROLLBACK')
})
```

##### Mock de Hooks
```typescript
// Mock correto dos hooks customizados
jest.mock('../../hooks/useSecurityValidation', () => ({
  useSecurityValidation: jest.fn(),
  useComplianceValidation: jest.fn(),
  useRiskAnalysis: jest.fn(),
  useSecurityMonitoring: jest.fn()
}))
```

---

## Conclusão

Este guia fornece uma estrutura completa para testes de integração do sistema de segurança e auditoria. Os testes cobrem desde funcionalidades básicas até cenários complexos de performance e conformidade.

Para executar todos os testes:

```bash
npm run test:security
```

Para monitoramento contínuo:

```bash
npm run test:watch
```