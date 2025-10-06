import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../contexts/AuthContext';
import MainDashboard from '../components/Dashboard/MainDashboard';

export const Dashboard = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  console.log('[Dashboard] Renderizado com usuário:', user);
  console.log('[Dashboard] Permissão dashboard.view:', hasPermission('dashboard.view'));

  // Verificar se o usuário tem permissão para acessar o dashboard
  if (!hasPermission('dashboard.view')) {
    console.log('[Dashboard] Acesso negado!');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  console.log('[Dashboard] Renderizando MainDashboard');
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <MainDashboard 
          className="max-w-7xl mx-auto"
          userId={user?.id || 'user-1'}
          userRole={user?.role || 'analista'}
        />
      </div>
    </div>
  );
}

export default Dashboard