import React, { useState, useEffect } from 'react'
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { ChatUser } from '../../types/chat'

interface CallModalProps {
  isOpen: boolean
  onClose: () => void
  callType: 'voice' | 'video'
  otherUser: ChatUser
  isIncoming?: boolean
  onAccept?: () => void
  onDecline?: () => void
}

export const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  onClose,
  callType,
  otherUser,
  isIncoming = false,
  onAccept,
  onDecline
}) => {
  const [callStatus, setCallStatus] = useState<'ringing' | 'connecting' | 'connected' | 'ended'>('ringing')
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video')
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [callDuration, setCallDuration] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setCallStatus('ringing')
      setCallDuration(0)
      return
    }

    let interval: NodeJS.Timeout

    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isOpen, callStatus])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAccept = () => {
    setCallStatus('connecting')
    setTimeout(() => setCallStatus('connected'), 2000)
    if (onAccept) onAccept()
  }

  const handleDecline = () => {
    setCallStatus('ended')
    setTimeout(() => onClose(), 1000)
    if (onDecline) onDecline()
  }

  const handleEndCall = () => {
    setCallStatus('ended')
    setTimeout(() => onClose(), 1000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
      <div className={`bg-white rounded-lg shadow-xl ${
        isFullscreen ? 'w-full h-full' : 'w-96 max-w-md'
      } overflow-hidden`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-lg font-bold mr-3">
                {otherUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold">{otherUser.name}</h3>
                <p className="text-sm opacity-90">
                  {callStatus === 'ringing' && (isIncoming ? 'Chamada recebida' : 'Chamando...')}
                  {callStatus === 'connecting' && 'Conectando...'}
                  {callStatus === 'connected' && formatDuration(callDuration)}
                  {callStatus === 'ended' && 'Chamada encerrada'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {callStatus === 'connected' && (
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Video Area */}
        {callType === 'video' && callStatus === 'connected' && (
          <div className={`bg-gray-900 relative ${isFullscreen ? 'h-full' : 'h-64'}`}>
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center text-2xl font-bold mb-2 mx-auto">
                  {otherUser.name.charAt(0).toUpperCase()}
                </div>
                <p className="text-sm opacity-75">Vídeo não disponível</p>
              </div>
            </div>
            
            {/* Self video preview */}
            <div className="absolute bottom-4 right-4 w-24 h-32 bg-gray-800 rounded-lg border-2 border-white overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-white text-xs">
                Você
              </div>
            </div>
          </div>
        )}

        {/* Voice Call Avatar */}
        {(callType === 'voice' || callStatus !== 'connected') && (
          <div className="p-8 text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
              {otherUser.name.charAt(0).toUpperCase()}
            </div>
            
            {callStatus === 'ringing' && (
              <div className="animate-pulse">
                <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-2"></div>
                <p className="text-gray-600">
                  {isIncoming ? 'Chamada recebida' : 'Chamando...'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="p-4 bg-gray-50">
          {callStatus === 'ringing' && isIncoming ? (
            /* Incoming call controls */
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleDecline}
                className="w-14 h-14 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
              <button
                onClick={handleAccept}
                className="w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
              >
                <Phone className="w-6 h-6" />
              </button>
            </div>
          ) : callStatus === 'connected' ? (
            /* Active call controls */
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isMuted ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              {callType === 'video' && (
                <button
                  onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    !isVideoEnabled ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
              )}
              
              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isSpeakerOn ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              
              <button
                onClick={handleEndCall}
                className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          ) : (
            /* Outgoing call controls */
            <div className="flex justify-center">
              <button
                onClick={handleDecline}
                className="w-14 h-14 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}