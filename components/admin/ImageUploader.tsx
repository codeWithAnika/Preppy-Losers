"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { GripVertical, Star, Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAdminToast } from "@/components/admin/AdminProviders";

interface ImageUploaderProps {
  images: string[];
  primaryImage: string;
  onChange: (images: string[], primaryImage: string) => void;
}

function publicUrl(path: string) {
  if (path.startsWith("http") || path.startsWith("/")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/product-media/${path}`;
}

export function ImageUploader({ images, primaryImage, onChange }: ImageUploaderProps) {
  const { toast } = useAdminToast();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((file) => file.type.startsWith("image/"));
      if (list.length === 0) return;

      setUploading(true);
      const supabase = createClient();
      const uploaded: string[] = [];

      for (const file of list) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("product-media").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (error) {
          toast(error.message, "error");
          continue;
        }
        uploaded.push(publicUrl(path));
      }

      const nextImages = [...images, ...uploaded];
      const nextPrimary = primaryImage || nextImages[0] || "";
      onChange(nextImages, nextPrimary);
      setUploading(false);
      if (uploaded.length > 0) toast("Images uploaded", "success");
    },
    [images, onChange, primaryImage, toast]
  );

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    await uploadFiles(event.dataTransfer.files);
  };

  const removeImage = (url: string) => {
    const nextImages = images.filter((image) => image !== url);
    const nextPrimary = primaryImage === url ? nextImages[0] ?? "" : primaryImage;
    onChange(nextImages, nextPrimary);
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next, primaryImage);
  };

  return (
    <div className="admin-uploader">
      <div
        className={`admin-uploader__drop ${dragOver ? "is-dragover" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <Upload size={20} />
        <p>Drag & drop images here</p>
        <label className="admin-btn admin-btn--ghost">
          Browse files
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(event) => {
              if (event.target.files) void uploadFiles(event.target.files);
            }}
          />
        </label>
        {uploading ? <p className="admin-uploader__hint">Uploading…</p> : null}
      </div>

      {images.length > 0 ? (
        <div className="admin-uploader__grid">
          {images.map((image, index) => (
            <div key={image} className="admin-uploader__item">
              <div className="admin-uploader__thumb">
                <Image src={image} alt="" fill className="object-cover" sizes="120px" />
              </div>
              <div className="admin-uploader__actions">
                <button
                  type="button"
                  className={`admin-icon-btn ${primaryImage === image ? "is-active" : ""}`}
                  onClick={() => onChange(images, image)}
                  aria-label="Set primary"
                >
                  <Star size={14} />
                </button>
                <button type="button" className="admin-icon-btn" onClick={() => moveImage(index, -1)}>
                  <GripVertical size={14} />
                </button>
                <button type="button" className="admin-icon-btn" onClick={() => removeImage(image)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export { publicUrl as mediaPublicUrl };
