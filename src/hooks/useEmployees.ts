import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

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

        // Buscar da tabela profiles (que contém os usuários do sistema)
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, email, position, department, avatar_url')
          .order('name')

        if (profilesError) throw profilesError

        const mappedEmployees: Employee[] = (profiles || []).map(profile => ({
          id: profile.id,
          name: profile.name,
          role: profile.position || 'Membro da equipe',
          email: profile.email,
          avatar: profile.avatar_url || undefined,
          department: profile.department || undefined
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

