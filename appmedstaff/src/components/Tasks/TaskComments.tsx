import React, { useState, useEffect } from 'react';
import { TaskComment } from '../../types/task';
import taskService from '../../services/taskService';
import { 
  Send, 
  MessageCircle, 
  Edit2, 
  Trash2, 
  MoreVertical,
  Smile,
  Paperclip,
  Upload,
  X,
  Download,
  Clock
} from 'lucide-react';
import EmojiPicker from '../UI/EmojiPicker';

interface TaskCommentsProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}



const GREETING_TEMPLATES = [
  'Bom dia! ',
  'Boa tarde! ',
  'Boa noite! ',
  'Olá! ',
  'Oi pessoal! ',
  'Prezados, ',
  'Equipe, '
]

const TaskComments: React.FC<TaskCommentsProps> = ({ taskId, isOpen, onClose }) => {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  
  // Novas funcionalidades
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGreetings, setShowGreetings] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Load comments
  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const task = await taskService.getTaskById(taskId);
      setComments(task?.comments || []);
    } catch (err) {
      setError('Erro ao carregar comentários');
      console.error('Error loading comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && taskId) {
      loadComments();
    }
  }, [isOpen, taskId]);

  // Handle new comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() && attachments.length === 0) return;

    try {
      setSubmitting(true);
      
      // Simular upload de anexos (em produção, fazer upload real)
      const attachmentNames = attachments.map(file => file.name);
      
      await taskService.addComment(
        taskId, 
        newComment.trim(), 
        'current-user', 
        'Usuário Atual',
        selectedEmoji || undefined,
        attachmentNames.length > 0 ? attachmentNames : undefined
      );
      
      setNewComment('');
      setSelectedEmoji('');
      setAttachments([]);
      setShowEmojiPicker(false);
      setShowGreetings(false);
      await loadComments();
    } catch (err) {
      setError('Erro ao adicionar comentário');
      console.error('Error adding comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    setShowEmojiPicker(false);
  };

  // Handle greeting selection
  const handleGreetingSelect = (greeting: string) => {
    setNewComment(greeting + newComment);
    setShowGreetings(false);
  };

  // Handle file upload
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).slice(0, 5 - attachments.length); // Máximo 5 arquivos
    setAttachments(prev => [...prev, ...newFiles]);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Handle edit comment
  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return;

    try {
      await taskService.updateComment(taskId, commentId, editText.trim());
      setEditingComment(null);
      setEditText('');
      await loadComments();
    } catch (err) {
      setError('Erro ao editar comentário');
      console.error('Error editing comment:', err);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este comentário?')) return;

    try {
      await taskService.deleteComment(taskId, commentId);
      await loadComments();
    } catch (err) {
      setError('Erro ao excluir comentário');
      console.error('Error deleting comment:', err);
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Comentários
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Carregando comentários...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {!loading && comments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhum comentário ainda</p>
                <p className="text-sm">Seja o primeiro a comentar nesta tarefa!</p>
              </div>
            )}

            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm text-gray-900">
                      {comment.authorName}
                    </span>
                    {comment.emoji && (
                      <span className="text-lg">{comment.emoji}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimestamp(comment.createdAt)}
                    </div>
                    <div className="relative">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {editingComment === comment.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md resize-none focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditComment(comment.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => {
                          setEditingComment(null);
                          setEditText('');
                        }}
                        className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                    
                    {comment.attachments && comment.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {comment.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>{attachment}</span>
                            <button className="hover:text-blue-900">
                              <Download className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* New Comment Form */}
          <div className="border-t p-4">
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <div className="relative">
                <div className="flex items-center space-x-2 mb-2">
                  {/* Botão de Saudações */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowGreetings(!showGreetings)}
                      className="flex items-center px-3 py-2 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg hover:from-blue-100 hover:to-indigo-100 border border-blue-200 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      💬 <span className="ml-1 font-medium">Saudações</span>
                    </button>
                    
                    {showGreetings && (
                      <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-xl p-3 z-20 min-w-[280px]">
                        <div className="text-xs font-medium text-gray-600 mb-2 px-1">Escolha uma saudação:</div>
                        <div className="grid grid-cols-1 gap-1">
                          {GREETING_TEMPLATES.map((greeting, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleGreetingSelect(greeting)}
                              className="text-left px-3 py-2 text-sm hover:bg-blue-50 rounded-lg transition-colors duration-150 border border-transparent hover:border-blue-200"
                            >
                              <span className="font-medium text-gray-700">{greeting.trim()}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botão de Emojis */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="flex items-center px-3 py-2 text-sm bg-gradient-to-r from-yellow-50 to-orange-50 text-orange-700 rounded-lg hover:from-yellow-100 hover:to-orange-100 border border-orange-200 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Smile className="w-4 h-4 mr-1" />
                      <span className="font-medium">
                        {selectedEmoji ? (
                          <span className="flex items-center">
                            <span className="text-lg mr-1">{selectedEmoji}</span>
                            Emoji
                          </span>
                        ) : (
                          'Emoji'
                        )}
                      </span>
                    </button>
                    
                    <EmojiPicker
                      isOpen={showEmojiPicker}
                      onClose={() => setShowEmojiPicker(false)}
                      onEmojiSelect={handleEmojiSelect}
                      selectedEmoji={selectedEmoji}
                    />
                  </div>

                  {/* Botão de Upload */}
                  <label className="flex items-center px-3 py-2 text-sm bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-lg hover:from-green-100 hover:to-emerald-100 border border-green-200 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer">
                    <Upload className="w-4 h-4 mr-1" />
                    <span className="font-medium">Anexar</span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                    />
                  </label>
                </div>

                {/* Área de Texto */}
                <div
                  className={`relative border-2 border-dashed rounded-lg transition-colors ${
                    isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escreva um comentário... (ou arraste arquivos aqui)"
                    className="w-full p-3 border-0 resize-none focus:ring-0 focus:outline-none bg-transparent"
                    rows={3}
                  />
                  
                  {isDragOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 rounded-lg">
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-blue-700 font-medium">Solte os arquivos aqui</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Anexos Selecionados */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                    >
                      <Paperclip className="w-3 h-3" />
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Botão de Envio */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={(!newComment.trim() && attachments.length === 0) || submitting}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Enviando...' : 'Comentar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskComments;