import React, { useState } from 'react'
import { 
  User, 
  Users, 
  FileText, 
  DollarSign, 
  Home, 
  CreditCard,
  Plus,
  Trash2,
  Save,
  X,
  Upload,
  Calendar
} from 'lucide-react'
import { IRPFForm as IRPFFormType } from '../../types/crm'

interface IRPFFormProps {
  onSubmit: (data: IRPFFormType) => void
  onCancel: () => void
  initialData?: Partial<IRPFFormType>
}

const IRPFForm: React.FC<IRPFFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState<IRPFFormType>({
    dadosPessoais: {
      nome: '',
      cpf: '',
      dataNascimento: '',
      telefone: '',
      email: '',
      endereco: {
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: ''
      }
    },
    dependentes: [],
    informesRendimentos: [],
    bensEDireitos: [],
    dividasEOnus: [],
    pagamentosEfetuados: {
      saude: 0,
      educacao: 0,
      doacoes: 0,
      previdenciaPrivada: 0
    },
    contaRestituicao: {
      banco: '',
      agencia: '',
      conta: '',
      tipoConta: 'corrente'
    },
    documentos: [],
    status: 'rascunho',
    anoExercicio: new Date().getFullYear(),
    responsavel: '',
    observacoes: '',
    ...initialData
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => {
      const sectionData = prev[section as keyof IRPFFormType] as any
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: value
        }
      }
    })
  }

  const handleDeepNestedInputChange = (section: string, subsection: string, field: string, value: any) => {
    setFormData(prev => {
      const sectionData = prev[section as keyof IRPFFormType] as any
      const subsectionData = sectionData[subsection] || {}
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [subsection]: {
            ...subsectionData,
            [field]: value
          }
        }
      }
    })
  }

  const addDependente = () => {
    setFormData(prev => ({
      ...prev,
      dependentes: [
        ...prev.dependentes,
        {
          nome: '',
          cpf: '',
          dataNascimento: '',
          grauParentesco: '',
          rendimentos: 0
        }
      ]
    }))
  }

  const removeDependente = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dependentes: prev.dependentes.filter((_, i) => i !== index)
    }))
  }

  const updateDependente = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      dependentes: prev.dependentes.map((dep, i) => 
        i === index ? { ...dep, [field]: value } : dep
      )
    }))
  }

  const addInformeRendimento = () => {
    setFormData(prev => ({
      ...prev,
      informesRendimentos: [
        ...prev.informesRendimentos,
        {
          fonte: '',
          cnpj: '',
          tipo: 'clt',
          valorTotal: 0,
          impostoRetido: 0,
          contribuicaoPrevidenciaria: 0
        }
      ]
    }))
  }

  const removeInformeRendimento = (index: number) => {
    setFormData(prev => ({
      ...prev,
      informesRendimentos: prev.informesRendimentos.filter((_, i) => i !== index)
    }))
  }

  const updateInformeRendimento = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      informesRendimentos: prev.informesRendimentos.map((informe, i) => 
        i === index ? { ...informe, [field]: value } : informe
      )
    }))
  }

  const addBemDireito = () => {
    setFormData(prev => ({
      ...prev,
      bensEDireitos: [
        ...prev.bensEDireitos,
        {
          codigo: '',
          descricao: '',
          valorAnterior: 0,
          valorAtual: 0
        }
      ]
    }))
  }

  const removeBemDireito = (index: number) => {
    setFormData(prev => ({
      ...prev,
      bensEDireitos: prev.bensEDireitos.filter((_, i) => i !== index)
    }))
  }

  const updateBemDireito = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      bensEDireitos: prev.bensEDireitos.map((bem, i) => 
        i === index ? { ...bem, [field]: value } : bem
      )
    }))
  }

  const addDividaOnus = () => {
    setFormData(prev => ({
      ...prev,
      dividasEOnus: [
        ...prev.dividasEOnus,
        {
          descricao: '',
          valor: 0
        }
      ]
    }))
  }

  const removeDividaOnus = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dividasEOnus: prev.dividasEOnus.filter((_, i) => i !== index)
    }))
  }

  const updateDividaOnus = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      dividasEOnus: prev.dividasEOnus.map((divida, i) => 
        i === index ? { ...divida, [field]: value } : divida
      )
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              Declaração de IRPF
            </h1>
            <p className="text-gray-600 mt-1">
              Formulário para coleta de dados para declaração de Imposto de Renda
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
            <button
              type="submit"
              form="irpf-form"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Salvar
            </button>
          </div>
        </div>
      </div>

      <form id="irpf-form" onSubmit={handleSubmit} className="space-y-8">
        {/* Dados Pessoais */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Dados Pessoais
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.dadosPessoais.nome}
                onChange={(e) => handleDeepNestedInputChange('dadosPessoais', '', 'nome', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF *
              </label>
              <input
                type="text"
                value={formData.dadosPessoais.cpf}
                onChange={(e) => handleDeepNestedInputChange('dadosPessoais', '', 'cpf', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="000.000.000-00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Nascimento *
              </label>
              <input
                type="date"
                value={formData.dadosPessoais.dataNascimento}
                onChange={(e) => handleDeepNestedInputChange('dadosPessoais', '', 'dataNascimento', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                value={formData.dadosPessoais.telefone}
                onChange={(e) => handleDeepNestedInputChange('dadosPessoais', '', 'telefone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                value={formData.dadosPessoais.email}
                onChange={(e) => handleDeepNestedInputChange('dadosPessoais', '', 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ano Exercício *
              </label>
              <input
                type="number"
                value={formData.anoExercicio}
                onChange={(e) => handleInputChange('anoExercicio', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="2020"
                max="2030"
                required
              />
            </div>
          </div>

          {/* Endereço */}
          <h3 className="text-md font-medium text-gray-900 mt-6 mb-3">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
              <input
                type="text"
                value={formData.dadosPessoais.endereco.cep}
                onChange={(e) => handleDeepNestedInputChange('dadosPessoais', 'endereco', 'cep', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="00000-000"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Logradouro</label>
              <input
                type="text"
                value={formData.dadosPessoais.endereco.logradouro}
                onChange={(e) => handleDeepNestedInputChange('dadosPessoais', 'endereco', 'logradouro', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
              <input
                type="text"
                value={formData.dadosPessoais.endereco.numero}
                onChange={(e) => handleDeepNestedInputChange('dadosPessoais', 'endereco', 'numero', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
              <input
                type="text"
                value={formData.dadosPessoais.endereco.complemento}
                onChange={(e) => handleDeepNestedInputChange('dadosPessoais', 'endereco', 'complemento', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
              <input
                type="text"
                value={formData.dadosPessoais.endereco.bairro}
                onChange={(e) => handleDeepNestedInputChange('dadosPessoais', 'endereco', 'bairro', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <input
                type="text"
                value={formData.dadosPessoais.endereco.cidade}
                onChange={(e) => handleDeepNestedInputChange('dadosPessoais', 'endereco', 'cidade', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={formData.dadosPessoais.endereco.estado}
                onChange={(e) => handleDeepNestedInputChange('dadosPessoais', 'endereco', 'estado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione</option>
                <option value="SP">São Paulo</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="MG">Minas Gerais</option>
                {/* Adicionar outros estados */}
              </select>
            </div>
          </div>
        </div>

        {/* Dependentes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Dependentes
            </h2>
            <button
              type="button"
              onClick={addDependente}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              Adicionar Dependente
            </button>
          </div>

          {formData.dependentes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum dependente cadastrado</p>
          ) : (
            <div className="space-y-4">
              {formData.dependentes.map((dependente, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Dependente {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeDependente(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                      <input
                        type="text"
                        value={dependente.nome}
                        onChange={(e) => updateDependente(index, 'nome', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                      <input
                        type="text"
                        value={dependente.cpf}
                        onChange={(e) => updateDependente(index, 'cpf', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="000.000.000-00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data Nascimento</label>
                      <input
                        type="date"
                        value={dependente.dataNascimento}
                        onChange={(e) => updateDependente(index, 'dataNascimento', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Grau Parentesco</label>
                      <select
                        value={dependente.grauParentesco}
                        onChange={(e) => updateDependente(index, 'grauParentesco', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Selecione</option>
                        <option value="filho">Filho(a)</option>
                        <option value="conjuge">Cônjuge</option>
                        <option value="pai">Pai</option>
                        <option value="mae">Mãe</option>
                        <option value="outros">Outros</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informes de Rendimentos */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Informes de Rendimentos
            </h2>
            <button
              type="button"
              onClick={addInformeRendimento}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              Adicionar Informe
            </button>
          </div>

          {formData.informesRendimentos.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum informe de rendimento cadastrado</p>
          ) : (
            <div className="space-y-4">
              {formData.informesRendimentos.map((informe, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Informe {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeInformeRendimento(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fonte Pagadora</label>
                      <input
                        type="text"
                        value={informe.fonte}
                        onChange={(e) => updateInformeRendimento(index, 'fonte', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                      <input
                        type="text"
                        value={informe.cnpj}
                        onChange={(e) => updateInformeRendimento(index, 'cnpj', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="00.000.000/0000-00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                      <select
                        value={informe.tipo}
                        onChange={(e) => updateInformeRendimento(index, 'tipo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="clt">CLT</option>
                        <option value="autonomo">Autônomo</option>
                        <option value="previdencia_privada">Previdência Privada</option>
                        <option value="outros">Outros</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={informe.valorTotal}
                        onChange={(e) => updateInformeRendimento(index, 'valorTotal', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Imposto Retido (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={informe.impostoRetido}
                        onChange={(e) => updateInformeRendimento(index, 'impostoRetido', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contribuição Previdenciária (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={informe.contribuicaoPrevidenciaria || 0}
                        onChange={(e) => updateInformeRendimento(index, 'contribuicaoPrevidenciaria', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bens e Direitos */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Home className="h-5 w-5 text-blue-600" />
              Bens e Direitos
            </h2>
            <button
              type="button"
              onClick={addBemDireito}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              Adicionar Bem
            </button>
          </div>

          {formData.bensEDireitos.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum bem ou direito cadastrado</p>
          ) : (
            <div className="space-y-4">
              {formData.bensEDireitos.map((bem, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Bem {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeBemDireito(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                      <input
                        type="text"
                        value={bem.codigo}
                        onChange={(e) => updateBemDireito(index, 'codigo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <input
                        type="text"
                        value={bem.descricao}
                        onChange={(e) => updateBemDireito(index, 'descricao', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valor Anterior (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={bem.valorAnterior}
                        onChange={(e) => updateBemDireito(index, 'valorAnterior', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valor Atual (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={bem.valorAtual}
                        onChange={(e) => updateBemDireito(index, 'valorAtual', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagamentos Efetuados */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Pagamentos Efetuados
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Saúde (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.pagamentosEfetuados.saude}
                onChange={(e) => handleNestedInputChange('pagamentosEfetuados', 'saude', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Educação (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.pagamentosEfetuados.educacao}
                onChange={(e) => handleNestedInputChange('pagamentosEfetuados', 'educacao', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doações (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.pagamentosEfetuados.doacoes}
                onChange={(e) => handleNestedInputChange('pagamentosEfetuados', 'doacoes', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Previdência Privada (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.pagamentosEfetuados.previdenciaPrivada}
                onChange={(e) => handleNestedInputChange('pagamentosEfetuados', 'previdenciaPrivada', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Conta para Restituição */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Conta para Restituição
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
              <input
                type="text"
                value={formData.contaRestituicao.banco}
                onChange={(e) => handleNestedInputChange('contaRestituicao', 'banco', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agência</label>
              <input
                type="text"
                value={formData.contaRestituicao.agencia}
                onChange={(e) => handleNestedInputChange('contaRestituicao', 'agencia', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conta</label>
              <input
                type="text"
                value={formData.contaRestituicao.conta}
                onChange={(e) => handleNestedInputChange('contaRestituicao', 'conta', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Conta</label>
              <select
                value={formData.contaRestituicao.tipoConta}
                onChange={(e) => handleNestedInputChange('contaRestituicao', 'tipoConta', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="corrente">Corrente</option>
                <option value="poupanca">Poupança</option>
              </select>
            </div>
          </div>
        </div>

        {/* Informações Gerais */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Gerais</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="rascunho">Rascunho</option>
                <option value="em_analise">Em Análise</option>
                <option value="entregue">Entregue</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
              <input
                type="text"
                value={formData.responsavel}
                onChange={(e) => handleInputChange('responsavel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              value={formData.observacoes || ''}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Observações adicionais sobre a declaração..."
            />
          </div>
        </div>
      </form>
    </div>
  )
}

export default IRPFForm