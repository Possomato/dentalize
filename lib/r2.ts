import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// R2 client configuration
const R2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "dentalize"

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  })

  await R2.send(command)

  // Return the public URL
  // If you have a custom domain configured, use that instead
  const publicUrl = process.env.R2_PUBLIC_URL
    ? `${process.env.R2_PUBLIC_URL}/${key}`
    : `${process.env.R2_ENDPOINT}/${BUCKET_NAME}/${key}`

  return publicUrl
}

export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  await R2.send(command)
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  return getSignedUrl(R2, command, { expiresIn })
}

// Extract the key from a full R2 URL
export function extractKeyFromUrl(url: string): string {
  const publicUrl = process.env.R2_PUBLIC_URL
  if (publicUrl && url.startsWith(publicUrl)) {
    return url.replace(`${publicUrl}/`, "")
  }
  // Fallback: extract from path
  const parts = url.split("/")
  return parts.slice(-2).join("/") // Returns "documents/filename.ext"
}
