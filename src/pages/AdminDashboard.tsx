import React, { useState, useEffect } from 'react';
import { Card } from '@/components/UI/Card';
import { Button } from '@/components/UI/Button';
import { DepartmentForm } from '@/components/Admin/DepartmentForm';
import TimeInternoForm from '../components/CRM/TimeInternoForm';
import { TimeInternoForm as TimeInternoFormType } from '../types/crm';
import TimeValidationDashboard from '../components/TimeValidationDashboard';

type AdminView = 'overview' | 'employees' | 'departments' | 'employee-form' | 'department-form' | 'time-validation';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  hireDate: Date;
  status: 'active' | 'inactive';
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  cpf: string;
  rg: string;
  birthDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  managerId?: string;
  managerName?: string;
  location: string;
  phone: string;
  email: string;
  budget: number;
  costCenter: string;
  status: 'active' | 'inactive';
  employees: Employee[];
  createdAt: Date;
  updatedAt: Date;
}

const AdminDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<AdminView>('overview');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>();
  const [selectedDepartment, setSelectedDepartment] = useState<Department | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [teamMembers, setTeamMembers] = useState<Employee[]>([]);
  const [internalDepartments, setInternalDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    const loadData = async () => {
      setLoading(true);
      try {
        // Aqui você carregaria os dados reais da API
        const mockEmployees: Employee[] = [
          {
            id: '1',
            name: 'João Silva',
            email: 'joao@example.com',
            phone: '(11) 99999-9999',
            position: 'Desenvolvedor',
            department: 'TI',
            salary: 5000,
            hireDate: new Date('2023-01-15'),
            status: 'active',
            address: 'Rua A, 123',
            emergencyContact: 'Maria Silva',
            emergencyPhone: '(11) 88888-8888',
            cpf: '123.456.789-00',
            rg: '12.345.678-9',
            birthDate: new Date('1990-05-15'),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        const mockDepartments: Department[] = [
          {
            id: '1',
            name: 'Tecnologia da Informação',
            code: 'TI',
            description: 'Departamento responsável pela tecnologia',
            location: 'Prédio A - 3º andar',
            phone: '(11) 3333-3333',
            email: 'ti@example.com',
            budget: 100000,
            costCenter: 'CC001',
            status: 'active',
            employees: mockEmployees,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        setTeamMembers(mockEmployees);
        setInternalDepartments(mockDepartments);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSaveEmployee = (employee: Employee) => {
    if (selectedEmployee) {
      // Atualizar funcionário existente
      setTeamMembers(prev => prev.map(emp => emp.id === employee.id ? employee : emp));
    } else {
      // Adicionar novo funcionário
      setTeamMembers(prev => [...prev, employee]);
    }
    setCurrentView('employees');
    setSelectedEmployee(undefined);
  };

  const handleSaveDepartment = (department: Department) => {
    if (selectedDepartment) {
      // Atualizar departamento existente
      setInternalDepartments(prev => prev.map(dept => dept.id === department.id ? department : dept));
    } else {
      // Adicionar novo departamento
      setInternalDepartments(prev => [...prev, department]);
    }
    setCurrentView('departments');
    setSelectedDepartment(undefined);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setCurrentView('employee-form');
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setCurrentView('department-form');
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
      setTeamMembers(prev => prev.filter(emp => emp.id !== employeeId));
    }
  };

  const handleDeleteDepartment = (departmentId: string) => {
    if (confirm('Tem certeza que deseja excluir este departamento?')) {
      setInternalDepartments(prev => prev.filter(dept => dept.id !== departmentId));
    }
  };

  const filteredEmployees = teamMembers.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDepartments = internalDepartments.filter(department =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    department.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Painel Administrativo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total de Funcionários</h3>
          <p className="text-3xl font-bold text-blue-600">{teamMembers.length}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Departamentos</h3>
          <p className="text-3xl font-bold text-green-600">{internalDepartments.length}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Funcionários Ativos</h3>
          <p className="text-3xl font-bold text-purple-600">
            {teamMembers.filter(emp => emp.status === 'active').length}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <Button 
              onClick={() => {
                setSelectedEmployee(undefined);
                setCurrentView('employee-form');
              }}
              className="w-full"
            >
              Adicionar Funcionário
            </Button>
            <Button 
              onClick={() => {
                setSelectedDepartment(undefined);
                setCurrentView('department-form');
              }}
              variant="outline"
              className="w-full"
            >
              Adicionar Departamento
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Navegação</h3>
          <div className="space-y-3">
            <Button 
              onClick={() => setCurrentView('employees')}
              variant="outline"
              className="w-full"
            >
              Gerenciar Funcionários
            </Button>
            <Button 
              onClick={() => setCurrentView('departments')}
              variant="outline"
              className="w-full"
            >
              Gerenciar Departamentos
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderEmployees = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Funcionários</h1>
        <Button 
          onClick={() => {
            setSelectedEmployee(undefined);
            setCurrentView('employee-form');
          }}
        >
          Adicionar Funcionário
        </Button>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Buscar funcionários..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid gap-4">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{employee.name}</h3>
                <p className="text-gray-600">{employee.position} - {employee.department}</p>
                <p className="text-gray-600">{employee.email}</p>
                <p className="text-sm text-gray-500">
                  Contratado em: {new Date(employee.hireDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditEmployee(employee)}
                >
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteEmployee(employee.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Excluir
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderDepartments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Departamentos</h1>
        <Button 
          onClick={() => {
            setSelectedDepartment(undefined);
            setCurrentView('department-form');
          }}
        >
          Adicionar Departamento
        </Button>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Buscar departamentos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid gap-4">
        {filteredDepartments.map((department) => (
          <Card key={department.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{department.name}</h3>
                <p className="text-gray-600">Código: {department.code}</p>
                <p className="text-gray-600">{department.description}</p>
                <p className="text-gray-600">Localização: {department.location}</p>
                <p className="text-sm text-gray-500">
                  Funcionários: {department.employees.length}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditDepartment(department)}
                >
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteDepartment(department.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Excluir
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (currentView) {
      case 'overview':
        return renderOverview();
      case 'employees':
        return renderEmployees();
      case 'departments':
        return renderDepartments();
      case 'employee-form':
        return (
          <TimeInternoForm
            initialData={selectedEmployee ? {
              dadosPessoais: {
                nome: selectedEmployee.name,
                cpf: selectedEmployee.cpf,
                rg: selectedEmployee.rg,
                dataNascimento: selectedEmployee.birthDate.toISOString().split('T')[0],
                estadoCivil: '',
                endereco: {
                  cep: '',
                  logradouro: selectedEmployee.address,
                  numero: '',
                  complemento: '',
                  bairro: '',
                  cidade: '',
                  estado: ''
                },
                telefone: selectedEmployee.phone,
                emailPessoal: selectedEmployee.email,
                alergias: '',
                contatoEmergencia: {
                  nome: selectedEmployee.emergencyContact,
                  telefone: selectedEmployee.emergencyPhone,
                  parentesco: '',
                  email: ''
                }
              },
              dadosProfissionais: {
                cargo: selectedEmployee.position,
                departamento: selectedEmployee.department,
                gestorResponsavel: '',
                dataAdmissao: selectedEmployee.hireDate.toISOString().split('T')[0],
                salario: selectedEmployee.salary,
                regime: 'clt' as const
              },
              status: selectedEmployee.status === 'active' ? 'ativo' as const : 'inativo' as const
            } : undefined}
            onSubmit={(data: TimeInternoFormType) => {
              const employeeData: Employee = {
                id: selectedEmployee?.id || Date.now().toString(),
                name: data.dadosPessoais.nome,
                email: data.dadosPessoais.emailPessoal,
                phone: data.dadosPessoais.telefone,
                position: data.dadosProfissionais.cargo,
                department: data.dadosProfissionais.departamento,
                salary: data.dadosProfissionais.salario,
                hireDate: new Date(data.dadosProfissionais.dataAdmissao),
                status: data.status === 'ativo' ? 'active' as const : 'inactive' as const,
                address: data.dadosPessoais.endereco.logradouro,
                emergencyContact: data.dadosPessoais.contatoEmergencia?.nome || '',
                emergencyPhone: data.dadosPessoais.contatoEmergencia?.telefone || '',
                cpf: data.dadosPessoais.cpf,
                rg: data.dadosPessoais.rg || '',
                birthDate: new Date(data.dadosPessoais.dataNascimento),
                createdAt: selectedEmployee?.createdAt || new Date(),
                updatedAt: new Date()
              };
              handleSaveEmployee(employeeData);
            }}
            onCancel={() => {
              setSelectedEmployee(undefined);
              setCurrentView('employees');
            }}
          />
        );
      case 'department-form':
        return (
          <DepartmentForm
            selectedDepartment={selectedDepartment}
            onSave={handleSaveDepartment}
            onCancel={() => {
              setSelectedDepartment(undefined);
              setCurrentView('departments');
            }}
          />
        );
      case 'time-validation':
        return (
          <TimeValidationDashboard
            onClose={() => setCurrentView('overview')}
          />
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setCurrentView('overview')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'overview'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setCurrentView('employees')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'employees' || currentView === 'employee-form'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Funcionários
              </button>
              <button
                onClick={() => setCurrentView('departments')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'departments' || currentView === 'department-form'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Departamentos
              </button>
              <button
                onClick={() => setCurrentView('time-validation')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'time-validation'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Validação de Ponto
              </button>
            </nav>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export { AdminDashboard };