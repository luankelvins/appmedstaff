// Utilitários para formatação de campos

export const formatCPF = (value: string): string => {
  // Remove tudo que não é dígito
  const cleanValue = value.replace(/\D/g, '')
  
  // Aplica a máscara xxx.xxx.xxx-xx
  if (cleanValue.length <= 11) {
    return cleanValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }
  
  return cleanValue.slice(0, 11)
    .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export const formatCEP = (value: string): string => {
  // Remove tudo que não é dígito
  const cleanValue = value.replace(/\D/g, '')
  
  // Aplica a máscara xxxxx-xxx
  if (cleanValue.length <= 8) {
    return cleanValue.replace(/(\d{5})(\d)/, '$1-$2')
  }
  
  return cleanValue.slice(0, 8).replace(/(\d{5})(\d{3})/, '$1-$2')
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export const formatPhone = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '')
  
  if (cleanValue.length <= 10) {
    return cleanValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  
  return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
}

// Função para buscar endereço por CEP
export const fetchAddressByCEP = async (cep: string) => {
  const cleanCEP = cep.replace(/\D/g, '')
  
  if (cleanCEP.length !== 8) {
    throw new Error('CEP deve ter 8 dígitos')
  }
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
    const data = await response.json()
    
    if (data.erro) {
      throw new Error('CEP não encontrado')
    }
    
    return {
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      cidade: data.localidade || '',
      estado: data.uf || ''
    }
  } catch (error) {
    throw new Error('Erro ao buscar CEP')
  }
}

// Função para gerar número de registro único
export const generateRegistrationNumber = (): string => {
  const year = new Date().getFullYear()
  const timestamp = Date.now().toString().slice(-6)
  return `${year}${timestamp}`
}

// Validações
export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '')
  
  if (cleanCPF.length !== 11) return false
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false
  
  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false
  
  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false
  
  return true
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}