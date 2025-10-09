import React, { useState } from 'react'
import { PipelineForm as PipelineFormType } from '../../types/crm'

interface PipelineFormProps {
  initialData?: Partial<PipelineFormType>
  onSubmit: (data: PipelineFormType) => void
  onCancel: () => void
}

const PipelineForm: React.FC<PipelineFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<PipelineFormType>({
    id: initialData?.id || '',
    tipo: initialData?.tipo || 'captacao',
    leadId: initialData?.leadId || '',
    clienteId: initialData?.clienteId || '',
    nomeCliente: initialData?.nomeCliente || '',
    emailCliente: initialData?.emailCliente || '',
    telefoneCliente: initialData?.telefoneCliente || '',
    servicosInteresse: initialData?.servicosInteresse || [],
    estagio: initialData?.estagio || 'captacao',
    propostaComercial: initialData?.propostaComercial || {
      valorProposto: 0,
      prazoExecucao: '',
      condicoesPagamento: '',
      observacoes: ''
    },
    documentos: initialData?.documentos || [],
    proximaAcao: initialData?.proximaAcao || '',
    dataProximaAcao: initialData?.dataProximaAcao || '',
    responsavel: initialData?.responsavel || '',
    historico: initialData?.historico || [],
    status: initialData?.status || 'ativo',
    motivoPerdido: initialData?.motivoPerdido || '',
    observacoes: initialData?.observacoes || ''
  })

  const [activeTab, setActiveTab] = useState('identificacao')

  const handleInputChange = (field: keyof PipelineFormType, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof PipelineFormType] as Record<string, any>),
        [field]: value
      }
    }))
  }

  const handleServicosChange = (servico: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      servicosInteresse: checked 
        ? [...prev.servicosInteresse, servico]
        : prev.servicosInteresse.filter(s => s !== servico)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const servicosDisponiveis = [
    'Gestão PJ',
    'Abertura de Empresa',
    'Alteração PJ',
    'Declaração IRPF',
    'Recuperação Tributária PJ',
    'Restituição Previdenciária PF',
    'Auxílio Moradia Residência',
    'Consultoria Financeira PF',
    'Med Benefícios',
    'Consultoria Abertura Clínicas'
  ]

  const estagiosDisponiveis = [
    { value: 'captacao', label: 'Captação' },
    { value: 'qualificacao', label: 'Qualificação' },
    { value: 'proposta', label: 'Proposta' },
    { value: 'negociacao', label: 'Negociação' },
    { value: 'fechamento', label: 'Fechamento' },
    { value: 'execucao', label: 'Execução' },
    { value: 'encerramento', label: 'Encerramento' }
  ]

  const tabs = [
    { id: 'identificacao', label: 'Identificação' },
    { id: 'servicos', label: 'Serviços' },
    { id: 'proposta', label: 'Proposta' },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'documentos', label: 'Documentos' }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pipeline de Captação</h2>
        <p className="text-gray-600">Gerencie o pipeline comercial e captação de leads</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-medstaff-primary text-medstaff-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identificação */}
        {activeTab === 'identificacao' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Pipeline *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => handleInputChange('tipo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="captacao">Captação</option>
                  <option value="proposta">Proposta</option>
                  <option value="contrato">Contrato</option>
                  <option value="execucao">Execução</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="ativo">Ativo</option>
                  <option value="pausado">Pausado</option>
                  <option value="ganho">Ganho</option>
                  <option value="perdido">Perdido</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID do Lead
                </label>
                <input
                  type="text"
                  value={formData.leadId || ''}
                  onChange={(e) => handleInputChange('leadId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ID do lead (se aplicável)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID do Cliente
                </label>
                <input
                  type="text"
                  value={formData.clienteId || ''}
                  onChange={(e) => handleInputChange('clienteId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ID do cliente (se aplicável)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  value={formData.nomeCliente}
                  onChange={(e) => handleInputChange('nomeCliente', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Nome completo do cliente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email do Cliente *
                </label>
                <input
                  type="email"
                  value={formData.emailCliente}
                  onChange={(e) => handleInputChange('emailCliente', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone do Cliente *
                </label>
                <input
                  type="tel"
                  value={formData.telefoneCliente}
                  onChange={(e) => handleInputChange('telefoneCliente', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>
        )}

        {/* Serviços */}
        {activeTab === 'servicos' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Serviços de Interesse *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {servicosDisponiveis.map((servico) => (
                  <label key={servico} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.servicosInteresse.includes(servico)}
                      onChange={(e) => handleServicosChange(servico, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{servico}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Proposta */}
        {activeTab === 'proposta' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Proposto (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.propostaComercial?.valorProposto || ''}
                  onChange={(e) => handleNestedInputChange('propostaComercial', 'valorProposto', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prazo de Execução
                </label>
                <input
                  type="text"
                  value={formData.propostaComercial?.prazoExecucao || ''}
                  onChange={(e) => handleNestedInputChange('propostaComercial', 'prazoExecucao', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 30 dias"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condições de Pagamento
              </label>
              <textarea
                value={formData.propostaComercial?.condicoesPagamento || ''}
                onChange={(e) => handleNestedInputChange('propostaComercial', 'condicoesPagamento', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descreva as condições de pagamento..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações da Proposta
              </label>
              <textarea
                value={formData.propostaComercial?.observacoes || ''}
                onChange={(e) => handleNestedInputChange('propostaComercial', 'observacoes', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Observações adicionais sobre a proposta..."
              />
            </div>
          </div>
        )}

        {/* Pipeline */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estágio do Pipeline *
                </label>
                <select
                  value={formData.estagio}
                  onChange={(e) => handleInputChange('estagio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {estagiosDisponiveis.map((estagio) => (
                    <option key={estagio.value} value={estagio.value}>
                      {estagio.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsável *
                </label>
                <input
                  type="text"
                  value={formData.responsavel}
                  onChange={(e) => handleInputChange('responsavel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Nome do responsável"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Próxima Ação *
                </label>
                <input
                  type="text"
                  value={formData.proximaAcao}
                  onChange={(e) => handleInputChange('proximaAcao', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Descreva a próxima ação"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data da Próxima Ação *
                </label>
                <input
                  type="date"
                  value={formData.dataProximaAcao}
                  onChange={(e) => handleInputChange('dataProximaAcao', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {formData.status === 'perdido' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo da Perda
                </label>
                <textarea
                  value={formData.motivoPerdido || ''}
                  onChange={(e) => handleInputChange('motivoPerdido', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descreva o motivo da perda..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações Gerais
              </label>
              <textarea
                value={formData.observacoes || ''}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Observações gerais sobre o pipeline..."
              />
            </div>
          </div>
        )}

        {/* Documentos */}
        {activeTab === 'documentos' && (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="space-y-2">
                <p className="text-gray-600 mb-4">
                  Arraste e solte os documentos aqui ou clique para selecionar
                </p>
                <button
                  type="button"
                  className="px-4 py-2 bg-medstaff-primary text-white rounded-lg hover:bg-medstaff-primary/90"
                >
                  Selecionar Documentos
                </button>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-4">Documentos Necessários:</h4>
                <ul className="space-y-2 text-sm text-gray-600 text-left max-w-md mx-auto">
                  <li>• Proposta comercial</li>
                  <li>• Documentos do cliente</li>
                  <li>• Contratos assinados</li>
                  <li>• Comprovantes de pagamento</li>
                  <li>• Documentos específicos do serviço</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-medstaff-primary text-white rounded-lg hover:bg-medstaff-primary/90"
          >
            Salvar Pipeline
          </button>
        </div>
      </form>
    </div>
  )
}

export default PipelineForm