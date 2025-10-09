import React, { useState } from 'react'
import { useValidation } from '../../hooks/useValidation'
import { useApiWithNotifications } from '../../hooks/useApiWithNotifications'
import { Loading } from '../UI/Loading'

interface UserFormData {
  name: string
  email: string
  phone: string
  cpf: string
  password: string
  confirmPassword: string
}

export const FormExample: React.FC = () => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
    confirmPassword: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sistema de validação
  const { validate, errors, hasError, getError, clearErrors } = useValidation({
    name: { required: true, minLength: 2, maxLength: 100 },
    email: { required: true, email: true },
    phone: { phone: true },
    cpf: { cpf: true },
    password: { required: true, minLength: 8 },
    confirmPassword: { required: true }
  })

  // API com notificações
  const api = useApiWithNotifications({
    showSuccessNotifications: true,
    showErrorNotifications: true
  })

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (hasError(field)) {
      clearErrors()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()

    // Validação customizada para confirmação de senha
    const validationData = { ...formData }
    const validation = validate(validationData)

    // Verificar se as senhas coincidem
    if (formData.password !== formData.confirmPassword) {
      validation.isValid = false
      validation.errors.confirmPassword = ['As senhas não coincidem']
    }

    if (!validation.isValid) {
      return
    }

    setIsSubmitting(true)

    try {
      // Simular chamada de API
      await api.post('/users', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        cpf: formData.cpf,
        password: formData.password
      }, {
        success: 'Usuário criado com sucesso!',
        error: 'Erro ao criar usuário'
      })

      // Limpar formulário após sucesso
      setFormData({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        password: '',
        confirmPassword: ''
      })
    } catch (error) {
      // Erro já tratado pelo sistema de notificações
      console.error('Erro no formulário:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Exemplo de Formulário com Validação
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError('name') ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Digite seu nome completo"
          />
          {hasError('name') && (
            <p className="mt-1 text-sm text-red-600">{getError('name')}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError('email') ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="seu@email.com"
          />
          {hasError('email') && (
            <p className="mt-1 text-sm text-red-600">{getError('email')}</p>
          )}
        </div>

        {/* Telefone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Telefone
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError('phone') ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="(11) 99999-9999"
          />
          {hasError('phone') && (
            <p className="mt-1 text-sm text-red-600">{getError('phone')}</p>
          )}
        </div>

        {/* CPF */}
        <div>
          <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-2">
            CPF
          </label>
          <input
            id="cpf"
            type="text"
            value={formData.cpf}
            onChange={(e) => handleInputChange('cpf', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError('cpf') ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="000.000.000-00"
          />
          {hasError('cpf') && (
            <p className="mt-1 text-sm text-red-600">{getError('cpf')}</p>
          )}
        </div>

        {/* Senha */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Senha *
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError('password') ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Mínimo 8 caracteres"
          />
          {hasError('password') && (
            <p className="mt-1 text-sm text-red-600">{getError('password')}</p>
          )}
        </div>

        {/* Confirmar Senha */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Senha *
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError('confirmPassword') ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Repita a senha"
          />
          {hasError('confirmPassword') && (
            <p className="mt-1 text-sm text-red-600">{getError('confirmPassword')}</p>
          )}
        </div>

        {/* Botão de Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
                name: '',
                email: '',
                phone: '',
                cpf: '',
                password: '',
                confirmPassword: ''
              })
              clearErrors()
            }}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Limpar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <Loading size="sm" text="" />
                <span className="ml-2">Salvando...</span>
              </div>
            ) : (
              'Salvar'
            )}
          </button>
        </div>
      </form>

      {/* Informações sobre validação */}
      <div className="mt-8 p-4 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          Recursos demonstrados:
        </h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Validação em tempo real com feedback visual</li>
          <li>• Notificações automáticas de sucesso e erro</li>
          <li>• Validação de email, telefone e CPF</li>
          <li>• Confirmação de senha</li>
          <li>• Estados de loading durante submissão</li>
          <li>• Limpeza automática de erros ao digitar</li>
        </ul>
      </div>
    </div>
  )
}

export default FormExample