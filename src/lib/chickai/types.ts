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

export interface ChickAIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionProposal?: {
    type: 'create_expense' | 'update_batch' | 'add_mortality' | 'create_sale' | 'create_task' | 'filter_batches';
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
      taskTitle?: string;
      priority?: 'low' | 'medium' | 'high';
      filterKey?: string;
      filterValue?: any;
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
