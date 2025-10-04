import React, { useState } from 'react'
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react'
import ClientePFForm from '../../components/CRM/ClientePFForm'
import { ClientePFForm as ClientePFFormType } from '../../types/crm'

export default function ClientePFPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientePFFormType | null>(null)
  const [clients, setClients] = useState<ClientePFFormType[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const handleCreateClient = () => {
    setEditingClient(null)
    setShowForm(true)
  }

  const handleEditClient = (client: ClientePFFormType) => {
    setEditingClient(client)
    setShowForm(true)
  }

  const handleSubmit = (data: ClientePFFormType) => {
    if (editingClient) {
      // Atualizar cliente existente
      setClients(prev => prev.map(client => 
        client.id === editingClient.id ? { ...data, id: editingClient.id } : client
      ))
    } else {
      // Criar novo cliente
      const newClient = {
        ...data,
        id: Date.now().toString(),
        numeroCliente: `PF${Date.now()}`,
        dataCadastro: new Date().toISOString().split('T')[0],
        dataUltimaAtualizacao: new Date().toISOString().split('T')[0]
      }
      setClients(prev => [...prev, newClient])
    }
    
    setShowForm(false)
    setEditingClient(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingClient(null)
  }

  const handleDeleteClient = (clientId: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      setClients(prev => prev.filter(client => client.id !== clientId))
    }
  }

  const filteredClients = clients.filter(client =>
    client.dadosPessoais.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.dadosPessoais.cpf.includes(searchTerm) ||
    client.dadosPessoais.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (showForm) {
    return (
      <ClientePFForm
        initialData={editingClient || undefined}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEditing={!!editingClient}
      />
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clientes Pessoa Física</h1>
            <p className="text-gray-600">Gerencie os clientes pessoa física</p>
          </div>
          <button
            onClick={handleCreateClient}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente PF
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-blue-600">{clients.length}</div>
          <div className="text-sm text-gray-600">Total de Clientes</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-green-600">
            {clients.filter(c => c.status === 'ativo').length}
          </div>
          <div className="text-sm text-gray-600">Clientes Ativos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-yellow-600">
            {clients.filter(c => c.status === 'suspenso').length}
          </div>
          <div className="text-sm text-gray-600">Clientes Suspensos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-red-600">
            {clients.filter(c => c.status === 'inativo').length}
          </div>
          <div className="text-sm text-gray-600">Clientes Inativos</div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Lista de Clientes</h2>
        </div>

        {filteredClients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {clients.length === 0 ? (
              <div>
                <div className="text-4xl mb-4">👥</div>
                <p className="text-lg mb-2">Nenhum cliente cadastrado</p>
                <p className="text-sm">Clique em "Novo Cliente PF" para começar</p>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-lg mb-2">Nenhum cliente encontrado</p>
                <p className="text-sm">Tente ajustar os termos de busca</p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPF
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsável
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {client.dadosPessoais.nome}
                        </div>
                        <div className="text-sm text-gray-500">
                          {client.dadosPessoais.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.dadosPessoais.cpf}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.dadosPessoais.telefone}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`
                        inline-flex px-2 py-1 text-xs font-semibold rounded-full
                        ${client.status === 'ativo' ? 'bg-green-100 text-green-800' :
                          client.status === 'suspenso' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}
                      `}>
                        {client.status === 'ativo' ? 'Ativo' :
                         client.status === 'suspenso' ? 'Suspenso' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.responsavelComercial}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClient(client)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => console.log('Visualizar cliente:', client)}
                          className="text-green-600 hover:text-green-900"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id!)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}