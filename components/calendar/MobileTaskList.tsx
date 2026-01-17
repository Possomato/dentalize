"use client"

import { format, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { TaskWithRelations } from "@/types"
import { Clock, User, Calendar as CalendarIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { startOfWeek, addDays, startOfDay } from "date-fns"

interface MobileTaskListProps {
  initialTasks: TaskWithRelations[]
  onTaskClick: (task: TaskWithRelations) => void
  onSlotClick: (date: Date, hour: number, minute: number) => void
  onWeekChange: (startDate: Date) => void
}

const statusLabels = {
  SCHEDULED: "Agendado",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
}

const statusColors = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-800",
}

export function MobileTaskList({ initialTasks, onTaskClick, onSlotClick, onWeekChange }: MobileTaskListProps) {
  const [currentDay, setCurrentDay] = useState(() => startOfDay(new Date()))

  const handlePreviousDay = () => {
    const newDay = addDays(currentDay, -1)
    setCurrentDay(newDay)
    onWeekChange(startOfWeek(newDay, { weekStartsOn: 0 }))
  }

  const handleNextDay = () => {
    const newDay = addDays(currentDay, 1)
    setCurrentDay(newDay)
    onWeekChange(startOfWeek(newDay, { weekStartsOn: 0 }))
  }

  // Filter tasks for current day only
  const tasksForDay = initialTasks.filter(task => {
    return isSameDay(new Date(task.startTime), currentDay)
  })

  // Sort tasks chronologically
  const sortedTasks = [...tasksForDay].sort((a, b) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  })

  return (
    <div className="flex flex-col h-full mt-16">
      {/* Header with day navigation */}
      <div className="flex flex-col items-start justify-between p-3 gap-3 border-b bg-white">
        <div className="flex items-center gap-2 w-full">
          <h2 className="text-lg font-bold truncate">
            {format(currentDay, "d MMMM", { locale: ptBR })}
          </h2>
          <div className="flex gap-1 ml-auto">
            <Button variant="outline" size="icon" onClick={handlePreviousDay} className="h-8 w-8">
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextDay} className="h-8 w-8">
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <Button onClick={() => onSlotClick(currentDay, 9, 0)} className="w-full text-sm">
          <Plus className="mr-2 h-3 w-3" />
          Nova Tarefa
        </Button>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Nenhuma tarefa encontrada para este dia.</p>
            <p className="text-sm mt-2">Clique em "Nova Tarefa" para criar uma.</p>
          </div>
        ) : (
          sortedTasks.map((task) => {
            const backgroundColor = task.service?.color || "#3B82F6"

            return (
              <Card
                key={task.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onTaskClick(task)}
              >
                <CardContent className="p-4">
                  {/* Color indicator bar */}
                  <div
                    className="w-full h-1 rounded-full mb-3"
                    style={{ backgroundColor }}
                  />

                  {/* Task title */}
                  <h3 className="font-semibold text-base mb-2">{task.title}</h3>

                  {/* Task details */}
                  <div className="space-y-2 text-sm text-gray-600">
                    {/* Time */}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>
                        {format(new Date(task.startTime), "HH:mm")} - {format(new Date(task.endTime), "HH:mm")}
                      </span>
                    </div>

                    {/* Client */}
                    {task.client && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 flex-shrink-0" />
                        <span>{task.client.name}</span>
                      </div>
                    )}

                    {/* Service */}
                    {task.service && (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded flex-shrink-0"
                          style={{ backgroundColor }}
                        />
                        <span>{task.service.name}</span>
                      </div>
                    )}

                    {/* Status badge */}
                    <div className="pt-2">
                      <span className={`text-xs px-2 py-1 rounded ${statusColors[task.status]}`}>
                        {statusLabels[task.status]}
                      </span>
                    </div>
                  </div>

                  {/* Description if available */}
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
