import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, X, File, Image, FileText, Video, Music, 
  Archive, AlertCircle, CheckCircle, Loader2 
} from 'lucide-react';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // em MB
  acceptedTypes?: string[];
  disabled?: boolean;
  className?: string;
}

interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onFilesChange,
  maxFiles = 10,
  maxFileSize = 10, // 10MB por padrão
  acceptedTypes = [
    'image/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/*',
    'video/*',
    'audio/*'
  ],
  disabled = false,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filesWithPreview: FileWithPreview[] = files.map((file, index) => ({
    ...file,
    id: `${file.name}-${index}-${file.lastModified}`,
    preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
  }));

  const validateFile = (file: File): string | null => {
    // Verificar tamanho
    if (file.size > maxFileSize * 1024 * 1024) {
      return `Arquivo "${file.name}" excede o tamanho máximo de ${maxFileSize}MB`;
    }

    // Verificar tipo
    const isAccepted = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isAccepted) {
      return `Tipo de arquivo "${file.type}" não é aceito`;
    }

    return null;
  };

  const processFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const errors: string[] = [];
    const validFiles: File[] = [];

    // Verificar limite de arquivos
    if (files.length + fileArray.length > maxFiles) {
      errors.push(`Máximo de ${maxFiles} arquivos permitidos`);
      setUploadErrors(errors);
      return;
    }

    // Validar cada arquivo
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        // Verificar se arquivo já existe
        const isDuplicate = files.some(existingFile => 
          existingFile.name === file.name && 
          existingFile.size === file.size &&
          existingFile.lastModified === file.lastModified
        );
        
        if (!isDuplicate) {
          validFiles.push(file);
        } else {
          errors.push(`Arquivo "${file.name}" já foi adicionado`);
        }
      }
    });

    setUploadErrors(errors);

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
    }
  }, [files, maxFiles, maxFileSize, acceptedTypes, onFilesChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [disabled, processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Limpar input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  const removeFile = useCallback((fileToRemove: FileWithPreview) => {
    const updatedFiles = files.filter((_, index) => 
      `${files[index].name}-${index}-${files[index].lastModified}` !== fileToRemove.id
    );
    onFilesChange(updatedFiles);
    
    // Limpar preview se existir
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  }, [files, onFilesChange]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (file.type.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (file.type.startsWith('audio/')) return <Music className="h-5 w-5" />;
    if (file.type === 'application/pdf') return <FileText className="h-5 w-5" />;
    if (file.type.includes('zip') || file.type.includes('rar')) return <Archive className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAcceptedTypesText = () => {
    const types = acceptedTypes.map(type => {
      if (type === 'image/*') return 'Imagens';
      if (type === 'application/pdf') return 'PDF';
      if (type === 'text/*') return 'Texto';
      if (type === 'video/*') return 'Vídeos';
      if (type === 'audio/*') return 'Áudio';
      return type;
    });
    return types.join(', ');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de Upload */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-2">
          <Upload className={`mx-auto h-8 w-8 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {isDragOver ? 'Solte os arquivos aqui' : 'Clique para selecionar ou arraste arquivos'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Máximo {maxFiles} arquivos, {maxFileSize}MB cada
            </p>
            <p className="text-xs text-gray-500">
              Tipos aceitos: {getAcceptedTypesText()}
            </p>
          </div>
        </div>
      </div>

      {/* Erros de Upload */}
      {uploadErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
            <div className="space-y-1">
              {uploadErrors.map((error, index) => (
                <p key={index} className="text-sm text-red-700">{error}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lista de Arquivos */}
      {filesWithPreview.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            Arquivos Anexados ({filesWithPreview.length}/{maxFiles})
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filesWithPreview.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {/* Preview ou Ícone */}
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                        {getFileIcon(file)}
                      </div>
                    )}
                  </div>

                  {/* Informações do Arquivo */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {file.type || 'Tipo desconhecido'}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>

                {/* Botão Remover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file);
                  }}
                  className="ml-3 p-1 text-gray-400 hover:text-red-500 transition-colors"
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;