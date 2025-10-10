import React, { Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { Layout } from './components/Layout/Layout'
import { Dashboard, Login, Feed, Tasks, Contacts } from './pages'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import TasksPageWrapper from './components/Tasks/TasksPageWrapper'
import Projects from './pages/Projects'
import Profile from './pages/Profile'
import CRMForms from './pages/CRMForms'
import { Commercial, Operational, Benefits } from './pages/activities'
import Leads from './pages/activities/commercial/Leads'
import ContactsLeads from './pages/contacts/Leads'
import { Organogram, Administrative, Financial, Relationship } from './pages/company'
import { HeMet, ClinicConsulting } from './pages/business'
import { FinancialConsultingPF, PensionRestitution, HousingAssistance, TaxRecovery } from './pages/partners'
import Audit from './pages/Audit'
import Notifications from './pages/Notifications'
import ChatReal from './pages/ChatReal'
import RecurringSeries from './pages/RecurringSeries'
import EmployeeCardDemo from './pages/EmployeeCardDemo'
import EmployeeProfileDemo from './components/Integration/EmployeeProfileDemo'
import SecurityDashboard from './components/SecurityDashboard'

import TaskAssignmentPage from './pages/TaskAssignment'
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary'
import { LoadingCard } from './components/UI/LoadingStates'
import { ToastProvider } from './contexts/ToastContext'
import { NotificationProvider } from './components/Notifications/NotificationSystem'

import ImprovedFeedDemo from './pages/ImprovedFeedDemo'
import FormExample from './components/Examples/FormExample'
import ServicesIntegrationTest from './components/Test/ServicesIntegrationTest'
import IntegratedDashboard from './components/Dashboard/IntegratedDashboard'
import DashboardIntegrationTest from './components/Test/DashboardIntegrationTest'

// Componente de loading para Suspense
const LoadingFallback = () => (
  <LoadingCard 
    title="Carregando aplicação..."
    description="Aguarde enquanto carregamos os dados necessários"
  />
)

// Componente de rota protegida
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingFallback />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  const { isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  console.log('[App] Estado atual:', { isAuthenticated, loading, pathname: location.pathname })

  // Redirecionar após login
  useEffect(() => {
    if (!loading && isAuthenticated && location.pathname === '/login') {
      console.log('[App] Usuário autenticado em /login, redirecionando para /dashboard')
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, loading, location.pathname, navigate])

  return (
    <ErrorBoundary>
      <NotificationProvider>
        <ToastProvider>
          <Suspense fallback={<LoadingFallback />}>
          {loading ? (
            <>
              {console.log('[App] Renderizando LoadingFallback')}
              <LoadingFallback />
            </>
          ) : (
            <>
              {console.log('[App] Renderizando Routes, isAuthenticated:', isAuthenticated)}
              <Routes>
                     {/* Rotas Públicas */}
                     <Route path="/login" element={
                       isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
                     } />
                     <Route path="/forgot-password" element={
                       isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />
                     } />
                     <Route path="/reset-password" element={
                       isAuthenticated ? <Navigate to="/dashboard" replace /> : <ResetPassword />
                     } />

            {/* Rotas Protegidas */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
            <Route path="feed" element={<Feed />} />
            <Route path="tasks" element={<TasksPageWrapper />} />
            <Route path="tasks/list" element={<TasksPageWrapper />} />
            <Route path="tasks/kanban" element={<TasksPageWrapper />} />
            <Route path="tasks/calendar" element={<TasksPageWrapper />} />
            <Route path="tasks/projects" element={<Projects />} />
            <Route path="tasks/recurring" element={<RecurringSeries />} />
            <Route path="tasks/assignment" element={<TaskAssignmentPage />} />
            <Route path="contacts/*" element={<Contacts />} />
            <Route path="contacts/leads" element={<ContactsLeads />} />
            <Route path="crm/forms" element={<CRMForms />} />
            <Route path="activities/commercial" element={<Commercial />} />
            <Route path="activities/commercial/leads" element={<Leads />} />
            <Route path="activities/operational" element={<Operational />} />
            <Route path="activities/benefits" element={<Benefits />} />
            <Route path="company/organogram" element={<Organogram />} />
            <Route path="company/administrative" element={<Administrative />} />
            <Route path="company/financial" element={<Financial />} />
            <Route path="company/relationship" element={<Relationship />} />
            <Route path="business/hemet" element={<HeMet />} />
            <Route path="business/clinic-consulting" element={<ClinicConsulting />} />
            
            {/* Serviços com Parceiros */}
            <Route path="partners/financial-consulting-pf" element={<FinancialConsultingPF />} />
            <Route path="partners/pension-restitution" element={<PensionRestitution />} />
            <Route path="partners/housing-assistance" element={<HousingAssistance />} />
            <Route path="partners/tax-recovery" element={<TaxRecovery />} />
            
            {/* Auditoria */}
            <Route path="audit" element={<Audit />} />
            
            {/* Dashboard de Segurança */}
            <Route path="security" element={<SecurityDashboard />} />
            
            {/* Notificações */}
            <Route path="notifications" element={<Notifications />} />
            
                       {/* Chat Interno */}
                       <Route path="chat" element={<ChatReal />} />
            
            {/* Perfil */}
            <Route path="profile" element={<Profile />} />
            
            {/* Demonstração */}
            <Route path="demo/employee-card" element={<EmployeeCardDemo />} />
            <Route path="demo/employee-profile" element={<EmployeeProfileDemo />} />
            <Route path="demo/improved-feed" element={<ImprovedFeedDemo />} />
            <Route path="demo/form-validation" element={<FormExample />} />
            <Route path="demo/services-integration" element={<ServicesIntegrationTest />} />
            <Route path="/demo/integrated-dashboard" element={<IntegratedDashboard />} />
                  <Route path="/demo/dashboard-test" element={<DashboardIntegrationTest />} />
            

          </Route>

            {/* Rota catch-all - redireciona para login se não autenticado, senão para dashboard */}
            <Route path="*" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
            } />
            </Routes>
          </>
        )}
          </Suspense>
        </ToastProvider>
      </NotificationProvider>
    </ErrorBoundary>
  )
}

export default App