import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import { Login } from '../../pages/Login'
import { useAuthStore } from '../../stores/authStore'

// Mock do react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn()
  }
}))

// Mock do authStore
const mockAuthStore = {
  login: vi.fn(),
  isLoading: false,
  error: null as string | null,
  user: null as any,
  isAuthenticated: false
}

vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn(() => mockAuthStore)
}))

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <BrowserRouter>{children}</BrowserRouter>
}

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthStore.isLoading = false
    mockAuthStore.error = null
    mockAuthStore.login = vi.fn()
  })

  describe('Login Page', () => {
    test('deve renderizar formulário de login', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      expect(screen.getByText(/plataforma interna/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
    })

    test('deve validar campos obrigatórios', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      // Tentar fazer login sem preencher campos
      const loginButton = screen.getByRole('button', { name: /entrar/i })
      fireEvent.click(loginButton)

      // Como o componente usa validação HTML5, não há mensagens customizadas
      // Verificamos se o login não foi chamado
      expect(mockAuthStore.login).not.toHaveBeenCalled()
    })

    test('deve fazer login com credenciais válidas', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      // Preencher formulário
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/senha/i)
      
      fireEvent.change(emailInput, { target: { value: 'admin@medstaff.com.br' } })
      fireEvent.change(passwordInput, { target: { value: '123456' } })

      // Fazer login
      const loginButton = screen.getByRole('button', { name: /entrar/i })
      fireEvent.click(loginButton)

      await waitFor(() => {
        expect(mockAuthStore.login).toHaveBeenCalledWith({
          email: 'admin@medstaff.com.br',
          password: '123456'
        })
      })
    })

    test('deve exibir erro de autenticação', () => {
      mockAuthStore.error = 'Email ou senha inválidos'

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      expect(screen.getByText(/email ou senha inválidos/i)).toBeInTheDocument()
    })

    test('deve exibir estado de carregamento', () => {
      mockAuthStore.isLoading = true

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      expect(screen.getByText(/entrando/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled()
    })

    test('deve permitir inserir email e senha', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
      const passwordInput = screen.getByLabelText(/senha/i) as HTMLInputElement

      fireEvent.change(emailInput, { target: { value: 'test@medstaff.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      expect(emailInput.value).toBe('test@medstaff.com')
      expect(passwordInput.value).toBe('password123')
    })

    test('deve ter campos com tipos corretos', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/senha/i)

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    test('deve ter placeholders apropriados', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/senha/i)

      expect(emailInput).toHaveAttribute('placeholder', 'seu@email.com')
      expect(passwordInput).toHaveAttribute('placeholder', '••••••••')
    })
  })

  describe('Fluxo de autenticação completo', () => {
    test('deve simular fluxo de login bem-sucedido', async () => {
      const { rerender } = render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      // Preencher e submeter formulário
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/senha/i)
      
      fireEvent.change(emailInput, { target: { value: 'admin@medstaff.com.br' } })
      fireEvent.change(passwordInput, { target: { value: '123456' } })

      const loginButton = screen.getByRole('button', { name: /entrar/i })
      fireEvent.click(loginButton)

      // Simular estado de carregamento
      mockAuthStore.isLoading = true
      rerender(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      expect(screen.getByText(/entrando/i)).toBeInTheDocument()

      // Simular sucesso
      mockAuthStore.isLoading = false
      mockAuthStore.isAuthenticated = true
      mockAuthStore.user = {
        id: '1',
        name: 'Super Administrador',
        email: 'admin@medstaff.com.br',
        role: {
          id: '1',
          name: 'Super Admin',
          slug: 'super_admin',
          description: 'Acesso total ao sistema',
          level: 'strategic',
          permissions: []
        },
        permissions: [],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }

      expect(mockAuthStore.login).toHaveBeenCalled()
    })

    test('deve simular fluxo de login com erro', async () => {
      const { rerender } = render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      // Preencher e submeter formulário
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/senha/i)
      
      fireEvent.change(emailInput, { target: { value: 'wrong@email.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })

      const loginButton = screen.getByRole('button', { name: /entrar/i })
      fireEvent.click(loginButton)

      // Simular erro
      mockAuthStore.error = 'Email ou senha inválidos'
      rerender(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      expect(screen.getByText(/email ou senha inválidos/i)).toBeInTheDocument()
    })

    test('deve limpar campos após erro', () => {
      mockAuthStore.error = 'Erro de conexão'

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
      const passwordInput = screen.getByLabelText(/senha/i) as HTMLInputElement

      // Verificar se campos podem ser limpos mesmo com erro
      fireEvent.change(emailInput, { target: { value: '' } })
      fireEvent.change(passwordInput, { target: { value: '' } })

      expect(emailInput.value).toBe('')
      expect(passwordInput.value).toBe('')
    })
  })
})