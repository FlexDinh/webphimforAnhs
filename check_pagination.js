const https = require('https');

const url = 'https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=1';

https.get(url, (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log("Pagination Data:", JSON.stringify(json.data?.params?.pagination, null, 2));
            // Also check items root for pagination (old format vs new format)
            if (json.pagination) {
                console.log("Root Pagination:", JSON.stringify(json.pagination, null, 2));
            }
        } catch (e) {
            console.log("Error parsing:", e.message);
        }
    });
});
