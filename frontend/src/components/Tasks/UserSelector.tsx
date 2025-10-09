import React, { useState, useRef, useEffect } from 'react';
import { User, X, ChevronDown, Search } from 'lucide-react';
import { employeeService, EmployeeOption } from '../../utils/employeeService';

interface UserSelectorProps {
  label: string;
  selectedUsers: string[];
  onSelectionChange: (userIds: string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  className?: string;
}

const UserSelector: React.FC<UserSelectorProps> = ({
  label,
  selectedUsers,
  onSelectionChange,
  multiple = false,
  placeholder = 'Selecione usuário(s)',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredUsers = employees.filter((user: EmployeeOption) =>
    user.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.cargo && user.cargo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedUserObjects = employees.filter((user: EmployeeOption) =>
    selectedUsers.includes(user.value)
  );

  // Carregar employees
  useEffect(() => {
    const loadEmployees = async () => {
      setLoading(true);
      try {
        const employeeOptions = await employeeService.getEmployeeOptions();
        setEmployees(employeeOptions);
      } catch (error) {
        console.error('Erro ao carregar employees:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserSelect = (userId: string) => {
    if (multiple) {
      if (selectedUsers.includes(userId)) {
        onSelectionChange(selectedUsers.filter(id => id !== userId));
      } else {
        onSelectionChange([...selectedUsers, userId]);
      }
    } else {
      onSelectionChange([userId]);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleRemoveUser = (userId: string) => {
    onSelectionChange(selectedUsers.filter(id => id !== userId));
  };

  const getDisplayText = () => {
    if (selectedUserObjects.length === 0) {
      return placeholder;
    }
    if (!multiple) {
      return selectedUserObjects[0].label;
    }
    if (selectedUserObjects.length === 1) {
      return selectedUserObjects[0].label;
    }
    return `${selectedUserObjects.length} usuários selecionados`;
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <User className="w-4 h-4 inline mr-1" />
        {label}
      </label>

      {/* Selected users display (for multiple selection) */}
      {multiple && selectedUserObjects.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedUserObjects.map(user => (
            <div
              key={user.value}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
            >
              <span>{user.label}</span>
              <button
                type="button"
                onClick={() => handleRemoveUser(user.value)}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown trigger */}
      <div
        ref={dropdownRef}
        className="relative"
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-left flex items-center justify-between"
        >
          <span className={selectedUserObjects.length === 0 ? 'text-gray-500' : 'text-gray-900'}>
            {getDisplayText()}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* User list */}
            <div className="max-h-48 overflow-y-auto">
              {loading ? (
                <div className="p-3 text-gray-500 text-center">
                  Carregando funcionários...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-3 text-gray-500 text-center">
                  Nenhum usuário encontrado
                </div>
              ) : (
                filteredUsers.map(user => (
                  <button
                    key={user.value}
                    type="button"
                    onClick={() => handleUserSelect(user.value)}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                      selectedUsers.includes(user.value) ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{user.label}</div>
                      <div className="text-sm text-gray-500">{user.cargo || 'Sem cargo definido'}</div>
                    </div>
                    {selectedUsers.includes(user.value) && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSelector;