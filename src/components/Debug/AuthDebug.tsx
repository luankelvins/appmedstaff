import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

const AuthDebug = () => {
  const { user, isAuthenticated, login } = useAuth()

  console.log('🔐 AuthDebug - Estado da autenticação:', {
    isAuthenticated,
    hasUser: !!user,
    userRole: user?.role,
    userPermissions: user?.permissions?.length || 0
  })

  // Verificar localStorage
  const localStorageAuth = localStorage.getItem('medstaff-auth')
  console.log('💾 AuthDebug - localStorage:', localStorageAuth)

  const handleAutoLogin = async () => {
    try {
      console.log('🔑 Fazendo login automático...')
      await login('admin@medstaff.com.br', '123456')
      console.log('✅ Login automático realizado com sucesso!')
    } catch (error) {
      console.error('❌ Erro no login automático:', error)
    }
  }

  return (
    <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 max-w-xs">
      <h3 className="font-bold">Debug - Autenticação</h3>
      <p>Autenticado: {isAuthenticated ? '✅' : '❌'}</p>
      <p>Usuário: {user?.name || 'Não encontrado'}</p>
      <p>Role: {user?.role || 'N/A'}</p>
      <p>Permissões: {user?.permissions?.length || 0}</p>
      {!isAuthenticated && (
        <button
          onClick={handleAutoLogin}
          className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Login Auto
        </button>
      )}
    </div>
  )
}

export default AuthDebug