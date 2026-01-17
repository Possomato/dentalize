"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const BUSINESS_START_HOUR = 7 // 7 AM
const BUSINESS_END_HOUR = 19 // 7 PM

const taskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  clientId: z.string().optional(),
  serviceId: z.string().optional(),
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).default("SCHEDULED"),
})

// Validate business hours
function validateBusinessHours(startTime: Date, endTime: Date): string | null {
  const startHour = startTime.getHours()
  const startMinute = startTime.getMinutes()
  const endHour = endTime.getHours()
  const endMinute = endTime.getMinutes()

  // Check if start time is before business hours
  if (startHour < BUSINESS_START_HOUR) {
    return `Horário inicial deve ser após ${BUSINESS_START_HOUR}:00`
  }

  // Check if end time is after business hours
  if (endHour > BUSINESS_END_HOUR || (endHour === BUSINESS_END_HOUR && endMinute > 0)) {
    return `Horário final deve ser antes de ${BUSINESS_END_HOUR}:00`
  }

  // Check if start is after end
  if (startTime >= endTime) {
    return "Horário inicial deve ser anterior ao horário final"
  }

  return null
}

// Check for overlapping tasks
async function checkOverlap(
  userId: string,
  startTime: Date,
  endTime: Date,
  excludeTaskId?: string
): Promise<boolean> {
  const overlappingTasks = await prisma.task.findMany({
    where: {
      userId,
      id: excludeTaskId ? { not: excludeTaskId } : undefined,
      OR: [
        {
          // New task starts during existing task
          AND: [
            { startTime: { lte: startTime } },
            { endTime: { gt: startTime } }
          ]
        },
        {
          // New task ends during existing task
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gte: endTime } }
          ]
        },
        {
          // New task completely contains existing task
          AND: [
            { startTime: { gte: startTime } },
            { endTime: { lte: endTime } }
          ]
        }
      ]
    }
  })

  return overlappingTasks.length > 0
}

export async function getTasks(startDate: Date, endDate: Date) {
  const session = await auth()
  if (!session?.user?.id) return []

  const tasks = await prisma.task.findMany({
    where: {
      userId: session.user.id,
      startTime: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      client: true,
      service: true,
    },
    orderBy: {
      startTime: "asc",
    },
  })

  return tasks
}

export async function createTask(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Não autenticado" }
  }

  const clientId = formData.get("clientId") as string
  const serviceId = formData.get("serviceId") as string

  const data = {
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    clientId: clientId === "none" ? undefined : clientId,
    serviceId: serviceId === "none" ? undefined : serviceId,
    status: formData.get("status") || "SCHEDULED",
  }

  const validatedFields = taskSchema.safeParse(data)

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors[0].message,
    }
  }

  const { title, description, startTime, endTime, status } = validatedFields.data

  const startDate = new Date(startTime)
  const endDate = new Date(endTime)

  // Validate business hours
  const businessHoursError = validateBusinessHours(startDate, endDate)
  if (businessHoursError) {
    return { error: businessHoursError }
  }

  // Check for overlapping tasks
  const hasOverlap = await checkOverlap(session.user.id, startDate, endDate)
  if (hasOverlap) {
    return { error: "Já existe uma tarefa agendada neste horário" }
  }

  await prisma.task.create({
    data: {
      title,
      description,
      startTime: startDate,
      endTime: endDate,
      status,
      userId: session.user.id,
      clientId: validatedFields.data.clientId || null,
      serviceId: validatedFields.data.serviceId || null,
    },
  })

  revalidatePath("/dashboard")
  return { success: true }
}

export async function updateTask(taskId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Não autenticado" }
  }

  const clientId = formData.get("clientId") as string
  const serviceId = formData.get("serviceId") as string

  const data = {
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    clientId: clientId === "none" ? undefined : clientId,
    serviceId: serviceId === "none" ? undefined : serviceId,
    status: formData.get("status") || "SCHEDULED",
  }

  const validatedFields = taskSchema.safeParse(data)

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors[0].message,
    }
  }

  const { title, description, startTime, endTime, status } = validatedFields.data

  const startDate = new Date(startTime)
  const endDate = new Date(endTime)

  // Validate business hours
  const businessHoursError = validateBusinessHours(startDate, endDate)
  if (businessHoursError) {
    return { error: businessHoursError }
  }

  // Check for overlapping tasks (excluding current task)
  const hasOverlap = await checkOverlap(session.user.id, startDate, endDate, taskId)
  if (hasOverlap) {
    return { error: "Já existe uma tarefa agendada neste horário" }
  }

  await prisma.task.update({
    where: { id: taskId, userId: session.user.id },
    data: {
      title,
      description,
      startTime: startDate,
      endTime: endDate,
      status,
      clientId: validatedFields.data.clientId || null,
      serviceId: validatedFields.data.serviceId || null,
    },
  })

  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteTask(taskId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Não autenticado" }
  }

  await prisma.task.delete({
    where: { id: taskId, userId: session.user.id },
  })

  revalidatePath("/dashboard")
  return { success: true }
}
