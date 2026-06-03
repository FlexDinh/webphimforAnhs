# Graph Report - .  (2026-05-17)

## Corpus Check
- 65 files · ~113,692 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 205 nodes · 245 edges · 34 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `normalizeApiResponse()` - 7 edges
2. `readManagedApiConfig()` - 6 edges
3. `getProgressMap()` - 5 edges
4. `getWatchlist()` - 5 edges
5. `proxy()` - 4 edges
6. `makeCheckUrls()` - 4 edges
7. `runAllChecks()` - 4 edges
8. `normalizeManagedApiConfig()` - 4 edges
9. `normalizeLookupText()` - 4 edges
10. `isUsableDetail()` - 4 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (12): fetchJsonProbe(), getSuggestions(), handleCopyLink(), handleShare(), makeCheckUrls(), resetConfig(), runAllChecks(), runApiChecks() (+4 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (4): getSearchHistory(), saveToHistory(), PreferencesProvider(), useLocalStorage()

### Community 2 - "Community 2"
Cohesion: 0.13
Nodes (7): clearWatchProgress(), getProgressMap(), getRecentlyWatched(), getRelatedMovies(), getWatchProgress(), normalizeGenres(), saveWatchProgress()

### Community 3 - "Community 3"
Cohesion: 0.23
Nodes (14): buildDerivedListing(), fetchJsonWithTimeout(), getLatestMovies(), getMovieBySlug(), getMoviesByCategory(), getMoviesByCountry(), getMoviesByType(), getTheatricalMovies() (+6 more)

### Community 4 - "Community 4"
Cohesion: 0.28
Nodes (10): fetchFromKkPhim(), fetchFromNguonC(), fetchFromOPhim(), getCachedDetail(), getDetailCacheKey(), getUnifiedMovieDetail(), isUsableDetail(), normalizeNguonC() (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.33
Nodes (9): getKkPhimBaseUrl(), getNguonCBaseUrl(), getOPhimBaseUrl(), getOPhimImageCdn(), getOPhimMovieImageBase(), normalizeBaseUrl(), normalizeManagedApiConfig(), readManagedApiConfig() (+1 more)

### Community 6 - "Community 6"
Cohesion: 0.31
Nodes (4): isThuyetMinhMovie(), isThuyetMinhServerName(), matchesMovieType(), normalizeLookupText()

### Community 7 - "Community 7"
Cohesion: 0.22
Nodes (0): 

### Community 8 - "Community 8"
Cohesion: 0.5
Nodes (6): addToWatchlist(), getWatchlist(), getWatchlistCount(), isInWatchlist(), removeFromWatchlist(), toggleWatchlist()

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 0.7
Nodes (4): proxy(), readBasicCredentials(), timingSafeEqualText(), unauthorizedResponse()

### Community 11 - "Community 11"
Cohesion: 0.5
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 0.67
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 13`** (2 nodes): `global-error.tsx`, `GlobalError()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (2 nodes): `route.ts`, `GET()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (2 nodes): `title.tsx`, `Title()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (2 nodes): `ModalCard.tsx`, `ModalCard()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (2 nodes): `MovieTheater.tsx`, `MovieTheater()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (2 nodes): `imageUrl.ts`, `getImageUrl()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `check_categories.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `check_latest.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `check_lists.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `check_other_apis.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `check_pagination.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `check_theatrical.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `find_theatrical_slug.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `list_categories.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `sw.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `CountryFilter.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `imageUrl.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `playerSecurity.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._