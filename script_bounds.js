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

let inScript = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<script')) {
        inScript = true;
        console.log(`Script tag starts at line ${i + 1}`);
    }
    if (i + 1 === 145) {
        if (inScript) {
            console.log(`\n!!! LINE 145 IS INSIDE A SCRIPT !!!`);
            console.log(`Code at line 145: ${lines[i]}\n`);
        } else {
            console.log(`\nLine 145 is NOT inside a script tag!\nCode at 145: ${lines[i]}\n`);
        }
    }
    if (lines[i].includes('</script>')) {
        inScript = false;
    }
}
