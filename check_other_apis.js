const https = require('https');

const apis = [
    'https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=1',
    'https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=1'
];

apis.forEach(url => {
    https.get(url, (resp) => {
        let data = '';
        resp.on('data', (chunk) => { data += chunk; });
        resp.on('end', () => {
            try {
                const json = JSON.parse(data);
                console.log(`URL: ${url}`);
                console.log(`Status: ${json.status}`);
                if (json.items && json.items.length > 0) {
                    console.log(`Sample: ${json.items[0].name}`);
                } else if (json.data && json.data.items) { // KKPhim structure sometimes
                    console.log(`Sample: ${json.data.items[0].name}`);
                }
            } catch (e) {
                console.log(`URL: ${url} - Error parsing JSON: ${e.message}`);
            }
        });
    }).on("error", (err) => {
        console.log(`URL: ${url} - Error: ${err.message}`);
    });
});
