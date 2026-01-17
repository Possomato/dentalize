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

  // Format datetime-local input value
  const getDateTimeValue = (date: Date) => {
    return format(date, "yyyy-MM-dd'T'HH:mm")
  }

  // Initialize form
  const defaultStartTime = initialDate
    ? new Date(initialDate.setHours(initialHour, initialMinute, 0, 0))
    : new Date()

  useEffect(() => {
    if (task) {
      setSelectedServiceId(task.serviceId || "none")
      const start = new Date(task.startTime)
      const end = new Date(task.endTime)
      const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
      setDuration(durationMinutes)
    } else {
      // Reset to defaults when creating new task
      setSelectedServiceId("none")
      setDuration(30)
      setError(null)
    }
  }, [task, open])

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId)
    if (serviceId === "none") {
      setDuration(30) // Reset to default 30 minutes
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

    // Calculate end time based on start time and duration
    const startTime = new Date(formData.get("startTime") as string)
    const endTime = new Date(startTime.getTime() + duration * 60000)
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

          <div className="space-y-2">
            <Label htmlFor="startTime">Data e Hora de Início *</Label>
            <Input
              id="startTime"
              name="startTime"
              type="datetime-local"
              defaultValue={task ? getDateTimeValue(new Date(task.startTime)) : getDateTimeValue(defaultStartTime)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duração (minutos)</Label>
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
              value={selectedServiceId || "none"}
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
