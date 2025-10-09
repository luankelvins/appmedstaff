import React from 'react';
import { TaskAssignmentManager } from '../components/Tasks/TaskAssignmentManager';

const TaskAssignmentPage: React.FC = () => {
  const handleTaskUpdate = () => {
    console.log('Tarefa atualizada!');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Gerenciamento de Atribuição de Tarefas
        </h1>
        <p className="text-gray-600 mt-2">
          Visualize e gerencie a atribuição de tarefas aos responsáveis.
        </p>
      </div>
      
      <TaskAssignmentManager onTaskUpdate={handleTaskUpdate} />
    </div>
  );
};

export default TaskAssignmentPage;