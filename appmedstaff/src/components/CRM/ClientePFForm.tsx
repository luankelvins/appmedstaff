import React, { useState } from 'react'
import { 
  User, 
  FileText, 
  Building2, 
  CreditCard, 
  Upload, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Shield,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react'
import { ClientePFForm as ClientePFFormType } from '../../types/crm'

interface ClientePFFormProps {
  onSubmit: (data: ClientePFFormType) => void
  onCancel: () => void
  initialData?: Partial<ClientePFFormType>
}

const ClientePFForm: React.FC<ClientePFFormProps> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  const [formData, setFormData] = useState<ClientePFFormType>({
    // Informações Pessoais
    nome: initialData?.nome || '',
    cpf: initialData?.cpf || '',
    rg: initialData?.rg || '',
    dataNascimento: initialData?.dataNascimento || '',
    estadoCivil: initialData?.estadoCivil || 'solteiro',
    telefone: initialData?.telefone || '',
    email: initialData?.email || '',
    
    // Endereço
    endereco: {
      cep: initialData?.endereco?.cep || '',
      logradouro: initialData?.endereco?.logradouro || '',
      numero: initialData?.endereco?.numero || '',
      complemento: initialData?.endereco?.complemento || '',
      bairro: initialData?.endereco?.bairro || '',
      cidade: initialData?.endereco?.cidade || '',
      estado: initialData?.endereco?.estado || ''
    },
    
    // Dados Profissionais
    profissao: initialData?.profissao || '',
    conselhoClasse: initialData?.conselhoClasse || '',
    numeroConselho: initialData?.numeroConselho || '',
    
    // Dados Bancários
    dadosBancarios: {
      banco: initialData?.dadosBancarios?.banco || '',
      agencia: initialData?.dadosBancarios?.agencia || '',
      conta: initialData?.dadosBancarios?.conta || '',
      tipoConta: initialData?.dadosBancarios?.tipoConta || 'corrente',
      pix: initialData?.dadosBancarios?.pix || ''
    },
    
    // Certificado Digital
    certificadoDigital: {
      arquivo: initialData?.certificadoDigital?.arquivo || '',
      senha: initialData?.certificadoDigital?.senha || '',
      dataVencimento: initialData?.certificadoDigital?.dataVencimento || ''
    },
    
    // Controle
    responsavel: initialData?.responsavel || '',
    status: initialData?.status || 'ativo',
    observacoes: initialData?.observacoes || '',
    documentos: initialData?.documentos || [],
    vinculos: initialData?.vinculos || []
  })

  const [activeTab, setActiveTab] = useState('pessoais')

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof ClientePFFormType] as any),
        [field]: value
      }
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const addVinculo = () => {
    setFormData(prev => ({
      ...prev,
      vinculos: [
        ...prev.vinculos,
        {
          id: Date.now().toString(),
          tipo: 'pj' as const,
          empresa: '',
          cargo: '',
          dataInicio: '',
          dataFim: '',
          ativo: true
        }
      ]
    }))
  }

  const removeVinculo = (id: string) => {
    setFormData(prev => ({
      ...prev,
      vinculos: prev.vinculos.filter(v => v.id !== id)
    }))
  }

  const updateVinculo = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      vinculos: prev.vinculos.map((vinculo, i) => 
        i === index ? { ...vinculo, [field]: value } : vinculo
      )
    }))
  }

  const tabs = [
    { id: 'pessoais', label: 'Dados Pessoais', icon: <User className="h-4 w-4" /> },
    { id: 'profissionais', label: 'Dados Profissionais', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'bancarios', label: 'Dados Bancários', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'certificado', label: 'Certificado Digital', icon: <Shield className="h-4 w-4" /> },
    { id: 'vinculos', label: 'Vínculos', icon: <Building2 className="h-4 w-4" /> },
    { id: 'documentos', label: 'Documentos', icon: <FileText className="h-4 w-4" /> }
  ]

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {initialData ? 'Editar Cliente PF' : 'Novo Cliente PF'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Preencha os dados do cliente pessoa física
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-medstaff-primary text-medstaff-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6">
          {/* Dados Pessoais */}
          {activeTab === 'pessoais' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF *
                  </label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RG
                  </label>
                  <input
                    type="text"
                    value={formData.rg}
                    onChange={(e) => handleInputChange('rg', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={formData.dataNascimento}
                    onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado Civil
                  </label>
                  <select
                    value={formData.estadoCivil}
                    onChange={(e) => handleInputChange('estadoCivil', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                  >
                    <option value="solteiro">Solteiro(a)</option>
                    <option value="casado">Casado(a)</option>
                    <option value="divorciado">Divorciado(a)</option>
                    <option value="viuvo">Viúvo(a)</option>
                    <option value="uniao_estavel">União Estável</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsável *
                  </label>
                  <input
                    type="text"
                    value={formData.responsavel}
                    onChange={(e) => handleInputChange('responsavel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={formData.endereco.cep}
                      onChange={(e) => handleNestedInputChange('endereco', 'cep', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logradouro
                    </label>
                    <input
                      type="text"
                      value={formData.endereco.logradouro}
                      onChange={(e) => handleNestedInputChange('endereco', 'logradouro', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número
                    </label>
                    <input
                      type="text"
                      value={formData.endereco.numero}
                      onChange={(e) => handleNestedInputChange('endereco', 'numero', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complemento
                    </label>
                    <input
                      type="text"
                      value={formData.endereco.complemento}
                      onChange={(e) => handleNestedInputChange('endereco', 'complemento', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={formData.endereco.bairro}
                      onChange={(e) => handleNestedInputChange('endereco', 'bairro', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.endereco.cidade}
                      onChange={(e) => handleNestedInputChange('endereco', 'cidade', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      value={formData.endereco.estado}
                      onChange={(e) => handleNestedInputChange('endereco', 'estado', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                    >
                      <option value="">Selecione...</option>
                      <option value="AC">Acre</option>
                      <option value="AL">Alagoas</option>
                      <option value="AP">Amapá</option>
                      <option value="AM">Amazonas</option>
                      <option value="BA">Bahia</option>
                      <option value="CE">Ceará</option>
                      <option value="DF">Distrito Federal</option>
                      <option value="ES">Espírito Santo</option>
                      <option value="GO">Goiás</option>
                      <option value="MA">Maranhão</option>
                      <option value="MT">Mato Grosso</option>
                      <option value="MS">Mato Grosso do Sul</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="PA">Pará</option>
                      <option value="PB">Paraíba</option>
                      <option value="PR">Paraná</option>
                      <option value="PE">Pernambuco</option>
                      <option value="PI">Piauí</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="RN">Rio Grande do Norte</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="RO">Rondônia</option>
                      <option value="RR">Roraima</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="SP">São Paulo</option>
                      <option value="SE">Sergipe</option>
                      <option value="TO">Tocantins</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dados Profissionais */}
          {activeTab === 'profissionais' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profissão
                  </label>
                  <input
                    type="text"
                    value={formData.profissao}
                    onChange={(e) => handleInputChange('profissao', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conselho de Classe
                  </label>
                  <select
                    value={formData.conselhoClasse}
                    onChange={(e) => handleInputChange('conselhoClasse', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
                    <option value="CRM">CRM - Conselho Regional de Medicina</option>
                    <option value="CRO">CRO - Conselho Regional de Odontologia</option>
                    <option value="COREN">COREN - Conselho Regional de Enfermagem</option>
                    <option value="CRF">CRF - Conselho Regional de Farmácia</option>
                    <option value="CREFITO">CREFITO - Conselho Regional de Fisioterapia</option>
                    <option value="CRP">CRP - Conselho Regional de Psicologia</option>
                    <option value="CRN">CRN - Conselho Regional de Nutrição</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número do Conselho
                  </label>
                  <input
                    type="text"
                    value={formData.numeroConselho}
                    onChange={(e) => handleInputChange('numeroConselho', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dados Bancários */}
          {activeTab === 'bancarios' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banco
                  </label>
                  <input
                    type="text"
                    value={formData.dadosBancarios.banco}
                    onChange={(e) => handleNestedInputChange('dadosBancarios', 'banco', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agência
                  </label>
                  <input
                    type="text"
                    value={formData.dadosBancarios.agencia}
                    onChange={(e) => handleNestedInputChange('dadosBancarios', 'agencia', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conta
                  </label>
                  <input
                    type="text"
                    value={formData.dadosBancarios.conta}
                    onChange={(e) => handleNestedInputChange('dadosBancarios', 'conta', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Conta
                  </label>
                  <select
                    value={formData.dadosBancarios.tipoConta}
                    onChange={(e) => handleNestedInputChange('dadosBancarios', 'tipoConta', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                  >
                    <option value="corrente">Conta Corrente</option>
                    <option value="poupanca">Conta Poupança</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PIX
                  </label>
                  <input
                    type="text"
                    value={formData.dadosBancarios.pix}
                    onChange={(e) => handleNestedInputChange('dadosBancarios', 'pix', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                    placeholder="CPF, e-mail, telefone ou chave aleatória"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Certificado Digital */}
          {activeTab === 'certificado' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arquivo do Certificado
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".p12,.pfx"
                      className="hidden"
                      id="certificado-upload"
                    />
                    <label
                      htmlFor="certificado-upload"
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4" />
                      Selecionar Arquivo
                    </label>
                    <span className="text-sm text-gray-500">
                      {formData.certificadoDigital.arquivo || 'Nenhum arquivo selecionado'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha do Certificado
                  </label>
                  <input
                    type="password"
                    value={formData.certificadoDigital.senha}
                    onChange={(e) => handleNestedInputChange('certificadoDigital', 'senha', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Vencimento
                  </label>
                  <input
                    type="date"
                    value={formData.certificadoDigital.dataVencimento}
                    onChange={(e) => handleNestedInputChange('certificadoDigital', 'dataVencimento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Vínculos */}
          {activeTab === 'vinculos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Vínculos Empregatícios</h3>
                <button
                  type="button"
                  onClick={addVinculo}
                  className="flex items-center gap-2 px-4 py-2 bg-medstaff-primary text-white rounded-lg hover:bg-medstaff-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Vínculo
                </button>
              </div>

              {formData.vinculos.map((vinculo, index) => (
                <div key={vinculo.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Vínculo {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeVinculo(vinculo.id)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo
                      </label>
                      <select
                        value={vinculo.tipo}
                        onChange={(e) => updateVinculo(index, 'tipo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                      >
                        <option value="pj">Pessoa Jurídica</option>
                        <option value="tomador">Tomador de Serviço</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Empresa
                      </label>
                      <input
                        type="text"
                        value={vinculo.empresa}
                        onChange={(e) => updateVinculo(index, 'empresa', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cargo
                      </label>
                      <input
                        type="text"
                        value={vinculo.cargo}
                        onChange={(e) => updateVinculo(index, 'cargo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data de Início
                      </label>
                      <input
                        type="date"
                        value={vinculo.dataInicio}
                        onChange={(e) => updateVinculo(index, 'dataInicio', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data de Fim
                      </label>
                      <input
                        type="date"
                        value={vinculo.dataFim}
                        onChange={(e) => updateVinculo(index, 'dataFim', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`ativo-${vinculo.id}`}
                        checked={vinculo.ativo}
                        onChange={(e) => updateVinculo(index, 'ativo', e.target.checked)}
                        className="h-4 w-4 text-medstaff-primary focus:ring-medstaff-primary border-gray-300 rounded"
                      />
                      <label htmlFor={`ativo-${vinculo.id}`} className="ml-2 text-sm text-gray-700">
                        Vínculo Ativo
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Documentos */}
          {activeTab === 'documentos' && (
            <div className="space-y-6">
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload de Documentos
                </h3>
                <p className="text-gray-600 mb-4">
                  Arraste e solte os arquivos aqui ou clique para selecionar
                </p>
                <button
                  type="button"
                  className="px-4 py-2 bg-medstaff-primary text-white rounded-lg hover:bg-medstaff-primary/90"
                >
                  Selecionar Arquivos
                </button>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">Documentos Necessários:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• RG (frente e verso)</li>
                  <li>• CPF</li>
                  <li>• Comprovante de residência</li>
                  <li>• Diploma/Certificado profissional</li>
                  <li>• Comprovante de inscrição no conselho de classe</li>
                  <li>• Certidão de casamento (se aplicável)</li>
                </ul>
              </div>
            </div>
          )}

          {/* Observações */}
          <div className="border-t pt-6 mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
              placeholder="Informações adicionais sobre o cliente..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-medstaff-primary text-white rounded-lg hover:bg-medstaff-primary/90"
          >
            <Save className="h-4 w-4" />
            Salvar Cliente
          </button>
        </div>
      </form>
    </div>
  )
}

export default ClientePFForm