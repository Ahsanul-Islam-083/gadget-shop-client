export type UserRole = "ADMIN" | "CUSTOMER";
export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

export interface Pagination {
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Category {
  id: string;
  name: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategorySummary {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  title: string;
  brand: string | null;
  description: string | null;
  price: number;
  stock: number;
  image: string | null;
  categoryId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  category: CategorySummary;
  avgRating: number | null;
  ratingCount: number;
}

export interface ProductListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "newest" | "price" | "rating";
  order?: "asc" | "desc";
}

export interface ProductInput {
  title: string;
  brand?: string | null;
  description?: string | null;
  price: number;
  stock?: number;
  image?: string | null;
  categoryId: string;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  user: Pick<User, "id" | "name">;
  product: Pick<Product, "id" | "title">;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: Pick<Product, "id" | "title" | "price" | "image" | "stock">;
  lineTotal: number;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
  product: Pick<Product, "id" | "title" | "price" | "image" | "stock">;
}

export interface WishlistToggleResult {
  inWishlist: boolean;
  item?: WishlistItem;
}

export interface WishlistAddResult {
  item: WishlistItem;
  added: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  product: Pick<Product, "id" | "title">;
}

export interface OrderStatusHistory {
  id: string;
  status: OrderStatus;
  changedBy: string;
  changedAt: string;
  user: Pick<User, "id" | "name">;
}

export type OrderStatusCounts = Record<OrderStatus, number>;

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  stripeSessionId: string | null;
  transactionId: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  statusHistory?: OrderStatusHistory[];
}

export interface OrdersAnalytics {
  totalRevenue: number;
  orderCountByStatus: OrderStatusCounts;
  topSellingProducts: {
    productId: string;
    title: string;
    brand: string | null;
    totalQuantitySold: number;
  }[];
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  includeDeleted?: boolean;
}