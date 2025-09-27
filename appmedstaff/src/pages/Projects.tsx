import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, FolderOpen, Calendar, Users } from 'lucide-react';
import { Project, ProjectStatus } from '../types/project';
import projectService from '../services/projectService';
import ProjectForm from '../components/Projects/ProjectForm';
import { toast } from 'react-hot-toast';

const statusConfig = {
  [ProjectStatus.PLANNING]: { label: 'Planejamento', color: 'bg-gray-100 text-gray-800' },
  [ProjectStatus.ACTIVE]: { label: 'Ativo', color: 'bg-green-100 text-green-800' },
  [ProjectStatus.ON_HOLD]: { label: 'Em Pausa', color: 'bg-yellow-100 text-yellow-800' },
  [ProjectStatus.COMPLETED]: { label: 'Concluído', color: 'bg-blue-100 text-blue-800' },
  [ProjectStatus.CANCELLED]: { label: 'Cancelado', color: 'bg-red-100 text-red-800' }
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjects();
      setProjects(response.projects);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      toast.error('Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (data: any) => {
    try {
      setFormLoading(true);
      const newProject = await projectService.createProject(data);
      setProjects(prev => [newProject, ...prev]);
      toast.success('Projeto criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      toast.error('Erro ao criar projeto');
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateProject = async (data: any) => {
    if (!editingProject) return;
    
    try {
      setFormLoading(true);
      const updatedProject = await projectService.updateProject(editingProject.id, data);
      setProjects(prev => prev.map(p => p.id === editingProject.id ? updatedProject : p));
      toast.success('Projeto atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      toast.error('Erro ao atualizar projeto');
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (!confirm(`Tem certeza que deseja excluir o projeto "${project.name}"?`)) {
      return;
    }

    try {
      await projectService.deleteProject(project.id);
      setProjects(prev => prev.filter(p => p.id !== project.id));
      toast.success('Projeto excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      toast.error('Erro ao excluir projeto');
    }
  };

  const handleToggleStatus = async (project: Project) => {
    try {
      const updatedProject = await projectService.toggleProjectStatus(project.id);
      setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
      toast.success(`Projeto ${updatedProject.isActive ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status do projeto');
    }
  };

  const openEditForm = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const openCreateForm = () => {
    setEditingProject(undefined);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProject(undefined);
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date | undefined) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FolderOpen className="w-7 h-7 text-blue-600" />
            Projetos
          </h1>
          <p className="text-gray-600 mt-1">Gerencie todos os projetos da organização</p>
        </div>
        <button
          onClick={openCreateForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Projeto
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar projetos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FolderOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-semibold">{projects.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ativos</p>
              <p className="text-xl font-semibold">
                {projects.filter(p => p.status === ProjectStatus.ACTIVE).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Planejamento</p>
              <p className="text-xl font-semibold">
                {projects.filter(p => p.status === ProjectStatus.PLANNING).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FolderOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Concluídos</p>
              <p className="text-xl font-semibold">
                {projects.filter(p => p.status === ProjectStatus.COMPLETED).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {filteredProjects.length === 0 ? (
          <div className="p-8 text-center">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhum projeto encontrado' : 'Nenhum projeto cadastrado'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Tente ajustar os termos de busca'
                : 'Comece criando seu primeiro projeto'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={openCreateForm}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Criar Primeiro Projeto
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projeto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className={!project.isActive ? 'opacity-60' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: project.color }}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {project.name}
                          </div>
                          {project.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {project.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[project.status].color}`}>
                        {statusConfig[project.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>Início: {formatDate(project.startDate)}</div>
                        <div>Fim: {formatDate(project.endDate)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(project.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(project)}
                          className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                            project.isActive ? 'text-gray-600' : 'text-green-600'
                          }`}
                          title={project.isActive ? 'Desativar projeto' : 'Ativar projeto'}
                        >
                          {project.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEditForm(project)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Editar projeto"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Excluir projeto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <ProjectForm
        project={editingProject}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
        isLoading={formLoading}
      />
    </div>
  );
}