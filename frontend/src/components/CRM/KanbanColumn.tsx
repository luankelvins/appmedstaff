import React from 'react';
import { LeadPipelineStage } from '../../types/crm';

interface KanbanColumnProps {
  stage: LeadPipelineStage;
  title: string;
  color: string;
  count: number;
  isDraggingOver: boolean;
  children: React.ReactNode;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  stage,
  title,
  color,
  count,
  isDraggingOver,
  children
}) => {
  return (
    <div className={`flex flex-col bg-gray-50 rounded-lg border-2 transition-colors duration-200 ${
      isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <h3 className="font-medium text-gray-900">{title}</h3>
          </div>
          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
            {count}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-[200px] max-h-[600px]">
        {children}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-white rounded-b-lg">
        <div className="text-xs text-gray-500 text-center">
          {count === 0 ? 'Nenhum lead' : `${count} lead${count > 1 ? 's' : ''}`}
        </div>
      </div>
    </div>
  );
};

export default KanbanColumn