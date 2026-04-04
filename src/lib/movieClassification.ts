import type { OPhimMovie } from "./ophimApi";

const DIACRITIC_REGEX = /[\u0300-\u036f]/g;
const NON_ALPHANUMERIC_REGEX = /[^a-z0-9]+/g;

export function normalizeLookupText(value?: string | null): string {
    if (!value) return "";

    return value
        .normalize("NFD")
        .replace(DIACRITIC_REGEX, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d")
        .toLowerCase()
        .replace(NON_ALPHANUMERIC_REGEX, " ")
        .trim();
}

export function matchesMovieType(movie: Pick<OPhimMovie, "type">, typeSlug: string): boolean {
    const movieType = normalizeLookupText(movie.type);

    switch (typeSlug) {
        case "phim-le":
            return movieType === "single";
        case "phim-bo":
            return movieType === "series";
        case "hoat-hinh":
            return movieType === "hoathinh";
        case "tv-shows":
            return movieType === "tvshows" || movieType === "tv shows";
        default:
            return true;
    }
}

export function isTheatricalMovie(movie: Pick<OPhimMovie, "chieurap">): boolean {
    return movie.chieurap === true;
}

export function isThuyetMinhMovie(movie: Pick<OPhimMovie, "lang" | "lang_key">): boolean {
    const language = normalizeLookupText(movie.lang);
    const langKeys = Array.isArray(movie.lang_key)
        ? movie.lang_key.map((key) => normalizeLookupText(key))
        : [];

    return (
        language.includes("thuyet minh") ||
        language.includes("long tieng") ||
        langKeys.includes("tm")
    );
}

export function isThuyetMinhServerName(serverName?: string | null): boolean {
    const normalized = normalizeLookupText(serverName);
    return normalized.includes("thuyet minh") || normalized.includes("long tieng");
}

export function dedupeMovies(movies: OPhimMovie[]): OPhimMovie[] {
    const seen = new Set<string>();
    const unique: OPhimMovie[] = [];

    movies.forEach((movie) => {
        const key = movie._id || movie.slug;
        if (!key || seen.has(key)) return;
        seen.add(key);
        unique.push(movie);
    });

    return unique;
}
