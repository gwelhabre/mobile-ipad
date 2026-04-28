import client from './client';
import { ApiResponse, PaginatedResponse, Product, ProductReview } from '../types';

export const marketplaceApi = {
  getProducts: (page = 1, limit = 20, category?: string, search?: string) =>
    client.get<ApiResponse<PaginatedResponse<Product>>>('/marketplace/products', {
      params: { page, limit, category, search },
    }),

  getProductById: (productId: string) =>
    client.get<ApiResponse<Product>>(`/marketplace/products/${productId}`),

  purchaseProduct: (productId: string) =>
    client.post<ApiResponse<void> | { order?: unknown; newBalance?: number }>('/marketplace/buy', { productId }),

  getProductReviews: (productId: string, page = 1) =>
    client.get<ApiResponse<PaginatedResponse<ProductReview>>>(
      `/marketplace/products/${productId}/reviews`,
      { params: { page } },
    ),

  submitReview: (productId: string, rating: number, comment: string) =>
    client.post<ApiResponse<ProductReview>>(
      `/marketplace/products/${productId}/reviews`,
      { rating, comment },
    ),

  getMyProducts: (page = 1) =>
    client.get<ApiResponse<PaginatedResponse<Product>>>('/marketplace/my-products', {
      params: { page },
    }),

  createProduct: (payload: Partial<Product>) =>
    client.post<ApiResponse<Product>>('/marketplace/products', payload),

  updateProduct: (productId: string, payload: Partial<Product>) =>
    client.put<ApiResponse<Product>>(`/marketplace/products/${productId}`, payload),
};
