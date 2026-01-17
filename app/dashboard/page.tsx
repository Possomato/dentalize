"use client"

import { useState, useEffect } from "react"
import { WeekView } from "@/components/calendar/WeekView"
import { MobileTaskList } from "@/components/calendar/MobileTaskList"
import { TaskForm } from "@/components/tasks/TaskForm"
import { getTasks } from "@/actions/tasks"
import { getClients } from "@/actions/clients"
import { getServices } from "@/actions/services"
import { TaskWithRelations, Client, Service } from "@/types"
import { startOfWeek, endOfWeek, addDays } from "date-fns"

export default function DashboardPage() {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedHour, setSelectedHour] = useState(9)
  const [selectedMinute, setSelectedMinute] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const fetchData = async (weekStart?: Date) => {
    const start = weekStart || startOfWeek(new Date(), { weekStartsOn: 0 })
    const end = endOfWeek(addDays(start, 6))

    const [fetchedTasks, fetchedClients, fetchedServices] = await Promise.all([
      getTasks(start, end),
      getClients(),
      getServices(),
    ])

    setTasks(fetchedTasks)
    setClients(fetchedClients)
    setServices(fetchedServices)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSlotClick = (date: Date, hour: number, minute: number) => {
    setSelectedTask(null)
    setSelectedDate(date)
    setSelectedHour(hour)
    setSelectedMinute(minute)
    setIsTaskFormOpen(true)
  }

  const handleTaskClick = (task: TaskWithRelations) => {
    setSelectedTask(task)
    setIsTaskFormOpen(true)
  }

  const handleWeekChange = (weekStart: Date) => {
    fetchData(weekStart)
  }

  const handleFormSuccess = () => {
    fetchData()
  }

  return (
    <div className="h-full">
      {isMobile ? (
        <MobileTaskList
          initialTasks={tasks}
          onTaskClick={handleTaskClick}
          onSlotClick={handleSlotClick}
          onWeekChange={handleWeekChange}
        />
      ) : (
        <WeekView
          initialTasks={tasks}
          onSlotClick={handleSlotClick}
          onTaskClick={handleTaskClick}
          onWeekChange={handleWeekChange}
        />
      )}

      <TaskForm
        open={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        initialDate={selectedDate}
        initialHour={selectedHour}
        initialMinute={selectedMinute}
        task={selectedTask}
        clients={clients}
        services={services}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
