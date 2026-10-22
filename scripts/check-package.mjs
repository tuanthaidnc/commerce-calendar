import {execFileSync} from 'node:child_process';
import {mkdtempSync, mkdirSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

// Invoke through npm run so npm_execpath points to the active npm CLI on all OSes.
if (!process.env.npm_execpath) throw new Error('Run npm run check:package');
const root = fileURLToPath(new URL('../', import.meta.url));
const temporary = mkdtempSync(join(tmpdir(), 'commerce-calendar-consumer-'));
const consumer = join(temporary, 'consumer');
mkdirSync(consumer);
const npm = (args, cwd) => execFileSync(process.execPath,
  [process.env.npm_execpath, ...args], {cwd, encoding:'utf8', stdio:['ignore','pipe','pipe']});
const [packed] = JSON.parse(npm(['pack', '--json', '--pack-destination', temporary], root));
const names = new Set(packed.files.map(file => file.path));
for (const required of ['index.js','index.d.ts','LICENSE','README.md','docs/API.md']) {
  if (!names.has(required)) throw new Error(`Missing packed file: ${required}`);
}
writeFileSync(join(consumer, 'package.json'), JSON.stringify({private:true,type:'module'}));
npm(['install','--ignore-scripts','--no-audit','--no-fund',join(temporary,packed.filename)], consumer);
const result = execFileSync(process.execPath, ['--input-type=module', '--eval', `
  import assert from 'node:assert/strict';
  import {createCalendar, estimateDelivery} from 'commerce-calendar';
  const calendar = createCalendar({timeZone:'UTC'});
  assert.equal(calendar.addBusinessDays('2026-09-25',1),'2026-09-28');
  assert.equal(estimateDelivery({calendar,orderedAt:'2026-09-25T12:00:00Z',
    processing:{min:1,max:1},shipping:{min:1,max:1}}).arrival.earliest,'2026-09-29');
  console.log('Installed package consumer: PASS');
`], {cwd:consumer,encoding:'utf8'});
console.log(result.trim());
console.log(`Packed ${packed.files.length} files; fixture retained at ${temporary}`);
