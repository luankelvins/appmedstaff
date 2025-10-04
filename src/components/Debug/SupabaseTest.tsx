import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import { supabaseService } from '../../services/supabaseService'
import { employeeIntegrationService } from '../../services/employeeIntegrationService'

interface DiagnosticResult {
  test: string
  status: 'success' | 'error' | 'warning' | 'pending'
  message: string
  details?: any
}

export const SupabaseTest: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTest, setCurrentTest] = useState<string>('')

  useEffect(() => {
    runDiagnostics()
  }, [])

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result])
  }

  const runDiagnostics = async () => {
    setResults([])
    setLoading(true)

    try {
      // Teste 1: Verificar configuração
      setCurrentTest('Verificando configuração...')
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        addResult({
          test: 'Configuração',
          status: 'error',
          message: 'Variáveis de ambiente não configuradas',
          details: { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey }
        })
        setLoading(false)
        return
      }

      addResult({
        test: 'Configuração',
        status: 'success',
        message: 'Variáveis de ambiente configuradas',
        details: { url: supabaseUrl.substring(0, 30) + '...' }
      })

      // Teste 2: Conexão básica
      setCurrentTest('Testando conexão básica...')
      try {
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
        
        if (error) {
          addResult({
            test: 'Conexão Básica',
            status: 'error',
            message: `Erro na conexão: ${error.message}`,
            details: error
          })
        } else {
          addResult({
            test: 'Conexão Básica',
            status: 'success',
            message: 'Conexão estabelecida com sucesso'
          })
        }
      } catch (err) {
        addResult({
          test: 'Conexão Básica',
          status: 'error',
          message: `Erro de rede: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
          details: err
        })
      }

      // Teste 3: Verificar tabelas
      setCurrentTest('Verificando estrutura das tabelas...')
      const tables = ['profiles', 'employees', 'tasks', 'leads']
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase.from(table).select('*').limit(1)
          
          if (error) {
            addResult({
              test: `Tabela ${table}`,
              status: 'error',
              message: `Tabela não existe ou sem permissão: ${error.message}`,
              details: error
            })
          } else {
            addResult({
              test: `Tabela ${table}`,
              status: 'success',
              message: 'Tabela acessível',
              details: { recordCount: data?.length || 0 }
            })
          }
        } catch (err) {
          addResult({
            test: `Tabela ${table}`,
            status: 'error',
            message: `Erro ao acessar: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
            details: err
          })
        }
      }

      // Teste 4: Testar supabaseService
      setCurrentTest('Testando supabaseService...')
      try {
        const healthCheck = await supabaseService.healthCheck()
        addResult({
          test: 'SupabaseService Health',
          status: healthCheck ? 'success' : 'error',
          message: healthCheck ? 'Serviço funcionando' : 'Serviço com problemas'
        })
      } catch (err) {
        addResult({
          test: 'SupabaseService Health',
          status: 'error',
          message: `Erro no serviço: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
          details: err
        })
      }

      // Teste 5: Buscar dados existentes
      setCurrentTest('Verificando dados existentes...')
      try {
        const employees = await supabaseService.getAllEmployees()
        addResult({
          test: 'Dados Existentes',
          status: employees.length > 0 ? 'success' : 'warning',
          message: `${employees.length} membros do time interno encontrados`,
          details: { count: employees.length }
        })

        // Se não há dados, oferecer para criar dados de exemplo
        if (employees.length === 0) {
          addResult({
            test: 'Dados de Exemplo',
            status: 'warning',
            message: 'Nenhum dado encontrado. Clique em "Inicializar Dados" para criar dados de exemplo.'
          })
        }
      } catch (err) {
        addResult({
          test: 'Dados Existentes',
          status: 'error',
          message: `Erro ao buscar dados: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
          details: err
        })
      }

    } catch (error) {
      addResult({
        test: 'Diagnóstico Geral',
        status: 'error',
        message: `Erro geral: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        details: error
      })
    } finally {
      setLoading(false)
      setCurrentTest('')
    }
  }

  const initializeSampleData = async () => {
    setLoading(true)
    setCurrentTest('Inicializando dados de exemplo...')
    
    try {
      await employeeIntegrationService.initializeSampleData()
      addResult({
        test: 'Inicialização de Dados',
        status: 'success',
        message: 'Dados de exemplo criados com sucesso'
      })
      
      // Reexecutar teste de dados
      const employees = await supabaseService.getAllEmployees()
      addResult({
        test: 'Verificação Pós-Inicialização',
        status: 'success',
        message: `${employees.length} membros do time interno agora disponíveis`,
        details: { count: employees.length }
      })
    } catch (error) {
      addResult({
        test: 'Inicialização de Dados',
        status: 'error',
        message: `Erro ao inicializar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        details: error
      })
    } finally {
      setLoading(false)
      setCurrentTest('')
    }
  }

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'pending': return '⏳'
      default: return '❓'
    }
  }

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
      case 'warning': return 'text-yellow-600'
      case 'pending': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const hasErrors = results.some(r => r.status === 'error')
  const hasWarnings = results.some(r => r.status === 'warning')
  const needsDataInit = results.some(r => r.test === 'Dados de Exemplo' && r.status === 'warning')

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Diagnóstico Supabase</h3>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Testando...' : 'Testar Novamente'}
        </button>
      </div>

      {loading && currentTest && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-700">{currentTest}</span>
          </div>
        </div>
      )}

      {!loading && (
        <div className="mb-4">
          <div className="flex items-center space-x-4 text-sm">
            <span className={`font-medium ${hasErrors ? 'text-red-600' : hasWarnings ? 'text-yellow-600' : 'text-green-600'}`}>
              Status Geral: {hasErrors ? 'Com Erros' : hasWarnings ? 'Com Avisos' : 'OK'}
            </span>
            {needsDataInit && (
              <button
                onClick={initializeSampleData}
                className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 transition-colors"
              >
                Inicializar Dados
              </button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {results.map((result, index) => (
          <div key={index} className="p-3 border rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getStatusIcon(result.status)}</span>
                <div>
                  <p className="font-medium text-sm">{result.test}</p>
                  <p className={`text-sm ${getStatusColor(result.status)}`}>
                    {result.message}
                  </p>
                </div>
              </div>
            </div>
            
            {result.details && (
              <details className="mt-2">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                  Ver detalhes
                </summary>
                <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      {results.length === 0 && !loading && (
        <p className="text-gray-500 text-center py-4">
          Clique em "Testar Novamente" para executar o diagnóstico
        </p>
      )}
    </div>
  )
}