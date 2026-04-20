export interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  createdAt: string;
  wallet: {
    user: {
      fullName: string;
    };
  };
}

export interface Stats {
  totalUsers: number;
  totalAgents: number;
  totalGroups: number;
  guaranteedGroups: number;
  activeDefaults: number;
  totalBalance: number;
  verifiedUsers: number;
  totalTransactions: number;
  totalSaved: number;
  recentTransactions: Transaction[];
}