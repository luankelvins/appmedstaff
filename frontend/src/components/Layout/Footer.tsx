import React from 'react'

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
        <div className="mb-2 sm:mb-0">
          © 2024 MedStaff. Todos os direitos reservados.
        </div>
        <div className="flex space-x-4">
          <span>Plataforma Interna</span>
          <span>•</span>
          <span>Versão 1.0.0</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer