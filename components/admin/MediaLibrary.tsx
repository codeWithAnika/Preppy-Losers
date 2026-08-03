"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Copy, Trash2 } from "lucide-react";
import { deleteMediaFileAction, renameMediaFileAction } from "@/lib/admin/actions/settings";
import { useAdminToast } from "@/components/admin/AdminProviders";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/admin/ImageUploader";

export type MediaItem = {
  name: string;
  url: string;
  folder: string;
};

interface MediaLibraryProps {
  items: MediaItem[];
}

export function MediaLibrary({ items }: MediaLibraryProps) {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [pending, startTransition] = useTransition();
  const [folder, setFolder] = useState<string>("all");
  const [renameTarget, setRenameTarget] = useState<MediaItem | null>(null);
  const [newName, setNewName] = useState("");

  const folders = ["all", ...Array.from(new Set(items.map((item) => item.folder)))];
  const filtered =
    folder === "all" ? items : items.filter((item) => item.folder === folder);

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast("URL copied", "success");
  };

  const remove = (item: MediaItem) => {
    startTransition(async () => {
      const result = await deleteMediaFileAction(item.name);
      if (result.success) {
        toast("File deleted", "success");
        router.refresh();
      } else {
        toast(result.error, "error");
      }
    });
  };

  const rename = () => {
    if (!renameTarget || !newName.trim()) return;
    const folderPrefix = renameTarget.name.includes("/")
      ? renameTarget.name.split("/").slice(0, -1).join("/")
      : "";
    const nextPath = folderPrefix ? `${folderPrefix}/${newName.trim()}` : newName.trim();

    startTransition(async () => {
      const result = await renameMediaFileAction(renameTarget.name, nextPath);
      if (result.success) {
        toast("File renamed", "success");
        setRenameTarget(null);
        router.refresh();
      } else {
        toast(result.error, "error");
      }
    });
  };

  return (
    <div className="admin-media">
      <div className="admin-panel">
        <h2 className="admin-section-title">Upload</h2>
        <ImageUploader
          images={[]}
          primaryImage=""
          onChange={() => {
            toast("Upload complete — refresh to see new files", "success");
            router.refresh();
          }}
        />
      </div>

      <div className="admin-toolbar">
        <select
          className="admin-select"
          value={folder}
          onChange={(event) => setFolder(event.target.value)}
        >
          {folders.map((entry) => (
            <option key={entry} value={entry}>
              {entry === "all" ? "All folders" : entry}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-media-grid">
        {filtered.map((item) => (
          <article key={item.name} className="admin-media-card">
            <div className="admin-media-card__thumb">
              <Image src={item.url} alt="" fill className="object-cover" sizes="200px" />
            </div>
            <div className="admin-media-card__body">
              <p>{item.name.split("/").pop()}</p>
              <span className="admin-muted">{item.folder}</span>
              <div className="admin-row-actions">
                <button type="button" className="admin-icon-btn" onClick={() => copyUrl(item.url)}>
                  <Copy size={14} />
                </button>
                <button
                  type="button"
                  className="admin-icon-btn"
                  onClick={() => {
                    setRenameTarget(item);
                    setNewName(item.name.split("/").pop() ?? "");
                  }}
                >
                  Rename
                </button>
                <button
                  type="button"
                  className="admin-icon-btn"
                  disabled={pending}
                  onClick={() => remove(item)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {renameTarget ? (
        <div className="admin-dialog-backdrop" onClick={() => setRenameTarget(null)}>
          <div className="admin-dialog" onClick={(event) => event.stopPropagation()}>
            <h2 className="admin-dialog__title">Rename file</h2>
            <input
              className="admin-input"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
            />
            <div className="admin-dialog__actions">
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setRenameTarget(null)}>
                Cancel
              </button>
              <button type="button" className="admin-btn admin-btn--primary" disabled={pending} onClick={rename}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
