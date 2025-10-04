import React, { useState, useEffect } from 'react';
import { Card } from '@/components/UI/Card';
import { Button } from '@/components/UI/Button';
import { Badge } from '@/components/UI/Badge';
import { Users, Mail, MapPin, AlertCircle } from 'lucide-react';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { internalTeamService, InternalTeamMember, Department } from '@/services/internalTeamService';

export const InternalTeamSection: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<InternalTeamMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const permissions = useAdminPermissions();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [membersData, departmentsData] = await Promise.all([
          internalTeamService.getInternalTeamMembers(),
          internalTeamService.getDepartments()
        ]);
        setTeamMembers(membersData);
        setDepartments(departmentsData);
      } catch (error) {
        console.error('Erro ao carregar dados do time interno:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'on_leave':
        return 'Afastado';
      case 'inactive':
        return 'Inativo';
      default:
        return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando time interno...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com busca e ações */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Time Interno</h3>
          <p className="text-sm text-gray-600">
            {filteredMembers.length} de {teamMembers.length} membros
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Buscar por nome, email, cargo ou departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {permissions.canCreateEmployees && (
            <Button className="whitespace-nowrap">
              <Users className="h-4 w-4 mr-2" />
              Adicionar Membro
            </Button>
          )}
        </div>
      </div>

      {/* Grid de membros */}
      {filteredMembers.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nenhum membro encontrado' : 'Nenhum membro cadastrado'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Tente ajustar os termos de busca para encontrar o que procura.'
              : 'Comece adicionando membros ao time interno.'
            }
          </p>
          {!searchTerm && permissions.canCreateEmployees && (
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Adicionar Primeiro Membro
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">{member.position}</p>
                  <Badge className={`text-xs ${getStatusColor(member.status)}`}>
                    {getStatusLabel(member.status)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{member.department}</span>
                </div>
              </div>

              {(permissions.canEditEmployees || permissions.canDeleteEmployees) && (
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  {permissions.canEditEmployees && (
                    <Button variant="outline" size="sm" className="flex-1">
                      Editar
                    </Button>
                  )}
                  {permissions.canDeleteEmployees && (
                    <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700">
                      Remover
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Estatísticas por departamento */}
      {departments.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Departamento</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {departments.map((dept) => {
              const deptMembers = teamMembers.filter(member => member.department === dept.name);
              const activeMembers = deptMembers.filter(member => member.status === 'active');
              
              return (
                <Card key={dept.id} className="p-4">
                  <h5 className="font-medium text-gray-900 mb-2">{dept.name}</h5>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {activeMembers.length}
                  </div>
                  <p className="text-sm text-gray-600">
                    {deptMembers.length} total
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};