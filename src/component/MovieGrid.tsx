"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getImageUrl, OPhimMovie, OPhimResponse } from "@/lib/ophimApi";

interface MovieGridProps {
    fetchFunction: (page: number) => Promise<OPhimResponse>;
    title?: string;
    showFilters?: boolean;
}

export default function MovieGrid({ fetchFunction, title, showFilters = false }: MovieGridProps) {
    const [movies, setMovies] = useState<OPhimMovie[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const router = useRouter();

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const data = await fetchFunction(page);
                setMovies(data.items);
                setTotalPages(data.pagination.totalPages);
            } catch (error) {
                console.error("Failed to fetch movies:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, [page, fetchFunction]);

    const handleMovieClick = (movie: OPhimMovie) => {
        router.push(`/phim/${movie.slug}`);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[16px]">
                {Array.from({ length: 18 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="aspect-[2/3] rounded-[12px] bg-[#2a2d3e]"></div>
                        <div className="mt-[10px] h-[14px] bg-[#2a2d3e] rounded w-[80%]"></div>
                        <div className="mt-[6px] h-[12px] bg-[#2a2d3e] rounded w-[60%]"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div>
            {/* Movie Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[16px]">
                {movies.map((movie) => (
                    <div
                        key={movie._id}
                        onClick={() => handleMovieClick(movie)}
                        className="cursor-pointer group movie-card-hover"
                    >
                        <div className="relative aspect-[2/3] rounded-[12px] overflow-hidden bg-[#2a2d3e]">
                            <Image
                                src={getImageUrl(movie.poster_url || movie.thumb_url)}
                                alt={movie.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                                unoptimized
                            />
                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-[12px]">
                                <span className="text-white text-[13px] font-medium">
                                    Xem ngay
                                </span>
                            </div>
                            {/* Badges */}
                            <div className="absolute top-[8px] left-[8px] flex flex-col gap-[4px]">
                                {movie.quality && (
                                    <span className="px-[6px] py-[2px] bg-[#FFD875] text-black text-[10px] font-semibold rounded">
                                        {movie.quality}
                                    </span>
                                )}
                                {movie.lang && movie.lang.includes("Thuyết Minh") && (
                                    <span className="px-[6px] py-[2px] bg-[#e74c3c] text-white text-[10px] font-semibold rounded">
                                        TM
                                    </span>
                                )}
                            </div>
                            {/* Episode badge */}
                            {movie.episode_current && (
                                <div className="absolute bottom-[8px] right-[8px]">
                                    <span className="px-[6px] py-[2px] bg-black/70 text-white text-[10px] rounded">
                                        {movie.episode_current}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="mt-[10px]">
                            <h3 className="text-white text-[14px] font-medium truncate group-hover:text-[#FFD875] transition-colors">
                                {movie.name}
                            </h3>
                            <div className="flex items-center gap-[8px] mt-[4px]">
                                <span className="text-[#888] text-[12px]">{movie.year}</span>
                                {movie.tmdb?.vote_average && movie.tmdb.vote_average > 0 && (
                                    <span className="text-[#FFD875] text-[11px]">
                                        ⭐ {movie.tmdb.vote_average.toFixed(1)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-[8px] mt-[40px]">
                <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-[20px] py-[10px] rounded-full bg-[#ffffff15] text-white text-[14px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ffffff25] transition-colors"
                >
                    Trước
                </button>
                <div className="flex items-center gap-[4px]">
                    {page > 2 && (
                        <>
                            <button onClick={() => setPage(1)} className="w-[36px] h-[36px] rounded-full bg-[#ffffff10] text-white text-[13px] hover:bg-[#ffffff20]">1</button>
                            {page > 3 && <span className="text-[#888] px-[4px]">...</span>}
                        </>
                    )}
                    {page > 1 && (
                        <button onClick={() => setPage(page - 1)} className="w-[36px] h-[36px] rounded-full bg-[#ffffff10] text-white text-[13px] hover:bg-[#ffffff20]">{page - 1}</button>
                    )}
                    <button className="w-[36px] h-[36px] rounded-full bg-[#FFD875] text-black text-[13px] font-semibold">{page}</button>
                    {page < totalPages && (
                        <button onClick={() => setPage(page + 1)} className="w-[36px] h-[36px] rounded-full bg-[#ffffff10] text-white text-[13px] hover:bg-[#ffffff20]">{page + 1}</button>
                    )}
                    {page < totalPages - 1 && (
                        <>
                            {page < totalPages - 2 && <span className="text-[#888] px-[4px]">...</span>}
                            <button onClick={() => setPage(totalPages)} className="w-[36px] h-[36px] rounded-full bg-[#ffffff10] text-white text-[13px] hover:bg-[#ffffff20]">{totalPages}</button>
                        </>
                    )}
                </div>
                <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-[20px] py-[10px] rounded-full bg-[#FFD875] text-black text-[14px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#FFD875]/90 transition-colors"
                >
                    Tiếp
                </button>
            </div>
        </div>
    );
}
