import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Activity, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

interface FinancialKPIs {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  profitMargin: number;
  revenueGrowth: number;
  expenseGrowth: number;
  burnRate: number;
  runway: number;
  averageTicket: number;
  conversionRate: number;
}

interface FinancialKPICardsProps {
  kpis: FinancialKPIs;
}

interface KPICard {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  format: 'currency' | 'percentage' | 'number' | 'months';
}

const FinancialKPICards: React.FC<FinancialKPICardsProps> = ({ kpis }) => {
  const formatValue = (value: number, format: KPICard['format']): string => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'months':
        return `${value.toFixed(1)} meses`;
      case 'number':
        return new Intl.NumberFormat('pt-BR').format(value);
      default:
        return value.toString();
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return ArrowUpRight;
    if (change < 0) return ArrowDownRight;
    return Minus;
  };

  const getChangeColor = (change: number, isPositiveGood: boolean = true) => {
    if (change === 0) return 'text-gray-500';
    const isGood = isPositiveGood ? change > 0 : change < 0;
    return isGood ? 'text-green-600' : 'text-red-600';
  };

  const cards: KPICard[] = [
    {
      title: 'Receita Total',
      value: formatValue(kpis.totalRevenue, 'currency'),
      change: kpis.revenueGrowth,
      changeLabel: 'vs mês anterior',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      format: 'currency'
    },
    {
      title: 'Despesas Total',
      value: formatValue(kpis.totalExpenses, 'currency'),
      change: kpis.expenseGrowth,
      changeLabel: 'vs mês anterior',
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      format: 'currency'
    },
    {
      title: 'Lucro Líquido',
      value: formatValue(kpis.netIncome, 'currency'),
      change: kpis.revenueGrowth - kpis.expenseGrowth,
      changeLabel: 'vs mês anterior',
      icon: TrendingUp,
      color: kpis.netIncome >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: kpis.netIncome >= 0 ? 'bg-green-50' : 'bg-red-50',
      format: 'currency'
    },
    {
      title: 'Margem de Lucro',
      value: formatValue(kpis.profitMargin, 'percentage'),
      change: kpis.revenueGrowth - kpis.expenseGrowth,
      changeLabel: 'vs mês anterior',
      icon: Target,
      color: kpis.profitMargin >= 20 ? 'text-green-600' : kpis.profitMargin >= 10 ? 'text-yellow-600' : 'text-red-600',
      bgColor: kpis.profitMargin >= 20 ? 'bg-green-50' : kpis.profitMargin >= 10 ? 'bg-yellow-50' : 'bg-red-50',
      format: 'percentage'
    },
    {
      title: 'Burn Rate',
      value: formatValue(kpis.burnRate, 'currency'),
      change: kpis.expenseGrowth,
      changeLabel: 'vs mês anterior',
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      format: 'currency'
    },
    {
      title: 'Runway',
      value: formatValue(kpis.runway, 'months'),
      change: kpis.revenueGrowth - kpis.expenseGrowth,
      changeLabel: 'vs mês anterior',
      icon: Clock,
      color: kpis.runway >= 12 ? 'text-green-600' : kpis.runway >= 6 ? 'text-yellow-600' : 'text-red-600',
      bgColor: kpis.runway >= 12 ? 'bg-green-50' : kpis.runway >= 6 ? 'bg-yellow-50' : 'bg-red-50',
      format: 'months'
    },
    {
      title: 'Ticket Médio',
      value: formatValue(kpis.averageTicket, 'currency'),
      change: kpis.revenueGrowth,
      changeLabel: 'vs mês anterior',
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      format: 'currency'
    },
    {
      title: 'Taxa de Conversão',
      value: formatValue(kpis.conversionRate, 'percentage'),
      change: 2.5, // Mock - seria calculado com dados reais
      changeLabel: 'vs mês anterior',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      format: 'percentage'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const ChangeIcon = getChangeIcon(card.change);
        
        return (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm ${getChangeColor(card.change, card.title !== 'Despesas Total' && card.title !== 'Burn Rate')}`}>
                <ChangeIcon className="w-4 h-4" />
                <span>{Math.abs(card.change).toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-xs text-gray-500">{card.changeLabel}</p>
            </div>

            {/* Indicador de status */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  card.title === 'Margem de Lucro' 
                    ? kpis.profitMargin >= 20 
                      ? 'bg-green-100 text-green-800' 
                      : kpis.profitMargin >= 10 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    : card.title === 'Runway'
                      ? kpis.runway >= 12
                        ? 'bg-green-100 text-green-800'
                        : kpis.runway >= 6
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      : card.change > 0
                        ? 'bg-green-100 text-green-800'
                        : card.change < 0
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                }`}>
                  {card.title === 'Margem de Lucro' 
                    ? kpis.profitMargin >= 20 ? 'Excelente' : kpis.profitMargin >= 10 ? 'Bom' : 'Baixo'
                    : card.title === 'Runway'
                      ? kpis.runway >= 12 ? 'Seguro' : kpis.runway >= 6 ? 'Moderado' : 'Crítico'
                      : card.change > 0 ? 'Crescendo' : card.change < 0 ? 'Declinando' : 'Estável'
                  }
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FinancialKPICards;