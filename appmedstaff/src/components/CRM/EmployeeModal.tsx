import React from 'react';
import { X } from 'lucide-react';
import { TimeInternoForm } from '../../types/crm';
import EmployeeCard from './EmployeeCard';

interface EmployeeModalProps {
  employee: TimeInternoForm;
  isOpen: boolean;
  onClose: () => void;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({ employee, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {employee.dadosPessoais?.nome?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {employee.dadosPessoais?.nome || 'Nome não informado'}
                </h2>
                <p className="text-gray-600">
                  {employee.dadosProfissionais?.cargo || 'Cargo não informado'} • {employee.dadosProfissionais?.departamento || 'Departamento não informado'}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <EmployeeCard employee={employee} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;