// TypeScript types for Fone Fusion

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  category_id: string;
  category?: Category;
  brand_ids: string[];
  brands?: Brand[];
  stock: number;
  images: string[];
  supported_models?: string[]; // e.g. ["iPhone 15", "iPhone 15 Pro", "Samsung S24 Ultra", "OnePlus 12"]
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image?: string;
  slug: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_email?: string;
  items: OrderItem[];
  total_amount: number;
  payment_id?: string;
  payment_status: 'pending' | 'paid' | 'failed';
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
}

export interface AdminUser {
  id: string;
  email: string;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  image_url: string;
  link_url: string;
  button_text?: string;
  bg_gradient?: string;
  is_active: boolean;
  display_order: number;
}

