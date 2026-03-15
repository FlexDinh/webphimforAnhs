const https = require('https');

const endpoints = [
    'https://ophim1.com/v1/api/danh-sach/phim-chieu-rap',
    'https://ophim1.com/v1/api/danh-sach/tv-shows',
    'https://ophim1.com/v1/api/danh-sach/hoat-hinh'
];

endpoints.forEach(url => {
    https.get(url, (resp) => {
        let data = '';
        resp.on('data', (chunk) => { data += chunk; });
        resp.on('end', () => {
            try {
                const json = JSON.parse(data);
                console.log(`${url} -> Status: ${json.status || 'undefined'}`);
            } catch (e) {
                console.log(`${url} -> Error: ${e.message}`);
            }
        });
    });
});
