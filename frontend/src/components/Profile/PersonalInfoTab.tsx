import React, { useState, useEffect } from 'react'
import { Save, X, Edit3, AlertCircle, Search } from 'lucide-react'
import { UserProfile, ProfileUpdateRequest, UserAddress } from '../../types/profile'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { personalInfoSchema } from '../../utils/validationSchemas'
import { usePhoneValidation, useCEPValidation } from '../../hooks/useFormValidation'
import { useViaCEP } from '../../hooks/useViaCEP'

interface PersonalInfoTabProps {
  profile: UserProfile
  onUpdate: (data: ProfileUpdateRequest) => Promise<void>
  canEdit?: boolean
}

interface FormData {
  name: string
  email: string
  phone?: string
  birthDate?: string
  address: UserAddress
}

export const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({
  profile,
  onUpdate,
  canEdit = true
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const { formatPhone } = usePhoneValidation()
  const { formatCEP } = useCEPValidation()
  const { fetchAddress, loading: loadingCEP, error: cepError, clearError } = useViaCEP()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue
  } = useForm<FormData>({
    resolver: zodResolver(personalInfoSchema) as any,
    defaultValues: {
      name: profile.name,
      email: profile.email,
      phone: profile.phone || '',
      birthDate: profile.birthDate || '',
      address: {
        street: profile.address?.street || '',
        number: profile.address?.number || '',
        complement: profile.address?.complement || '',
        neighborhood: profile.address?.neighborhood || '',
        city: profile.address?.city || '',
        state: profile.address?.state || '',
        zipCode: profile.address?.zipCode || '',
        country: profile.address?.country || 'Brasil'
      }
    }
  })

  const onSubmit = async (data: FormData) => {
    try {
      await onUpdate(data)
      setIsEditing(false)
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
    }
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value)
    setValue('phone', formatted, { shouldValidate: true })
  }

  const handleCEPChange = async (value: string) => {
    const formatted = formatCEP(value)
    setValue('address.zipCode', formatted, { shouldValidate: true })

    // Buscar endereço automaticamente quando o CEP estiver completo (8 dígitos)
    const cleanCEP = value.replace(/\D/g, '')
    if (cleanCEP.length === 8) {
      const addressData = await fetchAddress(formatted)
      
      if (addressData) {
        // Preencher os campos automaticamente
        setValue('address.street', addressData.street, { shouldValidate: true })
        setValue('address.neighborhood', addressData.neighborhood, { shouldValidate: true })
        setValue('address.city', addressData.city, { shouldValidate: true })
        setValue('address.state', addressData.state, { shouldValidate: true })
      }
    }
  }

  // Limpar erro do CEP quando o usuário começar a digitar novamente
  useEffect(() => {
    if (cepError) {
      const timeout = setTimeout(() => clearError(), 3000)
      return () => clearTimeout(timeout)
    }
  }, [cepError, clearError])

  const watchedValues = watch()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Informações Pessoais
        </h2>
        
        {!isEditing && canEdit && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Editar
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo *
            </label>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  {...register('name')}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.name.message}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-900">{profile.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            {isEditing ? (
              <div>
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email.message}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-900">{profile.email}</p>
            )}
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone
            </label>
            {isEditing ? (
              <div>
                <input
                  type="tel"
                  {...register('phone')}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.phone.message}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-900">{profile.phone || 'Não informado'}</p>
            )}
          </div>

          {/* Data de Nascimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Nascimento
            </label>
            {isEditing ? (
              <div>
                <input
                  type="date"
                  {...register('birthDate')}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.birthDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.birthDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.birthDate.message}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-900">
                {profile.birthDate ? new Date(profile.birthDate).toLocaleDateString('pt-BR') : 'Não informado'}
              </p>
            )}
          </div>
        </div>

        {/* Endereço */}
        <div className="mt-8">
          <h3 className="text-md font-medium text-gray-900 mb-4">Endereço</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* CEP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CEP
              </label>
              {isEditing ? (
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      {...register('address.zipCode')}
                      onChange={(e) => handleCEPChange(e.target.value)}
                      placeholder="12345-678"
                      maxLength={9}
                      className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.address?.zipCode || cepError ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {loadingCEP && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <Search className="w-5 h-5 text-blue-500 animate-pulse" />
                      </div>
                    )}
                  </div>
                  {errors.address?.zipCode && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.address.zipCode.message}
                    </p>
                  )}
                  {cepError && !errors.address?.zipCode && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {cepError}
                    </p>
                  )}
                  {!loadingCEP && !cepError && !errors.address?.zipCode && watch('address.zipCode')?.replace(/\D/g, '').length === 8 && (
                    <p className="mt-1 text-sm text-green-600">
                      ✓ Endereço encontrado
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-900">{profile.address?.zipCode || 'Não informado'}</p>
              )}
            </div>

            {/* Rua */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rua
              </label>
              {isEditing ? (
                <input
                  type="text"
                  {...register('address.street')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.address?.street || 'Não informado'}</p>
              )}
            </div>

            {/* Número */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número
              </label>
              {isEditing ? (
                <input
                  type="text"
                  {...register('address.number')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.address?.number || 'Não informado'}</p>
              )}
            </div>

            {/* Complemento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complemento
              </label>
              {isEditing ? (
                <input
                  type="text"
                  {...register('address.complement')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.address?.complement || 'Não informado'}</p>
              )}
            </div>

            {/* Bairro */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bairro
              </label>
              {isEditing ? (
                <input
                  type="text"
                  {...register('address.neighborhood')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.address?.neighborhood || 'Não informado'}</p>
              )}
            </div>

            {/* Cidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cidade
              </label>
              {isEditing ? (
                <input
                  type="text"
                  {...register('address.city')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.address?.city || 'Não informado'}</p>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              {isEditing ? (
                <select
                  {...register('address.state')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              ) : (
                <p className="text-gray-900">{profile.address?.state || 'Não informado'}</p>
              )}
            </div>

            {/* País */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                País
              </label>
              {isEditing ? (
                <input
                  type="text"
                  {...register('address.country')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.address?.country || 'Brasil'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Botões */}
        {isEditing && (
          <div className="flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </button>
          </div>
        )}
      </form>
    </div>
  )
}