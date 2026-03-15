const https = require('https');

// Fetch the list of categories/genres to see what's available
https.get('https://ophim1.com/v1/api/the-loai', (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => {
        try {
            // OPhim sometimes returns HTML 404 for root endpoints, but let's try
            // It might differ. If this fails, I'll try getting a movie detail and seeing its categories
            // Or just try specific guesses.
            console.log("Response length:", data.length);
            // If it's HTML, it will start with <
            if (data.trim().startsWith('<')) {
                console.log("Returned HTML (likely 404 or page)");
            } else {
                const json = JSON.parse(data);
                console.log(JSON.stringify(json, null, 2));
            }

        } catch (e) {
            console.log("Error parsing:", e.message);
        }
    });
});

// Alternative: Check a known recent theatrical movie to see its category slug
// "Mai" or "Dao, Pho va Piano" or similar if avail.
https.get('https://ophim1.com/v1/api/tim-kiem?keyword=mai', (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.data && json.data.items && json.data.items.length > 0) {
                const movie = json.data.items[0];
                console.log("Movie found:", movie.name);
                console.log("Slug:", movie.slug);
                // Need detail to see categories
                https.get(`https://ophim1.com/phim/${movie.slug}`, (r) => {
                    let d = '';
                    r.on('data', (c) => d += c);
                    r.on('end', () => {
                        try {
                            const detail = JSON.parse(d);
                            if (detail.movie && detail.movie.category) {
                                console.log("Categories:", detail.movie.category);
                            }
                        } catch (e) { }
                    });
                })
            }
        } catch (e) { }
    });
});
