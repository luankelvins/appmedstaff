import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, FolderPlus, Eye } from 'lucide-react';
import { FinancialCategory, CategoryFormData, ValidationResult } from '../../../types/financial';

interface FinancialCategoriesManagerProps {
  onCategorySelect?: (category: FinancialCategory) => void;
  selectedType?: 'income' | 'expense' | 'all';
}

const FinancialCategoriesManager: React.FC<FinancialCategoriesManagerProps> = ({
  onCategorySelect,
  selectedType = 'all'
}) => {
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<FinancialCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>(selectedType);
  const [showInactive, setShowInactive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FinancialCategory | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock data para demonstração
  const mockCategories: FinancialCategory[] = [
    {
      id: '1',
      name: 'Vendas de Produtos',
      description: 'Receitas provenientes da venda de produtos',
      type: 'income',
      color: '#10B981',
      icon: '💰',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: '2',
      name: 'Prestação de Serviços',
      description: 'Receitas de serviços prestados',
      type: 'income',
      color: '#3B82F6',
      icon: '🔧',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: '3',
      name: 'Salários e Encargos',
      description: 'Despesas com folha de pagamento',
      type: 'expense',
      color: '#EF4444',
      icon: '👥',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: '4',
      name: 'Aluguel e Condomínio',
      description: 'Despesas com aluguel e taxas condominiais',
      type: 'expense',
      color: '#F59E0B',
      icon: '🏢',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: '5',
      name: 'Marketing Digital',
      description: 'Investimentos em marketing online',
      type: 'expense',
      color: '#8B5CF6',
      icon: '📱',
      isActive: true,
      parentCategoryId: '6',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: '6',
      name: 'Marketing',
      description: 'Categoria principal de marketing',
      type: 'expense',
      color: '#EC4899',
      icon: '📢',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: 'admin',
      updatedBy: 'admin'
    }
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, searchTerm, filterType, showInactive]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      // Simular carregamento
      await new Promise(resolve => setTimeout(resolve, 500));
      setCategories(mockCategories);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = categories.filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesType = filterType === 'all' || category.type === filterType;
      const matchesActive = showInactive || category.isActive;
      
      return matchesSearch && matchesType && matchesActive;
    });

    setFilteredCategories(filtered);
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: FinancialCategory) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      } catch (error) {
        console.error('Erro ao excluir categoria:', error);
      }
    }
  };

  const handleSaveCategory = async (formData: CategoryFormData) => {
    try {
      if (editingCategory) {
        // Atualizar categoria existente
        const updatedCategory: FinancialCategory = {
          ...editingCategory,
          ...formData,
          updatedAt: new Date(),
          updatedBy: 'current-user'
        };
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id ? updatedCategory : cat
        ));
      } else {
        // Criar nova categoria
        const newCategory: FinancialCategory = {
          id: Date.now().toString(),
          ...formData,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'current-user',
          updatedBy: 'current-user'
        };
        setCategories(prev => [...prev, newCategory]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
    }
  };

  const getSubcategories = (parentId: string) => {
    return categories.filter(cat => cat.parentCategoryId === parentId);
  };

  const getMainCategories = () => {
    return filteredCategories.filter(cat => !cat.parentCategoryId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categorias Financeiras</h2>
          <p className="text-gray-600">Gerencie as categorias de receitas e despesas</p>
        </div>
        <button
          onClick={handleCreateCategory}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Categoria
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar categorias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Mostrar inativas</span>
          </label>
        </div>
      </div>

      {/* Lista de Categorias */}
      <div className="bg-white rounded-lg shadow-sm border">
        {getMainCategories().length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FolderPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma categoria encontrada</p>
            <p className="text-sm">Crie sua primeira categoria financeira</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {getMainCategories().map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                subcategories={getSubcategories(category.id)}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
                onSelect={onCategorySelect}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de Categoria */}
      {isModalOpen && (
        <CategoryModal
          category={editingCategory}
          categories={categories}
          onSave={handleSaveCategory}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

// Componente para item de categoria
interface CategoryItemProps {
  category: FinancialCategory;
  subcategories: FinancialCategory[];
  onEdit: (category: FinancialCategory) => void;
  onDelete: (categoryId: string) => void;
  onSelect?: (category: FinancialCategory) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  subcategories,
  onEdit,
  onDelete,
  onSelect
}) => {
  const [showSubcategories, setShowSubcategories] = useState(false);

  return (
    <div>
      <div className="p-4 hover:bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
            style={{ backgroundColor: category.color }}
          >
            {category.icon || (category.type === 'income' ? '💰' : '💸')}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900">{category.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                category.type === 'income' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {category.type === 'income' ? 'Receita' : 'Despesa'}
              </span>
              {!category.isActive && (
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                  Inativa
                </span>
              )}
              {subcategories.length > 0 && (
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {subcategories.length} subcategorias
                </span>
              )}
            </div>
            {category.description && (
              <p className="text-sm text-gray-600 mt-1">{category.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {subcategories.length > 0 && (
            <button
              onClick={() => setShowSubcategories(!showSubcategories)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          {onSelect && (
            <button
              onClick={() => onSelect(category)}
              className="p-2 text-blue-600 hover:text-blue-800"
            >
              Selecionar
            </button>
          )}
          <button
            onClick={() => onEdit(category)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-2 text-red-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Subcategorias */}
      {showSubcategories && subcategories.length > 0 && (
        <div className="bg-gray-50 border-t">
          {subcategories.map((subcategory) => (
            <div key={subcategory.id} className="p-4 pl-16 border-b border-gray-200 last:border-b-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ backgroundColor: subcategory.color }}
                  >
                    {subcategory.icon || '📁'}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{subcategory.name}</h4>
                    {subcategory.description && (
                      <p className="text-sm text-gray-600">{subcategory.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {onSelect && (
                    <button
                      onClick={() => onSelect(subcategory)}
                      className="p-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Selecionar
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(subcategory)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onDelete(subcategory.id)}
                    className="p-1 text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Modal para criar/editar categoria
interface CategoryModalProps {
  category: FinancialCategory | null;
  categories: FinancialCategory[];
  onSave: (formData: CategoryFormData) => void;
  onClose: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  category,
  categories,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name || '',
    description: category?.description || '',
    type: category?.type || 'expense',
    color: category?.color || '#3B82F6',
    icon: category?.icon || '',
    parentCategoryId: category?.parentCategoryId || ''
  });
  const [errors, setErrors] = useState<ValidationResult>({ isValid: true, errors: [] });

  const validateForm = (): ValidationResult => {
    const errors = [];

    if (!formData.name.trim()) {
      errors.push({ field: 'name', message: 'Nome é obrigatório', code: 'required' });
    }

    if (formData.name.length > 100) {
      errors.push({ field: 'name', message: 'Nome deve ter no máximo 100 caracteres', code: 'max_length' });
    }

    if (formData.description && formData.description.length > 500) {
      errors.push({ field: 'description', message: 'Descrição deve ter no máximo 500 caracteres', code: 'max_length' });
    }

    // Verificar se já existe categoria com o mesmo nome
    const existingCategory = categories.find(cat => 
      cat.name.toLowerCase() === formData.name.toLowerCase() && 
      cat.id !== category?.id
    );
    if (existingCategory) {
      errors.push({ field: 'name', message: 'Já existe uma categoria com este nome', code: 'duplicate' });
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateForm();
    setErrors(validation);

    if (validation.isValid) {
      onSave(formData);
    }
  };

  const getParentCategories = () => {
    return categories.filter(cat => 
      cat.type === formData.type && 
      !cat.parentCategoryId && 
      cat.id !== category?.id
    );
  };

  const colorOptions = [
    '#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  const iconOptions = ['💰', '💸', '🏢', '🚗', '🍽️', '⚡', '📱', '🏥', '🎓', '🛒', '✈️', '🎯'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h3 className="text-xl font-semibold text-white">
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </h3>
          <p className="text-blue-100 text-sm mt-1">
            {category ? 'Atualize as informações da categoria' : 'Preencha os dados para criar uma nova categoria'}
          </p>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                Informações Básicas
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Categoria *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.errors.find(e => e.field === 'name') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Material de Escritório, Vendas, etc."
                  />
                  {errors.errors.find(e => e.field === 'name') && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <span className="text-red-500">⚠</span>
                      {errors.errors.find(e => e.field === 'name')?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="income">💰 Receita</option>
                    <option value="expense">💸 Despesa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria Pai
                  </label>
                  <select
                    value={formData.parentCategoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, parentCategoryId: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">📁 Nenhuma (categoria principal)</option>
                    {getParentCategories().map(cat => (
                      <option key={cat.id} value={cat.id}>📂 {cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                      errors.errors.find(e => e.field === 'description') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Descreva o propósito desta categoria..."
                    rows={3}
                  />
                  {errors.errors.find(e => e.field === 'description') && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <span className="text-red-500">⚠</span>
                      {errors.errors.find(e => e.field === 'description')?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Personalização Visual */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                Personalização Visual
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Cor da Categoria
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                          formData.color === color 
                            ? 'border-gray-800 shadow-lg ring-2 ring-gray-300' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color }}
                        title={`Cor ${color}`}
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: formData.color }}
                    ></div>
                    <span>Cor selecionada: {formData.color}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Ícone da Categoria
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {iconOptions.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon }))}
                        className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-110 flex items-center justify-center text-lg ${
                          formData.icon === icon 
                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                        title={`Ícone ${icon}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  {formData.icon && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-lg">{formData.icon}</span>
                      <span>Ícone selecionado</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                Pré-visualização
              </h4>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: formData.color }}
                >
                  {formData.icon || '📁'}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {formData.name || 'Nome da categoria'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formData.type === 'income' ? '💰 Receita' : '💸 Despesa'}
                    {formData.description && ` • ${formData.description.substring(0, 50)}${formData.description.length > 50 ? '...' : ''}`}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-md"
          >
            {category ? '✏️ Atualizar' : '➕ Criar Categoria'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialCategoriesManager;