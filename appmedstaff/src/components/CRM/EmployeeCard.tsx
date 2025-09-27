import React, { useState } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Clock, 
  Shield, 
  FileText, 
  ChevronRight,
  Badge,
  Heart,
  AlertCircle,
  CheckCircle,
  Building,
  Users,
  DollarSign,
  Download,
  Eye,
  Star
} from 'lucide-react'
import { TimeInternoForm } from '../../types/crm'
import { formatCurrency } from '../../utils/formatters'

interface EmployeeCardProps {
  employee: TimeInternoForm
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'documents' | 'health'>('personal')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800 border-green-200'
      case 'inativo': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'afastado': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'desligado': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRegimeLabel = (regime: string) => {
    switch (regime) {
      case 'clt': return 'CLT'
      case 'pj': return 'PJ'
      case 'estagiario': return 'Estagiário'
      case 'terceirizado': return 'Terceirizado'
      case 'rpa': return 'RPA'
      default: return regime
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const calculateWorkTime = () => {
    if (!employee.dadosProfissionais.dataAdmissao) return '-'
    const admissionDate = new Date(employee.dadosProfissionais.dataAdmissao)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - admissionDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const years = Math.floor(diffDays / 365)
    const months = Math.floor((diffDays % 365) / 30)
    
    if (years > 0) {
      return `${years} ano${years > 1 ? 's' : ''} e ${months} mês${months !== 1 ? 'es' : ''}`
    }
    return `${months} mês${months !== 1 ? 'es' : ''}`
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg w-full overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${
              employee.status === 'ativo' ? 'bg-green-500' : 
              employee.status === 'afastado' ? 'bg-yellow-500' : 
              employee.status === 'desligado' ? 'bg-red-500' : 'bg-gray-500'
            }`}>
              {employee.status === 'ativo' && <CheckCircle className="w-3 h-3 text-white" />}
              {employee.status === 'afastado' && <Clock className="w-3 h-3 text-white" />}
            </div>
          </div>

          {/* Info Principal */}
          <div className="flex-1">
            <div>
              <h1 className="text-2xl font-bold">{employee.dadosPessoais.nome}</h1>
              <p className="text-blue-100 text-lg">{employee.dadosProfissionais.cargo}</p>
              <p className="text-blue-200 text-sm">{employee.dadosProfissionais.departamento}</p>
            </div>

            {/* Badges */}
            <div className="flex items-center space-x-3 mt-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(employee.status)}`}>
                {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
              </span>
              <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-xs font-medium">
                {getRegimeLabel(employee.dadosProfissionais.regime)}
              </span>
              <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-xs font-medium">
                Matrícula: {employee.numeroRegistro}
              </span>
            </div>
          </div>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white border-opacity-20">
          <div className="text-center">
            <div className="text-2xl font-bold">{calculateWorkTime()}</div>
            <div className="text-blue-200 text-sm">Tempo na empresa</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{formatCurrency(employee.dadosProfissionais.salario)}</div>
            <div className="text-blue-200 text-sm">Salário</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{employee.dependentes?.length || 0}</div>
            <div className="text-blue-200 text-sm">Dependentes</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'personal', label: 'Dados Pessoais', icon: User },
            { id: 'professional', label: 'Profissional', icon: Briefcase },
            { id: 'documents', label: 'Documentos', icon: FileText },
            { id: 'health', label: 'Saúde', icon: Heart }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'personal' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações Básicas */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Informações Básicas
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">CPF:</span>
                    <span className="font-medium">{employee.dadosPessoais.cpf}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">RG:</span>
                    <span className="font-medium">{employee.dadosPessoais.rg || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data de Nascimento:</span>
                    <span className="font-medium">{formatDate(employee.dadosPessoais.dataNascimento)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado Civil:</span>
                    <span className="font-medium">{employee.dadosPessoais.estadoCivil}</span>
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-blue-600" />
                  Contato
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{employee.dadosPessoais.telefone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{employee.dadosPessoais.emailPessoal}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Endereço
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Logradouro:</span>
                  <p className="font-medium">{employee.dadosPessoais.endereco.logradouro}, {employee.dadosPessoais.endereco.numero}</p>
                </div>
                <div>
                  <span className="text-gray-600">Bairro:</span>
                  <p className="font-medium">{employee.dadosPessoais.endereco.bairro}</p>
                </div>
                <div>
                  <span className="text-gray-600">Cidade/Estado:</span>
                  <p className="font-medium">{employee.dadosPessoais.endereco.cidade}, {employee.dadosPessoais.endereco.estado}</p>
                </div>
                <div>
                  <span className="text-gray-600">CEP:</span>
                  <p className="font-medium">{employee.dadosPessoais.endereco.cep}</p>
                </div>
              </div>
            </div>

            {/* Contato de Emergência */}
            {employee.dadosPessoais.contatoEmergencia && (
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                  Contato de Emergência
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Nome:</span>
                    <p className="font-medium">{employee.dadosPessoais.contatoEmergencia.nome}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Telefone:</span>
                    <p className="font-medium">{employee.dadosPessoais.contatoEmergencia.telefone}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Parentesco:</span>
                    <p className="font-medium">{employee.dadosPessoais.contatoEmergencia.parentesco || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">{employee.dadosPessoais.contatoEmergencia.email || '-'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Alergias */}
            {employee.dadosPessoais.alergias && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                  Alergias e Restrições
                </h3>
                <p className="text-gray-700">{employee.dadosPessoais.alergias}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'professional' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações do Cargo */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                  Cargo e Departamento
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cargo:</span>
                    <span className="font-medium">{employee.dadosProfissionais.cargo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Departamento:</span>
                    <span className="font-medium">{employee.dadosProfissionais.departamento}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gestor:</span>
                    <span className="font-medium">{employee.dadosProfissionais.gestorResponsavel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Regime:</span>
                    <span className="font-medium">{getRegimeLabel(employee.dadosProfissionais.regime)}</span>
                  </div>
                </div>
              </div>

              {/* Datas e Tempo */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Datas Importantes
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Admissão:</span>
                    <span className="font-medium">{formatDate(employee.dadosProfissionais.dataAdmissao)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tempo na empresa:</span>
                    <span className="font-medium">{calculateWorkTime()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Jornada de Trabalho */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Jornada de Trabalho
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Escala:</span>
                  <p className="font-medium">{employee.jornadaTrabalho.escala}</p>
                </div>
                <div>
                  <span className="text-gray-600">Carga Horária:</span>
                  <p className="font-medium">{employee.jornadaTrabalho.cargaHoraria}h</p>
                </div>
                <div>
                  <span className="text-gray-600">Horário:</span>
                  <p className="font-medium">{employee.jornadaTrabalho.horarioEntrada} às {employee.jornadaTrabalho.horarioSaida}</p>
                </div>
                <div>
                  <span className="text-gray-600">Intervalos:</span>
                  <p className="font-medium">{employee.jornadaTrabalho.intervalos}</p>
                </div>
              </div>
            </div>

            {/* Informações Financeiras */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Informações Financeiras
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Salário Base:</span>
                  <p className="font-medium text-lg">{formatCurrency(employee.dadosFinanceiros.salarioBase)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Banco:</span>
                  <p className="font-medium">{employee.dadosFinanceiros.dadosBancarios.banco}</p>
                </div>
                <div>
                  <span className="text-gray-600">Agência/Conta:</span>
                  <p className="font-medium">{employee.dadosFinanceiros.dadosBancarios.agencia} / {employee.dadosFinanceiros.dadosBancarios.conta}</p>
                </div>
                <div>
                  <span className="text-gray-600">Tipo de Conta:</span>
                  <p className="font-medium">{employee.dadosFinanceiros.dadosBancarios.tipoConta}</p>
                </div>
                <div>
                  <span className="text-gray-600">PIX:</span>
                  <p className="font-medium">{employee.dadosFinanceiros.dadosBancarios.pix}</p>
                </div>
              </div>
              
              {employee.dadosFinanceiros.beneficios && employee.dadosFinanceiros.beneficios.length > 0 && (
                <div className="mt-4">
                  <span className="text-gray-600">Benefícios:</span>
                  <div className="mt-2 space-y-2">
                    {employee.dadosFinanceiros.beneficios.map((beneficio, index) => (
                      <div key={index} className="flex justify-between bg-white rounded p-2">
                        <span>{beneficio.tipo}</span>
                        <span className="font-medium">{formatCurrency(beneficio.valor)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Documentos Principais */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Documentos Principais
              </h3>
              {employee.documentos && employee.documentos.length > 0 ? (
                <div className="space-y-3">
                  {employee.documentos.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{doc.nome}</p>
                          <p className="text-sm text-gray-500">{doc.tipo} • {formatDate(doc.data)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum documento cadastrado</p>
              )}
            </div>

            {/* Anexos e Notificações */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Badge className="w-5 h-5 mr-2 text-blue-600" />
                Anexos e Notificações
              </h3>
              {employee.anexosNotificacoes && employee.anexosNotificacoes.length > 0 ? (
                <div className="space-y-3">
                  {employee.anexosNotificacoes.map((anexo, index) => (
                    <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border">
                      <div className="flex items-center space-x-3">
                        <Badge className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{anexo.nome}</p>
                          <p className="text-sm text-gray-500">{anexo.tipo} • {formatDate(anexo.data)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum anexo cadastrado</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="space-y-6">
            {/* ASO Admissional */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                ASO Admissional
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Data:</span>
                  <p className="font-medium">{formatDate(employee.aso.admissional.data)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Médico:</span>
                  <p className="font-medium">{employee.aso.admissional.medico}</p>
                </div>
              </div>
            </div>

            {/* ASO Periódico */}
            {employee.aso.periodico && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  ASO Periódico
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-gray-600">Última Data:</span>
                    <p className="font-medium">{formatDate(employee.aso.periodico.data)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Médico:</span>
                    <p className="font-medium">{employee.aso.periodico.medico}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Próxima Data:</span>
                    <p className="font-medium">{formatDate(employee.aso.periodico.proximaData)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ASO Demissional */}
            {employee.aso.demissional && (
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                  ASO Demissional
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Data:</span>
                    <p className="font-medium">{formatDate(employee.aso.demissional.data)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Médico:</span>
                    <p className="font-medium">{employee.aso.demissional.medico}</p>
                  </div>
                </div>
                {employee.aso.demissional.questoesSaude && (
                  <div className="mt-4">
                    <span className="text-gray-600">Questões de Saúde:</span>
                    <p className="font-medium mt-1">{employee.aso.demissional.questoesSaude}</p>
                  </div>
                )}
              </div>
            )}

            {/* Dependentes */}
            {employee.dependentes && employee.dependentes.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Dependentes
                </h3>
                <div className="space-y-3">
                  {employee.dependentes.map((dependente, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-gray-600">Nome:</span>
                          <p className="font-medium">{dependente.nome}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Parentesco:</span>
                          <p className="font-medium">{dependente.grauParentesco}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Data de Nascimento:</span>
                          <p className="font-medium">{formatDate(dependente.dataNascimento)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default EmployeeCard