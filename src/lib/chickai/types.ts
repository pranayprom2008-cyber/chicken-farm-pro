// ==========================================
// CHICKAI FARM INTELLIGENCE SYSTEM TYPES
// ==========================================

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
  whatChanged?: string;
  differencePct?: string;
  comparedWith?: string;
  whyItMatters?: string;
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
  avgDailyFeedKg: number;
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
  type:
    | 'create_batch'
    | 'update_batch'
    | 'create_expense'
    | 'update_expense'
    | 'delete_expense'
    | 'add_mortality'
    | 'create_sale'
    | 'create_task'
    | 'filter_batches'
    | 'create_feed_purchase';
  title: string;
  details: {
    batchNumber?: string;
    batchName?: string;
    batchId?: string;
    totalChicks?: number;
    breedType?: string;
    durationDays?: number;
    expenseId?: string;
    category?: string;
    amount?: number;
    oldAmount?: number;
    newAmount?: number;
    description?: string;
    date?: string;
    deadChicks?: number;
    aliveChicks?: number;
    feedConsumed?: number;
    averageWeight?: number;
    buyer?: string;
    pricePerKg?: number;
    chickensSold?: number;
    totalRevenue?: number;
    taskTitle?: string;
    priority?: 'low' | 'medium' | 'high';
    purchaseQuantityKg?: number;
    filterKey?: string;
    filterValue?: any;
    transactionId?: string;
    [key: string]: any;
  };
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface VisionAnalysisResult {
  imageUrl?: string;
  approximateBirdCount: number;
  flockDistribution: 'Uniform' | 'Clustered' | 'Crowded near Feeders' | 'Crowded near Heat';
  activityLevel: 'High / Active' | 'Normal' | 'Low / Inactive Observed';
  deadOrInactiveVisible: number;
  estimatedAvgWeightKg: number;
  confidenceScore: number;
  environmentalObservations: string[];
  observations: string[];
  disclaimer: string;
}

export interface WeightEstimationResult {
  batchNumber: string;
  ageInDays: number;
  expectedTargetWeightKg: number;
  estimatedWeightKg: number;
  deviationPct: number;
  status: 'Target Reached' | 'Slight Lag' | 'Underweight Alert';
  recommendation: string;
  confidenceScore: number;
}

export interface SensorDataSnapshot {
  shedId: string;
  temperatureC: number;
  targetTempRange: [number, number];
  humidityPct: number;
  targetHumidityRange: [number, number];
  ammoniaPpm: number;
  co2Ppm: number;
  waterConsumptionLitersDay: number;
  lightIntensityLux: number;
  ventilationStatus: 'Optimal' | 'High Heat Stress' | 'High Ammonia Warning';
  lastUpdated: string;
}

export interface BatchForecastResult {
  batchNumber: string;
  expectedFinalBirds: number;
  expectedMortalityPct: number;
  expectedFinalWeightKg: number;
  remainingFeedKg: number;
  finalFeedCost: number;
  finalExpenses: number;
  expectedGrossRevenue: number;
  expectedNetProfit: number;
  profitMarginPct: number;
  expectedCompletionDate: string;
  confidencePct: number;
}

export interface InventoryForecastResult {
  currentFeedStockKg: number;
  dailyConsumptionKg: number;
  daysRemaining: number;
  depletionDate: string;
  requiredBatchFeedKg: number;
  recommendedPurchaseKg: number;
  urgency: 'normal' | 'attention' | 'critical';
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
  visionData?: VisionAnalysisResult;
  weightData?: WeightEstimationResult;
  sensorData?: SensorDataSnapshot;
  forecastData?: BatchForecastResult;
  inventoryData?: InventoryForecastResult;
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

export type ConversationState =
  | 'IDLE'
  | 'LISTENING'
  | 'THINKING'
  | 'SPEAKING'
  | 'WAITING_FOR_CONFIRMATION'
  | 'WAITING_FOR_INFORMATION'
  | 'EXECUTING_ACTION'
  | 'ACTION_COMPLETED'
  | 'CANCELLED'
  | 'ERROR';

export type UserIntent =
  | 'STOP_SPEAKING'
  | 'PAUSE'
  | 'WAIT'
  | 'CONTINUE'
  | 'CONFIRM'
  | 'CANCEL'
  | 'REPEAT'
  | 'CORRECT'
  | 'SLOW_DOWN'
  | 'SPEED_UP'
  | 'QUESTION'
  | 'FARM_QUERY'
  | 'DATABASE_ACTION'
  | 'GENERAL_CONVERSATION'
  | 'HELP'
  | 'CHANGE_REQUEST'
  | 'VISION_ANALYSIS'
  | 'SENSOR_QUERY'
  | 'FORECAST_QUERY'
  | 'SIMULATION_QUERY'
  | 'UNKNOWN';

export interface VoiceSessionMemory {
  currentFarmId?: string;
  currentBatch?: string; // e.g. "Batch 12"
  currentBatchId?: string;
  currentCategory?: string; // e.g. "Feed", "Medicine"
  lastCreatedRecord?: {
    type: 'batch' | 'expense' | 'mortality' | 'feed' | 'sale' | 'task';
    id: string;
    amount?: number;
    batchNumber?: string;
    category?: string;
    count?: number;
  };
  lastMentionedAmount?: number;
  lastMentionedItem?: string;
  lastMentionedCount?: number;
  lastAction?: string;
  lastTransactionId?: string;
}

export interface ConversationContext {
  state: ConversationState;
  lastIntent?: UserIntent;
  lastBatchId?: string | null;
  lastTopic?: string | null;
  pendingAction?: ActionProposal | null;
  waitingForField?: 'category' | 'batch' | 'amount' | null;
  interruptedMessage?: string | null;
  lastAssistantResponse?: string | null;
  speedAdjustment?: number;
  sessionMemory?: VoiceSessionMemory;
}

export interface ConversationProcessResult {
  message: ChickAIMessage;
  nextState: ConversationState;
  intent: UserIntent;
  pendingAction?: ActionProposal | null;
  waitingForField?: 'category' | 'batch' | 'amount' | null;
  stopAudio?: boolean;
  resumeAudioText?: string | null;
  speedAdjustment?: number;
  lastBatchId?: string | null;
  handledDirectly?: boolean;
  sessionMemory?: VoiceSessionMemory;
}
