import React, { useState, useEffect } from 'react';
import { RecurrenceSeries, Task, RecurrenceEditMode, UpdateRecurrenceSeriesRequest } from '../types/task';
import taskService from '../services/taskService';
import { Calendar, Clock, Repeat, Edit, Trash2, Eye, Settings } from 'lucide-react';
import { useToast } from '../hooks/useToast';

const RecurringSeries: React.FC = () => {
  const [series, setSeries] = useState<RecurrenceSeries[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<RecurrenceSeries | null>(null);
  const [seriesTasks, setSeriesTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    loadRecurringSeries();
  }, []);

  const loadRecurringSeries = async () => {
    try {
      setIsLoading(true);
      const data = await taskService.getRecurrenceSeries();
      setSeries(data);
    } catch (err) {
      console.error('Erro ao carregar tarefas recorrentes:', err);
      error('Erro ao carregar tarefas recorrentes');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSeriesTasks = async (seriesId: string) => {
    try {
      const tasks = await taskService.getTasks();
      const filteredTasks = tasks.tasks.filter(task => task.recurrenceId === seriesId);
      setSeriesTasks(filteredTasks);
    } catch (err) {
      console.error('Erro ao carregar tarefas:', err);
      error('Erro ao carregar tarefas');
    }
  };

  const handleSelectSeries = async (selectedSeries: RecurrenceSeries) => {
    setSelectedSeries(selectedSeries);
    await loadSeriesTasks(selectedSeries.id);
  };

  const handleDeleteSeries = async (seriesId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta recorrência? Todas as tarefas relacionadas serão removidas.')) {
      return;
    }

    try {
      await taskService.deleteRecurrenceSeries(seriesId);
      success('Recorrência excluída com sucesso');
      await loadRecurringSeries();
      if (selectedSeries?.id === seriesId) {
        setSelectedSeries(null);
        setSeriesTasks([]);
      }
    } catch (err) {
      console.error('Erro ao excluir recorrência:', err);
      error('Erro ao excluir recorrência');
    }
  };

  const handleEditSeries = async (seriesId: string, updates: UpdateRecurrenceSeriesRequest) => {
    try {
      await taskService.updateRecurrenceSeries(seriesId, updates);
      success('Recorrência atualizada com sucesso');
      await loadRecurringSeries();
      if (selectedSeries?.id === seriesId) {
        const updatedSeries = await taskService.getRecurrenceSeriesById(seriesId);
        if (updatedSeries) {
          setSelectedSeries(updatedSeries);
          await loadSeriesTasks(seriesId);
        }
      }
    } catch (err) {
      console.error('Erro ao atualizar recorrência:', err);
      error('Erro ao atualizar recorrência');
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      daily: 'Diário',
      weekly: 'Semanal',
      monthly: 'Mensal',
      yearly: 'Anual'
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  const getEndTypeLabel = (endType: string, rule: any) => {
    switch (endType) {
      case 'never':
        return 'Nunca termina';
      case 'after_occurrences':
        return `Após ${rule.occurrences} ocorrências`;
      case 'on_date':
        return `Até ${rule.endDate ? new Date(rule.endDate).toLocaleDateString() : ''}`;
      default:
        return endType;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tarefas Recorrentes</h1>
        <p className="text-gray-600">Gerencie suas tarefas recorrentes e visualize as tarefas geradas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Séries */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Repeat className="w-5 h-5 mr-2" />
              Tarefas Ativas
            </h2>
          </div>
          
          <div className="p-4">
            {series.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Repeat className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma tarefa recorrente encontrada</p>
                <p className="text-sm">Crie uma tarefa recorrente para começar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {series.map((seriesItem) => (
                  <div
                    key={seriesItem.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedSeries?.id === seriesItem.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectSeries(seriesItem)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {seriesItem.templateTask.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {getFrequencyLabel(seriesItem.recurrenceRule.frequency)} • 
                          {getEndTypeLabel(seriesItem.recurrenceRule.endType, seriesItem.recurrenceRule)}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          Criado em {seriesItem.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSeries(seriesItem);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Editar recorrência"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSeries(seriesItem.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Excluir recorrência"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detalhes da Série Selecionada */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              {selectedSeries ? 'Tarefas Geradas' : 'Selecione uma Recorrência'}
            </h2>
          </div>
          
          <div className="p-4">
            {!selectedSeries ? (
              <div className="text-center py-8 text-gray-500">
                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Selecione uma recorrência para ver as tarefas geradas</p>
              </div>
            ) : (
              <div>
                {/* Informações da Série */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">{selectedSeries.templateTask.title}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Frequência:</span>
                      <span className="ml-2 text-gray-900">
                        {getFrequencyLabel(selectedSeries.recurrenceRule.frequency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Intervalo:</span>
                      <span className="ml-2 text-gray-900">
                        A cada {selectedSeries.recurrenceRule.interval}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Término:</span>
                      <span className="ml-2 text-gray-900">
                        {getEndTypeLabel(selectedSeries.recurrenceRule.endType, selectedSeries.recurrenceRule)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lista de Tarefas */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">
                    Tarefas Geradas ({seriesTasks.length})
                  </h4>
                  
                  {seriesTasks.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nenhuma tarefa gerada ainda</p>
                  ) : (
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {seriesTasks
                        .sort((a, b) => (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0))
                        .map((task) => (
                          <div
                            key={task.id}
                            className="p-3 border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900 text-sm">
                                  {task.title}
                                </h5>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {task.dueDate?.toLocaleDateString()}
                                  <span className="mx-2">•</span>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    task.status === 'done' ? 'bg-green-100 text-green-800' :
                                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {task.status === 'done' ? 'Concluída' :
                                     task.status === 'in_progress' ? 'Em Progresso' :
                                     'Pendente'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurringSeries;