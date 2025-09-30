import React, { useState } from 'react'
import { FileText, Upload, Download, Trash2, Clock, User, Calendar, Plus, Search } from 'lucide-react'
import { usePermissions } from '../../hooks/usePermissions'

interface Document {
  id: string
  name: string
  type: string
  size: string
  uploadedBy: string
  uploadedAt: string
  category: 'contract' | 'policy' | 'procedure' | 'form' | 'other'
}

interface TimeEntry {
  id: string
  employeeId: string
  employeeName: string
  date: string
  clockIn: string
  clockOut?: string
  breakTime: number
  totalHours: number
  status: 'present' | 'absent' | 'late' | 'early_leave'
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Política de Segurança da Informação',
    type: 'PDF',
    size: '2.5 MB',
    uploadedBy: 'João Silva',
    uploadedAt: '2024-01-15',
    category: 'policy'
  },
  {
    id: '2',
    name: 'Contrato de Trabalho - Modelo',
    type: 'DOCX',
    size: '1.2 MB',
    uploadedBy: 'Maria Santos',
    uploadedAt: '2024-01-10',
    category: 'contract'
  },
  {
    id: '3',
    name: 'Procedimento de Onboarding',
    type: 'PDF',
    size: '3.1 MB',
    uploadedBy: 'Ana Oliveira',
    uploadedAt: '2024-01-08',
    category: 'procedure'
  }
]

const mockTimeEntries: TimeEntry[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'Pedro Costa',
    date: '2024-01-22',
    clockIn: '08:00',
    clockOut: '17:00',
    breakTime: 60,
    totalHours: 8,
    status: 'present'
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'Carlos Lima',
    date: '2024-01-22',
    clockIn: '08:15',
    clockOut: '17:15',
    breakTime: 60,
    totalHours: 8,
    status: 'late'
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: 'Lucia Ferreira',
    date: '2024-01-22',
    clockIn: '08:00',
    breakTime: 0,
    totalHours: 0,
    status: 'present'
  }
]

const categoryLabels = {
  contract: 'Contrato',
  policy: 'Política',
  procedure: 'Procedimento',
  form: 'Formulário',
  other: 'Outros'
}

const statusLabels = {
  present: 'Presente',
  absent: 'Ausente',
  late: 'Atrasado',
  early_leave: 'Saída Antecipada'
}

const statusColors = {
  present: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
  late: 'bg-yellow-100 text-yellow-800',
  early_leave: 'bg-orange-100 text-orange-800'
}

export const Administrative: React.FC = () => {
  const permissions = usePermissions()
  const [activeTab, setActiveTab] = useState<'documents' | 'attendance'>('documents')
  const [documents] = useState<Document[]>(mockDocuments)
  const [timeEntries] = useState<TimeEntry[]>(mockTimeEntries)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleUploadDocument = () => {
    // Implementar upload de documento
    console.log('Upload de documento')
  }

  const handleDownloadDocument = (doc: Document) => {
    // Implementar download de documento
    console.log('Download do documento:', doc.name)
  }

  const handleDeleteDocument = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      // Implementar exclusão de documento
      console.log('Excluindo documento:', id)
    }
  }

  if (!permissions.hasPermission('admin.docs.read') && !permissions.hasPermission('hr.attendance.read')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Acesso negado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Você não tem permissão para acessar esta seção.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administrativo</h1>
        <p className="text-gray-600">Gestão de documentos e controle de ponto</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {permissions.hasPermission('admin.docs.read') && (
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="inline-block w-4 h-4 mr-2" />
              Documentos
            </button>
          )}
          {permissions.hasPermission('hr.attendance.read') && (
            <button
              onClick={() => setActiveTab('attendance')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'attendance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Clock className="inline-block w-4 h-4 mr-2" />
              Ponto Interno
            </button>
          )}
        </nav>
      </div>

      {/* Documentos */}
      {activeTab === 'documents' && permissions.hasPermission('admin.docs.read') && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas as categorias</option>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            {permissions.hasPermission('admin.docs.upload') && (
              <button
                onClick={handleUploadDocument}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Upload size={20} />
                <span>Upload Documento</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tamanho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enviado por
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                          <div className="text-sm text-gray-500">{doc.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {categoryLabels[doc.category]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doc.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doc.uploadedBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleDownloadDocument(doc)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Download size={16} />
                        </button>
                        {permissions.hasPermission('admin.docs.delete') && (
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ponto Interno */}
      {activeTab === 'attendance' && permissions.hasPermission('hr.attendance.read') && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <input
                type="date"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue="2024-01-22"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Funcionário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entrada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saída
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Intervalo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-3" />
                        <div className="text-sm font-medium text-gray-900">{entry.employeeName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.clockIn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.clockOut || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.breakTime}min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.totalHours}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[entry.status]}`}>
                        {statusLabels[entry.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}