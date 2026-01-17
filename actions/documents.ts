"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { writeFile, unlink } from "fs/promises"
import { join } from "path"
import { z } from "zod"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function uploadDocument(clientId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Não autenticado" }
  }

  try {
    const file = formData.get("file") as File
    const description = formData.get("description") as string

    if (!file) {
      return { error: "Nenhum arquivo foi enviado" }
    }

    if (file.size > MAX_FILE_SIZE) {
      return { error: "Arquivo muito grande. Tamanho máximo: 10MB" }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name
    const extension = originalName.split(".").pop()
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_")
    const uniqueFileName = `${timestamp}_${sanitizedName}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save to public/uploads/documents
    const uploadDir = join(process.cwd(), "public", "uploads", "documents")
    const filePath = join(uploadDir, uniqueFileName)
    await writeFile(filePath, buffer)

    // Create database record
    const document = await prisma.clientDocument.create({
      data: {
        clientId,
        fileName: originalName,
        fileSize: file.size,
        mimeType: file.type,
        filePath: `/uploads/documents/${uniqueFileName}`,
        description: description || null,
      },
    })

    revalidatePath(`/dashboard/clientes/${clientId}`)
    return { success: true, document }
  } catch (error) {
    console.error("Upload error:", error)
    return { error: "Erro ao fazer upload do arquivo" }
  }
}

export async function deleteDocument(documentId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Não autenticado" }
  }

  try {
    // Get document info first
    const document = await prisma.clientDocument.findUnique({
      where: { id: documentId },
    })

    if (!document) {
      return { error: "Documento não encontrado" }
    }

    // Delete file from filesystem
    const filePath = join(process.cwd(), "public", document.filePath)
    try {
      await unlink(filePath)
    } catch (error) {
      console.error("Error deleting file:", error)
      // Continue even if file doesn't exist
    }

    // Delete database record
    await prisma.clientDocument.delete({
      where: { id: documentId },
    })

    revalidatePath(`/dashboard/clientes/${document.clientId}`)
    return { success: true }
  } catch (error) {
    console.error("Delete document error:", error)
    return { error: "Erro ao excluir documento" }
  }
}

export async function getClientDocuments(clientId: string) {
  const session = await auth()
  if (!session?.user?.id) return []

  const documents = await prisma.clientDocument.findMany({
    where: { clientId },
    orderBy: { uploadedAt: "desc" },
  })

  return documents
}
