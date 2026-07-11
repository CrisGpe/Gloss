const fs = require('fs');
const files = fs.readdirSync('.').filter(f => (f.endsWith('.html') || f.endsWith('.js')) && f !== 'SupabaseJS_lib.html');
files.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  const m = c.match(/`[^`]*\n[^`]*`/g);
  if (m) console.log('Found', m.length, 'MULTI-LINE backticks in', f);
});
