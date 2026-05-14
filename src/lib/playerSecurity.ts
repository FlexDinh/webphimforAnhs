export const PLAYER_IFRAME_SANDBOX = [
    "allow-forms",
    "allow-presentation",
    "allow-same-origin",
    "allow-scripts",
].join(" ");

export const PLAYER_IFRAME_ALLOW = "autoplay; encrypted-media; fullscreen; picture-in-picture";

const ALLOWED_EMBED_PROTOCOLS = new Set(["https:", "http:"]);

export function getSafeEmbedUrl(rawUrl?: string | null): string {
    const value = String(rawUrl || "").trim();
    if (!value) return "";

    try {
        const url = new URL(value, "https://rophim.local");
        if (!ALLOWED_EMBED_PROTOCOLS.has(url.protocol)) {
            return "";
        }

        if (value.startsWith("//")) {
            return `https:${value}`;
        }

        return value;
    } catch {
        return "";
    }
}
