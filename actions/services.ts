"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const serviceSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  duration: z.number().min(1, "Duração deve ser pelo menos 1 minuto"),
  price: z.number().min(0, "Preço deve ser maior ou igual a 0"),
  color: z.string().default("#3B82F6"),
})

export async function getServices() {
  const session = await auth()
  if (!session?.user?.id) return []

  const services = await prisma.service.findMany({
    orderBy: {
      name: "asc",
    },
  })

  return services
}

export async function createService(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Não autenticado" }
  }

  const data = {
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    duration: Number(formData.get("duration")),
    price: Number(formData.get("price")),
    color: formData.get("color") || "#3B82F6",
  }

  const validatedFields = serviceSchema.safeParse(data)

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors[0].message,
    }
  }

  const { name, description, duration, price, color } = validatedFields.data

  await prisma.service.create({
    data: {
      name,
      description,
      duration,
      price,
      color,
    },
  })

  revalidatePath("/dashboard/servicos")
  return { success: true }
}

export async function updateService(serviceId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Não autenticado" }
  }

  const data = {
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    duration: Number(formData.get("duration")),
    price: Number(formData.get("price")),
    color: formData.get("color") || "#3B82F6",
  }

  const validatedFields = serviceSchema.safeParse(data)

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors[0].message,
    }
  }

  const { name, description, duration, price, color } = validatedFields.data

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      name,
      description,
      duration,
      price,
      color,
    },
  })

  revalidatePath("/dashboard/servicos")
  return { success: true }
}

export async function deleteService(serviceId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Não autenticado" }
  }

  await prisma.service.delete({
    where: { id: serviceId },
  })

  revalidatePath("/dashboard/servicos")
  return { success: true }
}
