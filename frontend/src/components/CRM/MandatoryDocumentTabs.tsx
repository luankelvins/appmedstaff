import React, { useState } from 'react'
import { FileText, Upload, Check, AlertCircle, X } from 'lucide-react'

interface MandatoryDocument {
  id: string
  name: string
  type: 'aso' | 'comprovante_residencia' | 'documento_identificacao' | 'contrato_trabalho'
  file?: File
  url?: string
  status: 'pending' | 'uploaded' | 'validated' | 'rejected'
  uploadDate?: string
  notes?: string
  required: boolean
}

interface MandatoryDocumentTabsProps {
  documents: MandatoryDocument[]
  onDocumentUpdate: (documents: MandatoryDocument[]) => void
  readOnly?: boolean
}

const documentTypes = {
  aso: {
    label: 'ASO',
    description: 'Atestado de Saúde Ocupacional',
    acceptedFormats: '.pdf,.jpg,.jpeg,.png',
    maxSize: 10 * 1024 * 1024, // 10MB
    icon: FileText
  },
  comprovante_residencia: {
    label: 'Comprovante de Residência',
    description: 'Conta de luz, água, telefone ou similar',
    acceptedFormats: '.pdf,.jpg,.jpeg,.png',
    maxSize: 10 * 1024 * 1024,
    icon: FileText
  },
  documento_identificacao: {
    label: 'Documento de Identificação',
    description: 'RG, CNH ou Passaporte',
    acceptedFormats: '.pdf,.jpg,.jpeg,.png',
    maxSize: 10 * 1024 * 1024,
    icon: FileText
  },
  contrato_trabalho: {
    label: 'Contrato de Trabalho',
    description: 'Contrato de trabalho assinado',
    acceptedFormats: '.pdf,.doc,.docx',
    maxSize: 10 * 1024 * 1024,
    icon: FileText
  }
}

export const MandatoryDocumentTabs: React.FC<MandatoryDocumentTabsProps> = ({
  documents,
  onDocumentUpdate,
  readOnly = false
}) => {
  const [activeTab, setActiveTab] = useState<keyof typeof documentTypes>('aso')
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({})

  const getDocumentByType = (type: keyof typeof documentTypes) => {
    return documents.find(doc => doc.type === type)
  }

  const handleFileUpload = (type: keyof typeof documentTypes, file: File) => {
    const docType = documentTypes[type]
    
    // Validar tamanho do arquivo
    if (file.size > docType.maxSize) {
      setUploadErrors(prev => ({
        ...prev,
        [type]: `Arquivo muito grande. Tamanho máximo: ${docType.maxSize / (1024 * 1024)}MB`
      }))
      return
    }

    // Validar formato do arquivo
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!docType.acceptedFormats.includes(fileExtension)) {
      setUploadErrors(prev => ({
        ...prev,
        [type]: `Formato não aceito. Formatos aceitos: ${docType.acceptedFormats}`
      }))
      return
    }

    // Limpar erros
    setUploadErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[type]
      return newErrors
    })

    // Atualizar documento
    const existingDoc = getDocumentByType(type)
    const updatedDoc: MandatoryDocument = {
      id: existingDoc?.id || `${type}_${Date.now()}`,
      name: file.name,
      type,
      file,
      status: 'uploaded',
      uploadDate: new Date().toISOString(),
      required: true
    }

    const updatedDocuments = existingDoc
      ? documents.map(doc => doc.type === type ? updatedDoc : doc)
      : [...documents, updatedDoc]

    onDocumentUpdate(updatedDocuments)
  }

  const handleRemoveDocument = (type: keyof typeof documentTypes) => {
    const updatedDocuments = documents.filter(doc => doc.type !== type)
    onDocumentUpdate(updatedDocuments)
  }

  const getStatusIcon = (status: MandatoryDocument['status']) => {
    switch (status) {
      case 'uploaded':
        return <Check className="w-4 h-4 text-green-500" />
      case 'validated':
        return <Check className="w-4 h-4 text-green-600" />
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Upload className="w-4 h-4 text-gray-400" />
    }
  }

  const getTabStatus = (type: keyof typeof documentTypes) => {
    const doc = getDocumentByType(type)
    if (!doc) return 'pending'
    return doc.status
  }

  const getTabClassName = (type: keyof typeof documentTypes) => {
    const status = getTabStatus(type)
    const isActive = activeTab === type
    
    let baseClass = 'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors'
    
    if (isActive) {
      baseClass += ' border-blue-500 text-blue-600'
    } else {
      baseClass += ' border-transparent text-gray-500 hover:text-gray-700'
    }

    if (status === 'uploaded' || status === 'validated') {
      baseClass += ' bg-green-50'
    } else if (status === 'rejected') {
      baseClass += ' bg-red-50'
    }

    return baseClass
  }

  return (
    <div className="w-full">
      {/* Tabs Header */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {Object.entries(documentTypes).map(([type, config]) => {
            const Icon = config.icon
            const status = getTabStatus(type as keyof typeof documentTypes)
            
            return (
              <button
                key={type}
                onClick={() => setActiveTab(type as keyof typeof documentTypes)}
                className={getTabClassName(type as keyof typeof documentTypes)}
              >
                <Icon className="w-4 h-4" />
                {config.label}
                {getStatusIcon(status)}
                {documentTypes[type as keyof typeof documentTypes] && (
                  <span className="text-red-500">*</span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {Object.entries(documentTypes).map(([type, config]) => {
          if (activeTab !== type) return null
          
          const document = getDocumentByType(type as keyof typeof documentTypes)
          const error = uploadErrors[type]
          
          return (
            <div key={type} className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{config.label}</h3>
                <p className="text-sm text-gray-600">{config.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Formatos aceitos: {config.acceptedFormats} | Tamanho máximo: {config.maxSize / (1024 * 1024)}MB
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {document ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">{document.name}</p>
                        <p className="text-sm text-gray-500">
                          Enviado em {document.uploadDate ? new Date(document.uploadDate).toLocaleDateString('pt-BR') : 'Data não disponível'}
                        </p>
                        {document.notes && (
                          <p className="text-sm text-gray-600 mt-1">{document.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(document.status)}
                      {!readOnly && (
                        <button
                          onClick={() => handleRemoveDocument(type as keyof typeof documentTypes)}
                          className="p-1 text-red-500 hover:text-red-700"
                          title="Remover documento"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                !readOnly && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor={`file-upload-${type}`} className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Clique para fazer upload ou arraste o arquivo aqui
                          </span>
                        </label>
                        <input
                          id={`file-upload-${type}`}
                          name={`file-upload-${type}`}
                          type="file"
                          className="sr-only"
                          accept={config.acceptedFormats}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleFileUpload(type as keyof typeof documentTypes, file)
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              )}

              {document?.status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Documento rejeitado</h3>
                      <p className="text-sm text-red-700 mt-1">
                        {document.notes || 'Entre em contato com o RH para mais informações.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MandatoryDocumentTabs