const fs = require('fs');
const main = fs.readFileSync('recepcionDashboard.html', 'utf8');

function resolve(f) {
    let result = f;
    while (result.includes('<?!= include')) {
        result = result.replace(/<\?!= include\(['"](.*?)['"]\); \?>/g, (m, p1) => {
            let c = '';
            try {
                c = fs.readFileSync(p1 + '.html', 'utf8');
            } catch (e) {
                try {
                    c = fs.readFileSync(p1 + '.js', 'utf8');
                } catch (e) {}
            }
            return c;
        });
    }
    return result;
}

const fullHTML = resolve(main);
const lines = fullHTML.split('\n');
console.log('--- FULL HTML LINE 140-150 ---');
for (let i = 139; i < 150; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}
