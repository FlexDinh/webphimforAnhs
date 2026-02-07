"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { searchMovies, getImageUrl, OPhimMovie } from "@/lib/ophimApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlay, faSpinner } from "@fortawesome/free-solid-svg-icons";

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get("query") || "";
    const [results, setResults] = useState<OPhimMovie[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState(query);

    useEffect(() => {
        if (!query) return;

        const search = async () => {
            setLoading(true);
            try {
                const movies = await searchMovies(query, 24);
                setResults(movies);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        };

        search();
    }, [query]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            router.push(`/search?query=${encodeURIComponent(searchInput.trim())}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F111A] pt-[90px] pb-[50px]">
            <div className="container max-w-[1400px] mx-auto px-[16px]">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-[40px]">
                    <div className="relative max-w-[600px] mx-auto">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute left-[20px] top-1/2 -translate-y-1/2 text-[#666] text-[18px]"
                        />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Tìm phim, diễn viên, đạo diễn..."
                            className="w-full pl-[56px] pr-[20px] py-[16px] text-[16px] placeholder-[#666] text-white rounded-full bg-white/10 border border-white/10 focus:bg-white/15 focus:border-[#FFD875]/50 focus:outline-none transition-all"
                            autoFocus
                        />
                    </div>
                </form>

                {/* Results */}
                {query && (
                    <div className="mb-[20px]">
                        <h1 className="text-[24px] font-bold text-white">
                            Kết quả tìm kiếm: <span className="text-[#FFD875]">"{query}"</span>
                        </h1>
                        <p className="text-[#888] text-[14px] mt-[4px]">
                            Tìm thấy {results.length} kết quả
                        </p>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-[60px]">
                        <FontAwesomeIcon icon={faSpinner} className="text-[40px] text-[#FFD875] animate-spin" />
                    </div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[16px]">
                        {results.map((movie) => (
                            <div
                                key={movie._id}
                                onClick={() => router.push(`/phim/${movie.slug}`)}
                                className="cursor-pointer group movie-card-hover"
                            >
                                <div className="relative aspect-[2/3] rounded-[12px] overflow-hidden bg-[#2a2d3e]">
                                    <Image
                                        src={getImageUrl(movie.poster_url || movie.thumb_url)}
                                        alt={movie.name}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-[16px]">
                                        <div className="w-[40px] h-[40px] rounded-full bg-[#FFD875] flex items-center justify-center">
                                            <FontAwesomeIcon icon={faPlay} className="text-black text-[14px] ml-[2px]" />
                                        </div>
                                    </div>
                                    <div className="absolute top-[8px] left-[8px] flex flex-col gap-[4px]">
                                        {typeof movie.quality === 'string' && movie.quality && (
                                            <span className="px-[6px] py-[2px] bg-[#FFD875] text-black text-[10px] font-semibold rounded">
                                                {movie.quality}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-[10px]">
                                    <h3 className="text-white text-[14px] font-medium truncate group-hover:text-[#FFD875] transition-colors">
                                        {typeof movie.name === 'string' ? movie.name : ""}
                                    </h3>
                                    <div className="flex items-center gap-[8px] mt-[4px]">
                                        <span className="text-[#888] text-[12px]">{String(movie.year)}</span>
                                        {movie.tmdb?.vote_average && typeof movie.tmdb.vote_average === 'number' && movie.tmdb.vote_average > 0 && (
                                            <span className="text-[#FFD875] text-[11px]">
                                                ⭐ {movie.tmdb.vote_average.toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : query ? (
                    <div className="text-center py-[60px]">
                        <p className="text-white/60 text-[18px]">Không tìm thấy kết quả nào</p>
                        <p className="text-[#888] text-[14px] mt-[8px]">Thử tìm kiếm với từ khóa khác</p>
                    </div>
                ) : (
                    <div className="text-center py-[60px]">
                        <FontAwesomeIcon icon={faSearch} className="text-[60px] text-white/20 mb-[16px]" />
                        <p className="text-white/40">Nhập từ khóa để tìm phim</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0F111A] flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} className="text-[40px] text-[#FFD875] animate-spin" />
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
