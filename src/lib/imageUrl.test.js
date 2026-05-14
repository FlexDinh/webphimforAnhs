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

test("uses placeholder for missing image paths", async () => {
  const { getImageUrl } = await import("./imageUrl.ts");

  assert.equal(getImageUrl(""), "/placeholder.svg");
});
