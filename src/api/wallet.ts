import client from './client';
import { ApiResponse, PaginatedResponse, Transaction, WalletBalance, PayoutRequest } from '../types';

export const walletApi = {
  getBalance: () =>
    client.get<ApiResponse<WalletBalance>>('/wallet/balance'),

  getTransactions: (page = 1, limit = 20) =>
    client.get<ApiResponse<PaginatedResponse<Transaction>>>('/wallet/transactions', {
      params: { page, limit },
    }),

  addFunds: (amount: number, paymentMethod: string, paymentToken: string) =>
    client.post<ApiResponse<Transaction>>('/wallet/add-funds', {
      amount,
      paymentMethod,
      paymentToken,
    }),

  requestPayout: (amount: number, method: string, accountDetails: string) =>
    client.post<ApiResponse<PayoutRequest>>('/wallet/payout', {
      amount,
      method,
      accountDetails,
    }),

  getPayoutHistory: (page = 1, limit = 20) =>
    client.get<ApiResponse<PaginatedResponse<PayoutRequest>>>('/wallet/payouts', {
      params: { page, limit },
    }),
};
