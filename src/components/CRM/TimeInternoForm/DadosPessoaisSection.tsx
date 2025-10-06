import React from 'react'
import { User, MapPin, Phone, Mail, Calendar, Heart, AlertCircle } from 'lucide-react'
import { TimeInternoForm } from '../../../types/crm'
import { useFormValidation, useCPFValidation, useEmailValidation, usePhoneValidation } from '../../../hooks/useFormValidation'

interface DadosPessoaisSectionProps {
  formData: TimeInternoForm
  onFieldChange: (field: string, value: any) => void
  errors: Record<string, string>
  touched: Record<string, boolean>
}

export function DadosPessoaisSection({ formData, onFieldChange, errors, touched }: DadosPessoaisSectionProps) {
  const { validateCPF } = useCPFValidation()
  const { validateEmail } = useEmailValidation()
  const { validatePhone } = usePhoneValidation()

  const validationRules = {
    'dadosPessoais.nome': { required: true, minLength: 2 },
    'dadosPessoais.cpf': { required: true, custom: validateCPF },
    'dadosPessoais.dataNascimento': { required: true },
    'dadosPessoais.telefone': { required: true, custom: validatePhone },
    'dadosPessoais.emailPessoal': { required: true, custom: validateEmail },
    'dadosPessoais.endereco.cep': { required: true, pattern: /^\d{5}-?\d{3}$/ },
    'dadosPessoais.endereco.logradouro': { required: true },
    'dadosPessoais.endereco.numero': { required: true },
    'dadosPessoais.endereco.bairro': { required: true },
    'dadosPessoais.endereco.cidade': { required: true },
    'dadosPessoais.endereco.estado': { required: true }
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
        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
          <User className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Dados Pessoais</h3>
          <p className="text-sm text-gray-600">Informações básicas do funcionário</p>
        </div>
      </div>

      {/* Nome e CPF */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo *
          </label>
          <input
            type="text"
            value={formData.dadosPessoais.nome}
            onChange={(e) => handleInputChange('dadosPessoais.nome', e.target.value)}
            onBlur={(e) => handleInputBlur('dadosPessoais.nome', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError('dadosPessoais.nome') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Digite o nome completo"
          />
          {hasError('dadosPessoais.nome') && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {getFieldError('dadosPessoais.nome')}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CPF *
          </label>
          <input
            type="text"
            value={formData.dadosPessoais.cpf}
            onChange={(e) => handleInputChange('dadosPessoais.cpf', e.target.value)}
            onBlur={(e) => handleInputBlur('dadosPessoais.cpf', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError('dadosPessoais.cpf') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="000.000.000-00"
            maxLength={14}
          />
          {hasError('dadosPessoais.cpf') && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {getFieldError('dadosPessoais.cpf')}
            </p>
          )}
        </div>
      </div>

      {/* RG e Data de Nascimento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            RG
          </label>
          <input
            type="text"
            value={formData.dadosPessoais.rg || ''}
            onChange={(e) => handleInputChange('dadosPessoais.rg', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="00.000.000-0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data de Nascimento *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={formData.dadosPessoais.dataNascimento}
              onChange={(e) => handleInputChange('dadosPessoais.dataNascimento', e.target.value)}
              onBlur={(e) => handleInputBlur('dadosPessoais.dataNascimento', e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasError('dadosPessoais.dataNascimento') ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {hasError('dadosPessoais.dataNascimento') && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {getFieldError('dadosPessoais.dataNascimento')}
            </p>
          )}
        </div>
      </div>

      {/* Estado Civil */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estado Civil
        </label>
        <select
          value={formData.dadosPessoais.estadoCivil}
          onChange={(e) => handleInputChange('dadosPessoais.estadoCivil', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecione o estado civil</option>
          <option value="solteiro">Solteiro(a)</option>
          <option value="casado">Casado(a)</option>
          <option value="divorciado">Divorciado(a)</option>
          <option value="viuvo">Viúvo(a)</option>
          <option value="uniao_estavel">União Estável</option>
        </select>
      </div>

      {/* Endereço */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-gray-600" />
          <h4 className="text-md font-medium text-gray-900">Endereço</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CEP *
            </label>
            <input
              type="text"
              value={formData.dadosPessoais.endereco.cep}
              onChange={(e) => handleInputChange('dadosPessoais.endereco.cep', e.target.value)}
              onBlur={(e) => handleInputBlur('dadosPessoais.endereco.cep', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasError('dadosPessoais.endereco.cep') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="00000-000"
              maxLength={9}
            />
            {hasError('dadosPessoais.endereco.cep') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getFieldError('dadosPessoais.endereco.cep')}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logradouro *
            </label>
            <input
              type="text"
              value={formData.dadosPessoais.endereco.logradouro}
              onChange={(e) => handleInputChange('dadosPessoais.endereco.logradouro', e.target.value)}
              onBlur={(e) => handleInputBlur('dadosPessoais.endereco.logradouro', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasError('dadosPessoais.endereco.logradouro') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Rua, Avenida, etc."
            />
            {hasError('dadosPessoais.endereco.logradouro') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getFieldError('dadosPessoais.endereco.logradouro')}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número *
            </label>
            <input
              type="text"
              value={formData.dadosPessoais.endereco.numero}
              onChange={(e) => handleInputChange('dadosPessoais.endereco.numero', e.target.value)}
              onBlur={(e) => handleInputBlur('dadosPessoais.endereco.numero', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasError('dadosPessoais.endereco.numero') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="123"
            />
            {hasError('dadosPessoais.endereco.numero') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getFieldError('dadosPessoais.endereco.numero')}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complemento
            </label>
            <input
              type="text"
              value={formData.dadosPessoais.endereco.complemento || ''}
              onChange={(e) => handleInputChange('dadosPessoais.endereco.complemento', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Apto, Sala, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bairro *
            </label>
            <input
              type="text"
              value={formData.dadosPessoais.endereco.bairro}
              onChange={(e) => handleInputChange('dadosPessoais.endereco.bairro', e.target.value)}
              onBlur={(e) => handleInputBlur('dadosPessoais.endereco.bairro', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasError('dadosPessoais.endereco.bairro') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nome do bairro"
            />
            {hasError('dadosPessoais.endereco.bairro') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getFieldError('dadosPessoais.endereco.bairro')}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cidade *
            </label>
            <input
              type="text"
              value={formData.dadosPessoais.endereco.cidade}
              onChange={(e) => handleInputChange('dadosPessoais.endereco.cidade', e.target.value)}
              onBlur={(e) => handleInputBlur('dadosPessoais.endereco.cidade', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasError('dadosPessoais.endereco.cidade') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nome da cidade"
            />
            {hasError('dadosPessoais.endereco.cidade') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getFieldError('dadosPessoais.endereco.cidade')}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado *
            </label>
            <select
              value={formData.dadosPessoais.endereco.estado}
              onChange={(e) => handleInputChange('dadosPessoais.endereco.estado', e.target.value)}
              onBlur={(e) => handleInputBlur('dadosPessoais.endereco.estado', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasError('dadosPessoais.endereco.estado') ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecione o estado</option>
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
            {hasError('dadosPessoais.endereco.estado') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getFieldError('dadosPessoais.endereco.estado')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Contato */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Phone className="w-5 h-5 text-gray-600" />
          <h4 className="text-md font-medium text-gray-900">Contato</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone *
            </label>
            <input
              type="tel"
              value={formData.dadosPessoais.telefone}
              onChange={(e) => handleInputChange('dadosPessoais.telefone', e.target.value)}
              onBlur={(e) => handleInputBlur('dadosPessoais.telefone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasError('dadosPessoais.telefone') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="(11) 99999-9999"
            />
            {hasError('dadosPessoais.telefone') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getFieldError('dadosPessoais.telefone')}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Pessoal *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={formData.dadosPessoais.emailPessoal}
                onChange={(e) => handleInputChange('dadosPessoais.emailPessoal', e.target.value)}
                onBlur={(e) => handleInputBlur('dadosPessoais.emailPessoal', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  hasError('dadosPessoais.emailPessoal') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="email@exemplo.com"
              />
            </div>
            {hasError('dadosPessoais.emailPessoal') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getFieldError('dadosPessoais.emailPessoal')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Alergias */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alergias
        </label>
        <textarea
          value={formData.dadosPessoais.alergias || ''}
          onChange={(e) => handleInputChange('dadosPessoais.alergias', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Descreva as alergias conhecidas (opcional)"
        />
      </div>

      {/* Contato de Emergência */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-gray-600" />
          <h4 className="text-md font-medium text-gray-900">Contato de Emergência</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Contato
            </label>
            <input
              type="text"
              value={formData.dadosPessoais.contatoEmergencia?.nome || ''}
              onChange={(e) => handleInputChange('dadosPessoais.contatoEmergencia.nome', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nome completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone do Contato
            </label>
            <input
              type="tel"
              value={formData.dadosPessoais.contatoEmergencia?.telefone || ''}
              onChange={(e) => handleInputChange('dadosPessoais.contatoEmergencia.telefone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parentesco
            </label>
            <input
              type="text"
              value={formData.dadosPessoais.contatoEmergencia?.parentesco || ''}
              onChange={(e) => handleInputChange('dadosPessoais.contatoEmergencia.parentesco', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Pai, Mãe, Cônjuge, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email do Contato
            </label>
            <input
              type="email"
              value={formData.dadosPessoais.contatoEmergencia?.email || ''}
              onChange={(e) => handleInputChange('dadosPessoais.contatoEmergencia.email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@exemplo.com"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
