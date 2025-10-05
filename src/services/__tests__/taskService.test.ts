import { vi, Mock } from 'vitest';
import taskService from '../taskService';
import { TaskStatus, TaskPriority, CreateTaskRequest, UpdateTaskRequest } from '../../types/task';

// Mock do Supabase
vi.mock('../../config/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}));

import { supabase } from '../../config/supabase';

describe('TaskService', () => {
  let mockSupabaseFrom: Mock;
  let mockSupabaseQuery: any;

  beforeEach(() => {
    // Reset tasks and comments before each test
    taskService['tasks'] = [];
    taskService['comments'] = [];

    let taskIdCounter = 1;

    // Configurar mock do Supabase
    mockSupabaseQuery = {
      insert: vi.fn().mockImplementation((data) => ({
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: `test-id-${taskIdCounter++}`,
            title: data.title,
            description: data.description,
            status: data.status || 'pending',
            priority: data.priority || 'medium',
            assigned_to: data.assigned_to,
            created_by: data.created_by,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            due_date: data.due_date,
            tags: data.tags || [],
            metadata: data.metadata || {}
          },
          error: null
        })
      })),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      then: vi.fn()
    };

    mockSupabaseFrom = vi.mocked(supabase.from);
    mockSupabaseFrom.mockReturnValue(mockSupabaseQuery);
  });

  describe('getTasks', () => {
    it('should return empty list when no tasks exist', async () => {
      const result = await taskService.getTasks();
      
      expect(result.tasks).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(0);
    });

    it('should return tasks with pagination', async () => {
      const task1: CreateTaskRequest = {
        title: 'Task 1',
        description: 'Description 1',
        priority: TaskPriority.HIGH,
        assignedTo: 'user1',
        dueDate: new Date(),
        tags: ['tag1'],
        category: 'category1',
        project: 'project1',
        estimatedHours: 2
      };

      await taskService.createTask(task1, 'test-user');

      const result = await taskService.getTasks(undefined, undefined, 1, 10);
      
      expect(result.tasks).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should search tasks by title', async () => {
      const task1: CreateTaskRequest = {
        title: 'Important Task',
        description: 'Description 1',
        priority: TaskPriority.HIGH,
        assignedTo: 'user1',
        dueDate: new Date(),
        tags: [],
        category: 'category1',
        project: 'project1',
        estimatedHours: 2
      };

      const task2: CreateTaskRequest = {
        title: 'Regular Task',
        description: 'Description 2',
        priority: TaskPriority.MEDIUM,
        assignedTo: 'user2',
        dueDate: new Date(),
        tags: [],
        category: 'category2',
        project: 'project2',
        estimatedHours: 4
      };

      await taskService.createTask(task1, 'test-user');
      await taskService.createTask(task2, 'test-user');

      const result = await taskService.getTasks({ search: 'Important' });
      
      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].title).toBe('Important Task');
    });
  });

  describe('createTask', () => {
    it('should create a new task with all properties', async () => {
      const taskData: CreateTaskRequest = {
        title: 'New Task',
        description: 'Task description',
        priority: TaskPriority.HIGH,
        assignedTo: 'user1',
        dueDate: new Date('2024-12-31'),
        tags: ['urgent', 'important'],
        category: 'development',
        project: 'project1',
        estimatedHours: 8
      };

      const createdTask = await taskService.createTask(taskData, 'test-user');

      expect(createdTask.id).toBeDefined();
      expect(createdTask.title).toBe(taskData.title);
      expect(createdTask.description).toBe(taskData.description);
      expect(createdTask.priority).toBe(taskData.priority);
      expect(createdTask.assignedTo).toBe(taskData.assignedTo);
      expect(createdTask.tags).toEqual(taskData.tags);
      expect(createdTask.category).toBe(taskData.category);
      expect(createdTask.project).toBe(taskData.project);
      expect(createdTask.estimatedHours).toBe(taskData.estimatedHours);
      expect(createdTask.comments).toEqual([]);
      expect(createdTask.attachments).toEqual([]);
      expect(createdTask.createdAt).toBeDefined();
      expect(createdTask.updatedAt).toBeDefined();
      expect(createdTask.createdBy).toBe('test-user');
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      const taskData: CreateTaskRequest = {
        title: 'Original Task',
        description: 'Original description',
        priority: TaskPriority.LOW,
        assignedTo: 'user1',
        dueDate: new Date(),
        tags: [],
        category: 'category1',
        project: 'project1',
        estimatedHours: 2
      };

      const createdTask = await taskService.createTask(taskData, 'test-user');

      const updateData: UpdateTaskRequest = {
        title: 'Updated Task',
        priority: TaskPriority.HIGH
      };

      const updatedTask = await taskService.updateTask(createdTask.id, updateData);

      expect(updatedTask).not.toBeNull();
      expect(updatedTask!.title).toBe('Updated Task');
      expect(updatedTask!.priority).toBe(TaskPriority.HIGH);
      expect(updatedTask!.description).toBe('Original description');
      expect(updatedTask!.updatedAt).not.toBe(createdTask.updatedAt);
    });

    it('should return null when updating non-existent task', async () => {
      const updateData: UpdateTaskRequest = {
        title: 'Updated Task'
      };

      const result = await taskService.updateTask('non-existent-id', updateData);
      expect(result).toBeNull();
    });
  });

  describe('deleteTask', () => {
    it('should delete an existing task', async () => {
      const taskData: CreateTaskRequest = {
        title: 'Task to Delete',
        description: 'Description',
        priority: TaskPriority.LOW,
        assignedTo: 'user1',
        dueDate: new Date(),
        tags: [],
        category: 'category1',
        project: 'project1',
        estimatedHours: 2
      };

      const createdTask = await taskService.createTask(taskData, 'test-user');
      
      const result = await taskService.deleteTask(createdTask.id);
      expect(result).toBe(true);

      const deletedTask = await taskService.getTaskById(createdTask.id);
      expect(deletedTask).toBeNull();
    });

    it('should return false when deleting non-existent task', async () => {
      const result = await taskService.deleteTask('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('comments', () => {
    let taskId: string;

    beforeEach(async () => {
      const taskData: CreateTaskRequest = {
        title: 'Task with Comments',
        description: 'Description',
        priority: TaskPriority.LOW,
        assignedTo: 'user1',
        dueDate: new Date(),
        tags: [],
        category: 'category1',
        project: 'project1',
        estimatedHours: 2
      };

      const task = await taskService.createTask(taskData, 'test-user');
      taskId = task.id;
    });

    it('should add a comment to a task', async () => {
      const comment = await taskService.addComment(taskId, 'Test comment', 'user1', 'User One');

      expect(comment.id).toBeDefined();
      expect(comment.taskId).toBe(taskId);
      expect(comment.content).toBe('Test comment');
      expect(comment.userId).toBe('user1');
      expect(comment.userName).toBe('User One');
      expect(comment.createdAt).toBeDefined();

      const task = await taskService.getTaskById(taskId);
      expect(task).not.toBeNull();
      expect(task!.comments).toHaveLength(1);
      expect(task!.comments[0]).toEqual(comment);
    });

    it('should update a comment', async () => {
      const comment = await taskService.addComment(taskId, 'Original comment', 'user1', 'User One');
      
      const updatedComment = await taskService.updateComment(taskId, comment.id, 'Updated comment');

      expect(updatedComment).not.toBeNull();
      expect(updatedComment!.content).toBe('Updated comment');
      expect(updatedComment!.updatedAt).toBeDefined();

      const task = await taskService.getTaskById(taskId);
      expect(task!.comments[0].content).toBe('Updated comment');
    });

    it('should delete a comment', async () => {
      const comment = await taskService.addComment(taskId, 'Comment to delete', 'user1', 'User One');
      
      const result = await taskService.deleteComment(taskId, comment.id);
      expect(result).toBe(true);

      const task = await taskService.getTaskById(taskId);
      expect(task!.comments).toHaveLength(0);
    });
  });

  describe('getTaskStats', () => {
    it('should return correct task statistics', async () => {
      await taskService.createTask({
        title: 'Task 1',
        description: 'Description',
        priority: TaskPriority.HIGH,
        assignedTo: 'user1',
        dueDate: new Date(),
        tags: [],
        category: 'category1',
        project: 'project1',
        estimatedHours: 2
      }, 'test-user');

      await taskService.createTask({
        title: 'Task 2',
        description: 'Description',
        priority: TaskPriority.MEDIUM,
        assignedTo: 'user1',
        dueDate: new Date(),
        tags: [],
        category: 'category1',
        project: 'project1',
        estimatedHours: 4
      }, 'test-user');

      const stats = await taskService.getTaskStats();

      expect(stats.total).toBe(2);
      expect(stats.byPriority.high).toBe(1);
      expect(stats.byPriority.medium).toBe(1);
      expect(stats.byPriority.low).toBe(0);
    });
  });
});