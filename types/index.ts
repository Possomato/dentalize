import { Task, Client, Service, User, TaskStatus, ClientDocument } from "@prisma/client"

export type TaskWithRelations = Task & {
  client: Client | null
  service: Service | null
}

export type ClientWithRelations = Client & {
  tasks: TaskWithRelations[]
  documents: ClientDocument[]
}

export type { Task, Client, Service, User, TaskStatus, ClientDocument }
