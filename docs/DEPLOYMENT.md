# 🚀 Deployment Guide - MedStaff Platform

## CI/CD Pipeline

O projeto possui um pipeline CI/CD completo configurado com GitHub Actions que inclui:

- ✅ Testes automatizados (unit + integration)
- ✅ Verificação de tipos TypeScript
- ✅ Linting e formatação
- ✅ Auditoria de segurança
- ✅ Build da aplicação
- ✅ Deploy automático para Vercel

## Configuração dos Secrets

Para que o deploy automático funcione, você precisa configurar os seguintes secrets no GitHub:

### 1. Obter as informações da Vercel

Execute os comandos abaixo no terminal do projeto:

```bash
# Obter o token da Vercel
vercel login
cat ~/.vercel/auth.json

# Obter IDs do projeto
vercel link
cat .vercel/project.json
```

### 2. Configurar Secrets no GitHub

Vá em **Settings > Secrets and variables > Actions** do seu repositório e adicione:

| Secret Name | Descrição | Como obter |
|-------------|-----------|------------|
| `VERCEL_TOKEN` | Token de autenticação da Vercel | Do arquivo `~/.vercel/auth.json` |
| `VERCEL_ORG_ID` | ID da organização/usuário | Do arquivo `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | ID do projeto | Do arquivo `.vercel/project.json` |

### 3. Variáveis de Ambiente (Opcional)

Configure no painel da Vercel:
- `VITE_API_URL`: URL da sua API de produção
- `VITE_APP_NAME`: Nome da aplicação
- `VITE_APP_VERSION`: Versão da aplicação

## Fluxo de Deploy

### Branch `develop` (Staging)
- Push para `develop` → Deploy de preview na Vercel
- URL temporária para testes

### Branch `main` (Production)
- Push para `main` → Deploy de produção na Vercel
- URL de produção oficial

## Comandos Úteis

```bash
# Deploy manual para preview
vercel

# Deploy manual para produção
vercel --prod

# Verificar status do projeto
vercel ls

# Ver logs de deploy
vercel logs [deployment-url]
```

## Monitoramento

- **Analytics**: Habilitado automaticamente na Vercel
- **Error Tracking**: Configure Sentry ou similar
- **Performance**: Use Vercel Analytics ou Web Vitals

## Troubleshooting

### Build Falha
1. Verifique os logs no GitHub Actions
2. Execute `npm run build` localmente
3. Corrija erros de TypeScript se necessário

### Deploy Falha
1. Verifique se os secrets estão configurados
2. Confirme se o token da Vercel é válido
3. Verifique se o projeto está linkado corretamente

### Variáveis de Ambiente
1. Configure no painel da Vercel
2. Redeploy após mudanças nas variáveis
3. Use `VITE_` prefix para variáveis do frontend