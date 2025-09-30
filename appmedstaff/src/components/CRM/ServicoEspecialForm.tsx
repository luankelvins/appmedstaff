import React, { useState } from 'react'
import { ServicoEspecialForm as ServicoEspecialFormType } from '../../types/crm'
import { FileText, Upload, Calendar, DollarSign, User, Building, FileCheck } from 'lucide-react'

interface ServicoEspecialFormProps {
  onSubmit: (data: ServicoEspecialFormType) => void
  onCancel: () => void
}

export default function ServicoEspecialForm({ onSubmit, onCancel }: ServicoEspecialFormProps) {
  const [formData, setFormData] = useState<ServicoEspecialFormType>({
    tipoServico: 'auxilio_moradia',
    clienteId: '',
    clienteNome: '',
    clienteEmail: '',
    clienteTelefone: '',
    dadosEspecificos: {},
    documentos: [],
    status: 'iniciado',
    responsavelComercial: '',
    dataInicio: new Date().toISOString().split('T')[0],
    observacoes: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNestedInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof ServicoEspecialFormType] as Record<string, any>),
        [field]: value
      }
    }))
  }

  const handleDeepNestedInputChange = (section: string, subsection: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      dadosEspecificos: {
        ...prev.dadosEspecificos,
        [section]: {
          ...prev.dadosEspecificos[section as keyof typeof prev.dadosEspecificos],
          [subsection]: {
            ...(prev.dadosEspecificos[section as keyof typeof prev.dadosEspecificos] as any)?.[subsection],
            [field]: value
          }
        }
      }
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const renderServicoEspecifico = () => {
    switch (formData.tipoServico) {
      case 'auxilio_moradia':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Building className="h-5 w-5" />
              Auxílio Moradia - Residência Médica
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contrato de Residência
                </label>
                <input
                  type="text"
                  value={formData.dadosEspecificos.auxilioMoradia?.contratoResidencia || ''}
                  onChange={(e) => handleNestedInputChange('dadosEspecificos', 'auxilioMoradia', {
                    ...formData.dadosEspecificos.auxilioMoradia,
                    contratoResidencia: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Número do contrato de residência"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor do Aluguel (R$)
                </label>
                <input
                  type="number"
                  value={formData.dadosEspecificos.auxilioMoradia?.valorAluguel || ''}
                  onChange={(e) => handleNestedInputChange('dadosEspecificos', 'auxilioMoradia', {
                    ...formData.dadosEspecificos.auxilioMoradia,
                    valorAluguel: parseFloat(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Início da Residência
                </label>
                <input
                  type="date"
                  value={formData.dadosEspecificos.auxilioMoradia?.periodoResidencia?.inicio || ''}
                  onChange={(e) => handleDeepNestedInputChange('auxilioMoradia', 'periodoResidencia', 'inicio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fim da Residência
                </label>
                <input
                  type="date"
                  value={formData.dadosEspecificos.auxilioMoradia?.periodoResidencia?.fim || ''}
                  onChange={(e) => handleDeepNestedInputChange('auxilioMoradia', 'periodoResidencia', 'fim', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )

      case 'recuperacao_tributaria_pj':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Recuperação Tributária PJ
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ da Empresa
                </label>
                <input
                  type="text"
                  value={formData.dadosEspecificos.recuperacaoTributariaPJ?.cnpj || ''}
                  onChange={(e) => handleNestedInputChange('dadosEspecificos', 'recuperacaoTributariaPJ', {
                    ...formData.dadosEspecificos.recuperacaoTributariaPJ,
                    cnpj: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Estimado (R$)
                </label>
                <input
                  type="number"
                  value={formData.dadosEspecificos.recuperacaoTributariaPJ?.valorEstimado || ''}
                  onChange={(e) => handleNestedInputChange('dadosEspecificos', 'recuperacaoTributariaPJ', {
                    ...formData.dadosEspecificos.recuperacaoTributariaPJ,
                    valorEstimado: parseFloat(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Início do Período de Análise
                </label>
                <input
                  type="date"
                  value={formData.dadosEspecificos.recuperacaoTributariaPJ?.periodoAnalise?.inicio || ''}
                  onChange={(e) => handleDeepNestedInputChange('recuperacaoTributariaPJ', 'periodoAnalise', 'inicio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fim do Período de Análise
                </label>
                <input
                  type="date"
                  value={formData.dadosEspecificos.recuperacaoTributariaPJ?.periodoAnalise?.fim || ''}
                  onChange={(e) => handleDeepNestedInputChange('recuperacaoTributariaPJ', 'periodoAnalise', 'fim', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )

      case 'restituicao_previdenciaria_pf':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5" />
              Restituição Previdenciária PF
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  value={formData.dadosEspecificos.restituicaoPrevidenciariaPF?.cpf || ''}
                  onChange={(e) => handleNestedInputChange('dadosEspecificos', 'restituicaoPrevidenciariaPF', {
                    ...formData.dadosEspecificos.restituicaoPrevidenciariaPF,
                    cpf: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Contribuição
                </label>
                <select
                  value={formData.dadosEspecificos.restituicaoPrevidenciariaPF?.tipoContribuicao || ''}
                  onChange={(e) => handleNestedInputChange('dadosEspecificos', 'restituicaoPrevidenciariaPF', {
                    ...formData.dadosEspecificos.restituicaoPrevidenciariaPF,
                    tipoContribuicao: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione o tipo</option>
                  <option value="empregado">Empregado</option>
                  <option value="autonomo">Autônomo</option>
                  <option value="facultativo">Facultativo</option>
                  <option value="mei">MEI</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Início do Período de Contribuição
                </label>
                <input
                  type="date"
                  value={formData.dadosEspecificos.restituicaoPrevidenciariaPF?.periodoContribuicao?.inicio || ''}
                  onChange={(e) => handleDeepNestedInputChange('restituicaoPrevidenciariaPF', 'periodoContribuicao', 'inicio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fim do Período de Contribuição
                </label>
                <input
                  type="date"
                  value={formData.dadosEspecificos.restituicaoPrevidenciariaPF?.periodoContribuicao?.fim || ''}
                  onChange={(e) => handleDeepNestedInputChange('restituicaoPrevidenciariaPF', 'periodoContribuicao', 'fim', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Estimado (R$)
                </label>
                <input
                  type="number"
                  value={formData.dadosEspecificos.restituicaoPrevidenciariaPF?.valorEstimado || ''}
                  onChange={(e) => handleNestedInputChange('dadosEspecificos', 'restituicaoPrevidenciariaPF', {
                    ...formData.dadosEspecificos.restituicaoPrevidenciariaPF,
                    valorEstimado: parseFloat(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>
        )

      case 'alteracao_pj':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Alteração de PJ
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ da Empresa
                </label>
                <input
                  type="text"
                  value={formData.dadosEspecificos.alteracaoPJ?.cnpj || ''}
                  onChange={(e) => handleNestedInputChange('dadosEspecificos', 'alteracaoPJ', {
                    ...formData.dadosEspecificos.alteracaoPJ,
                    cnpj: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipos de Alteração
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Razão Social', 'Endereço', 'Atividade', 'Capital Social', 'Sócios', 'Administradores'].map((tipo) => (
                    <label key={tipo} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.dadosEspecificos.alteracaoPJ?.tipoAlteracao?.includes(tipo) || false}
                        onChange={(e) => {
                          const current = formData.dadosEspecificos.alteracaoPJ?.tipoAlteracao || []
                          const updated = e.target.checked 
                            ? [...current, tipo]
                            : current.filter(t => t !== tipo)
                          handleNestedInputChange('dadosEspecificos', 'alteracaoPJ', {
                            ...formData.dadosEspecificos.alteracaoPJ,
                            tipoAlteracao: updated
                          })
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{tipo}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Serviços Especiais</h2>
        <p className="text-gray-600">Cadastro de serviços especializados oferecidos pela MedStaff</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de Serviço */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Tipo de Serviço
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selecione o Serviço *
            </label>
            <select
              name="tipoServico"
              value={formData.tipoServico}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="auxilio_moradia">Auxílio Moradia (Residência Médica)</option>
              <option value="recuperacao_tributaria_pj">Recuperação Tributária PJ</option>
              <option value="restituicao_previdenciaria_pf">Restituição Previdenciária PF</option>
              <option value="alteracao_pj">Alteração de PJ</option>
            </select>
          </div>
        </div>

        {/* Dados do Cliente */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            Dados do Cliente
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID do Cliente
              </label>
              <input
                type="text"
                name="clienteId"
                value={formData.clienteId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ID do cliente no sistema"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Cliente *
              </label>
              <input
                type="text"
                name="clienteNome"
                value={formData.clienteNome}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail *
              </label>
              <input
                type="email"
                name="clienteEmail"
                value={formData.clienteEmail}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone *
              </label>
              <input
                type="tel"
                name="clienteTelefone"
                value={formData.clienteTelefone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
        </div>

        {/* Dados Específicos do Serviço */}
        <div className="bg-gray-50 p-4 rounded-lg">
          {renderServicoEspecifico()}
        </div>

        {/* Status e Responsáveis */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Status e Responsáveis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="iniciado">Iniciado</option>
                <option value="documentacao">Documentação</option>
                <option value="analise">Análise</option>
                <option value="execucao">Execução</option>
                <option value="concluido">Concluído</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsável Comercial *
              </label>
              <input
                type="text"
                name="responsavelComercial"
                value={formData.responsavelComercial}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome do responsável comercial"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsável Operacional
              </label>
              <input
                type="text"
                name="responsavelOperacional"
                value={formData.responsavelOperacional || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome do responsável operacional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Início *
              </label>
              <input
                type="date"
                name="dataInicio"
                value={formData.dataInicio}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Previsão de Conclusão
              </label>
              <input
                type="date"
                name="previsaoConclusao"
                value={formData.previsaoConclusao || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Observações
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações Gerais
            </label>
            <textarea
              name="observacoes"
              value={formData.observacoes || ''}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Observações sobre o serviço..."
            />
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Salvar Serviço
          </button>
        </div>
      </form>
    </div>
  )
}