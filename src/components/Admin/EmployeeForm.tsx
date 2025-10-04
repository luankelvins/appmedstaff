import React, { useState, useEffect } from 'react';
import { Card } from '@/components/UI/Card';
import { Button } from '@/components/UI/Button';

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

interface EmployeeFormProps {
  selectedEmployee?: Employee;
  onSave: (employee: Employee) => void;
  onCancel: () => void;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  selectedEmployee,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: '',
    hireDate: '',
    status: 'active' as 'active' | 'inactive',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    cpf: '',
    rg: '',
    birthDate: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedEmployee) {
      setFormData({
        name: selectedEmployee.name || '',
        email: selectedEmployee.email || '',
        phone: selectedEmployee.phone || '',
        position: selectedEmployee.position || '',
        department: selectedEmployee.department || '',
        salary: selectedEmployee.salary?.toString() || '',
        hireDate: selectedEmployee.hireDate ? new Date(selectedEmployee.hireDate).toISOString().split('T')[0] : '',
        status: selectedEmployee.status || 'active',
        address: selectedEmployee.address || '',
        emergencyContact: selectedEmployee.emergencyContact || '',
        emergencyPhone: selectedEmployee.emergencyPhone || '',
        cpf: selectedEmployee.cpf || '',
        rg: selectedEmployee.rg || '',
        birthDate: selectedEmployee.birthDate ? new Date(selectedEmployee.birthDate).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        salary: '',
        hireDate: '',
        status: 'active',
        address: '',
        emergencyContact: '',
        emergencyPhone: '',
        cpf: '',
        rg: '',
        birthDate: ''
      });
    }
    setErrors({});
  }, [selectedEmployee]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Cargo é obrigatório';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Departamento é obrigatório';
    }

    if (!formData.salary.trim()) {
      newErrors.salary = 'Salário é obrigatório';
    } else if (isNaN(Number(formData.salary)) || Number(formData.salary) <= 0) {
      newErrors.salary = 'Salário deve ser um número válido maior que zero';
    }

    if (!formData.hireDate) {
      newErrors.hireDate = 'Data de contratação é obrigatória';
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    }

    if (!formData.rg.trim()) {
      newErrors.rg = 'RG é obrigatório';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const employeeData: Employee = {
        id: selectedEmployee?.id || `emp_${Date.now()}`,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        position: formData.position.trim(),
        department: formData.department.trim(),
        salary: Number(formData.salary),
        hireDate: new Date(formData.hireDate),
        status: formData.status,
        address: formData.address.trim(),
        emergencyContact: formData.emergencyContact.trim(),
        emergencyPhone: formData.emergencyPhone.trim(),
        cpf: formData.cpf.trim(),
        rg: formData.rg.trim(),
        birthDate: new Date(formData.birthDate),
        createdAt: selectedEmployee?.createdAt || new Date(),
        updatedAt: new Date()
      };

      onSave(employeeData);
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {selectedEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}
        </h2>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Digite o nome completo"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Digite o email"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cargo *
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.position ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Digite o cargo"
              />
              {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departamento *
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.department ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Digite o departamento"
              />
              {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salário (R$) *
              </label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.salary ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Contratação *
              </label>
              <input
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData(prev => ({ ...prev, hireDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.hireDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.hireDate && <p className="text-red-500 text-sm mt-1">{errors.hireDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite o endereço completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contato de Emergência
              </label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome do contato de emergência"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone de Emergência
              </label>
              <input
                type="tel"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPF *
              </label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.cpf ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="000.000.000-00"
              />
              {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RG *
              </label>
              <input
                type="text"
                value={formData.rg}
                onChange={(e) => setFormData(prev => ({ ...prev, rg: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.rg ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="00.000.000-0"
              />
              {errors.rg && <p className="text-red-500 text-sm mt-1">{errors.rg}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Nascimento *
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.birthDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : (
                <>
                  {selectedEmployee ? 'Atualizar' : 'Criar'} Funcionário
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};