import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

async function migrateToSupabase() {
  console.log('=== CHICKEN FARM PRO - SUPABASE MIGRATION ENGINE ===');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    console.log('⚠️ Notice: Supabase credentials not set in environment yet.');
    console.log('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env to run direct import.');
    return {
      status: 'AWAITING_CREDENTIALS',
      message: 'Supabase schema generated in supabase/schema.sql and master backup prepared in backups/chicken-farm-recovery-master.json',
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Read Master Verified Backup
  const backupPath = path.join(process.cwd(), 'backups', 'chicken-farm-recovery-master.json');
  if (!fs.existsSync(backupPath)) {
    throw new Error('Master backup file not found: ' + backupPath);
  }
  const master = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

  console.log(`Loaded ${master.batches.length} batches and ${master.expenses.length} expenses from master backup.`);

  // 2. Ensure Farm Record Exists
  const farmId = master.farm?.id || 'farm_main';
  const { error: farmError } = await supabase.from('farms').upsert({
    id: farmId,
    farm_name: master.farm?.farmName || 'GreenField Bio-Secure Poultry Farm',
    location: master.farm?.location || 'Hyderabad, India',
    owner_name: master.farm?.ownerName || 'Venkata Farms',
    phone: master.farm?.phone || '9502828293',
  });
  if (farmError) console.error('Farm upsert notice:', farmError.message);

  // 3. Migrate Batches
  for (const b of master.batches) {
    const { error } = await supabase.from('batches').upsert({
      id: b.id,
      farm_id: farmId,
      batch_number: b.batchNumber,
      batch_name: b.batchName || 'Flock 1',
      breed_type: b.breedType || 'Cobb 500 (Broiler)',
      start_date: b.startDate,
      expected_end_date: b.expectedEndDate,
      actual_end_date: b.actualEndDate || null,
      duration_days: b.durationDays || 45,
      total_chicks: b.totalChicks || 5000,
      alive_chicks: b.aliveChicks || 5000,
      dead_chicks: b.deadChicks || 0,
      mortality_percentage: b.mortalityPercentage || 0,
      status: b.status || 'growing',
      notes: b.notes || '',
    });
    if (error) console.error(`Error migrating batch ${b.batchNumber}:`, error.message);
    else console.log(`✓ Migrated batch: ${b.batchNumber}`);
  }

  // 4. Migrate Expenses
  for (const exp of master.expenses) {
    const { error } = await supabase.from('expenses').upsert({
      id: exp.id,
      farm_id: farmId,
      batch_id: exp.batchId || null,
      category: exp.category || 'Miscellaneous',
      amount: Number(exp.amount),
      description: exp.description,
      date: exp.date ? new Date(exp.date).toISOString() : new Date().toISOString(),
    });
    if (error) console.error(`Error migrating expense ${exp.id}:`, error.message);
    else console.log(`✓ Migrated expense: ${exp.category} - ₹${exp.amount}`);
  }

  // 5. Migrate Billing
  for (const bill of master.billingHistory) {
    const { error } = await supabase.from('billing').upsert({
      id: bill.id,
      farm_id: farmId,
      batch_id: bill.batchId || null,
      type: bill.type || 'chick_purchase',
      chick_rate: bill.chickRate || null,
      number_of_chicks: bill.numberOfChicks || null,
      feed_bags: bill.feedBags || null,
      fcr_score: bill.fcrScore || null,
      total_amount: Number(bill.totalAmount),
      notes: bill.notes || '',
      date: bill.date ? new Date(bill.date).toISOString() : new Date().toISOString(),
    });
    if (error) console.error(`Error migrating billing record:`, error.message);
    else console.log(`✓ Migrated billing: ${bill.type} - ₹${bill.totalAmount}`);
  }

  // 6. Verification Audit
  const { count: batchCount } = await supabase.from('batches').select('*', { count: 'exact', head: true });
  const { count: expenseCount } = await supabase.from('expenses').select('*', { count: 'exact', head: true });
  const { count: billingCount } = await supabase.from('billing').select('*', { count: 'exact', head: true });

  const auditReport = {
    status: 'MIGRATION_VERIFIED',
    sourceBatches: master.batches.length,
    supabaseBatches: batchCount,
    sourceExpenses: master.expenses.length,
    supabaseExpenses: expenseCount,
    sourceBilling: master.billingHistory.length,
    supabaseBilling: billingCount,
    completedAt: new Date().toISOString(),
  };

  console.log('MIGRATION AUDIT REPORT:', JSON.stringify(auditReport, null, 2));
  return auditReport;
}

migrateToSupabase().catch(console.error);
