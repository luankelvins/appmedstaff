import { usePermissions } from '../hooks/usePermissions'
import { useAuth } from '../contexts/AuthContext'
import MainDashboard from '../components/Dashboard/MainDashboard'

export const Dashboard = () => {
  console.log('🚀 Dashboard - Componente iniciado com MainDashboard')
  
  const { canViewDashboard } = usePermissions()
  const { user } = useAuth()

  if (!canViewDashboard()) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Você não tem permissão para acessar o dashboard.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <MainDashboard 
        userId={user?.id || 'user-1'}
        userRole={user?.role || 'analista'}
        className="max-w-7xl mx-auto"
      />
    </div>
  )
}

export default Dashboard