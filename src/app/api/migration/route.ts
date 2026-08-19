import { NextResponse } from 'next/server';
import { runSafeD1Migration } from '@/lib/migration';
import * as fs from 'fs';
import * as path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const backupDir = path.join(process.cwd(), 'backups');
  const latestBackupPath = path.join(backupDir, 'farm_backup_latest.json');

  let hasBackup = false;
  let backupMeta: any = null;

  if (fs.existsSync(latestBackupPath)) {
    hasBackup = true;
    try {
      const data = JSON.parse(fs.readFileSync(latestBackupPath, 'utf-8'));
      backupMeta = {
        timestamp: data.backupTimestamp,
        batchesCount: data.batches?.length || 0,
        expensesCount: data.expenses?.length || 0,
        salesCount: data.sales?.length || 0,
        billingCount: data.billingHistory?.length || 0,
      };
    } catch {}
  }

  return NextResponse.json({
    status: hasBackup ? 'BACKUP_CREATED' : 'NOT_STARTED',
    hasBackup,
    backupMeta,
  });
}

export async function POST() {
  try {
    const report = await runSafeD1Migration();
    return NextResponse.json(report, { status: report.status === 'VERIFICATION_PASSED' ? 200 : 500 });
  } catch (err: any) {
    return NextResponse.json({ status: 'MIGRATION_FAILED', error: err.message }, { status: 500 });
  }
}
