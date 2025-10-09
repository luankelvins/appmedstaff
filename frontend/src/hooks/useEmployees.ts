import { useState, useEffect } from 'react'
import { employeeDataService } from '../utils/employeeDataService'

export interface Employee {
  id: string
  name: string
  role: string
  email?: string
  avatar?: string
  department?: string
}

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true)
        setError(null)

        // Buscar dados administrativos dos funcionários
        const employeesData = await employeeDataService.getAdministrativeData()

        const mappedEmployees: Employee[] = employeesData.map((employee: any) => ({
          id: employee.id,
          name: employee.dados_pessoais?.nome_completo || employee.email?.split('@')[0] || 'Usuário',
          role: employee.dados_profissionais?.cargo || 'Membro da equipe',
          email: employee.email,
          avatar: employee.dados_pessoais?.foto || undefined,
          department: employee.dados_profissionais?.departamento || undefined
        }))

        setEmployees(mappedEmployees)
      } catch (err) {
        console.error('Erro ao buscar employees:', err)
        setError('Erro ao carregar membros da equipe')
        setEmployees([])
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  return { employees, loading, error, refetch: () => {} }
}

// Hook para buscar um employee específico por ID
export const useEmployee = (employeeId?: string) => {
  const { employees, loading, error } = useEmployees()
  const employee = employees.find(e => e.id === employeeId)
  
  return { employee, loading, error }
}

