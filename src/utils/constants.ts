// ========================================
// GetGrip Admin Panel - API Constants
// ========================================

// --- Server Config ---
// For local development
export const IP = "localhost:5001";
export const PROTOCOL = "http";

// For live (uncomment when deploying)
// export const IP = "your-domain.com";
// export const PROTOCOL = "https";

// --- Base URLs ---
export const API_BASE_URL = `${PROTOCOL}://${IP}/api`;
export const UPLOADS_BASE_URL = `${PROTOCOL}://${IP}/uploads`;

// --- API Paths (use with apiGet / apiPost / apiPut / apiDelete) ---

// Auth
export const AUTH_LOGIN = "/auth/login";
export const AUTH_REGISTER = "/auth/register";
export const AUTH_ME = "/auth/me";

// Products
export const PRODUCTS = "/products";
export const PRODUCTS_FEATURED = "/products/featured";
export const PRODUCTS_ADMIN_STATS = "/products/admin/stats";
export const getProductPath = (id: string) => `/products/${id}`;
export const trackProductClickPath = (id: string) => `/products/${id}/click`;

// Brands
export const BRANDS = "/brands";
export const getBrandPath = (id: string) => `/brands/${id}`;

// Phone Models
export const PHONE_MODELS = "/phone-models";
export const getPhoneModelPath = (id: string) => `/phone-models/${id}`;
export const getPhoneModelsByBrand = (brandName: string) => `/phone-models?brand=${brandName}`;

// Categories
export const CATEGORIES = "/categories";
export const getCategoryPath = (id: string) => `/categories/${id}`;

// Cart
export const CART = "/cart";
export const getCartItemPath = (itemId: string) => `/cart/${itemId}`;

// Orders
export const ORDERS = "/orders";
export const MY_ORDERS = "/orders/my-orders";
export const getOrderPath = (id: string) => `/orders/${id}`;
export const cancelOrderPath = (id: string) => `/orders/${id}/cancel`;
export const updateOrderStatusPath = (id: string) => `/orders/${id}/status`;
export const updatePaymentStatusPath = (id: string) => `/orders/${id}/payment`;

// Upload
export const UPLOAD_SINGLE = "/upload/single";
export const UPLOAD_MULTIPLE = "/upload/multiple";
export const deleteUploadPath = (filename: string) => `/upload/${filename}`;

// File URL helper (returns full URL for images/files)
export const getFileUrl = (filename: string) => `${UPLOADS_BASE_URL}/${filename}`;

// Visitors
export const VISITORS_STATS = "/visitors/stats";
export const getVisitorByIpPath = (ip: string) => `/visitors/stats/ip/${encodeURIComponent(ip)}`;

// Health
export const HEALTH = "/health";
