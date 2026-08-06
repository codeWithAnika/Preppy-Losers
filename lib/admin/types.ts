import type { SizeStock } from "@/lib/products";
import type { Database } from "@/lib/database.types";

export type ProductStatus = "draft" | "published" | "archived";

export type AdminProductRow = {
  id: string;
  slug: string | null;
  name: string;
  description: string;
  details: string | null;
  price: number;
  drop_id: string | null;
  drop_date: string;
  size_stock: SizeStock[];
  images: string[];
  primary_image: string | null;
  featured: boolean;
  category: string | null;
  weight_grams: number | null;
  seo_title: string | null;
  seo_description: string | null;
  status: ProductStatus;
  accent_color: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type AdminOrderRow = {
  id: string;
  user_id: string;
  product_id: string;
  size: string;
  quantity: number;
  amount: number;
  status: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  shipping_address: Record<string, string> | null;
  tracking_id: string | null;
  courier_name: string | null;
  tracking_url: string | null;
  delivery_status: string | null;
  created_at: string;
};

export type AdminCustomerRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  order_count: number;
  lifetime_value: number;
};

export type AdminCustomerProfileRpc =
  Database["public"]["Functions"]["admin_customer_profiles"]["Returns"][number];

export type StoreSettings = {
  storeName: string;
  supportEmail: string;
  shippingNote: string;
  taxRate: number;
  socialLinks: {
    instagram?: string;
    threads?: string;
  };
  logoUrl: string;
  faviconUrl: string;
};

export type DashboardStats = {
  revenue: number;
  ordersCount: number;
  customersCount: number;
  productsCount: number;
  activeDrops: AdminDropRow[];
  outOfStockCount: number;
  recentOrders: AdminOrderWithCustomer[];
  latestCustomers: AdminCustomerRow[];
  stockAlerts: StockAlert[];
  salesByDay: ChartPoint[];
  ordersByDay: ChartPoint[];
};

export type ChartPoint = {
  label: string;
  value: number;
};

export type StockAlert = {
  productId: string;
  productName: string;
  size: string;
  stock: number;
};

export type AdminOrderWithCustomer = AdminOrderRow & {
  customer_name: string | null;
  customer_email: string | null;
};

export type ProductFormInput = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  details: string;
  price: number;
  dropId: string;
  dropDate: string;
  category: string;
  status: ProductStatus;
  featured: boolean;
  primaryImage: string;
  images: string[];
  sizeStock: SizeStock[];
  weightGrams: number | null;
  seoTitle: string;
  seoDescription: string;
  accentColor: string;
};

export type AdminDropRow = {
  id: string;
  drop_number: number;
  name: string;
  slug: string;
  description: string | null;
  hero_image: string | null;
  banner_image: string | null;
  launch_date: string;
  is_active: boolean;
  status: ProductStatus;
  seo_title: string | null;
  seo_description: string | null;
  display_order: number;
  starts_at: string | null;
  ends_at: string | null;
  featured: boolean;
  theme_color: string | null;
  visibility: "public" | "hidden" | "unlisted";
  created_at: string;
  updated_at: string;
  product_count?: number;
};

export type DropGroup = {
  drop: AdminDropRow;
  products: AdminProductRow[];
};

export type PromoCodeType = "percentage" | "fixed";

export type AdminPromoCodeRow = {
  id: string;
  code: string;
  type: PromoCodeType;
  value: number;
  minimum_order: number;
  maximum_discount: number | null;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
};

export type PromoCodeFormInput = {
  id?: string;
  code: string;
  type: PromoCodeType;
  value: number;
  minimumOrder: number;
  maximumDiscount: number | null;
  maxUses: number | null;
  active: boolean;
  startsAt: string | null;
  expiresAt: string | null;
};

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
];

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "Preppy Losers",
  supportEmail: "Loserspreppy@gmail.com",
  shippingNote: "Ships within 5–7 business days via tracked courier.",
  taxRate: 0,
  socialLinks: {
    instagram: "https://www.instagram.com/preppylosers",
    threads: "https://threads.net",
  },
  logoUrl: "/logo-badge.webp",
  faviconUrl: "/favicon.ico",
};
