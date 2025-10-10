import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MedStaff API',
      version: '1.0.0',
      description: 'API completa para o sistema MedStaff - Gestão de profissionais de saúde',
      contact: {
        name: 'Equipe MedStaff',
        email: 'suporte@medstaff.com',
        url: 'https://medstaff.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001/api/v1',
        description: 'Servidor de Desenvolvimento'
      },
      {
        url: 'https://api.medstaff.com/api/v1',
        description: 'Servidor de Produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido através do endpoint de login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único do usuário'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário'
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'Senha do usuário (mínimo 8 caracteres)'
            },
            name: {
              type: 'string',
              description: 'Nome completo do usuário'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin', 'superadmin'],
              description: 'Papel do usuário no sistema'
            },
            isAdmin: {
              type: 'boolean',
              description: 'Indica se o usuário é administrador'
            },
            twoFactorEnabled: {
              type: 'boolean',
              description: 'Indica se o 2FA está habilitado'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação do usuário'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data da última atualização'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'usuario@medstaff.com'
            },
            password: {
              type: 'string',
              minLength: 8,
              example: 'senhaSegura123'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            token: {
              type: 'string',
              description: 'Token JWT para autenticação'
            },
            user: {
              $ref: '#/components/schemas/User'
            },
            requiresTwoFactor: {
              type: 'boolean',
              description: 'Indica se é necessário completar 2FA'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'novo@medstaff.com'
            },
            password: {
              type: 'string',
              minLength: 8,
              example: 'senhaSegura123'
            },
            name: {
              type: 'string',
              example: 'João Silva'
            }
          }
        },
        SecurityMetrics: {
          type: 'object',
          properties: {
            timestamp: {
              type: 'string',
              format: 'date-time'
            },
            period: {
              type: 'string',
              enum: ['1h', '6h', '24h', '7d', '30d']
            },
            summary: {
              type: 'object',
              properties: {
                totalAlerts: {
                  type: 'integer',
                  description: 'Total de alertas no período'
                },
                criticalAlerts: {
                  type: 'integer',
                  description: 'Alertas críticos no período'
                },
                systemHealth: {
                  type: 'string',
                  enum: ['healthy', 'warning', 'critical'],
                  description: 'Status geral do sistema'
                },
                lastUpdate: {
                  type: 'string',
                  format: 'date-time'
                }
              }
            },
            trends: {
              type: 'object',
              properties: {
                alertsLast1h: {
                  type: 'integer'
                },
                alertsLast6h: {
                  type: 'integer'
                },
                alertsLast24h: {
                  type: 'integer'
                }
              }
            }
          }
        },
        Alert: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único do alerta'
            },
            type: {
              type: 'string',
              enum: ['critical', 'warning', 'info'],
              description: 'Tipo do alerta'
            },
            message: {
              type: 'string',
              description: 'Mensagem do alerta'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            },
            resolved: {
              type: 'boolean',
              description: 'Indica se o alerta foi resolvido'
            },
            source: {
              type: 'string',
              description: 'Origem do alerta'
            }
          }
        },
        DashboardStats: {
          type: 'object',
          properties: {
            totalUsers: {
              type: 'integer',
              description: 'Total de usuários no sistema'
            },
            totalTasks: {
              type: 'integer',
              description: 'Total de tarefas'
            },
            totalLeads: {
              type: 'integer',
              description: 'Total de leads'
            },
            systemHealth: {
              type: 'string',
              enum: ['healthy', 'warning', 'critical']
            }
          }
        },
        TwoFactorStatus: {
          type: 'object',
          properties: {
            enabled: {
              type: 'boolean',
              description: 'Indica se o 2FA está habilitado'
            },
            backupCodesCount: {
              type: 'integer',
              description: 'Número de códigos de backup disponíveis'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensagem de erro'
            },
            message: {
              type: 'string',
              description: 'Detalhes do erro'
            },
            code: {
              type: 'string',
              description: 'Código do erro'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Mensagem de sucesso'
            },
            data: {
              type: 'object',
              description: 'Dados retornados'
            }
          }
        },
        Lead: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único do lead'
            },
            nome: {
              type: 'string',
              description: 'Nome do lead'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do lead'
            },
            telefone: {
              type: 'string',
              description: 'Telefone do lead'
            },
            empresa: {
              type: 'string',
              description: 'Empresa do lead'
            },
            origem: {
              type: 'string',
              enum: ['website', 'telefone', 'email', 'indicacao', 'evento', 'outro'],
              description: 'Origem do lead'
            },
            status: {
              type: 'string',
              enum: ['novo', 'contato', 'qualificado', 'proposta', 'fechado', 'perdido'],
              description: 'Status do lead'
            },
            observacoes: {
              type: 'string',
              description: 'Observações sobre o lead'
            },
            responsavelId: {
              type: 'string',
              format: 'uuid',
              description: 'ID do responsável pelo lead'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Task: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único da tarefa'
            },
            titulo: {
              type: 'string',
              description: 'Título da tarefa'
            },
            descricao: {
              type: 'string',
              description: 'Descrição da tarefa'
            },
            status: {
              type: 'string',
              enum: ['pendente', 'em_andamento', 'concluida', 'cancelada'],
              description: 'Status da tarefa'
            },
            prioridade: {
              type: 'string',
              enum: ['baixa', 'media', 'alta', 'urgente'],
              description: 'Prioridade da tarefa'
            },
            dataVencimento: {
              type: 'string',
              format: 'date-time',
              description: 'Data de vencimento da tarefa'
            },
            responsavelId: {
              type: 'string',
              format: 'uuid',
              description: 'ID do responsável pela tarefa'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Employee: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único do funcionário'
            },
            nome: {
              type: 'string',
              description: 'Nome do funcionário'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do funcionário'
            },
            telefone: {
              type: 'string',
              description: 'Telefone do funcionário'
            },
            cargo: {
              type: 'string',
              description: 'Cargo do funcionário'
            },
            departamento: {
              type: 'string',
              description: 'Departamento do funcionário'
            },
            salario: {
              type: 'number',
              description: 'Salário do funcionário'
            },
            status: {
              type: 'string',
              enum: ['ativo', 'inativo', 'suspenso'],
              description: 'Status do funcionário'
            },
            dataAdmissao: {
              type: 'string',
              format: 'date',
              description: 'Data de admissão'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        ClientePF: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único do cliente PF'
            },
            nome: {
              type: 'string',
              description: 'Nome do cliente'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do cliente'
            },
            telefone: {
              type: 'string',
              description: 'Telefone do cliente'
            },
            cpf: {
              type: 'string',
              description: 'CPF do cliente'
            },
            endereco: {
              type: 'object',
              description: 'Endereço do cliente'
            },
            status: {
              type: 'string',
              enum: ['ativo', 'inativo', 'suspenso', 'cancelado'],
              description: 'Status do cliente'
            },
            responsavelId: {
              type: 'string',
              format: 'uuid',
              description: 'ID do responsável pelo cliente'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        ClientePJ: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único do cliente PJ'
            },
            razaoSocial: {
              type: 'string',
              description: 'Razão social da empresa'
            },
            nomeFantasia: {
              type: 'string',
              description: 'Nome fantasia da empresa'
            },
            cnpj: {
              type: 'string',
              description: 'CNPJ da empresa'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email da empresa'
            },
            telefone: {
              type: 'string',
              description: 'Telefone da empresa'
            },
            endereco: {
              type: 'object',
              description: 'Endereço da empresa'
            },
            status: {
              type: 'string',
              enum: ['ativo', 'inativo', 'suspenso', 'cancelado'],
              description: 'Status do cliente'
            },
            certificadoDigital: {
              type: 'object',
              description: 'Informações do certificado digital'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único da notificação'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'ID do usuário destinatário'
            },
            titulo: {
              type: 'string',
              description: 'Título da notificação'
            },
            mensagem: {
              type: 'string',
              description: 'Mensagem da notificação'
            },
            tipo: {
              type: 'string',
              enum: ['info', 'warning', 'error', 'success'],
              description: 'Tipo da notificação'
            },
            lida: {
              type: 'boolean',
              description: 'Indica se a notificação foi lida'
            },
            dados: {
              type: 'object',
              description: 'Dados adicionais da notificação'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Expense: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único da despesa'
            },
            descricao: {
              type: 'string',
              description: 'Descrição da despesa'
            },
            valor: {
              type: 'number',
              description: 'Valor da despesa'
            },
            categoria: {
              type: 'string',
              description: 'Categoria da despesa'
            },
            dataVencimento: {
              type: 'string',
              format: 'date',
              description: 'Data de vencimento'
            },
            dataPagamento: {
              type: 'string',
              format: 'date',
              description: 'Data de pagamento'
            },
            fornecedor: {
              type: 'string',
              description: 'Fornecedor da despesa'
            },
            status: {
              type: 'string',
              enum: ['pendente', 'paga', 'vencida', 'cancelada'],
              description: 'Status da despesa'
            },
            anexos: {
              type: 'array',
              items: {
                type: 'object'
              },
              description: 'Anexos da despesa'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de acesso inválido ou expirado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Token inválido',
                message: 'Token de acesso inválido ou expirado'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Acesso negado - permissões insuficientes',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Acesso negado',
                message: 'Você não tem permissão para acessar este recurso'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Não encontrado',
                message: 'O recurso solicitado não foi encontrado'
              }
            }
          }
        },
        ValidationError: {
          description: 'Erro de validação dos dados enviados',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Dados inválidos',
                message: 'Os dados enviados não passaram na validação'
              }
            }
          }
        },
        RateLimitError: {
          description: 'Limite de requisições excedido',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Rate limit excedido',
                message: 'Muitas requisições. Tente novamente em alguns minutos.'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Erro interno do servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Erro interno do servidor',
                message: 'Ocorreu um erro inesperado no servidor'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Autenticação',
        description: 'Endpoints relacionados à autenticação de usuários'
      },
      {
        name: '2FA',
        description: 'Endpoints para autenticação de dois fatores'
      },
      {
        name: 'Dashboard',
        description: 'Endpoints para dados do dashboard'
      },
      {
        name: 'Segurança',
        description: 'Endpoints para monitoramento de segurança'
      },
      {
        name: 'Alertas',
        description: 'Endpoints para gerenciamento de alertas'
      },
      {
        name: 'Sistema',
        description: 'Endpoints para monitoramento do sistema'
      },
      {
        name: 'Funcionários',
        description: 'Endpoints para gerenciamento de funcionários'
      },
      {
        name: 'Tarefas',
        description: 'Endpoints para gerenciamento de tarefas'
      },
      {
        name: 'Leads',
        description: 'Endpoints para gerenciamento de leads'
      },
      {
        name: 'Clientes PF',
        description: 'Endpoints para gerenciamento de clientes pessoa física'
      },
      {
        name: 'Clientes PJ',
        description: 'Endpoints para gerenciamento de clientes pessoa jurídica'
      },
      {
        name: 'Notificações',
        description: 'Endpoints para gerenciamento de notificações'
      },
      {
        name: 'Financeiro',
        description: 'Endpoints para gerenciamento financeiro e despesas'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './routes/*.js',
    './controllers/*.js'
  ]
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };