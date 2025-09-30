import React, { useState } from 'react'
import EmployeeCard from '../components/CRM/EmployeeCard'
import EmployeeModal from '../components/CRM/EmployeeModal'
import { TimeInternoForm } from '../types/crm'
import { User, Eye } from 'lucide-react'

// Dados de exemplo para teste
const mockEmployee: TimeInternoForm = {
  numeroRegistro: 'MED001',
  status: 'ativo',
  responsavelRH: 'Fernanda Costa',
  dadosPessoais: {
    nome: 'Dr. João Silva Santos',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    dataNascimento: '1985-03-15',
    estadoCivil: 'casado',
    telefone: '(11) 99999-9999',
    emailPessoal: 'joao.silva@email.com',
    endereco: {
      cep: '01310-100',
      logradouro: 'Av. Paulista',
      numero: '1000',
      complemento: 'Apto 101',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    contatoEmergencia: {
      nome: 'Maria Silva Santos',
      telefone: '(11) 88888-8888',
      parentesco: 'Esposa',
      email: 'maria.silva@email.com'
    },
    alergias: 'Alergia a penicilina e frutos do mar'
  },
  dadosProfissionais: {
    cargo: 'Médico Cardiologista',
    departamento: 'Medicina',
    gestorResponsavel: 'Dr. Carlos Mendes',
    dataAdmissao: '2020-01-15',
    regime: 'clt',
    salario: 15000
  },
  jornadaTrabalho: {
    escala: '12x36',
    cargaHoraria: 44,
    horarioEntrada: '07:00',
    horarioSaida: '19:00',
    intervalos: '1h almoço'
  },
  dadosFinanceiros: {
    salarioBase: 15000,
    dadosBancarios: {
        banco: 'Banco do Brasil',
        agencia: '1234-5',
        conta: '12345-6',
        tipoConta: 'corrente',
        pix: '123.456.789-00'
      },
    beneficios: [
      { tipo: 'Vale Refeição', valor: 800 },
      { tipo: 'Vale Transporte', valor: 200 },
      { tipo: 'Plano de Saúde', valor: 450 }
    ]
  },
  aso: {
    admissional: {
      data: '2020-01-10',
      medico: 'Dr. Ana Costa'
    },
    periodico: {
      data: '2023-01-10',
      medico: 'Dr. Ana Costa',
      proximaData: '2024-01-10'
    }
  },
  dependentes: [
    {
      nome: 'Pedro Silva Santos',
      grauParentesco: 'Filho',
      dataNascimento: '2010-05-20'
    },
    {
      nome: 'Ana Silva Santos',
      grauParentesco: 'Filha',
      dataNascimento: '2012-08-15'
    }
  ],
  documentos: [
    {
      id: 'doc1',
      nome: 'Carteira de Trabalho',
      tipo: 'Documento Pessoal',
      data: '2020-01-15',
      descricao: 'Carteira de trabalho digital',
      categoria: 'documento_pessoal'
    },
    {
      id: 'doc2',
      nome: 'Diploma de Medicina',
      tipo: 'Formação',
      data: '2020-01-15',
      descricao: 'Diploma de graduação em Medicina',
      categoria: 'certificado'
    },
    {
      id: 'doc3',
      nome: 'CRM',
      tipo: 'Registro Profissional',
      data: '2020-01-15',
      descricao: 'Registro no Conselho Regional de Medicina',
      categoria: 'certificado'
    }
  ],
  anexosNotificacoes: [
    {
      id: 'anexo1',
      nome: 'Contrato de Trabalho',
      tipo: 'Contrato',
      data: '2020-01-15',
      descricao: 'Contrato de trabalho assinado'
    },
    {
      id: 'anexo2',
      nome: 'Termo de Confidencialidade',
      tipo: 'Termo',
      data: '2020-01-15',
      descricao: 'Termo de confidencialidade assinado'
    }
  ],
  anexos: [
    {
      id: 'anexo3',
      nome: 'Certificado de Especialização',
      tipo: 'PDF',
      data: '2020-01-15',
      descricao: 'Certificado de especialização em cardiologia',
      categoria: 'certificado'
    }
  ],
  observacoesAnexos: 'Documentos complementares para comprovação de especialização'
}

const mockEmployee2: TimeInternoForm = {
  numeroRegistro: 'ADM002',
  status: 'afastado',
  responsavelRH: 'Fernanda Costa',
  dadosPessoais: {
    nome: 'Ana Carolina Oliveira',
    cpf: '987.654.321-00',
    rg: '98.765.432-1',
    dataNascimento: '1990-07-22',
    estadoCivil: 'solteira',
    telefone: '(11) 77777-7777',
    emailPessoal: 'ana.oliveira@email.com',
    endereco: {
      cep: '04567-890',
      logradouro: 'Rua das Flores',
      numero: '456',
      complemento: '',
      bairro: 'Vila Madalena',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    contatoEmergencia: {
      nome: 'Roberto Oliveira',
      telefone: '(11) 66666-6666',
      parentesco: 'Pai',
      email: 'roberto.oliveira@email.com'
    }
  },
  dadosProfissionais: {
    cargo: 'Analista Administrativo',
    departamento: 'Administrativo',
    gestorResponsavel: 'Fernanda Costa',
    dataAdmissao: '2021-03-01',
    regime: 'clt',
    salario: 4500
  },
  jornadaTrabalho: {
    escala: 'Segunda a Sexta',
    cargaHoraria: 40,
    horarioEntrada: '08:00',
    horarioSaida: '17:00',
    intervalos: '1h almoço'
  },
  dadosFinanceiros: {
    salarioBase: 4500,
    dadosBancarios: {
        banco: 'Itaú',
        agencia: '5678-9',
        conta: '98765-4',
        tipoConta: 'corrente',
        pix: 'ana.silva@email.com'
      },
    beneficios: [
      { tipo: 'Vale Refeição', valor: 600 },
      { tipo: 'Vale Transporte', valor: 150 }
    ]
  },
  aso: {
    admissional: {
      data: '2021-02-25',
      medico: 'Dr. Pedro Lima'
    }
  },
  dependentes: [],
  documentos: [
    {
      id: 'doc4',
      nome: 'Carteira de Trabalho',
      tipo: 'Documento Pessoal',
      data: '2021-03-01',
      descricao: 'Carteira de trabalho digital',
      categoria: 'documento_pessoal'
    }
  ],
  anexosNotificacoes: [],
  anexos: [],
  observacoesAnexos: ''
}

const EmployeeCardDemo: React.FC = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<TimeInternoForm | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const employees = [mockEmployee, mockEmployee2]

  const handleViewEmployee = (employee: TimeInternoForm) => {
    setSelectedEmployee(employee)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEmployee(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Demonstração - Cards de Funcionários
          </h1>
          <p className="text-gray-600">
            Visualização moderna e intuitiva dos perfis dos funcionários
          </p>
        </div>

        {/* Lista de Funcionários */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {employees.map((employee, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleViewEmployee(employee)}
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    employee.status === 'ativo' ? 'bg-green-500' : 
                    employee.status === 'afastado' ? 'bg-yellow-500' : 
                    employee.status === 'desligado' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {employee.dadosPessoais.nome}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {employee.dadosProfissionais.cargo}
                  </p>
                  <p className="text-xs text-gray-500">
                    {employee.dadosProfissionais.departamento}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  employee.status === 'ativo' ? 'bg-green-100 text-green-800' :
                  employee.status === 'afastado' ? 'bg-yellow-100 text-yellow-800' :
                  employee.status === 'desligado' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                </span>
                
                <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Ver detalhes</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Card de Exemplo Expandido */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Exemplo de Card Expandido
          </h2>
          <div className="max-w-4xl mx-auto">
            <EmployeeCard employee={mockEmployee} />
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedEmployee && (
        <EmployeeModal
          employee={selectedEmployee}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default EmployeeCardDemo