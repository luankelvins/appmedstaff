import { useEffect, useCallback, useRef } from 'react';
import { websocketService, type WebSocketMessage } from '../services/websocketService';
import { useDashboardData } from './useDashboardData';

interface DashboardData {
  quickStats: any;
  taskMetrics: any;
  leadMetrics: any;
  financialMetrics: any;
  systemMetrics: any;
  notifications: any;
}

export interface WebSocketDashboardConfig {
  autoConnect?: boolean;
  enableRealTimeUpdates?: boolean;
  subscribeToNotifications?: boolean;
  subscribeToMetrics?: boolean;
}

export interface WebSocketDashboardState {
  isConnected: boolean;
  connectionState: string;
  lastMessage: WebSocketMessage | null;
  error: string | null;
}

export function useWebSocketDashboard(config: WebSocketDashboardConfig = {}) {
  const {
    autoConnect = true,
    enableRealTimeUpdates = true,
    subscribeToNotifications = true,
    subscribeToMetrics = true,
  } = config;

  const { refresh, refreshSpecific } = useDashboardData({
    autoRefresh: false, // Desabilita auto-refresh quando WebSocket está ativo
    enablePolling: false, // Desabilita polling quando WebSocket está ativo
  });

  const lastMessageRef = useRef<WebSocketMessage | null>(null);
  const errorRef = useRef<string | null>(null);
  const unsubscribersRef = useRef<(() => void)[]>([]);

  // Handlers para diferentes tipos de mensagens WebSocket
  const handleDashboardUpdate = useCallback((message: WebSocketMessage) => {
    lastMessageRef.current = message;
    
    if (!enableRealTimeUpdates) return;

    switch (message.data?.type) {
      case 'quick_stats_update':
        refreshSpecific('quickStats');
        break;
      case 'financial_metrics_update':
        refreshSpecific('financialMetrics');
        break;
      case 'system_metrics_update':
        refreshSpecific('systemMetrics');
        break;
      case 'tasks_update':
        refreshSpecific('taskMetrics');
        break;
      case 'leads_update':
        refreshSpecific('leadMetrics');
        break;
      case 'full_dashboard_update':
        refresh();
        break;
      default:
        console.log('Tipo de atualização desconhecido:', message.data?.type);
    }
  }, [enableRealTimeUpdates, refresh, refreshSpecific]);

  const handleNotificationUpdate = useCallback((message: WebSocketMessage) => {
    lastMessageRef.current = message;
    
    if (!subscribeToNotifications) return;

    // Atualiza notificações quando recebe uma nova
    if (message.data?.type === 'new_notification') {
      refreshSpecific('notifications');
    }
  }, [subscribeToNotifications, refreshSpecific]);

  const handleMetricsUpdate = useCallback((message: WebSocketMessage) => {
    lastMessageRef.current = message;
    
    if (!subscribeToMetrics) return;

    // Atualiza métricas específicas baseado no tipo
    const metricType = message.data?.metricType;
    if (metricType) {
      refreshSpecific(metricType as keyof DashboardData);
    }
  }, [subscribeToMetrics, refreshSpecific]);

  const handleConnectionError = useCallback((message: WebSocketMessage) => {
    errorRef.current = message.data?.error || 'Erro de conexão WebSocket';
    console.error('Erro WebSocket:', message.data);
  }, []);

  const handlePong = useCallback((message: WebSocketMessage) => {
    // Resposta ao ping - mantém a conexão viva
    console.debug('WebSocket pong recebido:', message.data?.timestamp);
  }, []);

  // Função para conectar ao WebSocket
  const connect = useCallback(async () => {
    try {
      errorRef.current = null;
      await websocketService.connect();
    } catch (error) {
      errorRef.current = error instanceof Error ? error.message : 'Erro ao conectar WebSocket';
      console.error('Erro ao conectar WebSocket:', error);
    }
  }, []);

  // Função para desconectar do WebSocket
  const disconnect = useCallback(() => {
    // Remove todas as inscrições
    unsubscribersRef.current.forEach(unsubscribe => unsubscribe());
    unsubscribersRef.current = [];
    
    websocketService.disconnect();
    errorRef.current = null;
  }, []);

  // Função para enviar mensagem
  const sendMessage = useCallback((type: string, data: any) => {
    return websocketService.send({ type, data });
  }, []);

  // Função para solicitar atualização manual
  const requestUpdate = useCallback((metricType?: string) => {
    const message = {
      type: 'request_update',
      data: { metricType: metricType || 'all' }
    };
    return sendMessage(message.type, message.data);
  }, [sendMessage]);

  // Configurar inscrições WebSocket
  useEffect(() => {
    if (!websocketService.isConnected()) return;

    const subscriptions: (() => void)[] = [];

    // Inscrever em atualizações do dashboard
    if (enableRealTimeUpdates) {
      subscriptions.push(
        websocketService.subscribe('dashboard_update', handleDashboardUpdate)
      );
    }

    // Inscrever em notificações
    if (subscribeToNotifications) {
      subscriptions.push(
        websocketService.subscribe('notification_update', handleNotificationUpdate)
      );
    }

    // Inscrever em métricas
    if (subscribeToMetrics) {
      subscriptions.push(
        websocketService.subscribe('metrics_update', handleMetricsUpdate)
      );
    }

    // Inscrever em erros e pong
    subscriptions.push(
      websocketService.subscribe('error', handleConnectionError),
      websocketService.subscribe('pong', handlePong)
    );

    unsubscribersRef.current = subscriptions;

    return () => {
      subscriptions.forEach(unsubscribe => unsubscribe());
    };
  }, [
    enableRealTimeUpdates,
    subscribeToNotifications,
    subscribeToMetrics,
    handleDashboardUpdate,
    handleNotificationUpdate,
    handleMetricsUpdate,
    handleConnectionError,
    handlePong
  ]);

  // Auto-conectar se habilitado
  useEffect(() => {
    if (autoConnect && !websocketService.isConnected()) {
      connect();
    }

    return () => {
      if (autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect, connect, disconnect]);

  // Estado do WebSocket
  const state: WebSocketDashboardState = {
    isConnected: websocketService.isConnected(),
    connectionState: websocketService.getConnectionState(),
    lastMessage: lastMessageRef.current,
    error: errorRef.current,
  };

  return {
    ...state,
    connect,
    disconnect,
    sendMessage,
    requestUpdate,
  };
}