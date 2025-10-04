-- Script para criar tabelas do Sistema de Feed Expandido
-- Execute este script no Supabase Dashboard > SQL Editor

-- Tabela principal de itens do feed
CREATE TABLE IF NOT EXISTS feed_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('task', 'notification', 'activity', 'announcement', 'event')),
    priority VARCHAR(10) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    author VARCHAR(255) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    author_avatar TEXT,
    department VARCHAR(100),
    tags TEXT[], -- Array de strings
    is_public BOOLEAN DEFAULT true,
    target_audience TEXT[], -- Array de IDs de usuários ou departamentos
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Tabela de atividades
CREATE TABLE IF NOT EXISTS activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feed_item_id UUID REFERENCES feed_items(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    participants TEXT[], -- Array de IDs de usuários
    max_participants INTEGER,
    requires_confirmation BOOLEAN DEFAULT false,
    category VARCHAR(20) NOT NULL CHECK (category IN ('training', 'meeting', 'workshop', 'team_building', 'presentation', 'social', 'other')),
    instructions TEXT,
    materials TEXT[], -- Array de materiais necessários
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Tabela de comunicados
CREATE TABLE IF NOT EXISTS announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feed_item_id UUID REFERENCES feed_items(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_urgent BOOLEAN DEFAULT false,
    category VARCHAR(20) NOT NULL CHECK (category IN ('general', 'policy', 'system', 'hr', 'safety', 'celebration', 'urgent', 'other')),
    read_by TEXT[], -- Array de IDs de usuários que leram
    acknowledgment_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Tabela de eventos de calendário
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feed_item_id UUID REFERENCES feed_items(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_all_day BOOLEAN DEFAULT false,
    location TEXT,
    meeting_link TEXT,
    organizer VARCHAR(255) NOT NULL,
    recurrence_config JSONB, -- Configuração de recorrência
    category VARCHAR(20) NOT NULL CHECK (category IN ('meeting', 'deadline', 'training', 'holiday', 'personal', 'project', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Tabela de anexos do feed
CREATE TABLE IF NOT EXISTS feed_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feed_item_id UUID REFERENCES feed_items(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de confirmações de atividades
CREATE TABLE IF NOT EXISTS activity_confirmations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    status VARCHAR(10) NOT NULL CHECK (status IN ('confirmed', 'declined', 'maybe')),
    notes TEXT,
    confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(activity_id, user_id)
);

-- Tabela de reconhecimentos de comunicados
CREATE TABLE IF NOT EXISTS announcement_acknowledgments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    notes TEXT,
    acknowledged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(announcement_id, user_id)
);

-- Tabela de participantes de eventos
CREATE TABLE IF NOT EXISTS event_attendees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(10) NOT NULL CHECK (status IN ('invited', 'accepted', 'declined', 'tentative')),
    response_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Tabela de lembretes de eventos
CREATE TABLE IF NOT EXISTS event_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('email', 'push', 'popup')),
    minutes_before INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de notificações do feed
CREATE TABLE IF NOT EXISTS feed_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feed_item_id UUID REFERENCES feed_items(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('new_item', 'reminder', 'update', 'deadline', 'confirmation_request')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    action_label VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações do usuário para o feed
CREATE TABLE IF NOT EXISTS feed_user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    notifications JSONB NOT NULL DEFAULT '{
        "email": true,
        "push": true,
        "inApp": true,
        "types": {
            "activities": true,
            "announcements": true,
            "events": true,
            "reminders": true
        }
    }',
    default_view VARCHAR(10) DEFAULT 'feed' CHECK (default_view IN ('feed', 'calendar')),
    calendar_view VARCHAR(10) DEFAULT 'month' CHECK (calendar_view IN ('month', 'week', 'day', 'agenda')),
    auto_refresh BOOLEAN DEFAULT true,
    refresh_interval INTEGER DEFAULT 300, -- 5 minutos
    filters JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_feed_items_type ON feed_items(type);
CREATE INDEX IF NOT EXISTS idx_feed_items_author ON feed_items(author);
CREATE INDEX IF NOT EXISTS idx_feed_items_created_at ON feed_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_items_priority ON feed_items(priority);
CREATE INDEX IF NOT EXISTS idx_feed_items_department ON feed_items(department);

CREATE INDEX IF NOT EXISTS idx_activities_start_date ON activities(start_date);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category);

CREATE INDEX IF NOT EXISTS idx_announcements_expires_at ON announcements(expires_at);
CREATE INDEX IF NOT EXISTS idx_announcements_is_urgent ON announcements(is_urgent);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements(category);

CREATE INDEX IF NOT EXISTS idx_calendar_events_start_date ON calendar_events(start_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_end_date ON calendar_events(end_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON calendar_events(status);
CREATE INDEX IF NOT EXISTS idx_calendar_events_organizer ON calendar_events(organizer);
CREATE INDEX IF NOT EXISTS idx_calendar_events_category ON calendar_events(category);

CREATE INDEX IF NOT EXISTS idx_feed_notifications_user_id ON feed_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_notifications_is_read ON feed_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_feed_notifications_created_at ON feed_notifications(created_at DESC);

-- Triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feed_items_updated_at BEFORE UPDATE ON feed_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feed_user_settings_updated_at BEFORE UPDATE ON feed_user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE feed_items IS 'Tabela principal para todos os itens do feed (atividades, comunicados, eventos)';
COMMENT ON TABLE activities IS 'Atividades específicas com participantes e confirmações';
COMMENT ON TABLE announcements IS 'Comunicados e anúncios da empresa';
COMMENT ON TABLE calendar_events IS 'Eventos de calendário com participantes e lembretes';
COMMENT ON TABLE feed_attachments IS 'Anexos dos itens do feed';
COMMENT ON TABLE activity_confirmations IS 'Confirmações de participação em atividades';
COMMENT ON TABLE announcement_acknowledgments IS 'Reconhecimentos de leitura de comunicados';
COMMENT ON TABLE event_attendees IS 'Participantes de eventos de calendário';
COMMENT ON TABLE event_reminders IS 'Lembretes configurados para eventos';
COMMENT ON TABLE feed_notifications IS 'Notificações relacionadas aos itens do feed';
COMMENT ON TABLE feed_user_settings IS 'Configurações personalizadas do usuário para o feed';