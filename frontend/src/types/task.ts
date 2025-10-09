export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  assignedBy?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  tags: string[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
  estimatedHours?: number;
  actualHours?: number;
  category?: string;
  project?: string;
  // Campos para temporizador
  timerStartedAt?: Date;
  timerPausedAt?: Date;
  totalTimeSpent?: number; // em segundos
  isTimerRunning?: boolean;
  // Campos para tarefas recorrentes
  recurrenceRule?: RecurrenceRule;
  recurrenceId?: string; // ID da série de recorrência
  originalDate?: Date; // Data original para instâncias modificadas
  isRecurring?: boolean;
  parentTaskId?: string; // ID da tarefa pai (template)
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  DONE = 'done',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum RecurrenceFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export enum RecurrenceEndType {
  NEVER = 'never',
  AFTER_OCCURRENCES = 'after_occurrences',
  ON_DATE = 'on_date'
}

export enum WeekDay {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6
}

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number; // A cada X dias/semanas/meses/anos
  endType: RecurrenceEndType;
  endDate?: Date; // Para endType = 'on_date'
  occurrences?: number; // Para endType = 'after_occurrences'
  weekDays?: WeekDay[]; // Para frequência semanal
  monthDay?: number; // Para frequência mensal (dia do mês)
  yearMonth?: number; // Para frequência anual (mês do ano)
  yearDay?: number; // Para frequência anual (dia do mês)
}

export interface RecurrenceSeries {
  id: string;
  templateTask: CreateTaskRequest;
  recurrenceRule: RecurrenceRule;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  generatedUntil: Date;
  isActive: boolean;
  nextOccurrence?: Date;
  lastGenerated?: Date;
}

export enum RecurrenceEditMode {
  THIS_TASK = 'this_task',
  THIS_AND_FUTURE = 'this_and_future',
  ALL_TASKS = 'all_tasks'
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  authorName: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  parentId?: string; // Para respostas a comentários
  emoji?: string;
  attachments?: string[];
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignedTo?: string[];
  createdBy?: string[];
  tags?: string[];
  category?: string[];
  project?: string[];
  dueDateFrom?: Date;
  dueDateTo?: Date;
  search?: string;
}

export interface TaskSort {
  field: 'title' | 'status' | 'priority' | 'due_date' | 'created_at' | 'updated_at';
  direction: 'asc' | 'desc';
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  dueDate?: Date;
  tags?: string[];
  category?: string;
  project?: string;
  estimatedHours?: number;
  recurrenceRule?: RecurrenceRule;
  isRecurring?: boolean;
  leadId?: string; // Para vincular tarefas com leads
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  dueDate?: Date;
  tags?: string[];
  category?: string;
  project?: string;
  estimatedHours?: number;
  actualHours?: number;
  recurrenceRule?: RecurrenceRule;
  editMode?: RecurrenceEditMode;
}

export interface CreateRecurrenceSeriesRequest {
  templateTask: CreateTaskRequest;
  recurrenceRule: RecurrenceRule;
}

export interface UpdateRecurrenceSeriesRequest {
  templateTask?: Partial<CreateTaskRequest>;
  recurrenceRule?: RecurrenceRule;
  editMode: RecurrenceEditMode;
  taskId?: string; // Para edições específicas
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaskStats {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
}

// Tipos para visualizações
export type TaskViewMode = 'list' | 'kanban' | 'calendar';

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  color: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  task: Task;
  color?: string;
  resource?: Task;
  allDay?: boolean;
}

// Tipos para drag and drop
export interface DragResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  } | null;
}