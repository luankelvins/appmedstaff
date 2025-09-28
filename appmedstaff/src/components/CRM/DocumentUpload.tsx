import React, { useState, useRef } from 'react'
import { 
  Upload, 
  X, 
  FileText, 
  Image, 
  File, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { EmployeeCommentAttachment } from '../../types/crm'

interface DocumentUploadProps {
  onFilesSelected: (files: File[]) => void
  onFileRemove: (index: number) => void
  selectedFiles: File[]
  maxFiles?: number
  maxFileSize?: number // em MB
  acceptedTypes?: string[]
  isUploading?: boolean
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onFilesSelected,
  onFileRemove,
  selectedFiles,
  maxFiles = 5,
  maxFileSize = 10,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt'],
  isUploading = false
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop()
    
    switch (extension) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />
      case 'doc':
      case 'docx':
        return <FileText className="w-8 h-8 text-blue-500" />
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <Image className="w-8 h-8 text-green-500" />
      default:
        return <File className="w-8 h-8 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFiles = (files: FileList) => {
    const newErrors: string[] = []
    const validFiles: File[] = []

    Array.from(files).forEach((file) => {
      // Verificar número máximo de arquivos
      if (selectedFiles.length + validFiles.length >= maxFiles) {
        newErrors.push(`Máximo de ${maxFiles} arquivos permitidos`)
        return
      }

      // Verificar tamanho do arquivo
      if (file.size > maxFileSize * 1024 * 1024) {
        newErrors.push(`${file.name}: Arquivo muito grande (máx. ${maxFileSize}MB)`)
        return
      }

      // Verificar tipo do arquivo
      const fileExtension = '.' + file.name.toLowerCase().split('.').pop()
      if (!acceptedTypes.includes(fileExtension)) {
        newErrors.push(`${file.name}: Tipo de arquivo não permitido`)
        return
      }

      validFiles.push(file)
    })

    setErrors(newErrors)
    return validFiles
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const validFiles = validateFiles(e.dataTransfer.files)
      if (validFiles.length > 0) {
        onFilesSelected(validFiles)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const validFiles = validateFiles(e.target.files)
      if (validFiles.length > 0) {
        onFilesSelected(validFiles)
      }
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Área de Upload */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
            <p className="text-sm text-gray-600">Enviando arquivos...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              Clique para selecionar ou arraste arquivos aqui
            </p>
            <p className="text-xs text-gray-400">
              Máx. {maxFiles} arquivos, {maxFileSize}MB cada
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Formatos: {acceptedTypes.join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Erros */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
            <span className="text-sm font-medium text-red-800">Erros encontrados:</span>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Lista de Arquivos Selecionados */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Arquivos selecionados ({selectedFiles.length}/{maxFiles})
          </h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.name)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onFileRemove(index)
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded hover:bg-red-50"
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentUpload