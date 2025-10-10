/**
 * Componente de Teste para Integração dos Serviços
 * 
 * Este componente testa a integração dos novos serviços
 * com os componentes existentes do sistema.
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../UI/Card'
import { Button } from '../UI/Button'
import { Badge } from '../UI/Badge'
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  RefreshCw,
  Users,
  ClipboardList,
  Target,
  Bell,
  DollarSign,
  AlertTriangle
} from 'lucide-react'

// Importar os novos serviços
import { 
  authService,
  employeesService,
  tasksService,
  leadsService,
  notificationsService,
  expensesService
} from '../../services'

interface TestResult {
  service: string
  method: string
  status: 'pending' | 'success' | 'error'
  message: string
  duration?: number
}

interface ServiceTest {
  name: string
  icon: React.ComponentType<any>
  tests: Array<{
    method: string
    description: string
    testFn: () => Promise<any>
  }>
}

const ServicesIntegrationTest: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string>('')

  // Definir testes para cada serviço
  const serviceTests: ServiceTest[] = [
    {
      name: 'Autenticação',
      icon: Users,
      tests: [
        {
          method: 'isAuthenticated',
          description: 'Verificar se usuário está autenticado',
          testFn: async () => {
            const isAuth = authService.isAuthenticated()
            return { isAuthenticated: isAuth }
          }
        },
        {
          method: 'getUserDisplayInfo',
          description: 'Obter informações de exibição do usuário',
          testFn: async () => {
            const userInfo = authService.getUserDisplayInfo()
            return { userDisplayInfo: userInfo }
          }
        }
      ]
    },
    {
      name: 'Funcionários',
      icon: Users,
      tests: [
        {
          method: 'validateEmployeeData',
          description: 'Validar dados de funcionário',
          testFn: async () => {
            const mockEmployee = {
              nome: 'João Silva',
              email: 'joao@example.com',
              cpf: '123.456.789-00',
              telefone: '(11) 99999-9999',
              cargo: 'Desenvolvedor',
              departamento: 'TI',
              salario: 5000,
              data_admissao: new Date()
            }
            return employeesService.validateEmployeeData(mockEmployee)
          }
        },
        {
          method: 'formatEmployeeForDisplay',
          description: 'Formatar dados para exibição',
          testFn: async () => {
            const mockEmployee = {
              id: '1',
              nome: 'João Silva',
              email: 'joao@example.com',
              cpf: '12345678900',
              telefone: '11999999999',
              cargo: 'Desenvolvedor',
              departamento: 'TI',
              salario: 5000,
              data_admissao: new Date(),
              status: 'ativo' as const,
              created_at: new Date(),
              updated_at: new Date()
            }
            return employeesService.formatEmployeeForDisplay(mockEmployee)
          }
        }
      ]
    },
    {
      name: 'Tarefas',
      icon: ClipboardList,
      tests: [
        {
          method: 'validateTaskData',
          description: 'Validar dados de tarefa',
          testFn: async () => {
            const mockTask = {
              titulo: 'Tarefa de Teste',
              descricao: 'Descrição da tarefa de teste',
              prioridade: 'media' as const,
              data_vencimento: new Date(),
              responsavel_id: '1'
            }
            return tasksService.validateTaskData(mockTask)
          }
        },
        {
          method: 'formatTaskForDisplay',
          description: 'Formatar tarefa para exibição',
          testFn: async () => {
            const mockTask = {
              id: '1',
              titulo: 'Tarefa de Teste',
              descricao: 'Descrição da tarefa',
              status: 'pendente' as const,
              prioridade: 'alta' as const,
              data_vencimento: new Date(),
              responsavel_id: '1',
              criado_por: '1',
              created_at: new Date(),
              updated_at: new Date()
            }
            return tasksService.formatTaskForDisplay(mockTask)
          }
        }
      ]
    },
    {
      name: 'Leads',
      icon: Target,
      tests: [
        {
          method: 'validateLeadData',
          description: 'Validar dados de lead',
          testFn: async () => {
            const mockLead = {
              nome: 'Lead Teste',
              email: 'lead@example.com',
              telefone: '(11) 99999-9999',
              empresa: 'Empresa Teste',
              origem: 'website' as const
            }
            return leadsService.validateLeadData(mockLead)
          }
        },
        {
          method: 'formatLeadForDisplay',
          description: 'Formatar lead para exibição',
          testFn: async () => {
            const mockLead = {
              id: '1',
              nome: 'Lead Teste',
              email: 'lead@example.com',
              telefone: '11999999999',
              empresa: 'Empresa Teste',
              origem: 'website' as const,
              status: 'novo' as const,
              valor_estimado: 10000,
              created_at: new Date(),
              updated_at: new Date()
            }
            return leadsService.formatLeadForDisplay(mockLead)
          }
        }
      ]
    },
    {
      name: 'Notificações',
      icon: Bell,
      tests: [
        {
          method: 'validateNotificationData',
          description: 'Validar dados de notificação',
          testFn: async () => {
            const mockNotification = {
              titulo: 'Notificação Teste',
              mensagem: 'Mensagem de teste',
              tipo: 'info' as const,
              usuario_id: '1'
            }
            return notificationsService.validateNotificationData(mockNotification)
          }
        },
        {
          method: 'formatNotificationForDisplay',
          description: 'Formatar notificação para exibição',
          testFn: async () => {
            const mockNotification = {
              id: '1',
              user_id: '1',
              titulo: 'Notificação Teste',
              mensagem: 'Mensagem de teste',
              tipo: 'success' as const,
              categoria: 'geral' as const,
              prioridade: 'media' as const,
              lida: false,
              created_at: new Date(),
              updated_at: new Date()
            }
            return notificationsService.formatNotificationForDisplay(mockNotification)
          }
        }
      ]
    },
    {
      name: 'Despesas',
      icon: DollarSign,
      tests: [
        {
          method: 'validateExpenseData',
          description: 'Validar dados de despesa',
          testFn: async () => {
            const mockExpense = {
              descricao: 'Despesa Teste',
              valor: 100.50,
              data_vencimento: new Date(),
              categoria_id: '1',
              tipo: 'fixa' as const
            }
            return expensesService.validateExpenseData(mockExpense)
          }
        },
        {
          method: 'formatExpenseForDisplay',
          description: 'Formatar despesa para exibição',
          testFn: async () => {
            const mockExpense = {
              id: '1',
              descricao: 'Despesa Teste',
              valor: 100.50,
              data_vencimento: new Date(),
              status: 'pendente' as const,
              tipo: 'fixa' as const,
              categoria_id: '1',
              recorrente: false,
              created_at: new Date(),
              updated_at: new Date()
            }
            return expensesService.formatExpenseForDisplay(mockExpense)
          }
        }
      ]
    }
  ]

  // Executar teste individual
  const runTest = async (serviceName: string, test: any): Promise<TestResult> => {
    const startTime = Date.now()
    
    try {
      setCurrentTest(`${serviceName} - ${test.method}`)
      
      const result = await test.testFn()
      const duration = Date.now() - startTime
      
      return {
        service: serviceName,
        method: test.method,
        status: 'success',
        message: `✓ ${test.description} - Sucesso`,
        duration
      }
    } catch (error) {
      const duration = Date.now() - startTime
      
      return {
        service: serviceName,
        method: test.method,
        status: 'error',
        message: `✗ ${test.description} - ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        duration
      }
    }
  }

  // Executar todos os testes
  const runAllTests = async () => {
    setIsRunning(true)
    setResults([])
    setCurrentTest('')

    const allResults: TestResult[] = []

    for (const serviceTest of serviceTests) {
      for (const test of serviceTest.tests) {
        const result = await runTest(serviceTest.name, test)
        allResults.push(result)
        setResults([...allResults])
        
        // Pequena pausa entre testes
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    setCurrentTest('')
    setIsRunning(false)
  }

  // Calcular estatísticas
  const stats = {
    total: results.length,
    success: results.filter(r => r.status === 'success').length,
    error: results.filter(r => r.status === 'error').length,
    avgDuration: results.length > 0 
      ? Math.round(results.reduce((acc, r) => acc + (r.duration || 0), 0) / results.length)
      : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Teste de Integração dos Serviços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Testa a integração dos novos serviços com os componentes existentes
            </div>
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isRunning ? 'Executando...' : 'Executar Testes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status atual */}
      {isRunning && currentTest && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span>Executando: {currentTest}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600">Total de Testes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.success}</div>
              <div className="text-sm text-gray-600">Sucessos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{stats.error}</div>
              <div className="text-sm text-gray-600">Erros</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.avgDuration}ms</div>
              <div className="text-sm text-gray-600">Tempo Médio</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resultados dos testes */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {serviceTests.map((serviceTest) => {
                const serviceResults = results.filter(r => r.service === serviceTest.name)
                if (serviceResults.length === 0) return null

                const Icon = serviceTest.icon
                const hasErrors = serviceResults.some(r => r.status === 'error')

                return (
                  <div key={serviceTest.name} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="h-5 w-5" />
                      <h3 className="font-medium">{serviceTest.name}</h3>
                      <Badge variant={hasErrors ? 'destructive' : 'default'}>
                        {serviceResults.filter(r => r.status === 'success').length}/{serviceResults.length}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {serviceResults.map((result, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {result.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : result.status === 'error' ? (
                            <XCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          )}
                          <span className={result.status === 'error' ? 'text-red-600' : ''}>
                            {result.message}
                          </span>
                          {result.duration && (
                            <span className="text-gray-500 ml-auto">
                              {result.duration}ms
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Instruções
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Este teste verifica se os novos serviços estão funcionando corretamente</p>
            <p>• Testa métodos de validação e formatação de dados</p>
            <p>• Não faz chamadas reais para a API (usa dados mock)</p>
            <p>• Todos os testes devem passar para garantir a integração</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ServicesIntegrationTest