import { Project, ProjectStatus, CreateProjectRequest, UpdateProjectRequest, ProjectListResponse } from '../types/project';

// Mock data para desenvolvimento
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'MedStaff Platform',
    description: 'Plataforma principal do MedStaff',
    status: ProjectStatus.ACTIVE,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    createdBy: 'admin',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    color: '#3B82F6',
    isActive: true
  },
  {
    id: '2',
    name: 'App Mobile',
    description: 'Aplicativo móvel para clientes',
    status: ProjectStatus.PLANNING,
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-08-31'),
    createdBy: 'admin',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    color: '#10B981',
    isActive: true
  },
  {
    id: '3',
    name: 'Sistema de Relatórios',
    description: 'Dashboard avançado de relatórios',
    status: ProjectStatus.ON_HOLD,
    startDate: new Date('2024-02-01'),
    createdBy: 'admin',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    color: '#F59E0B',
    isActive: true
  }
];

class ProjectService {
  private projects: Project[] = [...mockProjects];

  // Simular delay de API
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getProjects(page: number = 1, limit: number = 10): Promise<ProjectListResponse> {
    await this.delay();
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProjects = this.projects.slice(startIndex, endIndex);
    
    return {
      projects: paginatedProjects,
      total: this.projects.length,
      page,
      limit,
      totalPages: Math.ceil(this.projects.length / limit)
    };
  }

  async getActiveProjects(): Promise<Project[]> {
    await this.delay(200);
    return this.projects.filter(project => project.isActive);
  }

  async getProjectById(id: string): Promise<Project | null> {
    await this.delay(300);
    return this.projects.find(project => project.id === id) || null;
  }

  async createProject(data: CreateProjectRequest): Promise<Project> {
    await this.delay();
    
    const newProject: Project = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description,
      status: data.status || ProjectStatus.PLANNING,
      startDate: data.startDate,
      endDate: data.endDate,
      createdBy: 'current-user', // Em produção, pegar do contexto de auth
      createdAt: new Date(),
      updatedAt: new Date(),
      color: data.color || '#6B7280',
      isActive: true
    };

    this.projects.unshift(newProject);
    return newProject;
  }

  async updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
    await this.delay();
    
    const projectIndex = this.projects.findIndex(project => project.id === id);
    if (projectIndex === -1) {
      throw new Error('Projeto não encontrado');
    }

    const updatedProject: Project = {
      ...this.projects[projectIndex],
      ...data,
      updatedAt: new Date()
    };

    this.projects[projectIndex] = updatedProject;
    return updatedProject;
  }

  async deleteProject(id: string): Promise<void> {
    await this.delay();
    
    const projectIndex = this.projects.findIndex(project => project.id === id);
    if (projectIndex === -1) {
      throw new Error('Projeto não encontrado');
    }

    this.projects.splice(projectIndex, 1);
  }

  async toggleProjectStatus(id: string): Promise<Project> {
    await this.delay();
    
    const project = this.projects.find(p => p.id === id);
    if (!project) {
      throw new Error('Projeto não encontrado');
    }

    project.isActive = !project.isActive;
    project.updatedAt = new Date();
    
    return project;
  }
}

export default new ProjectService();