const fs = require('fs');
const https = require('https');

https.get('https://haveibeenpwned.com/api/v3/breaches', (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
        try {
            const breaches = JSON.parse(data);
            const minimal = breaches.map(b => ({ n: b.Name, d: b.Domain }));
            fs.writeFileSync('./public/breaches.json', JSON.stringify(minimal));
            console.log('Saved ' + minimal.length + ' breaches to public/breaches.json');
        } catch (e) { console.error('Error parsing JSON', e); }
    });
}).on('error', e => console.error(e));
