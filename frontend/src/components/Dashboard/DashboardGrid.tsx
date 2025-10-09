import React, { useState, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { Grid, List, Settings, Plus, X, MoreVertical } from 'lucide-react'
import DashboardWidget from './DashboardWidget'

interface DashboardLayout {
  id: string
  widgets: Array<{
    id: string
    widgetId: string
    position: { x: number; y: number }
    size: { width: number; height: number }
    config?: any
  }>
}

interface WidgetConfig {
  id: string
  type: string
  title: string
  description: string
  component: React.ComponentType<any>
  defaultSize: 'small' | 'medium' | 'large' | 'full'
  configurable: boolean
  refreshable: boolean
  permissions?: string[]
}

interface DashboardGridProps {
  layout: DashboardLayout
  availableWidgets: WidgetConfig[]
  viewMode: 'grid' | 'list'
  onLayoutChange: (layout: DashboardLayout) => void
  onRemoveWidget: (widgetInstanceId: string) => void
  onAddWidget: () => void
  className?: string
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  layout,
  availableWidgets,
  viewMode,
  onLayoutChange,
  onRemoveWidget,
  onAddWidget,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleDragEnd = useCallback((result: DropResult) => {
    setIsDragging(false)
    
    if (!result.destination) {
      return
    }

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    if (sourceIndex === destinationIndex) {
      return
    }

    const newWidgets = Array.from(layout.widgets)
    const [reorderedWidget] = newWidgets.splice(sourceIndex, 1)
    newWidgets.splice(destinationIndex, 0, reorderedWidget)

    const newLayout = {
      ...layout,
      widgets: newWidgets
    }

    onLayoutChange(newLayout)
  }, [layout, onLayoutChange])

  const renderWidget = (widget: typeof layout.widgets[0], index: number) => {
    const widgetConfig = availableWidgets.find(w => w.id === widget.widgetId)
    if (!widgetConfig) return null

    const WidgetComponent = widgetConfig.component

    const getSizeClasses = (size: { width: number; height: number }) => {
      if (viewMode === 'list') {
        return 'col-span-12'
      }
      
      // Grid responsivo baseado no tamanho
      const widthClass = size.width <= 3 ? 'col-span-12 md:col-span-6 lg:col-span-3' :
                        size.width <= 6 ? 'col-span-12 md:col-span-6' :
                        size.width <= 8 ? 'col-span-12 lg:col-span-8' :
                        'col-span-12'
      
      return widthClass
    }

    return (
      <Draggable key={widget.id} draggableId={widget.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`${getSizeClasses(widget.size)} ${
              snapshot.isDragging ? 'z-50 rotate-2 scale-105' : ''
            } transition-transform duration-200`}
          >
            <div {...provided.dragHandleProps}>
               <DashboardWidget
                 id={widget.id}
                 title={widgetConfig.title}
                 subtitle={widgetConfig.description}
                 size={widgetConfig.defaultSize}
                 loading={false}
                 removable={true}
                 refreshable={widgetConfig.refreshable}
                 configurable={widgetConfig.configurable}
                 onRemove={() => onRemoveWidget(widget.id)}
                 onRefresh={() => {}}
                 onConfigure={() => {}}
                 className={`h-full ${snapshot.isDragging ? 'shadow-2xl' : ''}`}
               >
                 <WidgetComponent 
                   onRefresh={() => {}}
                   onConfigure={() => {}}
                   config={widget.config}
                 />
               </DashboardWidget>
             </div>
           </div>
        )}
      </Draggable>
    )
  }

  if (layout.widgets.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Grid className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum widget configurado
          </h3>
          <p className="text-gray-600 mb-6">
            Adicione widgets para personalizar seu dashboard
          </p>
          <button
            onClick={onAddWidget}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Widget
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard-grid">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-12' 
                  : 'grid-cols-1'
              } ${
                snapshot.isDraggingOver ? 'bg-blue-50' : ''
              } transition-colors duration-200 rounded-lg p-2`}
            >
              {layout.widgets.map((widget, index) => renderWidget(widget, index))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Overlay durante drag */}
      {isDragging && (
        <div className="fixed inset-0 bg-black bg-opacity-10 pointer-events-none z-40" />
      )}
    </div>
  )
}

export default DashboardGrid