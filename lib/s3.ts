import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.DO_SPACES_ENDPOINT;
const region = process.env.DO_SPACES_REGION || "sgp1";
const accessKeyId = process.env.DO_SPACES_KEY;
const secretAccessKey = process.env.DO_SPACES_SECRET;
const bucket = process.env.DO_SPACES_BUCKET;

if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
  console.error("Missing DigitalOcean Spaces credentials in environment variables");
}

export const s3Client = new S3Client({
  endpoint,
  forcePathStyle: false, // DigitalOcean Spaces supports virtual-hosted style requests
  region,
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
});

export async function uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    ACL: "private", // Keep it private, we'll use signed URLs to access it
  });

  await s3Client.send(command);
  return key;
}

export async function getSignedFileUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

export async function getFileBuffer(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  const response = await s3Client.send(command);
  if (!response.Body) {
    throw new Error("Empty body from S3");
  }
  const byteArray = await response.Body.transformToByteArray();
  return Buffer.from(byteArray);
}
