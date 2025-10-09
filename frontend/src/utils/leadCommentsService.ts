// Mock implementation - Supabase removed

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

// ==================== SERVICE ====================

export class LeadCommentsService {
  private eventHandlers: Map<string, Function[]> = new Map()
  private mockComments: LeadComment[] = [
    {
      id: '1',
      lead_id: '1',
      author_id: 'user1',
      author_name: 'João Silva',
      author_role: 'Vendedor',
      content: 'Cliente demonstrou interesse no produto premium',
      comment_type: 'qualification',
      priority: 'high',
      is_private: false,
      tags: ['interesse', 'premium'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  async getLeadComments(
    leadId: string, 
    filters?: CommentFilters
  ): Promise<LeadComment[]> {
    console.log('Getting lead comments for:', leadId, 'with filters:', filters)
    
    let filteredComments = this.mockComments.filter(comment => comment.lead_id === leadId)
    
    if (filters) {
      if (filters.comment_type) {
        filteredComments = filteredComments.filter(c => c.comment_type === filters.comment_type)
      }
      if (filters.priority) {
        filteredComments = filteredComments.filter(c => c.priority === filters.priority)
      }
      if (filters.is_private !== undefined) {
        filteredComments = filteredComments.filter(c => c.is_private === filters.is_private)
      }
      if (filters.author_id) {
        filteredComments = filteredComments.filter(c => c.author_id === filters.author_id)
      }
      if (filters.search) {
        filteredComments = filteredComments.filter(c => 
          c.content.toLowerCase().includes(filters.search!.toLowerCase())
        )
      }
    }
    
    return filteredComments
  }

  async getCommentById(commentId: string): Promise<LeadComment | null> {
    console.log('Getting comment by ID:', commentId)
    return this.mockComments.find(comment => comment.id === commentId) || null
  }

  async createComment(commentData: CreateCommentData): Promise<LeadComment> {
    console.log('Creating comment:', commentData)
    
    const newComment: LeadComment = {
      id: `comment_${Date.now()}`,
      lead_id: commentData.lead_id,
      author_id: 'current_user',
      author_name: 'Usuário Atual',
      author_role: 'Vendedor',
      content: commentData.content,
      comment_type: (commentData.comment_type as any) || 'general',
      priority: (commentData.priority as any) || 'medium',
      is_private: commentData.is_private || false,
      related_stage: commentData.related_stage,
      tags: commentData.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    this.mockComments.push(newComment)
    this.emitEvent('comment_created', newComment)
    
    return newComment
  }

  async updateComment(commentId: string, updateData: UpdateCommentData): Promise<LeadComment> {
    console.log('Updating comment:', commentId, updateData)
    
    const commentIndex = this.mockComments.findIndex(c => c.id === commentId)
    if (commentIndex === -1) {
      throw new Error('Comment not found')
    }
    
    const updatedComment: LeadComment = {
      ...this.mockComments[commentIndex],
      ...updateData,
      comment_type: (updateData.comment_type as any) || this.mockComments[commentIndex].comment_type,
      priority: (updateData.priority as any) || this.mockComments[commentIndex].priority,
      updated_at: new Date().toISOString()
    }
    
    this.mockComments[commentIndex] = updatedComment
    this.emitEvent('comment_updated', updatedComment)
    
    return updatedComment
  }

  async deleteComment(commentId: string): Promise<void> {
    console.log('Deleting comment:', commentId)
    
    const commentIndex = this.mockComments.findIndex(c => c.id === commentId)
    if (commentIndex === -1) {
      throw new Error('Comment not found')
    }
    
    const deletedComment = this.mockComments[commentIndex]
    this.mockComments.splice(commentIndex, 1)
    this.emitEvent('comment_deleted', { id: commentId })
  }

  async getCommentStats(leadId: string): Promise<CommentStats> {
    console.log('Getting comment stats for lead:', leadId)
    
    const leadComments = this.mockComments.filter(c => c.lead_id === leadId)
    
    const stats: CommentStats = {
      total_comments: leadComments.length,
      high_priority_count: leadComments.filter(c => c.priority === 'high' || c.priority === 'urgent').length,
      comments_by_type: {},
      comments_by_priority: {},
      recent_activity: leadComments.filter(c => {
        const commentDate = new Date(c.created_at)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return commentDate > weekAgo
      }).length
    }
    
    // Calcular distribuição por tipo
    leadComments.forEach(comment => {
      stats.comments_by_type[comment.comment_type] = (stats.comments_by_type[comment.comment_type] || 0) + 1
      stats.comments_by_priority[comment.priority] = (stats.comments_by_priority[comment.priority] || 0) + 1
    })
    
    return stats
  }

  subscribeToLeadComments(leadId: string, callback: (event: any) => void): string {
    console.log('Subscribing to lead comments:', leadId)
    
    const subscriptionId = `sub_${Date.now()}_${Math.random()}`
    
    if (!this.eventHandlers.has(leadId)) {
      this.eventHandlers.set(leadId, [])
    }
    
    this.eventHandlers.get(leadId)!.push(callback)
    
    return subscriptionId
  }

  unsubscribeFromLeadComments(subscriptionId: string): void {
    console.log('Unsubscribing from lead comments:', subscriptionId)
    // Mock implementation - just log
  }

  private emitEvent(eventType: string, data: any): void {
    console.log('Emitting event:', eventType, data)
    // Mock implementation - just log
  }
}

export const leadCommentsService = new LeadCommentsService()