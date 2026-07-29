import { getStorageAdmin } from "@/lib/storage";
import { env } from "@/lib/env";

const storage = getStorageAdmin();
const { data: buckets, error: listError } = await storage.storage.listBuckets();
if (listError) throw listError;

if (!buckets.some((bucket) => bucket.name === env.SUPABASE_STORAGE_BUCKET)) {
  const { error } = await storage.storage.createBucket(
    env.SUPABASE_STORAGE_BUCKET,
    {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ],
    },
  );
  if (error) throw error;
}

console.info(
  `Bucket privado '${env.SUPABASE_STORAGE_BUCKET}' listo para SIJAC.`,
);
