# 📋 Documentação de Testes - MedStaff Platform

## Visão Geral

Este documento descreve a estratégia de testes implementada na plataforma interna MedStaff, incluindo testes unitários, de integração e configuração de CI/CD.

## Estrutura de Testes

```
src/
├── test/
│   ├── integration/           # Testes de integração
│   │   └── auth-flow.integration.test.tsx
│   └── setup.ts              # Configuração global dos testes
├── components/
│   └── Profile/
│       └── __tests__/        # Testes unitários de componentes
│           └── ProfileHeader.test.tsx
└── pages/
    └── __tests__/            # Testes unitários de páginas
        └── Profile.test.tsx
```

## Tipos de Testes

### 1. Testes Unitários

**Localização**: `src/**/__tests__/**/*.test.{ts,tsx}`

**Objetivo**: Testar componentes e funções isoladamente.

**Exemplos implementados**:
- `ProfileHeader.test.tsx`: Testa o componente de cabeçalho do perfil
- `Profile.test.tsx`: Testa a página de perfil

**Como executar**:
```bash
npm run test:unit
```

### 2. Testes de Integração

**Localização**: `src/test/integration/**/*.test.{ts,tsx}`

**Objetivo**: Testar fluxos completos e interações entre componentes.

**Exemplos implementados**:
- `auth-flow.integration.test.tsx`: Testa o fluxo completo de autenticação

**Cenários cobertos**:
- ✅ Renderização do formulário de login
- ✅ Validação de campos obrigatórios
- ✅ Login com credenciais válidas
- ✅ Exibição de erros de autenticação
- ✅ Estados de carregamento
- ✅ Interação com campos de entrada
- ✅ Validação de tipos de campos
- ✅ Placeholders apropriados
- ✅ Fluxo completo de login bem-sucedido
- ✅ Fluxo de login com erro
- ✅ Limpeza de campos após erro

**Como executar**:
```bash
npm run test:integration
```

## Scripts de Teste

### Scripts Disponíveis

```json
{
  "test": "vitest",                                    // Modo watch
  "test:ui": "vitest --ui",                           // Interface gráfica
  "test:coverage": "vitest --coverage",               // Com cobertura
  "test:unit": "vitest --run --exclude=src/test/integration/**", // Apenas unitários
  "test:integration": "vitest --run src/test/integration/",      // Apenas integração
  "test:watch": "vitest --watch",                     // Modo watch explícito
  "test:ci": "vitest --run --coverage"                // Para CI/CD
}
```

### Execução

```bash
# Todos os testes em modo watch
npm test

# Apenas testes unitários
npm run test:unit

# Apenas testes de integração
npm run test:integration

# Testes com cobertura
npm run test:coverage

# Interface gráfica
npm run test:ui

# Para CI/CD (sem watch, com cobertura)
npm run test:ci
```

## Configuração de CI/CD

### GitHub Actions

**Arquivo**: `.github/workflows/ci.yml`

**Pipeline inclui**:

1. **Teste** (Node.js 18.x e 20.x):
   - Instalação de dependências
   - Linter
   - Type check
   - Testes unitários
   - Testes de integração
   - Cobertura de código
   - Upload para Codecov

2. **Build**:
   - Build da aplicação
   - Upload de artefatos

3. **Segurança**:
   - Auditoria de segurança
   - Verificação de dependências

4. **Deploy**:
   - Staging (branch `develop`)
   - Produção (branch `main`)

5. **Notificações**:
   - Status do deployment

### Triggers

- **Push**: branches `main` e `develop`
- **Pull Request**: para `main` e `develop`

## Ferramentas Utilizadas

### Framework de Testes
- **Vitest**: Framework de testes rápido e moderno
- **@testing-library/react**: Utilitários para testar componentes React
- **@testing-library/jest-dom**: Matchers customizados para DOM
- **@testing-library/user-event**: Simulação de eventos de usuário

### Mocking
- **vi.mock()**: Para mockar módulos e dependências
- **vi.fn()**: Para criar funções mock
- **react-hot-toast**: Mockado para evitar side effects

### Cobertura
- **c8**: Ferramenta de cobertura integrada ao Vitest

## Boas Práticas Implementadas

### 1. Estrutura de Testes
- Separação clara entre testes unitários e de integração
- Nomenclatura consistente (`*.test.{ts,tsx}`)
- Organização em pastas `__tests__`

### 2. Mocking Estratégico
- Mock de dependências externas (toast, stores)
- Preservação da lógica de negócio
- Isolamento de componentes

### 3. Cenários Abrangentes
- Casos de sucesso e erro
- Estados de carregamento
- Validações de formulário
- Interações do usuário

### 4. Configuração Robusta
- Setup global para testes
- Configuração de ambiente JSDOM
- Matchers customizados

## Métricas de Qualidade

### Cobertura Atual
- **Testes de Integração**: 1 arquivo, 11 testes
- **Testes Unitários**: 2 arquivos, 6 testes
- **Total**: 3 arquivos, 17 testes

### Objetivos de Cobertura
- **Linhas**: > 80%
- **Funções**: > 80%
- **Branches**: > 70%
- **Statements**: > 80%

## Próximos Passos

### Expansão de Testes
1. **Testes de Integração**:
   - Fluxo de gestão de perfil
   - Fluxo de permissões RBAC
   - Fluxo de auditoria
   - Fluxo de notificações

2. **Testes Unitários**:
   - Hooks customizados
   - Utilitários de validação
   - Serviços de API
   - Stores Zustand

3. **Testes E2E** (futuro):
   - Cypress ou Playwright
   - Fluxos críticos completos
   - Testes de regressão

### Melhorias de CI/CD
1. **Performance**:
   - Cache de dependências
   - Paralelização de testes
   - Build incremental

2. **Qualidade**:
   - Análise de código estático
   - Verificação de vulnerabilidades
   - Testes de performance

3. **Deploy**:
   - Deploy automático
   - Rollback automático
   - Monitoramento pós-deploy

## Comandos Úteis

```bash
# Executar testes específicos
npm test -- auth-flow
npm test -- Profile.test.tsx

# Executar com cobertura detalhada
npm run test:coverage -- --reporter=verbose

# Executar em modo debug
npm test -- --inspect-brk

# Executar com logs detalhados
npm test -- --reporter=verbose

# Limpar cache de testes
npx vitest --run --clearCache
```

## Troubleshooting

### Problemas Comuns

1. **Testes não encontrados**:
   - Verificar padrões de nomenclatura
   - Confirmar estrutura de pastas
   - Checar configuração do Vitest

2. **Mocks não funcionando**:
   - Verificar ordem de imports
   - Confirmar sintaxe do vi.mock()
   - Checar hoisting de mocks

3. **Erros de tipo**:
   - Verificar tipos dos mocks
   - Confirmar configuração TypeScript
   - Checar imports de tipos

### Logs e Debug

```bash
# Executar com logs detalhados
npm test -- --reporter=verbose

# Debug de testes específicos
npm test -- --inspect-brk auth-flow

# Verificar configuração
npx vitest --config
```

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Responsável**: Equipe de Desenvolvimento MedStaff