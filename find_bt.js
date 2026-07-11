const fs = require('fs');
const files = fs.readdirSync('.').filter(f => (f.endsWith('.html') || f.endsWith('.js')) && f !== 'SupabaseJS_lib.html');
files.forEach(f => {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  let inTick = false;
  lines.forEach((l, i) => {
    let t = (l.match(/`/g) || []).length;
    if (t % 2 !== 0) inTick = !inTick;
    // We check if line 145 is inside a backtick. Also check surrounding lines (like 137).
    if ((i === 144 || i === 136) && inTick) {
      console.log(`Line ${i + 1} is inside a backtick string in`, f);
    }
  });
});
