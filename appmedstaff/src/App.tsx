import React, { Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { Layout } from './components/Layout/Layout'
import { Dashboard, Login, Feed, Tasks, Contacts } from './pages'
import TasksPageWrapper from './components/Tasks/TasksPageWrapper'
import Projects from './pages/Projects'
import Profile from './pages/Profile'
import CRMForms from './pages/CRMForms'
import { Commercial, Operational, Benefits } from './pages/activities'
import { Organogram, Administrative, Financial, Relationship } from './pages/company'
import { HeMet, ClinicConsulting } from './pages/business'
import { FinancialConsultingPF, PensionRestitution, HousingAssistance, TaxRecovery } from './pages/partners'
import Audit from './pages/Audit'
import Notifications from './pages/Notifications'
import { Chat } from './pages/Chat'
import RecurringSeries from './pages/RecurringSeries'
import EmployeeCardDemo from './pages/EmployeeCardDemo'

// Componente de loading para Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medstaff-primary"></div>
  </div>
)

function App() {
  const { isAuthenticated, login } = useAuthStore()

  // Login automático para desenvolvimento
  useEffect(() => {
    const autoLogin = async () => {
      if (!isAuthenticated) {
        try {
          console.log('🔑 App - Fazendo login automático para desenvolvimento...')
          await login({
            email: 'admin@medstaff.com.br',
            password: '123456'
          })
          console.log('✅ App - Login automático realizado com sucesso!')
        } catch (error) {
          console.error('❌ App - Erro no login automático:', error)
        }
      }
    }

    autoLogin()
  }, [isAuthenticated, login])

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/tasks" element={<TasksPageWrapper />} />
            <Route path="/tasks/list" element={<TasksPageWrapper />} />
            <Route path="/tasks/kanban" element={<TasksPageWrapper />} />
            <Route path="/tasks/calendar" element={<TasksPageWrapper />} />
            <Route path="/tasks/projects" element={<Projects />} />
            <Route path="/tasks/recurring" element={<RecurringSeries />} />
          <Route path="/contacts/*" element={<Contacts />} />
          <Route path="/crm/forms" element={<CRMForms />} />
          <Route path="/activities/commercial" element={<Commercial />} />
          <Route path="/activities/operational" element={<Operational />} />
          <Route path="/activities/benefits" element={<Benefits />} />
          <Route path="/company/organogram" element={<Organogram />} />
          <Route path="/company/administrative" element={<Administrative />} />
          <Route path="/company/financial" element={<Financial />} />
          <Route path="/company/relationship" element={<Relationship />} />
          <Route path="/business/hemet" element={<HeMet />} />
              <Route path="/business/clinic-consulting" element={<ClinicConsulting />} />
              
              {/* Serviços com Parceiros */}
              <Route path="/partners/financial-consulting-pf" element={<FinancialConsultingPF />} />
              <Route path="/partners/pension-restitution" element={<PensionRestitution />} />
              <Route path="/partners/housing-assistance" element={<HousingAssistance />} />
              <Route path="/partners/tax-recovery" element={<TaxRecovery />} />
              
              {/* Auditoria */}
              <Route path="/audit" element={<Audit />} />
              
              {/* Notificações */}
              <Route path="/notifications" element={<Notifications />} />
              
              {/* Chat Interno */}
              <Route path="/chat" element={<Chat />} />
              
              {/* Perfil */}
              <Route path="/profile" element={<Profile />} />
              
              {/* Demonstração */}
              <Route path="/demo/employee-card" element={<EmployeeCardDemo />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App