import { createClient } from "@/lib/supabase/server";
import type { MediaItem } from "@/components/admin/MediaLibrary";

export async function fetchMediaLibrary(): Promise<MediaItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from("product-media").list("uploads", {
    limit: 200,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) {
    return [];
  }

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (data ?? [])
    .filter((file) => file.name)
    .map((file) => {
      const name = `uploads/${file.name}`;
      return {
        name,
        folder: "uploads",
        url: `${base}/storage/v1/object/public/product-media/${name}`,
      };
    });
}
