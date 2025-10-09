import React from 'react'
import { Briefcase, Building, Calendar, DollarSign, Users } from 'lucide-react'
import { TimeInternoForm } from '../../../types/crm'
import { useFormValidation } from '../../../hooks/useFormValidation'

interface DadosProfissionaisSectionProps {
  formData: TimeInternoForm
  onFieldChange: (field: string, value: any) => void
  errors: Record<string, string>
  touched: Record<string, boolean>
}

export function DadosProfissionaisSection({ formData, onFieldChange, errors, touched }: DadosProfissionaisSectionProps) {
  const validationRules = {
    'dadosProfissionais.cargo': { required: true, minLength: 2 },
    'dadosProfissionais.departamento': { required: true, minLength: 2 },
    'dadosProfissionais.gestorResponsavel': { required: true, minLength: 2 },
    'dadosProfissionais.dataAdmissao': { required: true },
    'dadosProfissionais.salario': { required: true, custom: (value: number) => value > 0 ? null : 'Salário deve ser maior que zero' },
    'dadosProfissionais.regime': { required: true }
  }

  const { handleFieldChange, handleFieldBlur, getFieldError, hasError } = useFormValidation({
    validationRules,
    validateOnChange: true,
    validateOnBlur: true
  })

  const handleInputChange = (field: string, value: any) => {
    onFieldChange(field, value)
    handleFieldChange(field, value)
  }

  const handleInputBlur = (field: string, value: any) => {
    handleFieldBlur(field, value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
          <Briefcase className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Dados Profissionais</h3>
          <p className="text-sm text-gray-600">Informações do cargo e contrato de trabalho</p>
        </div>
      </div>

      {/* Cargo e Departamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cargo *
          </label>
          <input
            type="text"
            value={formData.dadosProfissionais.cargo}
            onChange={(e) => handleInputChange('dadosProfissionais.cargo', e.target.value)}
            onBlur={(e) => handleInputBlur('dadosProfissionais.cargo', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              hasError('dadosProfissionais.cargo') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Desenvolvedor Senior"
          />
          {hasError('dadosProfissionais.cargo') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('dadosProfissionais.cargo')}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Departamento *
          </label>
          <input
            type="text"
            value={formData.dadosProfissionais.departamento}
            onChange={(e) => handleInputChange('dadosProfissionais.departamento', e.target.value)}
            onBlur={(e) => handleInputBlur('dadosProfissionais.departamento', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              hasError('dadosProfissionais.departamento') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Tecnologia"
          />
          {hasError('dadosProfissionais.departamento') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('dadosProfissionais.departamento')}</p>
          )}
        </div>
      </div>

      {/* Gestor Responsável */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gestor Responsável *
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={formData.dadosProfissionais.gestorResponsavel}
            onChange={(e) => handleInputChange('dadosProfissionais.gestorResponsavel', e.target.value)}
            onBlur={(e) => handleInputBlur('dadosProfissionais.gestorResponsavel', e.target.value)}
            className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              hasError('dadosProfissionais.gestorResponsavel') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nome do gestor direto"
          />
        </div>
        {hasError('dadosProfissionais.gestorResponsavel') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('dadosProfissionais.gestorResponsavel')}</p>
        )}
      </div>

      {/* Data de Admissão e Regime */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data de Admissão *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={formData.dadosProfissionais.dataAdmissao}
              onChange={(e) => handleInputChange('dadosProfissionais.dataAdmissao', e.target.value)}
              onBlur={(e) => handleInputBlur('dadosProfissionais.dataAdmissao', e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                hasError('dadosProfissionais.dataAdmissao') ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {hasError('dadosProfissionais.dataAdmissao') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('dadosProfissionais.dataAdmissao')}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Regime de Trabalho *
          </label>
          <select
            value={formData.dadosProfissionais.regime}
            onChange={(e) => handleInputChange('dadosProfissionais.regime', e.target.value)}
            onBlur={(e) => handleInputBlur('dadosProfissionais.regime', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              hasError('dadosProfissionais.regime') ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selecione o regime</option>
            <option value="clt">CLT</option>
            <option value="pj">Pessoa Jurídica</option>
            <option value="estagiario">Estagiário</option>
            <option value="terceirizado">Terceirizado</option>
            <option value="rpa">RPA</option>
          </select>
          {hasError('dadosProfissionais.regime') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('dadosProfissionais.regime')}</p>
          )}
        </div>
      </div>

      {/* Salário */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Salário Base *
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.dadosProfissionais.salario}
            onChange={(e) => handleInputChange('dadosProfissionais.salario', parseFloat(e.target.value) || 0)}
            onBlur={(e) => handleInputBlur('dadosProfissionais.salario', parseFloat(e.target.value) || 0)}
            className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              hasError('dadosProfissionais.salario') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0,00"
          />
        </div>
        {hasError('dadosProfissionais.salario') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('dadosProfissionais.salario')}</p>
        )}
      </div>
    </div>
  )
}
