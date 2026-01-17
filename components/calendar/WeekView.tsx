"use client"

import { startOfWeek, addDays, format, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { TaskWithRelations } from "@/types"
import { TaskCard } from "./TaskCard"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface WeekViewProps {
  initialTasks: TaskWithRelations[]
  onSlotClick: (date: Date, hour: number, minute: number) => void
  onTaskClick: (task: TaskWithRelations) => void
  onWeekChange: (startDate: Date) => void
}

const SLOT_HEIGHT = 60 // Fixed height in pixels for each 30-minute slot
const BUSINESS_START_HOUR = 7 // 7 AM
const BUSINESS_END_HOUR = 19 // 7 PM

export function WeekView({ initialTasks, onSlotClick, onTaskClick, onWeekChange }: WeekViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 0 }) // 0 = Sunday
  )
  const [daysToShow, setDaysToShow] = useState(7)

  // Adjust number of days based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setDaysToShow(1) // Mobile: show 1 day
      } else if (window.innerWidth < 1024) {
        setDaysToShow(3) // Tablet: show 3 days
      } else {
        setDaysToShow(7) // Desktop: show full week
      }
    }

    handleResize() // Set initial value
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const days = Array.from({ length: daysToShow }, (_, i) => addDays(currentWeekStart, i))

  // Time slots from 7 AM to 7 PM (12 hours), 30-minute intervals = 24 slots
  const hours = Array.from({ length: 12 }, (_, i) => i + BUSINESS_START_HOUR)
  const timeSlots: string[] = []
  hours.forEach(hour => {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`)
  })

  const handlePreviousWeek = () => {
    const newStart = addDays(currentWeekStart, -7)
    setCurrentWeekStart(newStart)
    onWeekChange(newStart)
  }

  const handleNextWeek = () => {
    const newStart = addDays(currentWeekStart, 7)
    setCurrentWeekStart(newStart)
    onWeekChange(newStart)
  }

  // Get tasks for a specific day
  const getTasksForDay = (day: Date) => {
    return initialTasks.filter(task => {
      const taskStart = new Date(task.startTime)
      return isSameDay(taskStart, day)
    })
  }

  // Calculate position and height for a task card
  const getTaskPosition = (task: TaskWithRelations) => {
    const start = new Date(task.startTime)
    const end = new Date(task.endTime)

    // Calculate start position (slots from 7 AM)
    const startHour = start.getHours()
    const startMinute = start.getMinutes()
    const startSlot = (startHour - BUSINESS_START_HOUR) * 2 + (startMinute >= 30 ? 1 : 0)
    const topPosition = startSlot * SLOT_HEIGHT

    // Calculate height based on duration
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
    const numberOfSlots = durationMinutes / 30
    const height = numberOfSlots * SLOT_HEIGHT

    return { top: topPosition, height }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with week navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 gap-3 bg-white border-b">
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <h2 className="text-lg sm:text-2xl font-bold truncate">
            {format(currentWeekStart, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <div className="flex gap-1 sm:gap-2 ml-auto sm:ml-0">
            <Button variant="outline" size="icon" onClick={handlePreviousWeek} className="h-8 w-8 sm:h-10 sm:w-10">
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextWeek} className="h-8 w-8 sm:h-10 sm:w-10">
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
        <Button onClick={() => onSlotClick(new Date(), 9, 0)} className="w-full sm:w-auto text-sm">
          <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="sm:inline">Nova Tarefa</span>
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto">
        <div className="inline-block min-w-full">
          {/* Day headers */}
          <div className="flex border-b bg-white sticky top-0 z-20">
            <div className="w-16 sm:w-20 p-2 sm:p-4 border-r flex-shrink-0"></div>
            {days.map((day) => (
              <div key={day.toISOString()} className="flex-1 min-w-[80px] sm:min-w-[120px] p-2 sm:p-4 text-center border-r">
                <div className="font-semibold text-xs sm:text-sm text-gray-600">
                  {format(day, "EEE", { locale: ptBR })}
                </div>
                <div className={`text-lg sm:text-2xl font-bold ${
                  isSameDay(day, new Date()) ? "text-blue-600" : "text-gray-900"
                }`}>
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>

          {/* Time grid with fixed-height slots */}
          <div className="flex">
            {/* Time labels column - auto width */}
            <div className="w-16 sm:w-20 border-r flex-shrink-0">
              {timeSlots.map((timeSlot) => (
                <div
                  key={timeSlot}
                  className="px-1 sm:px-2 py-1 text-center text-sm sm:text-base font-bold text-gray-700 border-b"
                  style={{ height: `${SLOT_HEIGHT}px` }}
                >
                  {timeSlot}
                </div>
              ))}
            </div>

            {/* Day columns with absolute positioned tasks */}
            <div className="flex flex-1">
              {days.map((day) => {
                const tasksForDay = getTasksForDay(day)

                return (
                  <div key={day.toISOString()} className="relative flex-1 min-w-[80px] sm:min-w-[120px] border-r">
                    {/* Empty slots for clicking */}
                    {timeSlots.map((timeSlot) => {
                      const [hour, minute] = timeSlot.split(':').map(Number)

                      return (
                        <div
                          key={timeSlot}
                          className="border-b cursor-pointer hover:bg-blue-50 transition-colors"
                          style={{ height: `${SLOT_HEIGHT}px` }}
                          onClick={() => onSlotClick(day, hour, minute)}
                        />
                      )
                    })}

                    {/* Absolutely positioned task cards */}
                    {tasksForDay.map((task) => {
                      const { top, height } = getTaskPosition(task)

                      return (
                        <div
                          key={task.id}
                          className="absolute left-1 right-1 z-10"
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            onTaskClick(task)
                          }}
                        >
                          <TaskCard task={task} />
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
