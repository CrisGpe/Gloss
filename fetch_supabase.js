const fs = require('fs');
const https = require('https');

https.get('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        const finalContent = `<script>\n${data}\n</script>`;
        fs.writeFileSync('SupabaseJS_lib.html', finalContent);
        console.log("Successfully downloaded and wrapped Supabase JS!");
    });
}).on('error', (err) => {
    console.error("Error: ", err.message);
});
