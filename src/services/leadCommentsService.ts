import { supabase } from '../config/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

// ==================== INTERFACES ====================

export interface LeadComment {
  id: string
  lead_id: string
  author_id: string
  author_name: string
  author_role: string
  content: string
  comment_type: 'general' | 'follow_up' | 'qualification' | 'objection' | 'proposal' | 'negotiation' | 'closing'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  is_private: boolean
  related_stage?: string
  related_contact_attempt_id?: string
  tags?: string[]
  created_at: string
  updated_at: string
  attachments?: LeadCommentAttachment[]
  replies?: LeadComment[]
}

export interface LeadCommentAttachment {
  id: string
  comment_id: string
  file_name: string
  file_type: string
  file_size: number
  file_url: string
  uploaded_by: string
  created_at: string
}

export interface CreateCommentData {
  lead_id: string
  content: string
  comment_type?: string
  priority?: string
  is_private?: boolean
  related_stage?: string
  tags?: string[]
}

export interface UpdateCommentData {
  content?: string
  comment_type?: string
  priority?: string
  is_private?: boolean
  tags?: string[]
}

export interface CommentFilters {
  comment_type?: string
  priority?: string
  is_private?: boolean
  related_stage?: string
  tags?: string[]
  author_id?: string
  date_from?: string
  date_to?: string
  search?: string
}

export interface CommentStats {
  total_comments: number
  high_priority_count: number
  comments_by_type: Record<string, number>
  comments_by_priority: Record<string, number>
  recent_activity: number
  avg_response_time?: number
}

// ==================== SERVIÇO DE COMENTÁRIOS ====================

export class LeadCommentsService {
  private realtimeChannel: RealtimeChannel | null = null
  private eventHandlers: Map<string, Function[]> = new Map()

  // ==================== OPERAÇÕES CRUD ====================

  /**
   * Busca comentários de um lead com filtros opcionais
   */
  async getLeadComments(
    leadId: string, 
    filters?: CommentFilters
  ): Promise<LeadComment[]> {
    try {
      let query = supabase
        .from('lead_comments')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })

      // Aplicar filtros
      if (filters) {
        if (filters.comment_type) {
          query = query.eq('comment_type', filters.comment_type)
        }
        if (filters.priority) {
          query = query.eq('priority', filters.priority)
        }
        if (filters.is_private !== undefined) {
          query = query.eq('is_private', filters.is_private)
        }
        if (filters.related_stage) {
          query = query.eq('related_stage', filters.related_stage)
        }
        if (filters.author_id) {
          query = query.eq('author_id', filters.author_id)
        }
        if (filters.date_from) {
          query = query.gte('created_at', filters.date_from)
        }
        if (filters.date_to) {
          query = query.lte('created_at', filters.date_to)
        }
        if (filters.search) {
          query = query.ilike('content', `%${filters.search}%`)
        }
        if (filters.tags && filters.tags.length > 0) {
          query = query.overlaps('tags', filters.tags)
        }
      }

      const { data, error } = await query

      if (error) throw error

      const comments = data?.map(this.mapCommentFromDB) || []
      return comments
    } catch (error) {
      console.error('Erro ao buscar comentários do lead:', error)
      throw error
    }
  }

  /**
   * Busca um comentário específico por ID
   */
  async getCommentById(commentId: string): Promise<LeadComment | null> {
    try {
      const { data, error } = await supabase
        .from('lead_comments')
        .select('*')
        .eq('id', commentId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Comentário não encontrado
        }
        throw error
      }

      return this.mapCommentFromDB(data)
    } catch (error) {
      console.error('Erro ao buscar comentário:', error)
      throw error
    }
  }

  /**
   * Cria um novo comentário
   */
  async createComment(commentData: CreateCommentData): Promise<LeadComment> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      // Buscar dados do usuário para author_name e author_role
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, position')
        .eq('id', user.id)
        .single()

      const insertData = {
        lead_id: commentData.lead_id,
        author_id: user.id,
        author_name: profile?.name || user.email || 'Usuário',
        author_role: profile?.position || 'Usuário',
        content: commentData.content,
        comment_type: commentData.comment_type || 'general',
        priority: commentData.priority || 'medium',
        is_private: commentData.is_private || false,
        related_stage: commentData.related_stage || null,
        tags: commentData.tags || null
      }

      const { data, error } = await supabase
        .from('lead_comments')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error

      const comment = this.mapCommentFromDB(data)

      // Emitir evento para atualizações em tempo real
      this.emitEvent('comment_created', { comment, leadId: commentData.lead_id })

      return comment
    } catch (error) {
      console.error('Erro ao criar comentário:', error)
      throw error
    }
  }

  /**
   * Atualiza um comentário existente
   */
  async updateComment(commentId: string, updateData: UpdateCommentData): Promise<LeadComment> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('lead_comments')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('author_id', user.id) // Só permite atualizar próprios comentários
        .select()
        .single()

      if (error) throw error

      const comment = this.mapCommentFromDB(data)

      // Emitir evento para atualizações em tempo real
      this.emitEvent('comment_updated', { comment, commentId })

      return comment
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error)
      throw error
    }
  }

  /**
   * Deleta um comentário
   */
  async deleteComment(commentId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { error } = await supabase
        .from('lead_comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', user.id) // Só permite deletar próprios comentários

      if (error) throw error

      // Emitir evento para atualizações em tempo real
      this.emitEvent('comment_deleted', { commentId })
    } catch (error) {
      console.error('Erro ao deletar comentário:', error)
      throw error
    }
  }

  /**
   * Busca estatísticas dos comentários de um lead
   */
  async getCommentStats(leadId: string): Promise<CommentStats> {
    try {
      const { data, error } = await supabase
        .from('lead_comments')
        .select('comment_type, priority, created_at')
        .eq('lead_id', leadId)

      if (error) throw error

      const comments = data || []
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const stats: CommentStats = {
        total_comments: comments.length,
        high_priority_count: comments.filter(c => c.priority === 'high' || c.priority === 'urgent').length,
        comments_by_type: {},
        comments_by_priority: {},
        recent_activity: comments.filter(c => new Date(c.created_at) > thirtyDaysAgo).length
      }

      // Contar por tipo
      comments.forEach(comment => {
        stats.comments_by_type[comment.comment_type] = (stats.comments_by_type[comment.comment_type] || 0) + 1
        stats.comments_by_priority[comment.priority] = (stats.comments_by_priority[comment.priority] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('Erro ao buscar estatísticas de comentários:', error)
      throw error
    }
  }

  // ==================== TEMPO REAL ====================

  /**
   * Inscreve-se para atualizações em tempo real dos comentários de um lead
   */
  subscribeToLeadComments(leadId: string, callback: (event: any) => void): string {
    const subscriptionId = `lead_comments_${leadId}_${Date.now()}`

    if (!this.realtimeChannel) {
      this.realtimeChannel = supabase.channel('lead_comments_channel')
    }

    this.realtimeChannel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lead_comments',
          filter: `lead_id=eq.${leadId}`
        },
        (payload) => {
          const event = {
            type: payload.eventType,
            table: 'lead_comments',
            record: payload.new,
            old_record: payload.old,
            timestamp: new Date().toISOString(),
            eventId: `${payload.eventType}_${Date.now()}`
          }
          callback(event)
        }
      )
      .subscribe()

    // Armazenar callback para cleanup
    if (!this.eventHandlers.has(subscriptionId)) {
      this.eventHandlers.set(subscriptionId, [])
    }
    this.eventHandlers.get(subscriptionId)!.push(callback)

    return subscriptionId
  }

  /**
   * Cancela inscrição de tempo real
   */
  unsubscribeFromLeadComments(subscriptionId: string): void {
    this.eventHandlers.delete(subscriptionId)
    
    if (this.eventHandlers.size === 0 && this.realtimeChannel) {
      this.realtimeChannel.unsubscribe()
      this.realtimeChannel = null
    }
  }

  // ==================== MÉTODOS AUXILIARES ====================

  /**
   * Mapeia dados do banco para o tipo LeadComment
   */
  private mapCommentFromDB(data: any): LeadComment {
    return {
      id: data.id,
      lead_id: data.lead_id,
      author_id: data.author_id,
      author_name: data.author_name,
      author_role: data.author_role,
      content: data.content,
      comment_type: data.comment_type,
      priority: data.priority,
      is_private: data.is_private,
      related_stage: data.related_stage,
      related_contact_attempt_id: data.related_contact_attempt_id,
      tags: data.tags || [],
      created_at: data.created_at,
      updated_at: data.updated_at,
      attachments: [],
      replies: []
    }
  }

  /**
   * Emite eventos para listeners
   */
  private emitEvent(eventType: string, data: any): void {
    // Implementação básica de eventos
    console.log(`[LeadCommentsService] Evento emitido: ${eventType}`, data)
  }
}

// Instância singleton do serviço
export const leadCommentsService = new LeadCommentsService()