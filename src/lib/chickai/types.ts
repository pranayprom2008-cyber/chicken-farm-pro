export interface ChickAIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionProposal?: {
    type: 'create_expense' | 'update_batch' | 'add_mortality' | 'create_sale';
    title: string;
    details: {
      category?: string;
      amount?: number;
      batchNumber?: string;
      batchId?: string;
      description?: string;
      deadChicks?: number;
      aliveChicks?: number;
      buyer?: string;
      pricePerKg?: number;
      chickensSold?: number;
      [key: string]: any;
    };
    status: 'pending' | 'confirmed' | 'cancelled';
  };
  reportData?: {
    batchNumber: string;
    breedType: string;
    ageDays: number;
    totalDays: number;
    started: number;
    alive: number;
    dead: number;
    mortalityPct: number;
    totalCost: number;
    revenue: number;
    profit: number;
    costPerBird: number;
    expensesByCategory: { category: string; amount: number }[];
    aiInsights: string[];
    recommendations: string[];
  };
}

export interface FarmContextSnapshot {
  batches: any[];
  expenses: any[];
  sales: any[];
  billingHistory: any[];
  stats: any;
  settings: any;
}
