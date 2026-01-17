"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTask, updateTask, deleteTask } from "@/actions/tasks"
import { Client, Service, TaskWithRelations } from "@/types"
import { format } from "date-fns"
import { Loader2, Trash2 } from "lucide-react"

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialDate?: Date
  initialHour?: number
  initialMinute?: number
  task?: TaskWithRelations | null
  clients: Client[]
  services: Service[]
  onSuccess: () => void
}

// Generate time options in 30-minute intervals
function generateTimeOptions() {
  const options: { value: string; label: string }[] = []
  for (let hour = 7; hour <= 19; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      // Skip 19:30 since business hours end at 19:00
      if (hour === 19 && minute > 0) continue
      const value = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      options.push({ value, label: value })
    }
  }
  return options
}

const TIME_OPTIONS = generateTimeOptions()

export function TaskForm({
  open,
  onOpenChange,
  initialDate,
  initialHour = 9,
  initialMinute = 0,
  task,
  clients,
  services,
  onSuccess,
}: TaskFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<string>("none")
  const [duration, setDuration] = useState(30)

  // Separate date and time state
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")

  // Initialize form values when dialog opens or task changes
  useEffect(() => {
    if (open) {
      if (task) {
        // Editing existing task
        const taskStart = new Date(task.startTime)
        const taskEnd = new Date(task.endTime)
        setSelectedDate(format(taskStart, "yyyy-MM-dd"))
        setSelectedTime(format(taskStart, "HH:mm"))
        setSelectedServiceId(task.serviceId || "none")
        const durationMinutes = (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60)
        setDuration(durationMinutes)
      } else {
        // Creating new task
        const dateToUse = initialDate || new Date()
        setSelectedDate(format(dateToUse, "yyyy-MM-dd"))
        // Round initial minute to nearest 30
        const roundedMinute = initialMinute >= 30 ? 30 : 0
        setSelectedTime(
          `${initialHour.toString().padStart(2, "0")}:${roundedMinute.toString().padStart(2, "0")}`
        )
        setSelectedServiceId("none")
        setDuration(30)
      }
      setError(null)
    }
  }, [open, task, initialDate, initialHour, initialMinute])

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId)
    if (serviceId === "none") {
      setDuration(30)
      return
    }
    const service = services.find(s => s.id === serviceId)
    if (service) {
      setDuration(service.duration)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    // Parse the selected date and time into components
    const [year, month, day] = selectedDate.split("-").map(Number)
    const [hours, minutes] = selectedTime.split(":").map(Number)

    // Create start time using local date components (avoids timezone issues)
    const startTime = new Date(year, month - 1, day, hours, minutes, 0, 0)

    // Calculate end time
    const endTime = new Date(startTime.getTime() + duration * 60000)

    // Store as ISO strings for the server
    formData.set("startTime", startTime.toISOString())
    formData.set("endTime", endTime.toISOString())

    const result = task
      ? await updateTask(task.id, formData)
      : await createTask(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      onSuccess()
      onOpenChange(false)
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!task || !confirm("Tem certeza que deseja excluir esta tarefa?")) return

    setLoading(true)
    await deleteTask(task.id)
    onSuccess()
    onOpenChange(false)
    setLoading(false)
  }

  // Calculate preview end time
  const getEndTimePreview = () => {
    if (!selectedDate || !selectedTime) return ""
    const [year, month, day] = selectedDate.split("-").map(Number)
    const [hours, minutes] = selectedTime.split(":").map(Number)
    const startTime = new Date(year, month - 1, day, hours, minutes, 0, 0)
    const endTime = new Date(startTime.getTime() + duration * 60000)
    return format(endTime, "HH:mm")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{task ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              name="title"
              defaultValue={task?.title}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              name="description"
              defaultValue={task?.description || ""}
              disabled={loading}
            />
          </div>

          {/* Separate Date and Time Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Horário *</Label>
              <Select
                value={selectedTime}
                onValueChange={setSelectedTime}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duração</Label>
            <Select value={duration.toString()} onValueChange={(val) => setDuration(Number(val))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="90">1h 30min</SelectItem>
                <SelectItem value="120">2 horas</SelectItem>
              </SelectContent>
            </Select>
            {selectedTime && (
              <p className="text-xs text-gray-500">
                Término às {getEndTimePreview()}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientId">Cliente</Label>
            <Select name="clientId" defaultValue={task?.clientId || "none"}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceId">Serviço</Label>
            <Select
              name="serviceId"
              value={selectedServiceId}
              onValueChange={handleServiceChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} ({service.duration} min - R$ {service.price.toFixed(2)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={task?.status || "SCHEDULED"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCHEDULED">Agendado</SelectItem>
                <SelectItem value="IN_PROGRESS">Em andamento</SelectItem>
                <SelectItem value="COMPLETED">Concluído</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex justify-between">
            {task && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {task ? "Salvar" : "Criar"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
