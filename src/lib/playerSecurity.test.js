const test = require("node:test");
const assert = require("node:assert/strict");

test("keeps http and https embed URLs", async () => {
  const { getSafeEmbedUrl } = await import("./playerSecurity.ts");

  assert.equal(getSafeEmbedUrl("https://player.example/embed/1"), "https://player.example/embed/1");
  assert.equal(getSafeEmbedUrl("http://player.example/embed/1"), "http://player.example/embed/1");
});

test("normalizes protocol-relative embed URLs to https", async () => {
  const { getSafeEmbedUrl } = await import("./playerSecurity.ts");

  assert.equal(getSafeEmbedUrl("//player.example/embed/1"), "https://player.example/embed/1");
});

test("blocks unsafe embed URL protocols", async () => {
  const { getSafeEmbedUrl } = await import("./playerSecurity.ts");

  assert.equal(getSafeEmbedUrl("javascript:alert(1)"), "");
  assert.equal(getSafeEmbedUrl("data:text/html,<script>alert(1)</script>"), "");
  assert.equal(getSafeEmbedUrl("vbscript:msgbox(1)"), "");
});
