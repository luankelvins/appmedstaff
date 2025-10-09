import React from 'react'
import { Calendar, Download, Filter } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../UI/Card'
import { Badge } from '../UI/Badge'

interface SecurityFiltersProps {
  selectedPeriod: string
  onPeriodChange: (period: string) => void
  onExport: () => void
}

const SecurityFilters: React.FC<SecurityFiltersProps> = ({
  selectedPeriod,
  onPeriodChange,
  onExport
}) => {
  const periods = [
    { value: '1h', label: 'Última hora' },
    { value: '6h', label: 'Últimas 6 horas' },
    { value: '24h', label: 'Últimas 24 horas' },
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filtros e Ações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filtro de Período */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Período de Análise
            </label>
            <div className="flex flex-wrap gap-2">
              {periods.map((period) => (
                <Badge
                  key={period.value}
                  className={`cursor-pointer transition-colors ${
                    selectedPeriod === period.value
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                  onClick={() => onPeriodChange(period.value)}
                >
                  {period.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Ações */}
          <div>
            <label className="block text-sm font-medium mb-2">Ações</label>
            <div className="flex gap-2">
              <button
                onClick={onExport}
                className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm"
              >
                <Download className="w-4 h-4 mr-1" />
                Exportar Relatório
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SecurityFilters