import client from './client';

export interface AdminReports {
  hiddenComments: any[];
  hiddenForumPosts: any[];
  hiddenReviews: any[];
  summary: {
    totalHiddenComments: number;
    totalHiddenForumPosts: number;
    totalHiddenReviews: number;
  };
}

export interface CommissionEntry {
  type: string;
  rate: number;
  effectiveAt: string;
  commissionTotal?: number;
  transactionCount?: number;
}

export interface PayoutRequest {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  createdAt: string;
  user?: { id: string; name?: string; email: string };
}

export interface AdCampaign {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'live' | 'paused' | 'completed';
  budget: number;
  spent: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export const getAdminReports = async (): Promise<AdminReports> => {
  const { data } = await client.get<AdminReports>('/admin/reports');
  return data;
};

export const getAdminCommissions = async (): Promise<{ commissions: CommissionEntry[] }> => {
  const { data } = await client.get<{ commissions: CommissionEntry[] }>('/admin/commissions');
  return data;
};

export const updateCommissionRate = async (transactionType: string, rate: number) => {
  const { data } = await client.patch('/admin/commissions', { transactionType, rate });
  return data;
};

export const getAdminPayouts = async (status: 'pending' | 'all' | 'approved' | 'rejected' | 'paid' = 'pending'): Promise<PayoutRequest[]> => {
  const { data } = await client.get<{ requests: PayoutRequest[] }>('/admin/payouts', { params: { status } });
  return data.requests ?? [];
};

export const updatePayoutRequest = async (payoutRequestId: string, action: 'approve' | 'reject' | 'mark_paid') => {
  const { data } = await client.patch('/admin/payouts', { payoutRequestId, action });
  return data;
};

export const getAdCampaigns = async (): Promise<AdCampaign[]> => {
  const { data } = await client.get<{ campaigns: AdCampaign[] }>('/admin/ads');
  return data.campaigns ?? [];
};

export const moderateItem = async (
  itemId: string,
  itemType: 'comment' | 'thread' | 'forumPost' | 'review',
  hide: boolean,
) => {
  const { data } = await client.post('/admin/moderate', { itemId, itemType, hide });
  return data;
};
