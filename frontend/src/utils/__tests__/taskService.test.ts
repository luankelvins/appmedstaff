import { vi, describe, it, expect, beforeEach } from 'vitest'
import { TaskStatus, TaskPriority } from '../../types/task'

vi.mock('../taskService', () => ({
  taskService: {
    createTask: vi.fn(),
    getTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    getTasks: vi.fn(),
    addComment: vi.fn(),
    updateComment: vi.fn(),
    deleteComment: vi.fn(),
    getTasksByEmployee: vi.fn(),
    getTasksByAssignee: vi.fn(),
    getTasksByProject: vi.fn(),
    getTasksByStatus: vi.fn(),
    getTasksByPriority: vi.fn(),
    getTasksByDateRange: vi.fn(),
    getOverdueTasks: vi.fn(),
    getUpcomingTasks: vi.fn(),
    getTaskStatistics: vi.fn(),
    getTaskStats: vi.fn(),
    bulkUpdateTasks: vi.fn(),
    bulkDeleteTasks: vi.fn(),
    assignTask: vi.fn(),
    unassignTask: vi.fn(),
    updateTaskStatus: vi.fn(),
    updateTaskPriority: vi.fn(),
    addTaskDependency: vi.fn(),
    removeTaskDependency: vi.fn(),
    getTaskDependencies: vi.fn(),
    addTaskAttachment: vi.fn(),
    removeTaskAttachment: vi.fn(),
    getTaskAttachments: vi.fn(),
    addTaskLabel: vi.fn(),
    removeTaskLabel: vi.fn(),
    getTaskLabels: vi.fn(),
    createTaskTemplate: vi.fn(),
    getTaskTemplates: vi.fn(),
    createTaskFromTemplate: vi.fn(),
    exportTasks: vi.fn(),
    importTasks: vi.fn(),
    searchTasks: vi.fn(),
    getTaskHistory: vi.fn(),
    restoreTask: vi.fn(),
    archiveTask: vi.fn(),
    getArchivedTasks: vi.fn(),
    duplicateTask: vi.fn(),
    moveTask: vi.fn(),
    getTasksByFilter: vi.fn(),
    saveTaskFilter: vi.fn(),
    getTaskFilters: vi.fn(),
    deleteTaskFilter: vi.fn(),
    getTaskMetrics: vi.fn(),
    getTaskAnalytics: vi.fn(),
    generateTaskReport: vi.fn(),
    scheduleTaskReminder: vi.fn(),
    cancelTaskReminder: vi.fn(),
    getTaskReminders: vi.fn(),
    createRecurringTask: vi.fn(),
    updateRecurringTask: vi.fn(),
    deleteRecurringTask: vi.fn(),
    getRecurringTasks: vi.fn(),
    pauseRecurringTask: vi.fn(),
    resumeRecurringTask: vi.fn(),
    getTaskNotifications: vi.fn(),
    markTaskNotificationAsRead: vi.fn(),
    clearTaskNotifications: vi.fn(),
    subscribeToTaskUpdates: vi.fn(),
    unsubscribeFromTaskUpdates: vi.fn(),
    getTaskSubscriptions: vi.fn(),
    validateTask: vi.fn(),
    getTaskValidationRules: vi.fn(),
    updateTaskValidationRules: vi.fn(),
    getTaskPermissions: vi.fn(),
    updateTaskPermissions: vi.fn(),
    checkTaskPermission: vi.fn(),
    getTaskAuditLog: vi.fn(),
    getTaskChangeHistory: vi.fn(),
    revertTaskChange: vi.fn(),
    getTaskWorkflow: vi.fn(),
    updateTaskWorkflow: vi.fn(),
    executeTaskWorkflow: vi.fn(),
    getTaskWorkflowHistory: vi.fn(),
    createTaskWorkflowTemplate: vi.fn(),
    getTaskWorkflowTemplates: vi.fn(),
    applyTaskWorkflowTemplate: vi.fn(),
    getTaskIntegrations: vi.fn(),
    syncTaskWithIntegration: vi.fn(),
    disconnectTaskIntegration: vi.fn(),
    getTaskSyncStatus: vi.fn(),
    retryTaskSync: vi.fn(),
    getTaskSyncHistory: vi.fn(),
    getTaskCustomFields: vi.fn(),
    updateTaskCustomFields: vi.fn(),
    createTaskCustomField: vi.fn(),
    deleteTaskCustomField: vi.fn(),
    getTaskCustomFieldOptions: vi.fn(),
    updateTaskCustomFieldOptions: vi.fn(),
    validateTaskCustomField: vi.fn(),
    getTaskTimeTracking: vi.fn(),
    startTaskTimer: vi.fn(),
    stopTaskTimer: vi.fn(),
    pauseTaskTimer: vi.fn(),
    resumeTaskTimer: vi.fn(),
    getTaskTimeEntries: vi.fn(),
    addTaskTimeEntry: vi.fn(),
    updateTaskTimeEntry: vi.fn(),
    deleteTaskTimeEntry: vi.fn(),
    getTaskTimeReport: vi.fn(),
    exportTaskTimeReport: vi.fn(),
    getTaskById: vi.fn()
  }
}))

import { taskService } from '../taskService'

const mockTaskService = taskService as any

describe('TaskService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTasks', () => {
    it('deve retornar lista de tarefas', async () => {
      const mockResponse = {
        tasks: [
          {
            id: '1',
            title: 'Tarefa 1',
            description: 'Descrição da tarefa 1',
            status: TaskStatus.TODO,
            priority: TaskPriority.HIGH,
            assigned_to: 'user1',
            created_at: '2024-01-01T10:00:00Z'
          },
          {
            id: '2',
            title: 'Tarefa 2',
            description: 'Descrição da tarefa 2',
            status: TaskStatus.IN_PROGRESS,
            priority: TaskPriority.MEDIUM,
            assigned_to: 'user2',
            created_at: '2024-01-02T10:00:00Z'
          }
        ],
        total: 2,
        page: 1,
        totalPages: 1
      }

      mockTaskService.getTasks.mockResolvedValue(mockResponse)

      const result = await taskService.getTasks()

      expect(result).toEqual(mockResponse)
      expect(mockTaskService.getTasks).toHaveBeenCalled()
    })
  })

  describe('getTaskById', () => {
    it('deve retornar tarefa por ID', async () => {
      const mockTask = {
        id: '1',
        title: 'Tarefa 1',
        description: 'Descrição da tarefa 1',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        assigned_to: 'user1',
        created_at: '2024-01-01T10:00:00Z'
      }

      mockTaskService.getTaskById.mockResolvedValue(mockTask)

      const result = await taskService.getTaskById('1')

      expect(result).toEqual(mockTask)
      expect(mockTaskService.getTaskById).toHaveBeenCalledWith('1')
    })

    it('deve retornar null para ID inexistente', async () => {
      mockTaskService.getTaskById.mockResolvedValue(null)

      const result = await taskService.getTaskById('999')

      expect(result).toBeNull()
      expect(mockTaskService.getTaskById).toHaveBeenCalledWith('999')
    })
  })

  describe('createTask', () => {
    it('deve criar nova tarefa', async () => {
      const newTask = {
        title: 'Nova Tarefa',
        description: 'Descrição da nova tarefa',
        priority: TaskPriority.MEDIUM,
        assignedTo: 'user1'
      }

      const createdTask = {
        id: '3',
        title: newTask.title,
        description: newTask.description,
        status: TaskStatus.TODO,
        priority: newTask.priority,
        assigned_to: newTask.assignedTo,
        created_at: '2024-01-03T10:00:00Z'
      }

      mockTaskService.createTask.mockResolvedValue(createdTask)

      const result = await taskService.createTask(newTask, 'creator1')

      expect(result).toEqual(createdTask)
      expect(mockTaskService.createTask).toHaveBeenCalledWith(newTask, 'creator1')
    })
  })

  describe('updateTask', () => {
    it('deve atualizar tarefa existente', async () => {
      const updateData = {
        title: 'Tarefa Atualizada',
        status: TaskStatus.DONE
      }

      const updatedTask = {
        id: '1',
        title: 'Tarefa Atualizada',
        description: 'Descrição original',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        assigned_to: 'user1',
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-03T10:00:00Z'
      }

      mockTaskService.updateTask.mockResolvedValue(updatedTask)

      const result = await taskService.updateTask('1', updateData)

      expect(result).toEqual(updatedTask)
      expect(mockTaskService.updateTask).toHaveBeenCalledWith('1', updateData)
    })
  })

  describe('deleteTask', () => {
    it('deve deletar tarefa', async () => {
      mockTaskService.deleteTask.mockResolvedValue(true)

      const result = await taskService.deleteTask('1')

      expect(result).toBe(true)
      expect(mockTaskService.deleteTask).toHaveBeenCalledWith('1')
    })
  })

  describe('getTasksByAssignee', () => {
    it('deve retornar tarefas por responsável', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Tarefa do User1',
          assigned_to: 'user1',
          status: TaskStatus.TODO
        }
      ]

      mockTaskService.getTasksByAssignee.mockResolvedValue(mockTasks)

      const result = await taskService.getTasksByAssignee('user1')

      expect(result).toEqual(mockTasks)
      expect(mockTaskService.getTasksByAssignee).toHaveBeenCalledWith('user1')
    })
  })

  describe('getTasksByStatus', () => {
    it('deve retornar tarefas por status', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Tarefa Pendente',
          status: TaskStatus.TODO
        },
        {
          id: '2',
          title: 'Outra Tarefa Pendente',
          status: TaskStatus.TODO
        }
      ]

      mockTaskService.getTasksByStatus.mockResolvedValue(mockTasks)

      const result = await taskService.getTasksByStatus(TaskStatus.TODO)

      expect(result).toEqual(mockTasks)
      expect(mockTaskService.getTasksByStatus).toHaveBeenCalledWith(TaskStatus.TODO)
    })
  })

  describe('updateTaskStatus', () => {
    it('deve atualizar status da tarefa', async () => {
      const updatedTask = {
        id: '1',
        title: 'Tarefa 1',
        status: TaskStatus.DONE,
        updated_at: '2024-01-03T10:00:00Z'
      }

      mockTaskService.updateTaskStatus.mockResolvedValue(updatedTask)

      const result = await taskService.updateTaskStatus('1', TaskStatus.DONE)

      expect(result).toEqual(updatedTask)
      expect(mockTaskService.updateTaskStatus).toHaveBeenCalledWith('1', TaskStatus.DONE)
    })
  })

  describe('assignTask', () => {
    it('deve atribuir tarefa a funcionário', async () => {
      const assignedTask = {
        id: '1',
        title: 'Tarefa 1',
        assigned_to: 'user2',
        updated_at: '2024-01-03T10:00:00Z'
      }

      mockTaskService.assignTask.mockResolvedValue(assignedTask)

      const result = await taskService.assignTask('1', 'user2')

      expect(result).toEqual(assignedTask)
      expect(mockTaskService.assignTask).toHaveBeenCalledWith('1', 'user2')
    })
  })

  describe('getTaskStats', () => {
    it('deve retornar estatísticas das tarefas', async () => {
      const mockStats = {
        total: 10,
        completed: 5,
        pending: 3,
        in_progress: 2,
        overdue: 1,
        by_priority: {
          high: 3,
          medium: 4,
          low: 3
        },
        by_status: {
          pending: 3,
          in_progress: 2,
          completed: 5
        },
        completion_rate: 50,
        average_completion_time: 5.5
      }

      mockTaskService.getTaskStats.mockResolvedValue(mockStats)

      const result = await taskService.getTaskStats()

      expect(result).toEqual(mockStats)
      expect(mockTaskService.getTaskStats).toHaveBeenCalled()
    })
  })

  describe('comments', () => {
    it('deve adicionar comentário a tarefa', async () => {
      const mockComment = {
        id: 'comment1',
        taskId: 'task1',
        content: 'Comentário de teste',
        userId: 'user1',
        userName: 'User One',
        createdAt: '2024-01-03T10:00:00Z'
      }

      mockTaskService.addComment.mockResolvedValue(mockComment)

      const result = await taskService.addComment('task1', 'Comentário de teste', 'user1', 'User One')

      expect(result).toEqual(mockComment)
      expect(mockTaskService.addComment).toHaveBeenCalledWith('task1', 'Comentário de teste', 'user1', 'User One')
    })

    it('deve atualizar comentário', async () => {
      const mockComment = {
        id: 'comment1',
        taskId: 'task1',
        content: 'Comentário atualizado',
        userId: 'user1',
        userName: 'User One',
        createdAt: '2024-01-03T10:00:00Z',
        updatedAt: '2024-01-03T11:00:00Z'
      }

      mockTaskService.updateComment.mockResolvedValue(mockComment)

      const result = await taskService.updateComment('task1', 'comment1', 'Comentário atualizado')

      expect(result).toEqual(mockComment)
      expect(mockTaskService.updateComment).toHaveBeenCalledWith('task1', 'comment1', 'Comentário atualizado')
    })

    it('deve deletar comentário', async () => {
      mockTaskService.deleteComment.mockResolvedValue(true)

      const result = await taskService.deleteComment('task1', 'comment1')

      expect(result).toBe(true)
      expect(mockTaskService.deleteComment).toHaveBeenCalledWith('task1', 'comment1')
    })
  })
})