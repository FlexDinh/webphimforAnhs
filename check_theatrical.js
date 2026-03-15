const https = require('https');

const endpoints = [
    'https://ophim1.com/v1/api/danh-sach/chieu-rap',
    'https://ophim1.com/v1/api/the-loai/chieu-rap',
    'https://ophim1.com/v1/api/danh-sach/tv-shows'
];

endpoints.forEach(url => {
    https.get(url, (resp) => {
        let data = '';
        resp.on('data', (chunk) => { data += chunk; });
        resp.on('end', () => {
            try {
                const json = JSON.parse(data);
                console.log(`${url} -> Status: ${json.status || 'undefined'}`);
                if (json.data && json.data.items && json.data.items.length > 0) {
                    console.log(`   Sample: ${json.data.items[0].name}`);
                } else {
                    console.log(`   Items: Empty or invalid structure`);
                }
            } catch (e) {
                console.log(`${url} -> Error: ${e.message}`); // Likely 404 results in HTML which fails JSON parse
            }
        });
    }).on("error", (err) => {
        console.log(`${url} -> Error: ${err.message}`);
    });
});
