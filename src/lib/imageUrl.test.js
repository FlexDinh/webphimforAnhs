const test = require("node:test");
const assert = require("node:assert/strict");

test("builds current OPhim CDN URLs for relative poster paths", async () => {
  const { getImageUrl } = await import("./imageUrl.ts");

  assert.equal(
    getImageUrl("hom-nay-lai-ban-het-poster.jpg"),
    "https://img.ophim.live/uploads/movies/hom-nay-lai-ban-het-poster.jpg"
  );
});

test("keeps absolute image URLs returned by backup providers", async () => {
  const { getImageUrl } = await import("./imageUrl.ts");
  const url = "https://phimimg.com/upload/vod/20260513-1/poster.jpg";

  assert.equal(getImageUrl(url), url);
});

test("normalizes protocol-relative and upload-prefixed image paths", async () => {
  const { getImageUrl } = await import("./imageUrl.ts");

  assert.equal(getImageUrl("//img.ophim.live/uploads/movies/a.jpg"), "https://img.ophim.live/uploads/movies/a.jpg");
  assert.equal(getImageUrl("/uploads/movies/a.jpg"), "https://img.ophim.live/uploads/movies/a.jpg");
  assert.equal(getImageUrl("uploads/movies/a.jpg"), "https://img.ophim.live/uploads/movies/a.jpg");
});

test("uses phimimg CDN for upload/vod paths returned by phimapi", async () => {
  const { getImageUrl } = await import("./imageUrl.ts");

  assert.equal(
    getImageUrl("upload/vod/20260604-1/poster.jpg"),
    "https://phimimg.com/upload/vod/20260604-1/poster.jpg"
  );
});

test("uses placeholder for missing image paths", async () => {
  const { getImageUrl } = await import("./imageUrl.ts");

  assert.equal(getImageUrl(""), "/placeholder.svg");
});

test("proxies backup image hosts on desktop and TV helpers", async () => {
  const { getProxiedImageUrl } = await import("./imageProxy.ts");
  const { getTVImageUrl } = await import("./tvImageUrl.ts");
  const urls = [
    "https://phimapi.com/static/poster.jpg",
    "https://cdn.ophim.live/uploads/movies/poster.jpg",
    "https://i.imgur.com/poster.jpg",
  ];

  for (const url of urls) {
    const expected = `/api/img?url=${encodeURIComponent(url)}`;
    assert.equal(getProxiedImageUrl(url), expected);
    assert.equal(getTVImageUrl(url), expected);
  }
});
