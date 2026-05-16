import client from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  Transaction,
  PayoutRequest,
  RidesPackage,
  WhishStatus,
  WhishVerificationStart,
} from '../types';

export interface WalletResponse {
  wallet: {
    id: string;
    userId: string;
    availableBalance: number;
    pendingBalance: number;
    coinBalance: number;
    coinPending: number;
    currency: string;
    totalEarned: number;
  };
  whish: WhishStatus | null;
}

export const walletApi = {
  getWallet: () =>
    client.get<WalletResponse>('/wallet'),

  getTransactions: (page = 1, limit = 20) =>
    client.get<ApiResponse<PaginatedResponse<Transaction>>>('/wallet/transactions', {
      params: { page, limit },
    }),

  getPackages: () =>
    client.get<{ packages: RidesPackage[] }>('/wallet/packages'),

  createCheckout: (packageId: string) =>
    client.post<{ url: string; sessionId: string }>('/wallet/checkout', { packageId }),

  requestPayout: (amount: number, notes?: string) =>
    client.post<{ payoutRequest: PayoutRequest }>('/wallet/payout', { amount, notes }),

  getPayoutHistory: () =>
    client.get<{ requests: PayoutRequest[] }>('/wallet/payout'),

  setupWhish: (phone: string) =>
    client.post<WhishVerificationStart>('/wallet/whish/setup', { phone }),

  verifyWhish: (verificationId: string, code: string) =>
    client.post<{ user: WhishStatus }>('/wallet/whish/verify', { verificationId, code }),
};
