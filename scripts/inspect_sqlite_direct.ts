import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

async function run() {
  const prisma = new PrismaClient();
  const tables = await prisma.$queryRawUnsafe<any[]>(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%';`);
  console.log('Tables in dev.db:', tables);

  const tableData: any = {};
  for (const t of tables) {
    try {
      const rows = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM "${t.name}"`);
      tableData[t.name] = rows;
      console.log(`Table [${t.name}]: ${rows.length} rows`);
      if (rows.length > 0) {
        console.log(`Sample row from ${t.name}:`, rows[0]);
      }
    } catch (e: any) {
      console.error(`Error querying ${t.name}:`, e.message);
    }
  }

  const exportFile = path.join(process.cwd(), 'backups', 'sqlite_dev_db_export.json');
  fs.writeFileSync(exportFile, JSON.stringify(tableData, null, 2));
  console.log('Exported SQLite database content to:', exportFile);
  await prisma.$disconnect();
}

run().catch(console.error);
