import React, { useState } from 'react'
import { Camera, Mail, Phone, MapPin, Calendar, Briefcase } from 'lucide-react'
import { UserProfile } from '../../types/profile'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ProfileHeaderProps {
  profile: UserProfile
  onAvatarUpload: (file: File) => Promise<void>
  isUpdating: boolean
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  onAvatarUpload,
  isUpdating
}) => {
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      onAvatarUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
        {/* Avatar */}
        <div className="relative">
          <div
            className={`relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg ${
              dragOver ? 'ring-2 ring-blue-500' : ''
            }`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name || 'Usuário'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-2xl font-semibold text-gray-600">
                  {profile.name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
            )}
            
            {/* Upload overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          {isUpdating && (
            <div className="absolute inset-0 bg-white bg-opacity-75 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.name || 'Usuário'}</h1>
              <p className="text-lg text-gray-600">{profile.role || 'Sem cargo'}</p>
              <p className="text-sm text-gray-500">{profile.department || 'Sem departamento'}</p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {profile.hireDate && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>
                      Desde {formatDistanceToNow(new Date(profile.hireDate), { 
                        addSuffix: false, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                )}
                {profile.manager && (
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-1" />
                    <span>Reporta para {profile.manager}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2 text-gray-400" />
              <span>{profile.email}</span>
            </div>
            
            {profile.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                <span>{profile.phone}</span>
              </div>
            )}
            
            {profile.address && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                <span>{profile.address.city}, {profile.address.state}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {profile.permissions?.length || 0}
            </div>
            <div className="text-sm text-gray-500">Permissões</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {profile.preferences?.dashboard?.widgets?.filter(w => w.enabled).length || 0}
            </div>
            <div className="text-sm text-gray-500">Widgets Ativos</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {profile.security?.deviceTrust?.trustedDevices?.length || 0}
            </div>
            <div className="text-sm text-gray-500">Dispositivos</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {profile.security?.twoFactorEnabled ? 'Ativo' : 'Inativo'}
            </div>
            <div className="text-sm text-gray-500">2FA</div>
          </div>
        </div>
      </div>
    </div>
  )
}