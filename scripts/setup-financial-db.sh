#!/bin/bash

# Script para configurar as tabelas financeiras no Supabase
echo "🚀 Configurando tabelas financeiras no Supabase..."

# Verificar se o Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado. Instalando..."
    npm install -g supabase
fi

# Verificar se as variáveis de ambiente estão configuradas
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_ROLE_KEY são obrigatórias"
    echo "📋 Configure-as no arquivo .env"
    exit 1
fi

# Extrair project ID da URL
PROJECT_ID=$(echo $VITE_SUPABASE_URL | sed 's/.*\/\/\([^.]*\).*/\1/')
echo "📋 Project ID: $PROJECT_ID"

# Executar migração do schema principal
echo "📄 Executando migração do schema financeiro..."
supabase db push --project-ref $PROJECT_ID --include-all

# Verificar se a migração foi bem-sucedida
if [ $? -eq 0 ]; then
    echo "✅ Schema financeiro criado com sucesso!"
    
    # Executar dados de exemplo
    echo "📄 Inserindo dados de exemplo..."
    supabase db push --project-ref $PROJECT_ID --include-all
    
    if [ $? -eq 0 ]; then
        echo "✅ Dados de exemplo inseridos com sucesso!"
        echo ""
        echo "🎉 Configuração concluída!"
        echo "📋 Tabelas criadas:"
        echo "   • financial_categories"
        echo "   • bank_accounts" 
        echo "   • payment_methods"
        echo "   • revenues"
        echo "   • expenses"
        echo "   • financial_change_history"
        echo "   • financial_notifications"
        echo "   • financial_reports"
        echo "   • financial_settings"
    else
        echo "⚠️  Schema criado, mas houve problemas com os dados de exemplo"
    fi
else
    echo "❌ Falha ao criar schema financeiro"
    exit 1
fi

echo ""
echo "🔗 Acesse o painel do Supabase para verificar as tabelas:"
echo "   $VITE_SUPABASE_URL"