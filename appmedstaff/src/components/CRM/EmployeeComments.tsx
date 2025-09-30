import React, { useState } from 'react'
import {
  MessageSquare,
  Plus,
  Filter,
  Search,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Archive,
  Paperclip,
  Download,
  Eye,
  Edit,
  Trash2,
  Tag,
  ChevronDown,
  ChevronUp,
  FileText,
  Heart,
  Award,
  Bell,
  Shield,
  Briefcase,
  GraduationCap,
  TrendingUp,
  X,
  Save
} from 'lucide-react'
import { EmployeeComment, EmployeeCommentAttachment, CommentFilter } from '../../types/crm'
import DocumentUpload from './DocumentUpload'

interface EmployeeCommentsProps {
  employeeId: string
  employeeName: string
  comments: EmployeeComment[]
  onAddComment: (comment: Omit<EmployeeComment, 'id' | 'createdAt'>) => void
  onUpdateComment: (commentId: string, updates: Partial<EmployeeComment>) => void
  onDeleteComment: (commentId: string) => void
  currentUserId: string
  currentUserName: string
  currentUserRole: string
  canEdit?: boolean
  canDelete?: boolean
  canViewPrivate?: boolean
}

const EmployeeComments: React.FC<EmployeeCommentsProps> = ({
  employeeId,
  employeeName,
  comments,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  currentUserId,
  currentUserName,
  currentUserRole,
  canEdit = true,
  canDelete = false,
  canViewPrivate = false
}) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [filters, setFilters] = useState<CommentFilter>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all')

  const [newComment, setNewComment] = useState({
    type: 'observacao' as EmployeeComment['type'],
    title: '',
    content: '',
    isPrivate: false,
    priority: 'media' as EmployeeComment['priority'],
    tags: [] as string[],
    attachments: [] as EmployeeCommentAttachment[],
    requiresAcknowledgment: false,
    expirationDate: ''
  })

  const commentTypes = [
    { value: 'aviso', label: 'Aviso', icon: Bell, color: 'text-yellow-600' },
    { value: 'advertencia', label: 'Advertência', icon: AlertTriangle, color: 'text-red-600' },
    { value: 'elogio', label: 'Elogio', icon: Heart, color: 'text-pink-600' },
    { value: 'observacao', label: 'Observação', icon: MessageSquare, color: 'text-blue-600' },
    { value: 'atestado', label: 'Atestado', icon: FileText, color: 'text-green-600' },
    { value: 'ferias', label: 'Férias', icon: Calendar, color: 'text-purple-600' },
    { value: 'licenca', label: 'Licença', icon: Shield, color: 'text-orange-600' },
    { value: 'treinamento', label: 'Treinamento', icon: GraduationCap, color: 'text-indigo-600' },
    { value: 'promocao', label: 'Promoção', icon: TrendingUp, color: 'text-emerald-600' },
    { value: 'outros', label: 'Outros', icon: Briefcase, color: 'text-gray-600' }
  ]

  const priorityColors = {
    baixa: 'bg-gray-100 text-gray-800 border-gray-200',
    media: 'bg-blue-100 text-blue-800 border-blue-200',
    alta: 'bg-orange-100 text-orange-800 border-orange-200',
    urgente: 'bg-red-100 text-red-800 border-red-200'
  }

  const statusColors = {
    ativo: 'bg-green-100 text-green-800 border-green-200',
    arquivado: 'bg-gray-100 text-gray-800 border-gray-200',
    resolvido: 'bg-blue-100 text-blue-800 border-blue-200'
  }

  const getTypeConfig = (type: EmployeeComment['type']) => {
    return commentTypes.find(t => t.value === type) || commentTypes[3]
  }

  const filteredComments = comments.filter(comment => {
    // Filtro de privacidade
    if (comment.isPrivate && !canViewPrivate && comment.authorId !== currentUserId) {
      return false
    }

    // Filtro por data
    if (dateFilter !== 'all') {
      const commentDate = new Date(comment.createdAt)
      const now = new Date()
      
      switch (dateFilter) {
        case 'today':
          if (commentDate.toDateString() !== now.toDateString()) {
            return false
          }
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          if (commentDate < weekAgo) {
            return false
          }
          break
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          if (commentDate < monthAgo) {
            return false
          }
          break
      }
    }

    // Filtro de busca
    if (searchTerm && !comment.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !comment.content.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Filtros específicos
    if (filters.type && filters.type.length > 0 && !filters.type.includes(comment.type)) {
      return false
    }

    if (filters.priority && filters.priority.length > 0 && !filters.priority.includes(comment.priority)) {
      return false
    }

    if (filters.status && filters.status.length > 0 && !filters.status.includes(comment.status)) {
      return false
    }

    return true
  }).sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
  })

  const handleAddComment = async () => {
    if (!newComment.title.trim() || !newComment.content.trim()) return

    setIsUploading(true)

    try {
      // Converter arquivos selecionados em attachments
       const attachments: EmployeeCommentAttachment[] = selectedFiles.map((file, index) => ({
         id: `temp-${Date.now()}-${index}`,
         commentId: '', // Será preenchido após criar o comentário
         name: file.name,
         type: file.type || 'application/octet-stream',
         size: file.size,
         url: URL.createObjectURL(file), // URL temporária para preview
         category: getFileCategory(file.name) as EmployeeCommentAttachment['category'],
         uploadDate: new Date().toISOString(),
         uploadedBy: currentUserId
       }))

      onAddComment({
        employeeId,
        authorId: currentUserId,
        authorName: currentUserName,
        authorRole: currentUserRole,
        type: newComment.type,
        title: newComment.title,
        content: newComment.content,
        isPrivate: newComment.isPrivate,
        attachments,
        tags: newComment.tags,
        priority: newComment.priority,
        status: 'ativo',
        requiresAcknowledgment: newComment.requiresAcknowledgment,
        expirationDate: newComment.expirationDate || undefined
      })

      // Reset form
      setNewComment({
        type: 'observacao',
        title: '',
        content: '',
        isPrivate: false,
        priority: 'media',
        tags: [],
        attachments: [],
        requiresAcknowledgment: false,
        expirationDate: ''
      })
      setSelectedFiles([])
      setShowAddForm(false)
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const getFileCategory = (fileName: string): EmployeeCommentAttachment['category'] => {
    const extension = fileName.toLowerCase().split('.').pop()
    
    switch (extension) {
      case 'pdf':
      case 'doc':
      case 'docx':
        return 'documento_oficial'
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'foto'
      case 'txt':
        return 'comprovante'
      default:
        return 'outros'
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newAttachments: EmployeeCommentAttachment[] = Array.from(files).map(file => ({
      id: `temp-${Date.now()}-${Math.random()}`,
      commentId: '',
      name: file.name,
      type: file.type,
      size: file.size,
      file,
      uploadDate: new Date().toISOString(),
      uploadedBy: currentUserName,
      category: 'outros'
    }))

    setNewComment(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }))
  }

  const toggleCommentExpansion = (commentId: string) => {
    const newExpanded = new Set(expandedComments)
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId)
    } else {
      newExpanded.add(commentId)
    }
    setExpandedComments(newExpanded)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Histórico e Comentários
          </h3>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {filteredComments.length}
          </span>
        </div>
        
        {canEdit && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Comentário</span>
          </button>
        )}
      </div>

      {/* Filtros e busca */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar comentários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filters.type?.[0] || ''}
            onChange={(e) => setFilters((prev: CommentFilter) => ({ 
              ...prev, 
              type: e.target.value ? [e.target.value as EmployeeComment['type']] : undefined 
            }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os tipos</option>
            {commentTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <select
            value={filters.priority?.[0] || ''}
            onChange={(e) => setFilters((prev: CommentFilter) => ({ 
              ...prev, 
              priority: e.target.value ? [e.target.value as EmployeeComment['priority']] : undefined 
            }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as prioridades</option>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Mais recentes primeiro</option>
            <option value="oldest">Mais antigos primeiro</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas as datas</option>
            <option value="today">Hoje</option>
            <option value="week">Última semana</option>
            <option value="month">Último mês</option>
          </select>
        </div>
      </div>

      {/* Formulário de adicionar comentário */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Novo Comentário</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={newComment.type}
                onChange={(e) => setNewComment(prev => ({ ...prev, type: e.target.value as EmployeeComment['type'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {commentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridade
              </label>
              <select
                value={newComment.priority}
                onChange={(e) => setNewComment(prev => ({ ...prev, priority: e.target.value as EmployeeComment['priority'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título
            </label>
            <input
              type="text"
              value={newComment.title}
              onChange={(e) => setNewComment(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite o título do comentário..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conteúdo
            </label>
            <textarea
              value={newComment.content}
              onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite o conteúdo do comentário..."
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newComment.isPrivate}
                onChange={(e) => setNewComment(prev => ({ ...prev, isPrivate: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Comentário privado (apenas RH)</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newComment.requiresAcknowledgment}
                onChange={(e) => setNewComment(prev => ({ ...prev, requiresAcknowledgment: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Requer confirmação de leitura</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anexos
            </label>
            <DocumentUpload
              onFilesSelected={(files) => setSelectedFiles(prev => [...prev, ...files])}
              onFileRemove={(index) => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
              selectedFiles={selectedFiles}
              maxFiles={5}
              maxFileSize={10}
              acceptedTypes={['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt']}
              isUploading={isUploading}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddComment}
              disabled={!newComment.title.trim() || !newComment.content.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Adicionar Comentário
            </button>
          </div>
        </div>
      )}

      {/* Lista de comentários */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum comentário encontrado</p>
          </div>
        ) : (
          filteredComments.map((comment) => {
            const typeConfig = getTypeConfig(comment.type)
            const TypeIcon = typeConfig.icon
            const isExpanded = expandedComments.has(comment.id)
            
            return (
              <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`p-2 rounded-lg ${typeConfig.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                      <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">{comment.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${priorityColors[comment.priority]}`}>
                          {comment.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[comment.status]}`}>
                          {comment.status}
                        </span>
                        {comment.isPrivate && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
                            Privado
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">{comment.authorName}</span>
                        <span className="text-gray-400"> • {comment.authorRole} • </span>
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                      
                      <div className={`text-gray-700 ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {comment.content}
                      </div>
                      
                      {comment.content.length > 150 && (
                        <button
                          onClick={() => toggleCommentExpansion(comment.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm mt-1 flex items-center space-x-1"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              <span>Ver menos</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              <span>Ver mais</span>
                            </>
                          )}
                        </button>
                      )}
                      
                      {comment.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium text-gray-700">Anexos:</p>
                          <div className="flex flex-wrap gap-2">
                            {comment.attachments.map((attachment) => (
                              <div key={attachment.id} className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                                <Paperclip className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">{attachment.name}</span>
                                <button className="text-blue-600 hover:text-blue-800">
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {comment.tags && comment.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {comment.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              <Tag className="w-3 h-3" />
                              <span>{tag}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {(canEdit && comment.authorId === currentUserId) && (
                      <button
                        onClick={() => setEditingComment(comment.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    
                    {(canDelete || comment.authorId === currentUserId) && (
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default EmployeeComments