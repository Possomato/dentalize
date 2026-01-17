"use client"

import { useState, useEffect } from "react"
import { getServices, createService, updateService, deleteService } from "@/actions/services"
import { Service } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchServices = async () => {
    const data = await getServices()
    setServices(data)
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    const result = selectedService
      ? await updateService(selectedService.id, formData)
      : await createService(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      await fetchServices()
      setIsDialogOpen(false)
      setSelectedService(null)
      setLoading(false)
    }
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return

    await deleteService(serviceId)
    await fetchServices()
  }

  const handleEdit = (service: Service) => {
    setSelectedService(service)
    setIsDialogOpen(true)
  }

  const handleNew = () => {
    setSelectedService(null)
    setError(null)
    setIsDialogOpen(true)
  }

  return (
    <div className="p-3 sm:p-6 md:p-8 pt-20 md:pt-8">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold">Serviços</h1>
        <Button onClick={handleNew} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                  <div
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0"
                    style={{ backgroundColor: service.color }}
                  />
                  <span className="truncate">{service.name}</span>
                </div>
                <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 sm:h-10 sm:w-10"
                    onClick={() => handleEdit(service)}
                  >
                    <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 sm:h-10 sm:w-10"
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs sm:text-sm text-gray-600 space-y-2 p-4 sm:p-6 pt-0">
              {service.description && <div className="line-clamp-2">{service.description}</div>}
              <div className="flex justify-between items-center pt-2 border-t text-xs sm:text-sm">
                <span>Duração: {service.duration} min</span>
                <span className="font-semibold text-blue-600">
                  R$ {service.price.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Nenhum serviço cadastrado
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedService ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={selectedService?.name}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                name="description"
                defaultValue={selectedService?.description || ""}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duração (min) *</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="1"
                  defaultValue={selectedService?.duration || 30}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={selectedService?.price || 0}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="color"
                  name="color"
                  type="color"
                  defaultValue={selectedService?.color || "#3B82F6"}
                  disabled={loading}
                  className="w-20 h-10"
                />
                <span className="text-sm text-gray-600">
                  Cor para identificação no calendário
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedService ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
