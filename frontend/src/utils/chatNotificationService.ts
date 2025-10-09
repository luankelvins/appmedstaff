import { ChatMessage, ChatUser } from '../types/chat'

export interface NotificationPermission {
  granted: boolean
  denied: boolean
  default: boolean
}

export interface ChatNotificationOptions {
  title: string
  body: string
  icon?: string
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
}

class ChatNotificationService {
  private permission: NotificationPermission = {
    granted: false,
    denied: false,
    default: true
  }

  private isDocumentVisible = true
  private soundEnabled = true
  private notificationSound: HTMLAudioElement | null = null

  constructor() {
    this.initializePermissions()
    this.setupVisibilityListener()
    this.initializeSound()
  }

  private initializePermissions() {
    if ('Notification' in window) {
      this.updatePermissionState()
    }
  }

  private updatePermissionState() {
    const permission = Notification.permission
    this.permission = {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default'
    }
  }

  private setupVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      this.isDocumentVisible = !document.hidden
    })
  }

  private initializeSound() {
    // Criar um som simples usando Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      this.notificationSound = new Audio()
      this.notificationSound.volume = 0.3
      
      // Criar um tom simples para notificação
      const createNotificationTone = () => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
      }

      this.notificationSound.addEventListener('play', createNotificationTone)
    } catch (error) {
      console.warn('Não foi possível inicializar o som de notificação:', error)
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Este navegador não suporta notificações')
      return false
    }

    if (this.permission.granted) {
      return true
    }

    try {
      const permission = await Notification.requestPermission()
      this.updatePermissionState()
      return permission === 'granted'
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificação:', error)
      return false
    }
  }

  private shouldShowNotification(): boolean {
    return !this.isDocumentVisible && this.permission.granted
  }

  private playNotificationSound() {
    if (this.soundEnabled && this.notificationSound) {
      try {
        this.notificationSound.currentTime = 0
        this.notificationSound.play().catch(error => {
          console.warn('Não foi possível reproduzir o som de notificação:', error)
        })
      } catch (error) {
        console.warn('Erro ao reproduzir som de notificação:', error)
      }
    }
  }

  showMessageNotification(message: ChatMessage, sender: ChatUser, conversationName: string) {
    // Sempre reproduzir som se habilitado
    this.playNotificationSound()

    // Mostrar notificação apenas se a janela não estiver visível
    if (!this.shouldShowNotification()) {
      return
    }

    const options: ChatNotificationOptions = {
      title: `${sender.name} - ${conversationName}`,
      body: this.formatMessageContent(message),
      icon: sender.avatar || '/medstaff-icon.svg',
      tag: `chat-${message.channelId || message.receiverId}`,
      requireInteraction: false,
      silent: false
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon,
        tag: options.tag,
        requireInteraction: options.requireInteraction,
        silent: options.silent
      })

      // Auto-fechar após 5 segundos
      setTimeout(() => {
        notification.close()
      }, 5000)

      // Focar na janela quando clicar na notificação
      notification.onclick = () => {
        window.focus()
        notification.close()
      }

    } catch (error) {
      console.error('Erro ao mostrar notificação:', error)
    }
  }

  private formatMessageContent(message: ChatMessage): string {
    switch (message.type) {
      case 'text':
        return message.content.length > 100 
          ? message.content.substring(0, 100) + '...'
          : message.content
      case 'image':
        return '📷 Enviou uma imagem'
      case 'file':
        return `📎 Enviou um arquivo: ${message.attachments?.[0]?.name || 'arquivo'}`
      case 'system':
        return message.content
      default:
        return 'Nova mensagem'
    }
  }

  showTypingNotification(user: ChatUser, conversationName: string) {
    if (!this.shouldShowNotification()) {
      return
    }

    const options: ChatNotificationOptions = {
      title: conversationName,
      body: `${user.name} está digitando...`,
      icon: user.avatar || '/medstaff-icon.svg',
      tag: `typing-${user.id}`,
      silent: true
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon,
        tag: options.tag,
        silent: options.silent
      })

      // Auto-fechar após 3 segundos
      setTimeout(() => {
        notification.close()
      }, 3000)

    } catch (error) {
      console.error('Erro ao mostrar notificação de digitação:', error)
    }
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled
  }

  isSoundEnabled(): boolean {
    return this.soundEnabled
  }

  getPermissionState(): NotificationPermission {
    return { ...this.permission }
  }

  isSupported(): boolean {
    return 'Notification' in window
  }
}

export const chatNotificationService = new ChatNotificationService()