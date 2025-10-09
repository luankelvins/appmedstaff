import { useState, useCallback } from 'react'

export interface ViaCEPAddress {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
}

export interface AddressData {
  street: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

export const useViaCEP = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAddress = useCallback(async (cep: string): Promise<AddressData | null> => {
    // Remove caracteres não numéricos
    const cleanCEP = cep.replace(/\D/g, '')

    // Valida o CEP
    if (cleanCEP.length !== 8) {
      setError('CEP deve ter 8 dígitos')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar CEP')
      }

      const data: ViaCEPAddress = await response.json()

      // ViaCEP retorna erro: true quando o CEP não existe
      if ('erro' in data && data.erro) {
        setError('CEP não encontrado')
        return null
      }

      // Mapear para o formato esperado
      const addressData: AddressData = {
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
        zipCode: cep
      }

      setLoading(false)
      return addressData

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar CEP'
      setError(errorMessage)
      setLoading(false)
      return null
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    fetchAddress,
    loading,
    error,
    clearError
  }
}


