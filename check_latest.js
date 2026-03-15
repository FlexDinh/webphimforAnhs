const https = require('https');

const url = 'https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=1';

https.get(url, (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => {
        try {
            console.log("Status Code:", resp.statusCode);
            const json = JSON.parse(data);
            console.log("Has Root Items:", !!json.items);
            console.log("Has Root Pagination:", !!json.pagination);
            if (json.pagination) {
                console.log("Total Pages:", json.pagination.totalPages);
            }
        } catch (e) {
            console.log("Error parsing:", e.message);
            console.log("First 100 chars:", data.substring(0, 100));
        }
    });
});
