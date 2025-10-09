import { MenuStructure } from '../types/menu'

export const menuConfig: MenuStructure = [
  {
    id: 'main',
    title: 'Principal',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'LayoutDashboard',
        path: '/dashboard',
        permission: 'dashboard.view'
      },
      {
        id: 'feed',
        label: 'Feed',
        icon: 'Rss',
        path: '/feed',
        permission: 'feed.view'
      },
      {
        id: 'tasks',
        label: 'Tarefas',
        icon: 'CheckSquare',
        path: '/tasks',
        permission: 'tasks.view',
        children: [
          {
            id: 'tasks-list',
            label: 'Lista',
            path: '/tasks/list'
          },
          {
            id: 'tasks-kanban',
            label: 'Kanban',
            path: '/tasks/kanban'
          },
          {
            id: 'tasks-calendar',
            label: 'Calendário',
            path: '/tasks/calendar'
          },
          {
            id: 'tasks-projects',
            label: 'Projetos',
            path: '/tasks/projects'
          },
          {
            id: 'tasks-recurring',
            label: 'Tarefas Recorrentes',
            path: '/tasks/recurring'
          }
        ]
      }
    ]
  },
  {
    id: 'contacts',
    title: 'Contatos',
    permission: 'contacts.read',
    items: [
      {
        id: 'leads',
        label: 'Leads',
        icon: 'Target',
        path: '/contacts/leads',
        permission: 'contacts.read'
      },
      {
        id: 'clients-pf',
        label: 'Clientes PF',
        icon: 'User',
        path: '/contacts/clients-pf',
        permission: 'contacts.read'
      },
      {
        id: 'clients-pj',
        label: 'Clientes PJ',
        icon: 'Building',
        path: '/contacts/clients-pj',
        permission: 'contacts.read'
      },
      {
        id: 'service-takers',
        label: 'Tomadores de Serviço',
        icon: 'Briefcase',
        path: '/contacts/service-takers',
        permission: 'contacts.read'
      },
      {
        id: 'partners',
        label: 'Parceiros',
        icon: 'Users',
        path: '/contacts/partners',
        permission: 'contacts.read'
      },
      {
        id: 'internal-team',
        label: 'Time Interno',
        icon: 'Users',
        path: '/contacts/internal-team',
        permission: 'contacts.internal.view'
      }
    ]
  },
  {
    id: 'crm',
    title: 'CRM',
    permission: 'crm.forms.access',
    items: [
      {
        id: 'crm-forms',
        label: 'Formulários de CRM',
        icon: 'FileText',
        path: '/crm/forms',
        permission: 'crm.forms.access'
      }
    ]
  },
  {
    id: 'activities',
    title: 'Atividades',
    items: [
      {
        id: 'commercial',
        label: 'Comercial',
        icon: 'TrendingUp',
        permission: 'activities.commercial.view',
        children: [
          {
            id: 'commercial-leads',
            label: 'Leads',
            path: '/activities/commercial/leads'
          },
          {
            id: 'commercial-pj-management',
            label: 'Gestão PJ',
            path: '/activities/commercial/pj-management'
          },
          {
            id: 'commercial-other-products',
            label: 'Outros produtos',
            path: '/activities/commercial/other-products'
          }
        ]
      },
      {
        id: 'operational',
        label: 'Operacional',
        icon: 'Settings',
        permission: 'activities.operational.view',
        children: [
          {
            id: 'operational-company-management',
            label: 'Abertura/Alteração/Baixa de Empresa',
            path: '/activities/operational/company-management'
          },
          {
            id: 'operational-invoice-emission',
            label: 'Emissão NF',
            path: '/activities/operational/invoice-emission'
          },
          {
            id: 'operational-company-monitoring',
            label: 'Acompanhamento de Empresas',
            path: '/activities/operational/company-monitoring'
          },
          {
            id: 'operational-irpf',
            label: 'IRPF',
            path: '/activities/operational/irpf'
          }
        ]
      },
      {
        id: 'benefits',
        label: 'Med Benefícios',
        icon: 'Heart',
        permission: 'activities.benefits.view',
        children: [
          {
            id: 'benefits-duo-gourmet',
            label: 'Duo Gourmet',
            path: '/activities/benefits/duo-gourmet'
          },
          {
            id: 'benefits-medstaff-health',
            label: 'MedStaff + Saúde',
            path: '/activities/benefits/medstaff-health'
          },
          {
            id: 'benefits-home-support',
            label: 'Apoio Doméstico',
            path: '/activities/benefits/home-support'
          }
        ]
      },
      {
        id: 'business-management',
        label: 'Gestão de Negócios',
        icon: 'BarChart3',
        permission: 'activities.business.view',
        children: [
          {
            id: 'business-hemet',
            label: 'HeMet',
            path: '/activities/business/hemet'
          },
          {
            id: 'business-clinic-consulting',
            label: 'Consultoria abertura de clínicas',
            path: '/activities/business/clinic-consulting'
          }
        ]
      },
      {
        id: 'partner-services',
        label: 'Serviços com parceiros',
        icon: 'Users2',
        permission: 'activities.partners.view',
        children: [
          {
            id: 'partners-financial-consulting-pf',
            label: 'Consultoria Financeira PF',
            path: '/activities/partners/financial-consulting-pf'
          },
          {
            id: 'partners-pension-restitution',
            label: 'Restituição Previdenciária PF',
            path: '/activities/partners/pension-restitution'
          },
          {
            id: 'partners-housing-assistance',
            label: 'Auxílio Moradia Residência Médica',
            path: '/activities/partners/housing-assistance'
          },
          {
            id: 'partners-tax-recovery',
            label: 'Recuperação Tributária PJ',
            path: '/activities/partners/tax-recovery'
          }
        ]
      }
    ]
  },
  {
    id: 'company',
    title: 'Empresa',
    items: [
      {
        id: 'org-chart',
        label: 'Organograma',
        icon: 'Network',
        path: '/company/organogram',
        permission: 'org.chart.view'
      },
      {
        id: 'administrative',
        label: 'Administrativo',
        icon: 'FolderOpen',
        path: '/company/administrative',
        permission: 'admin.docs.read'
      },
      {
        id: 'financial',
        label: 'Financeiro',
        icon: 'DollarSign',
        path: '/company/financial',
        permission: 'finance.expenses.create'
      },
      {
        id: 'relationship',
        label: 'Relacionamento',
        icon: 'Users',
        path: '/company/relationship',
        permission: 'relationship.collaborators.read'
      }
    ]
  },

  {
    id: 'audit',
    title: 'Auditoria',
    items: [
      {
        id: 'audit-logs',
        label: 'Logs de Auditoria',
        icon: 'Shield',
        path: '/audit',
        permission: 'audit.read'
      },
      {
        id: 'security-dashboard',
        label: 'Dashboard de Segurança',
        icon: 'Shield',
        path: '/security',
        permission: 'security.view'
      }
    ]
  },
  {
    id: 'communication',
    title: 'Comunicação',
    items: [
      {
        id: 'notifications',
        label: 'Notificações',
        icon: 'Bell',
        path: '/notifications',
        permission: 'notifications.view',
        badge: 3
      },
      {
        id: 'chat',
        label: 'Chat Interno',
        icon: 'MessageCircle',
        path: '/chat',
        permission: 'chat.view'
      }
    ]
  },
  {
    id: 'profile',
    title: 'Perfil',
    items: [
      {
        id: 'user-profile',
        label: 'Perfil de Usuário',
        icon: 'UserCircle',
        path: '/profile',
        permission: 'profile.view'
      }
    ]
  }
]