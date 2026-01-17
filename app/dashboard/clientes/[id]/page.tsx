"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getClientWithDetails, getClients } from "@/actions/clients"
import { getServices } from "@/actions/services"
import { uploadDocument, deleteDocument } from "@/actions/documents"
import { Client, ClientDocument, Service, TaskWithRelations } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, FileText, Trash2, Calendar, Loader2, Download, Clock, User } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { TaskForm } from "@/components/tasks/TaskForm"

type ClientWithDetails = Client & {
  tasks: TaskWithRelations[]
  documents: ClientDocument[]
}

export default function ClientProfilePage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [client, setClient] = useState<ClientWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileDescription, setFileDescription] = useState("")

  // TaskForm state
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null)
  const [allClients, setAllClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])

  const fetchClient = async () => {
    setLoading(true)
    const data = await getClientWithDetails(clientId)
    if (data) {
      setClient(data as ClientWithDetails)
    } else {
      setError("Cliente não encontrado")
    }
    setLoading(false)
  }

  const fetchFormData = async () => {
    const [clientsData, servicesData] = await Promise.all([
      getClients(),
      getServices(),
    ])
    setAllClients(clientsData)
    setServices(servicesData)
  }

  useEffect(() => {
    fetchClient()
    fetchFormData()
  }, [clientId])

  const handleTaskClick = (task: TaskWithRelations) => {
    setSelectedTask(task)
    setTaskFormOpen(true)
  }

  const handleTaskFormSuccess = () => {
    fetchClient()
  }

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedFile) return

    setUploadLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", selectedFile)
    formData.append("description", fileDescription)

    const result = await uploadDocument(clientId, formData)

    if (result.error) {
      setError(result.error)
      setUploadLoading(false)
    } else {
      setSelectedFile(null)
      setFileDescription("")
      await fetchClient()
      setUploadLoading(false)
      // Reset file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm("Tem certeza que deseja excluir este documento?")) return

    await deleteDocument(documentId)
    await fetchClient()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      SCHEDULED: "Agendado",
      IN_PROGRESS: "Em andamento",
      COMPLETED: "Concluído",
      CANCELLED: "Cancelado",
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SCHEDULED: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-gray-100 text-gray-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="p-3 sm:p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">{error || "Cliente não encontrado"}</p>
          <Link href="/dashboard/clientes">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Clientes
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <Link href="/dashboard/clientes">
          <Button variant="ghost" className="mb-3 sm:mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Voltar para Clientes</span>
            <span className="sm:hidden">Voltar</span>
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">{client.name}</h1>
      </div>

      {/* Client Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label className="text-xs sm:text-sm text-gray-500">Email</Label>
                <p className="font-medium text-sm sm:text-base truncate">{client.email || "Não informado"}</p>
              </div>
              <div>
                <Label className="text-xs sm:text-sm text-gray-500">Telefone</Label>
                <p className="font-medium text-sm sm:text-base">{client.phone || "Não informado"}</p>
              </div>
              <div>
                <Label className="text-xs sm:text-sm text-gray-500">CPF</Label>
                <p className="font-medium text-sm sm:text-base">{client.cpf || "Não informado"}</p>
              </div>
              <div>
                <Label className="text-xs sm:text-sm text-gray-500">Cadastrado em</Label>
                <p className="font-medium text-sm sm:text-base">
                  {format(new Date(client.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>

            {client.notes && (
              <div>
                <Label className="text-sm text-gray-500">Observações Rápidas</Label>
                <p className="font-medium">{client.notes}</p>
              </div>
            )}

            {client.description && (
              <div>
                <Label className="text-sm text-gray-500">Descrição Detalhada</Label>
                <p className="font-medium whitespace-pre-wrap">{client.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
            <div>
              <Label className="text-xs sm:text-sm text-gray-500">Total de Tarefas</Label>
              <p className="text-xl sm:text-2xl font-bold">{client.tasks.length}</p>
            </div>
            <div>
              <Label className="text-xs sm:text-sm text-gray-500">Documentos Anexados</Label>
              <p className="text-xl sm:text-2xl font-bold">{client.documents.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Section */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Documentos e Arquivos</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* Upload Form */}
          <form onSubmit={handleFileUpload} className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Selecionar Arquivo</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  disabled={uploadLoading}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos aceitos: PDF, JPG, PNG, DOC, DOCX (máx. 10MB)
                </p>
              </div>
              <div>
                <Label htmlFor="file-description">Descrição (opcional)</Label>
                <Input
                  id="file-description"
                  placeholder="Ex: Raio-X panorâmico, Exame de sangue..."
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  disabled={uploadLoading}
                />
              </div>
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
              <Button type="submit" disabled={!selectedFile || uploadLoading}>
                {uploadLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Upload className="mr-2 h-4 w-4" />
                Fazer Upload
              </Button>
            </div>
          </form>

          {/* Documents List */}
          {client.documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhum documento anexado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {client.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 gap-3"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 w-full">
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{doc.fileName}</p>
                      {doc.description && (
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{doc.description}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {formatFileSize(doc.fileSize)} • Enviado em{" "}
                        {format(new Date(doc.uploadedAt), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <a href={doc.filePath} download target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="flex-1 sm:flex-none"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task History */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Histórico de Tarefas</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {client.tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhuma tarefa registrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {client.tasks.map((task) => {
                const backgroundColor = task.service?.color || "#3B82F6"

                return (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className="cursor-pointer border border-gray-200 rounded-lg hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Color indicator bar */}
                    <div
                      className="w-full h-1"
                      style={{ backgroundColor }}
                    />

                    <div className="p-3 sm:p-4">
                      {/* Header with title and status */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-sm sm:text-base">{task.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full whitespace-nowrap flex-shrink-0 ${getStatusColor(task.status)}`}
                        >
                          {getStatusLabel(task.status)}
                        </span>
                      </div>

                      {/* Task details */}
                      <div className="space-y-1.5 text-sm text-gray-600">
                        {/* Date and Time */}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
                          <span>
                            {format(new Date(task.startTime), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
                          <span>
                            {format(new Date(task.startTime), "HH:mm")} - {format(new Date(task.endTime), "HH:mm")}
                            <span className="text-gray-400 ml-2">
                              ({Math.round(
                                (new Date(task.endTime).getTime() - new Date(task.startTime).getTime()) /
                                  (1000 * 60)
                              )} min)
                            </span>
                          </span>
                        </div>

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
                      </div>

                      {/* Description */}
                      {task.description && (
                        <p className="text-xs sm:text-sm text-gray-500 mt-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Form Modal */}
      <TaskForm
        open={taskFormOpen}
        onOpenChange={setTaskFormOpen}
        task={selectedTask}
        clients={allClients}
        services={services}
        onSuccess={handleTaskFormSuccess}
      />
    </div>
  )
}
