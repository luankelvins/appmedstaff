import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/UI/Card'
import { Button } from '../components/UI/Button'
import { Badge } from '../components/UI/Badge'
import { 
  getProjectInfo, 
  getTableColumns, 
  listDatabaseFunctions, 
  listTableIndexes,
  generateProjectReport,
  type ProjectInfo,
  type TableInfo,
  type ColumnInfo
} from '../utils/supabaseInspector'
import { Database, Table, FileText, Download, RefreshCw, Info } from 'lucide-react'

export default function SupabaseInspector() {
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [tableColumns, setTableColumns] = useState<ColumnInfo[]>([])
  const [functions, setFunctions] = useState<any[]>([])
  const [indexes, setIndexes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingColumns, setLoadingColumns] = useState(false)
  const [report, setReport] = useState<string>('')

  useEffect(() => {
    loadProjectData()
  }, [])

  const loadProjectData = async () => {
    setLoading(true)
    try {
      const [projectData, functionsData, indexesData] = await Promise.all([
        getProjectInfo(),
        listDatabaseFunctions(),
        listTableIndexes()
      ])
      
      setProjectInfo(projectData)
      setFunctions(functionsData)
      setIndexes(indexesData)
    } catch (error) {
      console.error('Erro ao carregar dados do projeto:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTableColumns = async (tableName: string) => {
    setLoadingColumns(true)
    setSelectedTable(tableName)
    try {
      const columns = await getTableColumns(tableName)
      setTableColumns(columns)
    } catch (error) {
      console.error(`Erro ao carregar colunas da tabela ${tableName}:`, error)
    } finally {
      setLoadingColumns(false)
    }
  }

  const generateReport = async () => {
    try {
      const reportContent = await generateProjectReport()
      setReport(reportContent)
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
    }
  }

  const downloadReport = () => {
    if (!report) return
    
    const blob = new Blob([report], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `supabase-project-report-${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Carregando informações do Supabase...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Inspetor do Supabase</h1>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadProjectData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={generateReport} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Gerar Relatório
          </Button>
          {report && (
            <Button onClick={downloadReport}>
              <Download className="h-4 w-4 mr-2" />
              Baixar Relatório
            </Button>
          )}
        </div>
      </div>

      {/* Informações do Projeto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>Informações do Projeto</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">URL do Projeto</label>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                {projectInfo?.project_url}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">ID do Projeto</label>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                {projectInfo?.project_id}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Total de Tabelas</label>
              <p className="text-2xl font-bold text-blue-600">
                {projectInfo?.total_tables}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tabelas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Table className="h-5 w-5" />
            <span>Tabelas do Banco de Dados</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectInfo?.tables.map((table) => (
              <Card 
                key={table.table_name} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTable === table.table_name ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => loadTableColumns(table.table_name)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{table.table_name}</h3>
                    <Badge variant="secondary">{table.table_type}</Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Schema: {table.table_schema}</p>
                    <p>Colunas: {table.column_count}</p>
                    <p>Registros: {table.row_count}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detalhes da Tabela Selecionada */}
      {selectedTable && (
        <Card>
          <CardHeader>
            <CardTitle>Estrutura da Tabela: {selectedTable}</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingColumns ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                <span>Carregando colunas...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Nome da Coluna</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Tipo de Dados</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Nullable</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Valor Padrão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableColumns.map((column, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-mono">
                          {column.column_name}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <Badge variant="outline">{column.data_type}</Badge>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <Badge variant={column.is_nullable === 'YES' ? 'secondary' : 'destructive'}>
                            {column.is_nullable === 'YES' ? 'Sim' : 'Não'}
                          </Badge>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 font-mono text-sm">
                          {column.column_default || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Funções do Banco */}
      {functions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Funções do Banco de Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {functions.map((func, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{func.routine_name}</h3>
                    <div className="flex space-x-2 mt-2">
                      <Badge variant="outline">{func.routine_type}</Badge>
                      <Badge variant="secondary">{func.data_type}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Índices das Tabelas */}
      {indexes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Índices das Tabelas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {indexes.map((index, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{index.tablename}</span>
                    <span className="text-gray-500 ml-2">{index.indexname}</span>
                  </div>
                  <Badge variant="outline">Índice</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relatório Gerado */}
      {report && (
        <Card>
          <CardHeader>
            <CardTitle>Relatório Completo</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
              {report}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}