const https = require('https');

https.get('https://ophim1.com/v1/api/the-loai', (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.data && json.data.items) {
                console.log("Categories:");
                json.data.items.forEach(item => {
                    console.log(`- ${item.name} (${item.slug})`);
                });
            } else {
                console.log("Structure unexpected:", JSON.stringify(json).substring(0, 200));
            }
        } catch (e) {
            console.log("Error:", e.message);
        }
    });
});
