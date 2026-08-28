import { FunctionDeclaration, SchemaType } from '@google/generative-ai';

/**
 * 16 Predefined, Safe Server-Side Tools for Gemini 3.1 Flash-Lite
 * Enables real Supabase/Prisma database interaction without arbitrary SQL.
 */
export const GEMINI_FARM_TOOLS: FunctionDeclaration[] = [
  {
    name: 'get_farm_summary',
    description: 'Get an executive summary of the entire farm: active flocks, bird counts, total expenses, sales revenue, and net profit.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
    },
  },
  {
    name: 'get_batches',
    description: 'Retrieve list of poultry batches/flocks with their breed, chick counts, mortality rate, growth days, and status (growing, completed, sold).',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        status: {
          type: SchemaType.STRING,
          description: 'Optional filter by batch status: "growing", "completed", "sold", or "all".',
        },
      },
    },
  },
  {
    name: 'get_batch_details',
    description: 'Get detailed performance and historical metrics for a specific batch by its batchNumber (e.g. "B-2026-01") or ID.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        batchIdentifier: {
          type: SchemaType.STRING,
          description: 'The batch number (e.g. "B-2026-01") or batch ID.',
        },
      },
      required: ['batchIdentifier'],
    },
  },
  {
    name: 'get_expenses',
    description: 'Retrieve real farm expense records from the database. Can filter by category (Feed, Medicine, Electricity, Labour, Maintenance, Miscellaneous) or batch.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        category: {
          type: SchemaType.STRING,
          description: 'Optional category filter: "Feed", "Medicine", "Electricity", "Labour", "Maintenance", "Miscellaneous".',
        },
        batchNumber: {
          type: SchemaType.STRING,
          description: 'Optional batch number filter (e.g. "B-2026-01").',
        },
        limit: {
          type: SchemaType.NUMBER,
          description: 'Maximum number of recent expenses to retrieve (default 20).',
        },
      },
    },
  },
  {
    name: 'get_revenue',
    description: 'Retrieve bird sales and revenue transactions from the database.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        batchNumber: {
          type: SchemaType.STRING,
          description: 'Optional batch number filter.',
        },
        limit: {
          type: SchemaType.NUMBER,
          description: 'Maximum number of sales records to retrieve (default 20).',
        },
      },
    },
  },
  {
    name: 'get_inventory',
    description: 'Check current inventory stocks including feed bags and medicine stocks.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        itemType: {
          type: SchemaType.STRING,
          description: 'Optional filter: "feed", "medicine", or "all".',
        },
      },
    },
  },
  {
    name: 'get_mortality',
    description: 'Retrieve mortality records and death loss statistics across all flocks or a specific batch.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        batchNumber: {
          type: SchemaType.STRING,
          description: 'Optional batch number to inspect mortality for.',
        },
      },
    },
  },
  {
    name: 'get_feed_usage',
    description: 'Retrieve feed consumption metrics and FCR (Feed Conversion Ratio) trends.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        batchNumber: {
          type: SchemaType.STRING,
          description: 'Optional batch number.',
        },
      },
    },
  },
  {
    name: 'create_expense',
    description: 'Create and save a real financial expense record in the farm database.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        amount: {
          type: SchemaType.NUMBER,
          description: 'The exact amount in INR (e.g. 1000). Must be positive.',
        },
        category: {
          type: SchemaType.STRING,
          description: 'Expense category: "Feed", "Medicine", "Electricity", "Labour", "Maintenance", or "Miscellaneous".',
        },
        description: {
          type: SchemaType.STRING,
          description: 'Clear description of the expense (e.g. "Feed purchase 10 bags").',
        },
        batchNumber: {
          type: SchemaType.STRING,
          description: 'Optional batch number associated with this expense (e.g. "B-2026-01").',
        },
        date: {
          type: SchemaType.STRING,
          description: 'Optional ISO date string (YYYY-MM-DD). Defaults to today.',
        },
      },
      required: ['amount', 'category', 'description'],
    },
  },
  {
    name: 'update_expense',
    description: 'Update an existing expense amount or description in the database.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        expenseId: {
          type: SchemaType.STRING,
          description: 'The unique ID of the expense to update.',
        },
        newAmount: {
          type: SchemaType.NUMBER,
          description: 'The updated amount in INR.',
        },
        newDescription: {
          type: SchemaType.STRING,
          description: 'The updated description.',
        },
      },
      required: ['expenseId'],
    },
  },
  {
    name: 'create_batch',
    description: 'Create a new poultry flock/batch in the database.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        batchNumber: {
          type: SchemaType.STRING,
          description: 'Unique batch identifier (e.g. "B-2026-02").',
        },
        batchName: {
          type: SchemaType.STRING,
          description: 'Name of the flock (e.g. "Monsoon Broiler Flock 2").',
        },
        totalChicks: {
          type: SchemaType.NUMBER,
          description: 'Initial number of chicks placed (e.g. 5000).',
        },
        breedType: {
          type: SchemaType.STRING,
          description: 'Breed name, defaults to "Cobb 500 (Broiler)".',
        },
        durationDays: {
          type: SchemaType.NUMBER,
          description: 'Expected growth cycle in days (default 45).',
        },
      },
      required: ['batchNumber', 'totalChicks'],
    },
  },
  {
    name: 'update_batch',
    description: 'Update batch status, notes, or ending date.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        batchNumber: {
          type: SchemaType.STRING,
          description: 'Batch number to update.',
        },
        status: {
          type: SchemaType.STRING,
          description: 'New status: "growing", "completed", or "sold".',
        },
        notes: {
          type: SchemaType.STRING,
          description: 'Additional operational notes.',
        },
      },
      required: ['batchNumber'],
    },
  },
  {
    name: 'record_mortality',
    description: 'Record dead bird count for a specific batch and update live bird population.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        batchNumber: {
          type: SchemaType.STRING,
          description: 'The batch number (e.g. "B-2026-01").',
        },
        deadChicks: {
          type: SchemaType.NUMBER,
          description: 'Number of dead birds to record.',
        },
        notes: {
          type: SchemaType.STRING,
          description: 'Optional reason or symptom notes.',
        },
      },
      required: ['batchNumber', 'deadChicks'],
    },
  },
  {
    name: 'record_feed_usage',
    description: 'Record daily feed consumed by a batch in kilograms.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        batchNumber: {
          type: SchemaType.STRING,
          description: 'The batch number (e.g. "B-2026-01").',
        },
        feedConsumedKg: {
          type: SchemaType.NUMBER,
          description: 'Kilograms of feed consumed.',
        },
        averageWeightKg: {
          type: SchemaType.NUMBER,
          description: 'Optional average bird body weight sampled in kilograms.',
        },
      },
      required: ['batchNumber', 'feedConsumedKg'],
    },
  },
  {
    name: 'record_revenue',
    description: 'Record a bird sale transaction with revenue received.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        batchNumber: {
          type: SchemaType.STRING,
          description: 'The batch number sold from.',
        },
        chickensSold: {
          type: SchemaType.NUMBER,
          description: 'Number of live birds sold.',
        },
        averageWeightKg: {
          type: SchemaType.NUMBER,
          description: 'Average weight per bird in kg.',
        },
        pricePerKg: {
          type: SchemaType.NUMBER,
          description: 'Market sale price per kg in INR.',
        },
        buyer: {
          type: SchemaType.STRING,
          description: 'Trader or buyer name.',
        },
      },
      required: ['batchNumber', 'chickensSold', 'averageWeightKg', 'pricePerKg'],
    },
  },
  {
    name: 'create_inventory_transaction',
    description: 'Log purchase of feed bags or veterinary medicines into inventory.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        itemType: {
          type: SchemaType.STRING,
          description: '"feed" or "medicine".',
        },
        name: {
          type: SchemaType.STRING,
          description: 'Product name (e.g. "Broiler Starter Crumbs" or "LaSota Vaccine").',
        },
        quantity: {
          type: SchemaType.NUMBER,
          description: 'Quantity (bags, kg, or vials).',
        },
        cost: {
          type: SchemaType.NUMBER,
          description: 'Total purchase cost in INR.',
        },
        supplier: {
          type: SchemaType.STRING,
          description: 'Supplier or vendor name.',
        },
      },
      required: ['itemType', 'name', 'quantity', 'cost'],
    },
  },
];
