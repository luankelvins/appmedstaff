import { supabase } from '../config/supabase';
import {
  FeedItem,
  Activity,
  Announcement,
  CalendarEvent,
  FeedFilter,
  FeedStats,
  ActivityFormData,
  AnnouncementFormData,
  EventFormData,
  FeedUserSettings,
  FeedNotification,
  ActivityConfirmation,
  AnnouncementAcknowledgment,
  EventAttendee,
  FeedAttachment
} from '../types/feed';

class FeedService {
  // ==================== FEED ITEMS ====================

  async getFeedItems(filter?: FeedFilter, currentUserId?: string): Promise<FeedItem[]> {
    let query = supabase
      .from('feed_items')
      .select(`
        *,
        activities(*),
        announcements(*),
        calendar_events(*),
        feed_attachments(*)
      `)
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filter) {
      if (filter.types && filter.types.length > 0) {
        query = query.in('type', filter.types);
      }
      if (filter.priorities && filter.priorities.length > 0) {
        query = query.in('priority', filter.priorities);
      }
      if (filter.authors && filter.authors.length > 0) {
        query = query.in('author', filter.authors);
      }
      if (filter.departments && filter.departments.length > 0) {
        query = query.in('department', filter.departments);
      }
      if (filter.dateFrom) {
        query = query.gte('created_at', filter.dateFrom.toISOString());
      }
      if (filter.dateTo) {
        query = query.lte('created_at', filter.dateTo.toISOString());
      }
      if (filter.searchTerm) {
        query = query.or(`title.ilike.%${filter.searchTerm}%,description.ilike.%${filter.searchTerm}%`);
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    let items = data?.map(this.mapFeedItemFromDB) || [];

    // Aplicar regras de visibilidade específicas por tipo
    if (currentUserId) {
      items = await this.applyVisibilityRules(items, currentUserId);
    }

    return items;
  }

  /**
   * Aplica regras específicas de visibilidade para cada tipo de item:
   * - Tarefas: usuário é o responsável OU participante
   * - Notificações: exclusivamente do usuário
   * - Atividades/Eventos: consolidados, visíveis se usuário é participante
   * - Comunicados: gerais para todo o time
   */
  private async applyVisibilityRules(items: FeedItem[], currentUserId: string): Promise<FeedItem[]> {
    const filteredItems: FeedItem[] = [];

    for (const item of items) {
      let shouldInclude = false;

      switch (item.type) {
        case 'task':
          // Tarefas: usuário é responsável OU participante
          shouldInclude = await this.isUserTaskOwnerOrParticipant(item.id, currentUserId);
          break;

        case 'notification':
          // Notificações: exclusivamente do usuário
          shouldInclude = item.author === currentUserId;
          break;

        case 'activity':
        case 'event':
          // Atividades e eventos: usuário é participante OU item é público
          shouldInclude = await this.isUserActivityOrEventParticipant(item.id, currentUserId) || item.isPublic;
          break;

        case 'announcement':
          // Comunicados: gerais para todo o time (sempre visíveis)
          shouldInclude = true;
          break;

        default:
          // Outros tipos: visíveis por padrão
          shouldInclude = true;
      }

      if (shouldInclude) {
        filteredItems.push(item);
      }
    }

    return filteredItems;
  }

  private async isUserTaskOwnerOrParticipant(itemId: string, userId: string): Promise<boolean> {
    // Verificar se o usuário é o responsável pela tarefa
    const { data: taskData } = await supabase
      .from('feed_items')
      .select('author')
      .eq('id', itemId)
      .eq('type', 'task')
      .single();

    if (taskData?.author === userId) {
      return true;
    }

    // Verificar se o usuário é participante da tarefa
    const { data: participantData } = await supabase
      .from('task_participants')
      .select('id')
      .eq('task_id', itemId)
      .eq('user_id', userId)
      .single();

    return !!participantData;
  }

  private async isUserActivityOrEventParticipant(itemId: string, userId: string): Promise<boolean> {
    // Verificar participação em atividades
    const { data: activityParticipant } = await supabase
      .from('activity_confirmations')
      .select('id')
      .eq('activity_id', itemId)
      .eq('user_id', userId)
      .single();

    if (activityParticipant) {
      return true;
    }

    // Verificar participação em eventos
    const { data: eventParticipant } = await supabase
      .from('event_attendees')
      .select('id')
      .eq('event_id', itemId)
      .eq('user_id', userId)
      .single();

    return !!eventParticipant;
  }

  async getFeedItemById(id: string): Promise<FeedItem | null> {
    const { data, error } = await supabase
      .from('feed_items')
      .select(`
        *,
        activities(*),
        announcements(*),
        calendar_events(*),
        feed_attachments(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return this.mapFeedItemFromDB(data);
  }

  async getFeedStats(): Promise<FeedStats> {
    const { data, error } = await supabase
      .from('feed_items')
      .select('type, priority, created_at');

    if (error) throw error;

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const stats: FeedStats = {
      totalItems: data?.length || 0,
      byType: {
        task: 0,
        notification: 0,
        activity: 0,
        announcement: 0,
        event: 0
      },
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0
      },
      recentActivity: 0,
      pendingActions: 0,
      upcomingEvents: 0
    };

    data?.forEach(item => {
      if (item.type in stats.byType) {
        stats.byType[item.type as keyof typeof stats.byType]++;
      }
      if (item.priority in stats.byPriority) {
        stats.byPriority[item.priority as keyof typeof stats.byPriority]++;
      }
      
      if (new Date(item.created_at) > yesterday) {
        stats.recentActivity++;
      }
    });

    // Buscar eventos próximos
    const { data: upcomingEvents } = await supabase
      .from('calendar_events')
      .select('id')
      .gte('start_date', now.toISOString())
      .lte('start_date', nextWeek.toISOString());

    stats.upcomingEvents = upcomingEvents?.length || 0;

    return stats;
  }

  // ==================== ATIVIDADES ====================

  async createActivity(data: ActivityFormData, userId: string): Promise<Activity> {
    // Criar item do feed
    const feedItemData = {
      title: data.title,
      description: data.description,
      type: 'activity',
      priority: data.priority,
      author: userId,
      author_name: 'Usuário', // TODO: buscar nome real do usuário
      department: 'Geral',
      tags: data.tags || [],
      is_public: data.isPublic,
      target_audience: data.targetAudience || [],
      created_by: userId,
      updated_by: userId
    };

    const { data: feedItem, error: feedError } = await supabase
      .from('feed_items')
      .insert(feedItemData)
      .select()
      .single();

    if (feedError) throw feedError;

    // Criar atividade específica
    const activityData = {
      feed_item_id: feedItem.id,
      status: data.status,
      start_date: data.startDate.toISOString(),
      end_date: data.endDate?.toISOString(),
      location: data.location,
      category: data.category,
      max_participants: data.maxParticipants,
      requires_confirmation: data.requiresConfirmation,
      instructions: data.instructions,
      materials: data.materials || [],
      created_by: userId,
      updated_by: userId
    };

    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .insert(activityData)
      .select()
      .single();

    if (activityError) throw activityError;

    return this.mapActivityFromDB({ ...feedItem, activities: [activity] });
  }

  async updateActivity(id: string, updates: Partial<ActivityFormData>, userId: string): Promise<Activity> {
    // Atualizar item do feed
    if (updates.title || updates.description || updates.priority || updates.tags) {
      const feedUpdates: any = { updated_by: userId };
      if (updates.title) feedUpdates.title = updates.title;
      if (updates.description) feedUpdates.description = updates.description;
      if (updates.priority) feedUpdates.priority = updates.priority;
      if (updates.tags) feedUpdates.tags = updates.tags;

      const { error: feedError } = await supabase
        .from('feed_items')
        .update(feedUpdates)
        .eq('id', id);

      if (feedError) throw feedError;
    }

    // Atualizar atividade específica
    const activityUpdates: any = { updated_by: userId };
    if (updates.status) activityUpdates.status = updates.status;
    if (updates.startDate) activityUpdates.start_date = updates.startDate.toISOString();
    if (updates.endDate) activityUpdates.end_date = updates.endDate.toISOString();
    if (updates.location) activityUpdates.location = updates.location;
    if (updates.category) activityUpdates.category = updates.category;
    if (updates.maxParticipants) activityUpdates.max_participants = updates.maxParticipants;
    if (updates.requiresConfirmation !== undefined) activityUpdates.requires_confirmation = updates.requiresConfirmation;
    if (updates.instructions) activityUpdates.instructions = updates.instructions;
    if (updates.materials) activityUpdates.materials = updates.materials;

    const { error: activityError } = await supabase
      .from('activities')
      .update(activityUpdates)
      .eq('feed_item_id', id);

    if (activityError) throw activityError;

    const updatedActivity = await this.getFeedItemById(id);
    return updatedActivity as Activity;
  }

  async confirmActivity(activityId: string, userId: string, status: 'confirmed' | 'declined' | 'maybe', notes?: string): Promise<void> {
    const confirmationData = {
      activity_id: activityId,
      user_id: userId,
      user_name: 'Usuário', // TODO: buscar nome real
      status,
      notes
    };

    const { error } = await supabase
      .from('activity_confirmations')
      .upsert(confirmationData, { onConflict: 'activity_id,user_id' });

    if (error) throw error;
  }

  // ==================== COMUNICADOS ====================

  async createAnnouncement(data: AnnouncementFormData, userId: string): Promise<Announcement> {
    // Criar item do feed
    const feedItemData = {
      title: data.title,
      description: data.description,
      type: 'announcement',
      priority: data.priority,
      author: userId,
      author_name: 'Usuário', // TODO: buscar nome real do usuário
      department: 'Geral',
      tags: data.tags || [],
      is_public: data.isPublic,
      target_audience: data.targetAudience || [],
      created_by: userId,
      updated_by: userId
    };

    const { data: feedItem, error: feedError } = await supabase
      .from('feed_items')
      .insert(feedItemData)
      .select()
      .single();

    if (feedError) throw feedError;

    // Criar comunicado específico
    const announcementData = {
      feed_item_id: feedItem.id,
      expires_at: data.expiresAt?.toISOString(),
      is_urgent: data.isUrgent,
      category: data.category,
      acknowledgment_required: data.acknowledgmentRequired,
      created_by: userId,
      updated_by: userId
    };

    const { data: announcement, error: announcementError } = await supabase
      .from('announcements')
      .insert(announcementData)
      .select()
      .single();

    if (announcementError) throw announcementError;

    return this.mapAnnouncementFromDB({ ...feedItem, announcements: [announcement] });
  }

  async acknowledgeAnnouncement(announcementId: string, userId: string, notes?: string): Promise<void> {
    const acknowledgmentData = {
      announcement_id: announcementId,
      user_id: userId,
      user_name: 'Usuário', // TODO: buscar nome real
      notes
    };

    const { error } = await supabase
      .from('announcement_acknowledgments')
      .upsert(acknowledgmentData, { onConflict: 'announcement_id,user_id' });

    if (error) throw error;

    // Atualizar lista de leitores no comunicado
    const { data: announcement } = await supabase
      .from('announcements')
      .select('read_by')
      .eq('id', announcementId)
      .single();

    if (announcement) {
      const readBy = announcement.read_by || [];
      if (!readBy.includes(userId)) {
        readBy.push(userId);
        
        await supabase
          .from('announcements')
          .update({ read_by: readBy })
          .eq('id', announcementId);
      }
    }
  }

  // ==================== EVENTOS ====================

  async createEvent(data: EventFormData, userId: string): Promise<CalendarEvent> {
    // Criar item do feed
    const feedItemData = {
      title: data.title,
      description: data.description,
      type: 'event',
      priority: data.priority,
      author: userId,
      author_name: 'Usuário', // TODO: buscar nome real do usuário
      department: 'Geral',
      tags: data.tags || [],
      is_public: data.isPublic,
      created_by: userId,
      updated_by: userId
    };

    const { data: feedItem, error: feedError } = await supabase
      .from('feed_items')
      .insert(feedItemData)
      .select()
      .single();

    if (feedError) throw feedError;

    // Criar evento específico
    const eventData = {
      feed_item_id: feedItem.id,
      status: 'scheduled',
      start_date: data.startDate.toISOString(),
      end_date: data.endDate.toISOString(),
      is_all_day: data.isAllDay,
      location: data.location,
      meeting_link: data.meetingLink,
      organizer: userId,
      recurrence_config: data.recurrence,
      category: data.category,
      created_by: userId,
      updated_by: userId
    };

    const { data: event, error: eventError } = await supabase
      .from('calendar_events')
      .insert(eventData)
      .select()
      .single();

    if (eventError) throw eventError;

    // Adicionar participantes se especificados
    if (data.attendees && data.attendees.length > 0) {
      const attendeesData = data.attendees.map(attendeeId => ({
        event_id: event.id,
        user_id: attendeeId,
        user_name: 'Usuário', // TODO: buscar nome real
        email: 'usuario@email.com', // TODO: buscar email real
        status: 'invited'
      }));

      await supabase
        .from('event_attendees')
        .insert(attendeesData);
    }

    // Adicionar lembretes se especificados
    if (data.reminders && data.reminders.length > 0) {
      const remindersData = data.reminders.map(reminder => ({
        event_id: event.id,
        type: reminder.type,
        minutes_before: reminder.minutesBefore,
        is_active: reminder.isActive
      }));

      await supabase
        .from('event_reminders')
        .insert(remindersData);
    }

    return this.mapEventFromDB({ ...feedItem, calendar_events: [event] });
  }

  async respondToEvent(eventId: string, userId: string, status: 'accepted' | 'declined' | 'tentative', notes?: string): Promise<void> {
    const attendeeData = {
      event_id: eventId,
      user_id: userId,
      user_name: 'Usuário', // TODO: buscar nome real
      email: 'usuario@email.com', // TODO: buscar email real
      status,
      response_date: new Date().toISOString(),
      notes
    };

    const { error } = await supabase
      .from('event_attendees')
      .upsert(attendeeData, { onConflict: 'event_id,user_id' });

    if (error) throw error;
  }

  // ==================== ANEXOS ====================

  async addAttachment(feedItemId: string, file: File, userId: string): Promise<FeedAttachment> {
    // TODO: Implementar upload de arquivo para storage
    // Por enquanto, simular URL do arquivo
    const fileUrl = `https://storage.supabase.co/v1/object/public/feed-attachments/${feedItemId}/${file.name}`;

    const attachmentData = {
      feed_item_id: feedItemId,
      file_name: file.name,
      file_url: fileUrl,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: userId
    };

    const { data, error } = await supabase
      .from('feed_attachments')
      .insert(attachmentData)
      .select()
      .single();

    if (error) throw error;

    return this.mapAttachmentFromDB(data);
  }

  // ==================== CONFIGURAÇÕES DO USUÁRIO ====================

  async getUserSettings(userId: string): Promise<FeedUserSettings> {
    const { data, error } = await supabase
      .from('feed_user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Criar configurações padrão se não existirem
        return this.createDefaultUserSettings(userId);
      }
      throw error;
    }

    return this.mapUserSettingsFromDB(data);
  }

  async updateUserSettings(userId: string, settings: Partial<FeedUserSettings>): Promise<FeedUserSettings> {
    const updates: any = {};
    if (settings.notifications) updates.notifications = settings.notifications;
    if (settings.defaultView) updates.default_view = settings.defaultView;
    if (settings.calendarView) updates.calendar_view = settings.calendarView;
    if (settings.autoRefresh !== undefined) updates.auto_refresh = settings.autoRefresh;
    if (settings.refreshInterval) updates.refresh_interval = settings.refreshInterval;
    if (settings.filters) updates.filters = settings.filters;

    const { data, error } = await supabase
      .from('feed_user_settings')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return this.mapUserSettingsFromDB(data);
  }

  private async createDefaultUserSettings(userId: string): Promise<FeedUserSettings> {
    const defaultSettings = {
      user_id: userId,
      notifications: {
        email: true,
        push: true,
        inApp: true,
        types: {
          activities: true,
          announcements: true,
          events: true,
          reminders: true
        }
      },
      default_view: 'feed' as const,
      calendar_view: 'month' as const,
      auto_refresh: true,
      refresh_interval: 300,
      filters: {}
    };

    const { data, error } = await supabase
      .from('feed_user_settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (error) throw error;

    return this.mapUserSettingsFromDB(data);
  }

  // ==================== NOTIFICAÇÕES ====================

  async createNotification(feedItemId: string, userId: string, type: string, title: string, message: string): Promise<void> {
    const notificationData = {
      feed_item_id: feedItemId,
      user_id: userId,
      type,
      title,
      message
    };

    const { error } = await supabase
      .from('feed_notifications')
      .insert(notificationData);

    if (error) throw error;
  }

  async getUserNotifications(userId: string, unreadOnly = false): Promise<FeedNotification[]> {
    let query = supabase
      .from('feed_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data?.map(this.mapNotificationFromDB) || [];
  }

  /**
   * Busca itens de notificação do feed exclusivamente para o usuário
   */
  async getUserFeedNotifications(userId: string, filter?: FeedFilter): Promise<FeedItem[]> {
    let query = supabase
      .from('feed_items')
      .select(`
        *,
        activities(*),
        announcements(*),
        calendar_events(*),
        feed_attachments(*)
      `)
      .eq('type', 'notification')
      .eq('author', userId)
      .order('created_at', { ascending: false });

    // Aplicar filtros adicionais se fornecidos
    if (filter) {
      if (filter.priorities && filter.priorities.length > 0) {
        query = query.in('priority', filter.priorities);
      }
      if (filter.dateFrom) {
        query = query.gte('created_at', filter.dateFrom.toISOString());
      }
      if (filter.dateTo) {
        query = query.lte('created_at', filter.dateTo.toISOString());
      }
      if (filter.searchTerm) {
        query = query.or(`title.ilike.%${filter.searchTerm}%,description.ilike.%${filter.searchTerm}%`);
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    return data?.map(this.mapFeedItemFromDB) || [];
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('feed_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  }

  // ==================== MAPEAMENTO DE DADOS ====================

  private mapFeedItemFromDB(data: any): FeedItem {
    const baseItem = {
      id: data.id,
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
      author: data.author,
      authorName: data.author_name,
      authorAvatar: data.author_avatar,
      department: data.department,
      tags: data.tags || [],
      attachments: data.feed_attachments?.map(this.mapAttachmentFromDB) || [],
      isPublic: data.is_public,
      targetAudience: data.target_audience || [],
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by || '',
      updatedBy: data.updated_by || ''
    };

    // Mapear dados específicos baseado no tipo
    if (data.type === 'activity' && data.activities?.[0]) {
      return this.mapActivityFromDB(data);
    } else if (data.type === 'announcement' && data.announcements?.[0]) {
      return this.mapAnnouncementFromDB(data);
    } else if (data.type === 'event' && data.calendar_events?.[0]) {
      return this.mapEventFromDB(data);
    }

    return baseItem;
  }

  private mapActivityFromDB(data: any): Activity {
    const activity = data.activities[0];
    return {
      ...this.mapFeedItemFromDB(data),
      type: 'activity',
      status: activity.status,
      startDate: new Date(activity.start_date),
      endDate: activity.end_date ? new Date(activity.end_date) : undefined,
      location: activity.location,
      participants: activity.participants || [],
      maxParticipants: activity.max_participants,
      requiresConfirmation: activity.requires_confirmation,
      confirmations: [], // TODO: buscar confirmações
      category: activity.category,
      instructions: activity.instructions,
      materials: activity.materials || []
    } as Activity;
  }

  private mapAnnouncementFromDB(data: any): Announcement {
    const announcement = data.announcements[0];
    return {
      ...this.mapFeedItemFromDB(data),
      type: 'announcement',
      expiresAt: announcement.expires_at ? new Date(announcement.expires_at) : undefined,
      isUrgent: announcement.is_urgent,
      category: announcement.category,
      readBy: announcement.read_by || [],
      acknowledgmentRequired: announcement.acknowledgment_required,
      acknowledgments: [] // TODO: buscar reconhecimentos
    } as Announcement;
  }

  private mapEventFromDB(data: any): CalendarEvent {
    const event = data.calendar_events[0];
    return {
      ...this.mapFeedItemFromDB(data),
      type: 'event',
      status: event.status,
      startDate: new Date(event.start_date),
      endDate: new Date(event.end_date),
      isAllDay: event.is_all_day,
      location: event.location,
      meetingLink: event.meeting_link,
      attendees: [], // TODO: buscar participantes
      organizer: event.organizer,
      recurrence: event.recurrence_config,
      reminders: [], // TODO: buscar lembretes
      category: event.category
    } as CalendarEvent;
  }

  private mapAttachmentFromDB(data: any): FeedAttachment {
    return {
      id: data.id,
      fileName: data.file_name,
      fileUrl: data.file_url,
      fileSize: data.file_size,
      mimeType: data.mime_type,
      uploadedBy: data.uploaded_by,
      uploadedAt: new Date(data.uploaded_at)
    };
  }

  private mapUserSettingsFromDB(data: any): FeedUserSettings {
    return {
      userId: data.user_id,
      notifications: data.notifications,
      defaultView: data.default_view,
      calendarView: data.calendar_view,
      autoRefresh: data.auto_refresh,
      refreshInterval: data.refresh_interval,
      filters: data.filters || {}
    };
  }

  private mapNotificationFromDB(data: any): FeedNotification {
    return {
      id: data.id,
      feedItemId: data.feed_item_id,
      userId: data.user_id,
      type: data.type,
      title: data.title,
      message: data.message,
      isRead: data.is_read,
      createdAt: new Date(data.created_at),
      actionUrl: data.action_url,
      actionLabel: data.action_label
    };
  }

  // ==================== MÉTODOS DE UTILIDADE ====================

  async deleteFeedItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('feed_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getCalendarEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('feed_items')
      .select(`
        *,
        calendar_events(*)
      `)
      .eq('type', 'event')
      .gte('calendar_events.start_date', startDate.toISOString())
      .lte('calendar_events.start_date', endDate.toISOString())
      .order('calendar_events.start_date');

    if (error) throw error;

    return data?.map(this.mapEventFromDB) || [];
  }
}

export const feedService = new FeedService();