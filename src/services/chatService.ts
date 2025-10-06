import { supabase, supabaseAdmin } from '../config/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ==================== TIPOS ====================

export interface ChatChannel {
  id: string
  name: string
  description?: string
  type: 'public' | 'private' | 'direct'
  created_by?: string
  created_at: string
  updated_at: string
  is_active: boolean
  unread_count?: number
}

export interface ChatMessage {
  id: string
  channel_id: string
  user_id: string
  content: string
  type: 'text' | 'file' | 'image' | 'system'
  metadata?: any
  reply_to?: string
  is_edited: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
  user?: {
    id: string
    name: string
    avatar?: string
  }
}

export interface ChatChannelMember {
  id: string
  channel_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  last_read_at: string
}

export interface TypingIndicator {
  channel_id: string
  user_id: string
  user_name: string
}

// ==================== SERVIÇO DE CHAT ====================

class ChatService {
  private typingChannel: RealtimeChannel | null = null
  private messageChannels: Map<string, RealtimeChannel> = new Map()

  // ==================== CANAIS ====================

  /**
   * Busca todos os canais que o usuário tem acesso
   */
  async getMyChannels(userId: string): Promise<ChatChannel[]> {
    try {
      // Usar admin client para bypass RLS
      const client = supabaseAdmin || supabase
      
      // Buscar IDs dos canais que o usuário é membro
      const { data: memberData, error: memberError } = await client
        .from('chat_channel_members')
        .select('channel_id')
        .eq('user_id', userId)

      if (memberError) {
        console.error('Erro ao buscar membros:', memberError)
        return []
      }

      const channelIds = memberData?.map(m => m.channel_id) || []

      if (channelIds.length === 0) {
        return []
      }

      // Buscar detalhes dos canais
      const { data: channels, error: channelsError } = await client
        .from('chat_channels')
        .select('*')
        .in('id', channelIds)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })

      if (channelsError) {
        console.error('Erro ao buscar canais:', channelsError)
        return []
      }

      // Buscar contagem de mensagens não lidas (sem await paralelo por enquanto)
      const channelsWithUnread: ChatChannel[] = []
      for (const channel of channels || []) {
        const unread = await this.getUnreadCount(userId, channel.id)
        channelsWithUnread.push({ ...channel, unread_count: unread })
      }

      return channelsWithUnread
    } catch (error) {
      console.error('Erro ao buscar canais:', error)
      return []
    }
  }

  /**
   * Busca canais públicos disponíveis
   */
  async getPublicChannels(): Promise<ChatChannel[]> {
    try {
      const { data, error } = await supabase
        .from('chat_channels')
        .select('*')
        .eq('type', 'public')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar canais públicos:', error)
      return []
    }
  }

  /**
   * Cria um novo canal
   */
  async createChannel(
    name: string,
    description: string,
    type: 'public' | 'private',
    createdBy: string,
    members: string[] = []
  ): Promise<ChatChannel | null> {
    try {
      // Criar canal
      const { data: channel, error: channelError } = await supabase
        .from('chat_channels')
        .insert({
          name,
          description,
          type,
          created_by: createdBy
        })
        .select()
        .single()

      if (channelError) throw channelError

      // Adicionar criador como owner
      await supabase
        .from('chat_channel_members')
        .insert({
          channel_id: channel.id,
          user_id: createdBy,
          role: 'owner'
        })

      // Adicionar membros
      if (members.length > 0) {
        await supabase
          .from('chat_channel_members')
          .insert(
            members.map(userId => ({
              channel_id: channel.id,
              user_id: userId,
              role: 'member'
            }))
          )
      }

      return channel
    } catch (error) {
      console.error('Erro ao criar canal:', error)
      return null
    }
  }

  /**
   * Inicia conversa direta com usuário
   */
  async startDirectConversation(user1Id: string, user2Id: string): Promise<ChatChannel | null> {
    try {
      // Verificar se já existe conversa
      const { data: existing } = await supabase
        .from('chat_direct_conversations')
        .select('channel_id, chat_channels(*)')
        .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)
        .single()

      if (existing) {
        return existing.chat_channels as any
      }

      // Criar novo canal direto
      const { data: channel, error: channelError } = await supabase
        .from('chat_channels')
        .insert({
          name: `Direct: ${user1Id}-${user2Id}`,
          type: 'direct',
          created_by: user1Id
        })
        .select()
        .single()

      if (channelError) throw channelError

      // Criar registro de conversa direta
      await supabase
        .from('chat_direct_conversations')
        .insert({
          user1_id: user1Id,
          user2_id: user2Id,
          channel_id: channel.id
        })

      // Adicionar ambos usuários como membros
      await supabase
        .from('chat_channel_members')
        .insert([
          { channel_id: channel.id, user_id: user1Id, role: 'member' },
          { channel_id: channel.id, user_id: user2Id, role: 'member' }
        ])

      return channel
    } catch (error) {
      console.error('Erro ao iniciar conversa direta:', error)
      return null
    }
  }

  // ==================== MENSAGENS ====================

  /**
   * Busca mensagens de um canal
   */
  async getMessages(channelId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles:user_id(id, name, avatar_url)
        `)
        .eq('channel_id', channelId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return (data || []).map(msg => ({
        ...msg,
        user: msg.profiles ? {
          id: msg.profiles.id,
          name: msg.profiles.name,
          avatar: msg.profiles.avatar_url
        } : undefined
      })).reverse()
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error)
      return []
    }
  }

  /**
   * Envia uma mensagem
   */
  async sendMessage(
    channelId: string,
    userId: string,
    content: string,
    type: 'text' | 'file' | 'image' = 'text',
    replyTo?: string
  ): Promise<ChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          channel_id: channelId,
          user_id: userId,
          content,
          type,
          reply_to: replyTo
        })
        .select()
        .single()

      if (error) throw error

      // Atualizar timestamp do canal
      await supabase
        .from('chat_channels')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', channelId)

      return data
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      return null
    }
  }

  /**
   * Edita uma mensagem
   */
  async editMessage(messageId: string, content: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ content, is_edited: true })
        .eq('id', messageId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erro ao editar mensagem:', error)
      return false
    }
  }

  /**
   * Deleta uma mensagem
   */
  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_deleted: true, content: '[Mensagem deletada]' })
        .eq('id', messageId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error)
      return false
    }
  }

  // ==================== MENSAGENS NÃO LIDAS ====================

  /**
   * Obtém contagem de mensagens não lidas
   */
  async getUnreadCount(userId: string, channelId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('get_unread_messages_count', {
          p_user_id: userId,
          p_channel_id: channelId
        })

      if (error) throw error
      return data || 0
    } catch (error) {
      // Se função não existir, calcular manualmente
      try {
        const { data: member } = await supabase
          .from('chat_channel_members')
          .select('last_read_at')
          .eq('user_id', userId)
          .eq('channel_id', channelId)
          .single()

        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('channel_id', channelId)
          .gt('created_at', member?.last_read_at || '1970-01-01')
          .neq('user_id', userId)

        return count || 0
      } catch {
        return 0
      }
    }
  }

  /**
   * Marca mensagens como lidas
   */
  async markAsRead(userId: string, channelId: string): Promise<void> {
    try {
      await supabase
        .rpc('mark_messages_as_read', {
          p_user_id: userId,
          p_channel_id: channelId
        })
    } catch (error) {
      // Se função não existir, atualizar manualmente
      await supabase
        .from('chat_channel_members')
        .update({ last_read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('channel_id', channelId)
    }
  }

  // ==================== INDICADORES DE DIGITAÇÃO ====================

  /**
   * Define indicador de digitação
   */
  async setTyping(userId: string, channelId: string, userName: string): Promise<void> {
    try {
      await supabase
        .from('chat_typing_indicators')
        .upsert({
          channel_id: channelId,
          user_id: userId,
          started_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Erro ao definir indicador de digitação:', error)
    }
  }

  /**
   * Remove indicador de digitação
   */
  async removeTyping(userId: string, channelId: string): Promise<void> {
    try {
      await supabase
        .from('chat_typing_indicators')
        .delete()
        .eq('user_id', userId)
        .eq('channel_id', channelId)
    } catch (error) {
      console.error('Erro ao remover indicador de digitação:', error)
    }
  }

  // ==================== REALTIME ====================

  /**
   * Subscreve para novas mensagens em um canal
   */
  subscribeToMessages(
    channelId: string,
    onMessage: (message: ChatMessage) => void
  ): () => void {
    const channel = supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => {
          onMessage(payload.new as ChatMessage)
        }
      )
      .subscribe()

    this.messageChannels.set(channelId, channel)

    return () => {
      channel.unsubscribe()
      this.messageChannels.delete(channelId)
    }
  }

  /**
   * Subscreve para indicadores de digitação
   */
  subscribeToTyping(
    channelId: string,
    onTyping: (indicators: TypingIndicator[]) => void
  ): () => void {
    const channel = supabase
      .channel(`typing:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_typing_indicators',
          filter: `channel_id=eq.${channelId}`
        },
        async () => {
          // Buscar indicadores atualizados
          const { data } = await supabase
            .from('chat_typing_indicators')
            .select(`
              *,
              profiles:user_id(name)
            `)
            .eq('channel_id', channelId)
            .gt('started_at', new Date(Date.now() - 10000).toISOString())

          const indicators = (data || []).map(d => ({
            channel_id: d.channel_id,
            user_id: d.user_id,
            user_name: d.profiles?.name || 'Usuário'
          }))

          onTyping(indicators)
        }
      )
      .subscribe()

    this.typingChannel = channel

    return () => {
      channel.unsubscribe()
      this.typingChannel = null
    }
  }

  /**
   * Limpa todas as subscrições
   */
  cleanup(): void {
    this.typingChannel?.unsubscribe()
    this.messageChannels.forEach(channel => channel.unsubscribe())
    this.messageChannels.clear()
  }
}

export const chatService = new ChatService()
export default chatService
