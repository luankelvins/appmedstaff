// Tipos para o Sistema de Feed Expandido

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

// Tipos de itens do feed
export type FeedItemType = 'task' | 'notification' | 'activity' | 'announcement' | 'event';

// Prioridades
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Status para atividades e eventos
export type ActivityStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
export type EventStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

// Interface base para itens do feed
export interface FeedItem extends BaseEntity {
  title: string;
  description: string;
  type: FeedItemType;
  priority: Priority;
  author: string;
  authorName: string;
  authorAvatar?: string;
  department?: string;
  tags?: string[];
  attachments?: FeedAttachment[];
  isPublic: boolean;
  targetAudience?: string[]; // IDs dos usuários ou departamentos
  metadata?: Record<string, any>;
}

// Atividade
export interface Activity extends FeedItem {
  type: 'activity';
  status: ActivityStatus;
  startDate: Date;
  endDate?: Date;
  location?: string;
  participants?: string[]; // IDs dos participantes
  maxParticipants?: number;
  requiresConfirmation: boolean;
  confirmations?: ActivityConfirmation[];
  category: ActivityCategory;
  instructions?: string;
  materials?: string[];
}

// Comunicado
export interface Announcement extends FeedItem {
  type: 'announcement';
  expiresAt?: Date;
  isUrgent: boolean;
  category: AnnouncementCategory;
  readBy?: string[]; // IDs dos usuários que leram
  acknowledgmentRequired: boolean;
  acknowledgments?: AnnouncementAcknowledgment[];
}

// Evento de calendário
export interface CalendarEvent extends FeedItem {
  type: 'event';
  status: EventStatus;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  location?: string;
  meetingLink?: string;
  attendees?: EventAttendee[];
  organizer: string;
  recurrence?: RecurrenceConfig;
  reminders?: EventReminder[];
  category: EventCategory;
}

// Anexos
export interface FeedAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
}

// Confirmações de atividade
export interface ActivityConfirmation {
  userId: string;
  userName: string;
  confirmedAt: Date;
  status: 'confirmed' | 'declined' | 'maybe';
  notes?: string;
}

// Reconhecimentos de comunicado
export interface AnnouncementAcknowledgment {
  userId: string;
  userName: string;
  acknowledgedAt: Date;
  notes?: string;
}

// Participantes de evento
export interface EventAttendee {
  userId: string;
  userName: string;
  email: string;
  status: 'invited' | 'accepted' | 'declined' | 'tentative';
  responseDate?: Date;
  notes?: string;
}

// Lembretes de evento
export interface EventReminder {
  id: string;
  type: 'email' | 'push' | 'popup';
  minutesBefore: number;
  isActive: boolean;
}

// Categorias
export type ActivityCategory = 
  | 'training' 
  | 'meeting' 
  | 'workshop' 
  | 'team_building' 
  | 'presentation' 
  | 'social' 
  | 'other';

export type AnnouncementCategory = 
  | 'general' 
  | 'policy' 
  | 'system' 
  | 'hr' 
  | 'safety' 
  | 'celebration' 
  | 'urgent' 
  | 'other';

export type EventCategory = 
  | 'meeting' 
  | 'deadline' 
  | 'training' 
  | 'holiday' 
  | 'personal' 
  | 'project' 
  | 'other';

// Configuração de recorrência
export interface RecurrenceConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // A cada X dias/semanas/meses/anos
  endType: 'never' | 'on_date' | 'after_occurrences';
  endDate?: Date;
  occurrences?: number;
  weekDays?: number[]; // 0-6 (domingo-sábado)
  monthDay?: number; // Dia do mês (1-31)
}

// Filtros para o feed
export interface FeedFilter {
  types?: FeedItemType[];
  priorities?: Priority[];
  categories?: (ActivityCategory | AnnouncementCategory | EventCategory)[];
  authors?: string[];
  departments?: string[];
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
  showExpired?: boolean;
  onlyMyItems?: boolean;
}

// Estatísticas do feed
export interface FeedStats {
  totalItems: number;
  byType: Record<FeedItemType, number>;
  byPriority: Record<Priority, number>;
  recentActivity: number; // Últimas 24h
  pendingActions: number; // Itens que requerem ação do usuário
  upcomingEvents: number; // Próximos 7 dias
}

// Formulários
export interface ActivityFormData {
  title: string;
  description: string;
  priority: Priority;
  status: ActivityStatus;
  startDate: Date;
  endDate?: Date;
  location?: string;
  category: ActivityCategory;
  maxParticipants?: number;
  requiresConfirmation: boolean;
  isPublic: boolean;
  targetAudience?: string[];
  instructions?: string;
  materials?: string[];
  tags?: string[];
}

export interface AnnouncementFormData {
  title: string;
  description: string;
  priority: Priority;
  category: AnnouncementCategory;
  expiresAt?: Date;
  isUrgent: boolean;
  acknowledgmentRequired: boolean;
  isPublic: boolean;
  targetAudience?: string[];
  tags?: string[];
  attachments?: File[]; // Arquivos para upload
  existingAttachments?: FeedAttachment[]; // Anexos já salvos (para edição)
}

export interface EventFormData {
  title: string;
  description: string;
  priority: Priority;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  location?: string;
  meetingLink?: string;
  category: EventCategory;
  attendees?: string[];
  recurrence?: RecurrenceConfig;
  reminders?: Omit<EventReminder, 'id'>[];
  isPublic: boolean;
  tags?: string[];
}

// Visualizações do calendário
export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export interface CalendarViewConfig {
  view: CalendarView;
  date: Date;
  showWeekends: boolean;
  showAllDay: boolean;
  timeSlotDuration: number; // em minutos
  businessHours: {
    start: string; // HH:mm
    end: string; // HH:mm
  };
}

// Notificações do feed
export interface FeedNotification {
  id: string;
  feedItemId: string;
  userId: string;
  type: 'new_item' | 'reminder' | 'update' | 'deadline' | 'confirmation_request';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  actionLabel?: string;
}

// Configurações do usuário para o feed
export interface FeedUserSettings {
  userId: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    types: {
      activities: boolean;
      announcements: boolean;
      events: boolean;
      reminders: boolean;
    };
  };
  defaultView: 'feed' | 'calendar';
  calendarView: CalendarView;
  autoRefresh: boolean;
  refreshInterval: number; // em segundos
  filters: FeedFilter;
}