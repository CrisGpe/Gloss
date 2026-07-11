const fs = require('fs');

function include(filename) {
    if (!filename.endsWith('.html') && !filename.endsWith('.js')) {
        filename += '.html';
    }
    if (!fs.existsSync(filename)) {
        if (fs.existsSync(filename.replace('.html', '.js'))) {
            filename = filename.replace('.html', '.js');
        } else if (fs.existsSync(filename.replace('.js', '.html'))) {
            filename = filename.replace('.js', '.html');
        }
    }
    return fs.readFileSync(filename, 'utf8');
}

let main = fs.readFileSync('recepcionDashboard.html', 'utf8');

// Recursively resolve includes
let prev = '';
while (main !== prev) {
    prev = main;
    main = main.replace(/<\?!= include\(['"](.*?)['"]\); \?>/g, (match, p1) => {
        try {
            return include(p1);
        } catch (e) {
            return `<!-- ERROR INCLUDING ${p1} -->`;
        }
    });
}

const scripts = main.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
let allScriptLines = [];
if (scripts) {
    scripts.forEach(s => {
        let code = s.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
        allScriptLines = allScriptLines.concat(code.split('\n'));
    });
}
console.log('--- ALL SCRIPTS LINE 140-150 ---');
for (let i = 139; i < 150; i++) {
    console.log(`${i+1}: ${allScriptLines[i]}`);
}
