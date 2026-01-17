"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const clientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  notes: z.string().optional(),
  description: z.string().optional(),
})

export async function getClients() {
  const session = await auth()
  if (!session?.user?.id) return []

  const clients = await prisma.client.findMany({
    orderBy: {
      name: "asc",
    },
  })

  return clients
}

export async function getClientWithDetails(clientId: string) {
  const session = await auth()
  if (!session?.user?.id) return null

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      tasks: {
        include: {
          service: true,
          client: true,
        },
        orderBy: {
          startTime: "desc",
        },
      },
      documents: {
        orderBy: {
          uploadedAt: "desc",
        },
      },
    },
  })

  return client
}

export async function createClient(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Não autenticado" }
  }

  const data = {
    name: formData.get("name"),
    email: formData.get("email") || "",
    phone: formData.get("phone") || undefined,
    cpf: formData.get("cpf") || undefined,
    notes: formData.get("notes") || undefined,
    description: formData.get("description") || undefined,
  }

  const validatedFields = clientSchema.safeParse(data)

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors[0].message,
    }
  }

  const { name, email, phone, cpf, notes, description } = validatedFields.data

  await prisma.client.create({
    data: {
      name,
      email: email || null,
      phone,
      cpf,
      notes,
      description,
    },
  })

  revalidatePath("/dashboard/clientes")
  return { success: true }
}

export async function updateClient(clientId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Não autenticado" }
  }

  const data = {
    name: formData.get("name"),
    email: formData.get("email") || "",
    phone: formData.get("phone") || undefined,
    cpf: formData.get("cpf") || undefined,
    notes: formData.get("notes") || undefined,
    description: formData.get("description") || undefined,
  }

  const validatedFields = clientSchema.safeParse(data)

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors[0].message,
    }
  }

  const { name, email, phone, cpf, notes, description } = validatedFields.data

  await prisma.client.update({
    where: { id: clientId },
    data: {
      name,
      email: email || null,
      phone,
      cpf,
      notes,
      description,
    },
  })

  revalidatePath("/dashboard/clientes")
  revalidatePath(`/dashboard/clientes/${clientId}`)
  return { success: true }
}

export async function deleteClient(clientId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Não autenticado" }
  }

  await prisma.client.delete({
    where: { id: clientId },
  })

  revalidatePath("/dashboard/clientes")
  return { success: true }
}
