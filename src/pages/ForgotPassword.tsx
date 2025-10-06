import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { passwordResetService } from '../services/passwordResetService'
import { Loading } from '../components/UI/Loading'

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Verificar rate limiting
      const rateLimitCheck = await passwordResetService.checkRateLimit(email)
      
      if (!rateLimitCheck.allowed) {
        setError(rateLimitCheck.message || 'Muitas tentativas. Aguarde antes de tentar novamente.')
        setLoading(false)
        return
      }

      // Solicitar recuperação de senha
      const result = await passwordResetService.requestPasswordReset(email)
      
      if (result.success) {
        setEmailSent(true)
        setMessage(result.message)
      } else {
        setError(result.message)
      }
    } catch (err) {
      console.error('Erro ao processar recuperação de senha:', err)
      setError('Erro interno. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendEmail = async () => {
    if (!email) return
    
    setLoading(true)
    setError('')
    
    try {
      const result = await passwordResetService.resendPasswordReset(email)
      
      if (result.success) {
        setMessage(result.message)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Erro ao reenviar email.')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
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
              Email Enviado!
            </h1>
            <p className="text-gray-600 mt-2">
              Enviamos um link de recuperação para <strong>{email}</strong>
            </p>
          </div>

          {/* Success Message */}
          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{message}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4">
            <button
              onClick={handleResendEmail}
              disabled={loading}
              className="w-full bg-medstaff-primary text-white py-2 px-4 rounded-md hover:bg-medstaff-primary/90 focus:outline-none focus:ring-2 focus:ring-medstaff-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loading size="sm" text="" />
                  <span className="ml-2">Reenviando...</span>
                </div>
              ) : (
                'Reenviar Email'
              )}
            </button>
            
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
              Verifique também sua pasta de spam/lixo eletrônico.
            </p>
          </div>
        </div>
      </div>
    )
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
            Esqueceu sua senha?
          </h1>
          <p className="text-gray-600 mt-2">
            Digite seu email e enviaremos um link para redefinir sua senha
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{message}</p>
          </div>
        )}

        {/* Form */}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medstaff-primary focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-medstaff-primary text-white py-2 px-4 rounded-md hover:bg-medstaff-primary/90 focus:outline-none focus:ring-2 focus:ring-medstaff-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loading size="sm" text="" />
                <span className="ml-2">Enviando...</span>
              </div>
            ) : (
              'Enviar Link de Recuperação'
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

export default ForgotPassword
