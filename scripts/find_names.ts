import fs from 'fs';
import path from 'path';

function searchInDir(dir: string, terms: string[]) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory() && f.name !== 'node_modules' && f.name !== '.next') {
      searchInDir(full, terms);
    } else if (f.isFile() && (f.name.endsWith('.ts') || f.name.endsWith('.tsx') || f.name.endsWith('.json') || f.name.endsWith('.sql'))) {
      const content = fs.readFileSync(full, 'utf8');
      for (const t of terms) {
        if (content.toLowerCase().includes(t.toLowerCase())) {
          console.log(`Found "${t}" in: ${full}`);
        }
      }
    }
  }
}

searchInDir('src', ['John', 'Pranay']);
searchInDir('backups', ['John', 'Pranay']);
