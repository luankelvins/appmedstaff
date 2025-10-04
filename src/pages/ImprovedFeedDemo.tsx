import React from 'react';
import ImprovedFeedPage from '../components/Feed/ImprovedFeedPage';
import { ActivityFormData, AnnouncementFormData, EventFormData } from '../types/feed';

const ImprovedFeedDemo: React.FC = () => {
  const handleActivityCreate = async (data: ActivityFormData) => {
    console.log('Nova atividade criada:', data);
    // Aqui você integraria com sua API
    // await api.createActivity(data);
  };

  const handleAnnouncementCreate = async (data: AnnouncementFormData) => {
    console.log('Novo comunicado criado:', data);
    // Aqui você integraria com sua API
    // await api.createAnnouncement(data);
  };

  const handleEventCreate = async (data: EventFormData) => {
    console.log('Novo evento criado:', data);
    // Aqui você integraria com sua API
    // await api.createEvent(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Feed Redesenhado - Demonstração
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Nova experiência do usuário com formulários intuitivos, validações em tempo real 
              e interface padronizada seguindo os melhores princípios de UX.
            </p>
          </div>
        </div>
      </div>

      <ImprovedFeedPage
        onActivityCreate={handleActivityCreate}
        onAnnouncementCreate={handleAnnouncementCreate}
        onEventCreate={handleEventCreate}
      />
    </div>
  );
};

export default ImprovedFeedDemo;