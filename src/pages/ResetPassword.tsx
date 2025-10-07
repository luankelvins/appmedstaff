import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { passwordResetService } from '../services/passwordResetService'
import { Loading } from '../components/UI/Loading'

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setError('Token de recuperação inválido.')
      return
    }

    // Validar token usando o serviço
    const validateToken = async () => {
      try {
        const validation = await passwordResetService.validateResetToken(token)
        
        if (validation.valid && validation.userId) {
          setUserId(validation.userId)
          setTokenValid(true)
        } else {
          setError(validation.message)
        }
      } catch (err) {
        console.error('Erro ao validar token:', err)
        setError('Erro ao validar token de recuperação.')
      }
    }

    validateToken()
  }, [searchParams])

  const validatePassword = (pwd: string): string[] => {
    const errors = []
    if (pwd.length < 8) errors.push('Mínimo 8 caracteres')
    if (!/[A-Z]/.test(pwd)) errors.push('Pelo menos 1 letra maiúscula')
    if (!/[a-z]/.test(pwd)) errors.push('Pelo menos 1 letra minúscula')
    if (!/\d/.test(pwd)) errors.push('Pelo menos 1 número')
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) errors.push('Pelo menos 1 caractere especial')
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validações
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      setLoading(false)
      return
    }

    const passwordErrors = validatePassword(password)
    if (passwordErrors.length > 0) {
      setError(`Senha inválida: ${passwordErrors.join(', ')}`)
      setLoading(false)
      return
    }

    try {
      const token = searchParams.get('token')
      if (!token) {
        setError('Token inválido.')
        setLoading(false)
        return
      }

      // Redefinir senha usando o serviço
      const result = await passwordResetService.resetPassword(token, password)
      
      if (result.success) {
        setSuccess(true)
        
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        setError(result.message)
      }

    } catch (err: any) {
      console.error('Erro ao redefinir senha:', err)
      setError('Erro interno. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!tokenValid && error) {
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
              Token Inválido
            </h1>
            <p className="text-gray-600 mt-2">
              {error}
            </p>
          </div>

          {/* Error Message */}
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Link
              to="/forgot-password"
              className="w-full bg-medstaff-primary text-white py-2 px-4 rounded-md hover:bg-medstaff-primary/90 focus:outline-none focus:ring-2 focus:ring-medstaff-primary focus:ring-offset-2 transition-colors flex items-center justify-center"
            >
              Solicitar Novo Link
            </Link>
            
            <Link
              to="/login"
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
            >
              Voltar ao Login
            </Link>
          </div>

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

  if (success) {
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
              Senha Redefinida!
            </h1>
            <p className="text-gray-600 mt-2">
              Sua senha foi redefinida com sucesso. Você será redirecionado para o login.
            </p>
          </div>

          {/* Success Message */}
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">
              Redirecionando para o login...
            </p>
          </div>

          {/* Loading */}
          <div className="flex items-center justify-center">
            <Loading size="sm" text="" />
            <span className="ml-2 text-gray-600">Redirecionando...</span>
          </div>

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

  if (!tokenValid) {
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
              Verificando Token...
            </h1>
            <p className="text-gray-600 mt-2">
              Aguarde enquanto validamos seu link de recuperação.
            </p>
          </div>

          {/* Loading */}
          <div className="flex items-center justify-center">
            <Loading size="sm" text="" />
            <span className="ml-2 text-gray-600">Verificando...</span>
          </div>

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

  const passwordErrors = validatePassword(password)
  const isPasswordValid = passwordErrors.length === 0 && password.length > 0

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
            Redefinir Senha
          </h1>
          <p className="text-gray-600 mt-2">
            Digite sua nova senha abaixo
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Nova Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                placeholder="Digite sua nova senha"
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
            
            {password && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <div className="text-xs font-medium text-gray-700 mb-2">Requisitos da senha:</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { text: 'Mínimo 8 caracteres', valid: password.length >= 8 },
                    { text: 'Letra maiúscula', valid: /[A-Z]/.test(password) },
                    { text: 'Letra minúscula', valid: /[a-z]/.test(password) },
                    { text: 'Número', valid: /\d/.test(password) },
                    { text: 'Caractere especial', valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
                  ].map((criterion, index) => (
                    <div key={index} className={`flex items-center text-xs transition-colors ${criterion.valid ? 'text-green-600' : 'text-gray-400'}`}>
                      {criterion.valid ? (
                        <CheckCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                      )}
                      <span>{criterion.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Senha
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
                placeholder="Confirme sua nova senha"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {confirmPassword && password !== confirmPassword && (
              <div className="mt-2 flex items-center text-sm text-red-600">
                <XCircle className="w-4 h-4 mr-1.5" />
                <span>As senhas não coincidem</span>
              </div>
            )}
            
            {confirmPassword && password === confirmPassword && password.length > 0 && (
              <div className="mt-2 flex items-center text-sm text-green-600">
                <CheckCircle className="w-4 h-4 mr-1.5" />
                <span>As senhas coincidem</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordValid || password !== confirmPassword}
            className="w-full bg-medstaff-primary text-white py-2 px-4 rounded-md hover:bg-medstaff-primary/90 focus:outline-none focus:ring-2 focus:ring-medstaff-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loading size="sm" text="" />
                <span className="ml-2">Redefinindo...</span>
              </div>
            ) : (
              'Redefinir Senha'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="text-medstaff-primary hover:text-medstaff-primary/80 text-sm"
          >
            Voltar ao Login
          </Link>
          <p className="text-xs text-gray-500 mt-2">
            © 2024 MedStaff. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
