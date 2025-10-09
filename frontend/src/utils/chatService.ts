import db from '../config/database'

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

/**
 * Serviço de chat
 */
class ChatService {
  // ==================== CANAIS ====================

  /**
   * Obtém canais do usuário
   */
  async getMyChannels(userId: string): Promise<ChatChannel[]> {
    try {
      const result = await db.query(`
        SELECT DISTINCT 
          c.id,
          c.name,
          c.description,
          c.type,
          c.created_by,
          c.created_at,
          c.updated_at,
          c.is_active,
          COALESCE(unread.count, 0) as unread_count
        FROM chat_channels c
        INNER JOIN chat_channel_members cm ON c.id = cm.channel_id
        LEFT JOIN (
          SELECT 
            m.channel_id,
            COUNT(*) as count
          FROM chat_messages m
          INNER JOIN chat_channel_members cm2 ON m.channel_id = cm2.channel_id
          WHERE cm2.user_id = $1
            AND m.created_at > COALESCE(cm2.last_read_at, '1970-01-01')
            AND m.user_id != $1
          GROUP BY m.channel_id
        ) unread ON c.id = unread.channel_id
        WHERE cm.user_id = $1 AND c.is_active = true
        ORDER BY c.updated_at DESC
      `, [userId])

      return result.rows
    } catch (error) {
      console.error('Erro ao buscar canais do usuário:', error)
      return []
    }
  }

  /**
   * Obtém canais públicos
   */
  async getPublicChannels(): Promise<ChatChannel[]> {
    try {
      const result = await db.query(`
        SELECT 
          id,
          name,
          description,
          type,
          created_by,
          created_at,
          updated_at,
          is_active
        FROM chat_channels
        WHERE type = 'public' AND is_active = true
        ORDER BY name
      `)

      return result.rows
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
      const channelResult = await db.query(`
        INSERT INTO chat_channels (name, description, type, created_by, is_active)
        VALUES ($1, $2, $3, $4, true)
        RETURNING *
      `, [name, description, type, createdBy])

      const channel = channelResult.rows[0]

      // Adicionar criador como membro
      await db.query(`
        INSERT INTO chat_channel_members (channel_id, user_id, role, joined_at, last_read_at)
        VALUES ($1, $2, 'owner', NOW(), NOW())
      `, [channel.id, createdBy])

      // Adicionar outros membros
      for (const memberId of members) {
        if (memberId !== createdBy) {
          await db.query(`
            INSERT INTO chat_channel_members (channel_id, user_id, role, joined_at, last_read_at)
            VALUES ($1, $2, 'member', NOW(), NOW())
          `, [channel.id, memberId])
        }
      }

      return channel
    } catch (error) {
      console.error('Erro ao criar canal:', error)
      return null
    }
  }

  /**
   * Inicia conversa direta entre dois usuários
   */
  async startDirectConversation(user1Id: string, user2Id: string): Promise<ChatChannel | null> {
    try {
      // Verificar se já existe conversa direta
      const existingResult = await db.query(`
        SELECT c.*
        FROM chat_channels c
        INNER JOIN chat_channel_members cm1 ON c.id = cm1.channel_id
        INNER JOIN chat_channel_members cm2 ON c.id = cm2.channel_id
        WHERE c.type = 'direct'
          AND cm1.user_id = $1
          AND cm2.user_id = $2
          AND c.is_active = true
      `, [user1Id, user2Id])

      if (existingResult.rows.length > 0) {
        return existingResult.rows[0]
      }

      // Criar nova conversa direta
      const channelResult = await db.query(`
        INSERT INTO chat_channels (name, type, created_by, is_active)
        VALUES ('Conversa Direta', 'direct', $1, true)
        RETURNING *
      `, [user1Id])

      const channel = channelResult.rows[0]

      // Adicionar ambos os usuários como membros
      await db.query(`
        INSERT INTO chat_channel_members (channel_id, user_id, role, joined_at, last_read_at)
        VALUES 
          ($1, $2, 'member', NOW(), NOW()),
          ($1, $3, 'member', NOW(), NOW())
      `, [channel.id, user1Id, user2Id])

      return channel
    } catch (error) {
      console.error('Erro ao iniciar conversa direta:', error)
      return null
    }
  }

  // ==================== MENSAGENS ====================

  /**
   * Obtém mensagens de um canal
   */
  async getMessages(channelId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const result = await db.query(`
        SELECT 
          m.*,
          e.email,
          e.dados_pessoais
        FROM chat_messages m
        LEFT JOIN employees e ON m.user_id = e.id
        WHERE m.channel_id = $1
        ORDER BY m.created_at DESC
        LIMIT $2
      `, [channelId, limit])

      return result.rows.map((row: any) => ({
        id: row.id,
        channel_id: row.channel_id,
        user_id: row.user_id,
        content: row.content,
        type: row.type,
        metadata: row.metadata,
        reply_to: row.reply_to,
        is_edited: row.is_edited,
        is_deleted: row.is_deleted,
        created_at: row.created_at,
        updated_at: row.updated_at,
        user: row.email ? {
          id: row.user_id,
          name: row.dados_pessoais?.nome_completo || row.email.split('@')[0],
          avatar: row.dados_pessoais?.foto_perfil
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
      const result = await db.query(`
        INSERT INTO chat_messages (channel_id, user_id, content, type, reply_to, is_edited, is_deleted)
        VALUES ($1, $2, $3, $4, $5, false, false)
        RETURNING *
      `, [channelId, userId, content, type, replyTo])

      // Atualizar timestamp do canal
      await db.query(`
        UPDATE chat_channels 
        SET updated_at = NOW() 
        WHERE id = $1
      `, [channelId])

      return result.rows[0]
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
      await db.query(`
        UPDATE chat_messages 
        SET content = $1, is_edited = true, updated_at = NOW()
        WHERE id = $2
      `, [content, messageId])

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
      await db.query(`
        UPDATE chat_messages 
        SET is_deleted = true, content = '[Mensagem deletada]', updated_at = NOW()
        WHERE id = $1
      `, [messageId])

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
      const result = await db.query(`
        SELECT COUNT(*) as count
        FROM chat_messages m
        INNER JOIN chat_channel_members cm ON m.channel_id = cm.channel_id
        WHERE m.channel_id = $1
          AND cm.user_id = $2
          AND m.created_at > COALESCE(cm.last_read_at, '1970-01-01')
          AND m.user_id != $2
      `, [channelId, userId])

      return parseInt(result.rows[0].count) || 0
    } catch (error) {
      console.error('Erro ao buscar contagem de não lidas:', error)
      return 0
    }
  }

  /**
   * Marca mensagens como lidas
   */
  async markAsRead(userId: string, channelId: string): Promise<void> {
    try {
      await db.query(`
        UPDATE chat_channel_members 
        SET last_read_at = NOW()
        WHERE user_id = $1 AND channel_id = $2
      `, [userId, channelId])
    } catch (error) {
      console.error('Erro ao marcar como lidas:', error)
    }
  }

  // ==================== INDICADORES DE DIGITAÇÃO ====================

  /**
   * Define indicador de digitação
   */
  async setTyping(userId: string, channelId: string, userName: string): Promise<void> {
    try {
      await db.query(`
        INSERT INTO chat_typing_indicators (channel_id, user_id, started_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (channel_id, user_id) 
        DO UPDATE SET started_at = NOW()
      `, [channelId, userId])
    } catch (error) {
      console.error('Erro ao definir indicador de digitação:', error)
    }
  }

  /**
   * Remove indicador de digitação
   */
  async removeTyping(userId: string, channelId: string): Promise<void> {
    try {
      await db.query(`
        DELETE FROM chat_typing_indicators
        WHERE user_id = $1 AND channel_id = $2
      `, [userId, channelId])
    } catch (error) {
      console.error('Erro ao remover indicador de digitação:', error)
    }
  }

  // ==================== REALTIME ====================
  // Nota: As funcionalidades de realtime precisarão ser implementadas
  // usando WebSockets ou Server-Sent Events no backend

  /**
   * Subscreve para novas mensagens em um canal
   * Nota: Esta implementação é um placeholder - precisa ser implementada com WebSockets
   */
  subscribeToMessages(
    channelId: string,
    onMessage: (message: ChatMessage) => void
  ): () => void {
    console.warn('subscribeToMessages: Funcionalidade de realtime precisa ser implementada com WebSockets')
    
    // Retorna função de cleanup vazia por enquanto
    return () => {}
  }

  /**
   * Subscreve para indicadores de digitação
   * Nota: Esta implementação é um placeholder - precisa ser implementada com WebSockets
   */
  subscribeToTyping(
    channelId: string,
    onTyping: (indicators: TypingIndicator[]) => void
  ): () => void {
    console.warn('subscribeToTyping: Funcionalidade de realtime precisa ser implementada com WebSockets')
    
    // Retorna função de cleanup vazia por enquanto
    return () => {}
  }

  /**
   * Limpa todas as subscrições
   */
  cleanup(): void {
    // Placeholder para quando implementarmos WebSockets
    console.log('Chat cleanup executado')
  }
}

export const chatService = new ChatService()
export default chatService
