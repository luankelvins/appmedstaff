import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loading } from '../components/UI/Loading'
import { Eye, EyeOff } from 'lucide-react'
import { useValidation } from '../hooks/useValidation'
import { useApiNotifications } from '../components/Notifications/NotificationSystem'

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  
  const { notifySuccess, notifyError } = useApiNotifications()
  const { validate, errors, clearErrors, hasError, getError } = useValidation({
    email: { required: true, email: true },
    password: { required: true, minLength: 6 }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()
    
    // Validar dados
    const validation = validate({ email, password })
    if (!validation.isValid) {
      return
    }
    
    try {
      await login(email, password)
      notifySuccess('Login realizado com sucesso!')
      navigate('/dashboard')
    } catch (err) {
      notifyError(
        'Erro ao fazer login',
        err instanceof Error ? err.message : 'Credenciais inválidas'
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medstaff-primary to-medstaff-secondary flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/medstaff-logo.svg" 
            alt="MedStaff" 
            className="h-12 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">
            Plataforma Interna
          </h1>
          <p className="text-gray-600 mt-2">
            Faça login para acessar o sistema
          </p>
        </div>



        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-medstaff-primary focus:border-transparent ${
                hasError('email') ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="seu@email.com"
            />
            {hasError('email') && (
              <p className="mt-1 text-sm text-red-600">{getError('email')}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-medstaff-primary hover:text-medstaff-primary/80"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-medstaff-primary focus:border-transparent ${
                  hasError('password') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {hasError('password') && (
              <p className="mt-1 text-sm text-red-600">{getError('password')}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-medstaff-primary text-white py-2 px-4 rounded-md hover:bg-medstaff-primary/90 focus:outline-none focus:ring-2 focus:ring-medstaff-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loading size="sm" text="" />
                <span className="ml-2">Entrando...</span>
              </div>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2024 MedStaff. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login