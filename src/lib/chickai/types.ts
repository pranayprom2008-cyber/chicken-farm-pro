export interface FarmAIScore {
  overall: number; // 0 - 100
  batchHealth: number; // 0 - 100
  mortalityControl: number; // 0 - 100
  feedEfficiency: number; // 0 - 100
  expenseControl: number; // 0 - 100
  profitability: number; // 0 - 100
  opportunityNote: string;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
}

export interface WhatIfSimulationResult {
  scenarioTitle: string;
  originalProfit: number;
  newProfit: number;
  impactAmount: number;
  impactType: 'positive' | 'negative' | 'neutral';
  assumptions: string[];
  explanation: string;
}

export interface ProactiveAlert {
  id: string;
  severity: 'healthy' | 'attention' | 'critical';
  title: string;
  description: string;
  batchNumber?: string;
  batchId?: string;
  metric?: string;
  recommendation: string;
  timestamp: string;
}

export interface HistoricalBaselines {
  avgMortalityPct: number;
  avgFCR: number;
  avgFeedCostPerBird: number;
  avgCostPerBird: number;
  avgProfitPerBatch: number;
  avgHarvestWeightKg: number;
  sampleBatchesCount: number;
}

export interface AIActionHistoryItem {
  id: string;
  action: string;
  target: string;
  amount?: number;
  timestamp: string;
  type?: string;
  status?: 'completed' | 'cancelled';
}

export interface ActionProposal {
  type: 'create_expense' | 'update_expense' | 'delete_expense' | 'update_batch' | 'add_mortality' | 'create_sale' | 'create_task' | 'filter_batches';
  title: string;
  details: {
    expenseId?: string;
    category?: string;
    amount?: number;
    oldAmount?: number;
    newAmount?: number;
    batchNumber?: string;
    batchId?: string;
    description?: string;
    date?: string;
    deadChicks?: number;
    aliveChicks?: number;
    buyer?: string;
    pricePerKg?: number;
    chickensSold?: number;
    taskTitle?: string;
    priority?: 'low' | 'medium' | 'high';
    filterKey?: string;
    filterValue?: any;
    [key: string]: any;
  };
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface ChickAIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionProposal?: ActionProposal;
  clarificationOptions?: {
    field: 'category' | 'batch';
    options: string[];
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
  simulationData?: WhatIfSimulationResult;
  scoreData?: FarmAIScore;
  alertsData?: ProactiveAlert[];
}

export interface FarmContextSnapshot {
  batches: any[];
  expenses: any[];
  sales: any[];
  billingHistory: any[];
  stats: any;
  settings: any;
  currentPath?: string;
}
