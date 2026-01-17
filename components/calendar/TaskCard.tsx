"use client"

import { TaskWithRelations } from "@/types"
import { format } from "date-fns"
import { Clock, User } from "lucide-react"

interface TaskCardProps {
  task: TaskWithRelations
}

const statusLabels = {
  SCHEDULED: "Agendado",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
}

const statusColors = {
  SCHEDULED: "bg-blue-500",
  IN_PROGRESS: "bg-yellow-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-gray-500",
}

export function TaskCard({ task }: TaskCardProps) {
  const backgroundColor = task.service?.color || "#3B82F6"

  return (
    <div
      className="absolute inset-0 m-0.5 sm:m-1 p-1.5 sm:p-2 rounded-md text-white text-[10px] sm:text-xs overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      style={{ backgroundColor }}
    >
      <div className="font-semibold truncate text-xs sm:text-sm">{task.title}</div>
      {task.client && (
        <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1 opacity-90">
          <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
          <span className="truncate text-[10px] sm:text-xs">{task.client.name}</span>
        </div>
      )}
      <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1 opacity-90">
        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
        <span className="text-[10px] sm:text-xs">
          {format(new Date(task.startTime), "HH:mm")} - {format(new Date(task.endTime), "HH:mm")}
        </span>
      </div>
      {task.status !== "SCHEDULED" && (
        <div className="mt-0.5 sm:mt-1">
          <span className={`text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded ${statusColors[task.status]} bg-opacity-80`}>
            {statusLabels[task.status]}
          </span>
        </div>
      )}
    </div>
  )
}
