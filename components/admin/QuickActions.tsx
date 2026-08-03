import Link from "next/link";
import { ImagePlus, PackagePlus, Zap } from "lucide-react";

export function QuickActions() {
  return (
    <div className="admin-panel admin-quick-actions">
      <h2 className="admin-section-title">Quick actions</h2>
      <div className="admin-quick-actions__grid">
        <Link href="/admin/products/new" className="admin-quick-action">
          <PackagePlus size={18} />
          <span>New Product</span>
        </Link>
        <Link href="/admin/drops" className="admin-quick-action">
          <Zap size={18} />
          <span>Create Drop</span>
        </Link>
        <Link href="/admin/media" className="admin-quick-action">
          <ImagePlus size={18} />
          <span>Upload Images</span>
        </Link>
      </div>
    </div>
  );
}
