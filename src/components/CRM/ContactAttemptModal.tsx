import React, { useState, useEffect } from 'react';
import { 
  X, 
  Phone, 
  MessageSquare, 
  Mail, 
  User, 
  Clock, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Save,
  RotateCcw
} from 'lucide-react';
import { 
  ContactAttempt, 
  ContactAttemptType, 
  ContactAttemptResult,
  LeadPipelineCard 
} from '../../types/crm';

interface ContactAttemptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (attempt: Omit<ContactAttempt, 'id' | 'leadPipelineId'>) => void;
  leadCard: LeadPipelineCard;
  initialData?: Partial<ContactAttempt>;
}

interface ContactAttemptFormData {
  tipo: ContactAttemptType;
  resultado: ContactAttemptResult;
  observacoes: string;
  duracao?: number;
  proximaAcao?: string;
  dataProximaAcao?: string;
}

const CONTACT_TYPES = [
  { value: 'ligacao', label: 'Ligação', icon: Phone, color: 'text-blue-600' },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'text-green-600' },
  { value: 'email', label: 'E-mail', icon: Mail, color: 'text-purple-600' },
  { value: 'presencial', label: 'Presencial', icon: User, color: 'text-orange-600' }
] as const;

const CONTACT_RESULTS = [
  { 
    value: 'sucesso', 
    label: 'Sucesso', 
    icon: CheckCircle, 
    color: 'text-green-600',
    description: 'Contato realizado com sucesso'
  },
  { 
    value: 'sem_resposta', 
    label: 'Sem resposta', 
    icon: Clock, 
    color: 'text-yellow-600',
    description: 'Não houve resposta do lead'
  },
  { 
    value: 'ocupado', 
    label: 'Ocupado', 
    icon: AlertCircle, 
    color: 'text-orange-600',
    description: 'Lead estava ocupado'
  },
  { 
    value: 'numero_invalido', 
    label: 'Número inválido', 
    icon: X, 
    color: 'text-red-600',
    description: 'Número de telefone inválido'
  },
  { 
    value: 'nao_atende', 
    label: 'Não atende', 
    icon: Clock, 
    color: 'text-gray-600',
    description: 'Lead não atendeu a ligação'
  },
  { 
    value: 'reagendar', 
    label: 'Reagendar', 
    icon: Calendar, 
    color: 'text-blue-600',
    description: 'Necessário reagendar contato'
  }
] as const;

export const ContactAttemptModal: React.FC<ContactAttemptModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  leadCard,
  initialData
}) => {
  const [formData, setFormData] = useState<ContactAttemptFormData>({
    tipo: 'ligacao',
    resultado: 'sucesso',
    observacoes: '',
    duracao: undefined,
    proximaAcao: '',
    dataProximaAcao: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        tipo: initialData.tipo || 'ligacao',
        resultado: initialData.resultado || 'sucesso',
        observacoes: initialData.observacoes || '',
        duracao: initialData.duracao,
        proximaAcao: initialData.proximaAcao || '',
        dataProximaAcao: initialData.dataProximaAcao 
          ? new Date(initialData.dataProximaAcao).toISOString().split('T')[0]
          : ''
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.observacoes.trim()) {
      newErrors.observacoes = 'Observações são obrigatórias';
    }

    if (formData.tipo === 'ligacao' && formData.duracao !== undefined && formData.duracao < 0) {
      newErrors.duracao = 'Duração deve ser um valor positivo';
    }

    if (formData.resultado === 'reagendar' && !formData.dataProximaAcao) {
      newErrors.dataProximaAcao = 'Data para reagendamento é obrigatória';
    }

    if (formData.dataProximaAcao) {
      const selectedDate = new Date(formData.dataProximaAcao);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dataProximaAcao = 'Data deve ser futura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const attemptData: Omit<ContactAttempt, 'id' | 'leadPipelineId'> = {
        tipo: formData.tipo,
        resultado: formData.resultado,
        dataContato: new Date(),
        responsavel: leadCard.responsavelAtual,
        observacoes: formData.observacoes,
        ...(formData.tipo === 'ligacao' && formData.duracao !== undefined && { duracao: formData.duracao }),
        ...(formData.proximaAcao && { proximaAcao: formData.proximaAcao }),
        ...(formData.dataProximaAcao && { dataProximaAcao: new Date(formData.dataProximaAcao) })
      };

      await onSubmit(attemptData);
      handleClose();
    } catch (error) {
      console.error('Erro ao salvar tentativa de contato:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      tipo: 'ligacao',
      resultado: 'sucesso',
      observacoes: '',
      duracao: undefined,
      proximaAcao: '',
      dataProximaAcao: ''
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const resetForm = () => {
    setFormData({
      tipo: 'ligacao',
      resultado: 'sucesso',
      observacoes: '',
      duracao: undefined,
      proximaAcao: '',
      dataProximaAcao: ''
    });
    setErrors({});
  };

  if (!isOpen) return null;

  const selectedType = CONTACT_TYPES.find(type => type.value === formData.tipo);
  const selectedResult = CONTACT_RESULTS.find(result => result.value === formData.resultado);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Registrar Tentativa de Contato
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {leadCard.leadData.nome} - {leadCard.leadData.empresa}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tipo de Contato */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Contato
            </label>
            <div className="grid grid-cols-2 gap-3">
              {CONTACT_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tipo: type.value }))}
                    className={`
                      p-3 border-2 rounded-lg flex items-center space-x-3 transition-all
                      ${formData.tipo === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${type.color}`} />
                    <span className="font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duração (apenas para ligações) */}
          {formData.tipo === 'ligacao' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duração (minutos)
              </label>
              <input
                type="number"
                min="0"
                value={formData.duracao || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  duracao: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                className={`
                  w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.duracao ? 'border-red-500' : 'border-gray-300'}
                `}
                placeholder="Ex: 15"
              />
              {errors.duracao && (
                <p className="mt-1 text-sm text-red-600">{errors.duracao}</p>
              )}
            </div>
          )}

          {/* Resultado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Resultado do Contato
            </label>
            <div className="space-y-2">
              {CONTACT_RESULTS.map((result) => {
                const Icon = result.icon;
                return (
                  <button
                    key={result.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, resultado: result.value }))}
                    className={`
                      w-full p-3 border-2 rounded-lg flex items-center space-x-3 text-left transition-all
                      ${formData.resultado === result.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${result.color}`} />
                    <div>
                      <div className="font-medium">{result.label}</div>
                      <div className="text-sm text-gray-600">{result.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações *
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              className={`
                w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.observacoes ? 'border-red-500' : 'border-gray-300'}
              `}
              rows={4}
              placeholder="Descreva o que aconteceu durante o contato..."
            />
            {errors.observacoes && (
              <p className="mt-1 text-sm text-red-600">{errors.observacoes}</p>
            )}
          </div>

          {/* Próxima Ação (condicional) */}
          {(formData.resultado === 'reagendar' || formData.resultado === 'sucesso') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Próxima Ação
              </label>
              <input
                type="text"
                value={formData.proximaAcao}
                onChange={(e) => setFormData(prev => ({ ...prev, proximaAcao: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Enviar proposta, Agendar reunião..."
              />
            </div>
          )}

          {/* Data da Próxima Ação (obrigatória para reagendamento) */}
          {formData.resultado === 'reagendar' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data para Reagendamento *
              </label>
              <input
                type="date"
                value={formData.dataProximaAcao}
                onChange={(e) => setFormData(prev => ({ ...prev, dataProximaAcao: e.target.value }))}
                className={`
                  w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.dataProximaAcao ? 'border-red-500' : 'border-gray-300'}
                `}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.dataProximaAcao && (
                <p className="mt-1 text-sm text-red-600">{errors.dataProximaAcao}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RotateCcw size={16} />
              <span>Limpar</span>
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save size={16} />
                <span>{isSubmitting ? 'Salvando...' : 'Salvar Contato'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactAttemptModal;