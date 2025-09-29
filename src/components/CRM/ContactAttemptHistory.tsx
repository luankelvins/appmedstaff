import React, { useState } from 'react';
import { 
  Clock, 
  Phone, 
  MessageSquare, 
  Mail, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  Filter,
  Download,
  Search,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { 
  ContactAttempt, 
  ContactAttemptType, 
  ContactAttemptResult,
  LeadPipelineCard 
} from '../../types/crm';

interface ContactAttemptHistoryProps {
  leadCard: LeadPipelineCard;
  onEditAttempt?: (attemptId: string) => void;
}

interface FilterOptions {
  tipo: ContactAttemptType | 'all';
  resultado: ContactAttemptResult | 'all';
  dateRange: 'all' | 'today' | 'week' | 'month';
  searchTerm: string;
}

const CONTACT_TYPE_ICONS = {
  ligacao: Phone,
  whatsapp: MessageSquare,
  email: Mail,
  presencial: User
};

const CONTACT_TYPE_COLORS = {
  ligacao: 'text-blue-600 bg-blue-100',
  whatsapp: 'text-green-600 bg-green-100',
  email: 'text-purple-600 bg-purple-100',
  presencial: 'text-orange-600 bg-orange-100'
};

const RESULT_ICONS = {
  sucesso: CheckCircle,
  sem_resposta: Clock,
  ocupado: AlertCircle,
  numero_invalido: XCircle,
  nao_atende: Clock,
  reagendar: Calendar
};

const RESULT_COLORS = {
  sucesso: 'text-green-600 bg-green-100',
  sem_resposta: 'text-yellow-600 bg-yellow-100',
  ocupado: 'text-orange-600 bg-orange-100',
  numero_invalido: 'text-red-600 bg-red-100',
  nao_atende: 'text-gray-600 bg-gray-100',
  reagendar: 'text-blue-600 bg-blue-100'
};

export const ContactAttemptHistory: React.FC<ContactAttemptHistoryProps> = ({
  leadCard,
  onEditAttempt
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    tipo: 'all',
    resultado: 'all',
    dateRange: 'all',
    searchTerm: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  // Filtrar tentativas de contato
  const filteredAttempts = leadCard.contactAttempts.filter(attempt => {
    // Filtro por tipo
    if (filters.tipo !== 'all' && attempt.tipo !== filters.tipo) {
      return false;
    }

    // Filtro por resultado
    if (filters.resultado !== 'all' && attempt.resultado !== filters.resultado) {
      return false;
    }

    // Filtro por data
    if (filters.dateRange !== 'all') {
      const attemptDate = new Date(attempt.dataContato);
      const now = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          if (attemptDate.toDateString() !== now.toDateString()) {
            return false;
          }
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (attemptDate < weekAgo) {
            return false;
          }
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (attemptDate < monthAgo) {
            return false;
          }
          break;
      }
    }

    // Filtro por termo de busca
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesObservacoes = attempt.observacoes?.toLowerCase().includes(searchLower);
      const matchesProximaAcao = attempt.proximaAcao?.toLowerCase().includes(searchLower);
      
      if (!matchesObservacoes && !matchesProximaAcao) {
        return false;
      }
    }

    return true;
  });

  // Calcular estatísticas
  const stats = {
    total: leadCard.contactAttempts.length,
    sucesso: leadCard.contactAttempts.filter(a => a.resultado === 'sucesso').length,
    taxaSucesso: leadCard.contactAttempts.length > 0 
      ? (leadCard.contactAttempts.filter(a => a.resultado === 'sucesso').length / leadCard.contactAttempts.length * 100).toFixed(1)
      : '0',
    tempoMedioLigacao: (() => {
      const ligacoes = leadCard.contactAttempts.filter(a => a.tipo === 'ligacao' && a.duracao);
      if (ligacoes.length === 0) return 0;
      const totalDuracao = ligacoes.reduce((sum, a) => sum + (a.duracao || 0), 0);
      return Math.round(totalDuracao / ligacoes.length);
    })(),
    ultimoContato: leadCard.contactAttempts.length > 0 
      ? Math.floor((Date.now() - new Date(leadCard.contactAttempts[leadCard.contactAttempts.length - 1].dataContato).getTime()) / (1000 * 60 * 60 * 24))
      : null
  };

  const exportHistory = () => {
    const csvContent = [
      ['Data', 'Tipo', 'Resultado', 'Duração', 'Observações', 'Próxima Ação'].join(','),
      ...leadCard.contactAttempts.map(attempt => [
        new Date(attempt.dataContato).toLocaleDateString(),
        attempt.tipo,
        attempt.resultado,
        attempt.duracao || '',
        `"${attempt.observacoes || ''}"`,
        `"${attempt.proximaAcao || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico-contatos-${leadCard.leadData.nome.replace(/\s+/g, '-')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header com estatísticas */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Histórico de Contatos
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Filter size={16} />
              <span>Filtros</span>
            </button>
            <button
              onClick={exportHistory}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Download size={16} />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Taxa Sucesso</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.taxaSucesso}%</div>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Tempo Médio</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.tempoMedioLigacao}min</div>
          </div>

          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Último Contato</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {stats.ultimoContato !== null ? `${stats.ultimoContato}d` : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={filters.tipo}
                onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todos</option>
                <option value="ligacao">Ligação</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">E-mail</option>
                <option value="presencial">Presencial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resultado
              </label>
              <select
                value={filters.resultado}
                onChange={(e) => setFilters(prev => ({ ...prev, resultado: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todos</option>
                <option value="sucesso">Sucesso</option>
                <option value="sem_resposta">Sem resposta</option>
                <option value="ocupado">Ocupado</option>
                <option value="numero_invalido">Número inválido</option>
                <option value="nao_atende">Não atende</option>
                <option value="reagendar">Reagendar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todos</option>
                <option value="today">Hoje</option>
                <option value="week">Última semana</option>
                <option value="month">Último mês</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  placeholder="Buscar em observações..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de tentativas */}
      <div className="p-6">
        {filteredAttempts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma tentativa de contato encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAttempts.map((attempt) => {
              const TypeIcon = CONTACT_TYPE_ICONS[attempt.tipo];
              const ResultIcon = RESULT_ICONS[attempt.resultado];
              
              return (
                <div
                  key={attempt.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${CONTACT_TYPE_COLORS[attempt.tipo]}`}>
                        <TypeIcon size={16} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium capitalize">{attempt.tipo}</span>
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${RESULT_COLORS[attempt.resultado]}`}>
                            <ResultIcon size={12} />
                            <span className="capitalize">{attempt.resultado}</span>
                          </div>
                          {attempt.duracao && (
                            <span className="text-xs text-gray-500">
                              {attempt.duracao} min
                            </span>
                          )}
                        </div>
                        
                        {attempt.observacoes && (
                          <p className="text-gray-700 text-sm mb-2">{attempt.observacoes}</p>
                        )}
                        
                        {attempt.proximaAcao && (
                          <div className="bg-blue-50 p-2 rounded text-sm">
                            <span className="font-medium text-blue-900">Próxima ação:</span>
                            <span className="text-blue-700 ml-1">{attempt.proximaAcao}</span>
                            {attempt.dataProximaAcao && (
                              <span className="text-blue-600 ml-2">
                                em {new Date(attempt.dataProximaAcao).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {new Date(attempt.dataContato).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(attempt.dataContato).toLocaleTimeString()}
                      </div>
                      {onEditAttempt && (
                        <button
                          onClick={() => onEditAttempt(attempt.id)}
                          className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                        >
                          Editar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactAttemptHistory;