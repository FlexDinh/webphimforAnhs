"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getImageUrl, getLatestMovies, OPhimMovie } from "@/lib/ophimApi";
import { getRelatedMovies, normalizeGenres } from "@/lib/movieUtils";

interface RelatedMoviesProps {
    currentMovie: OPhimMovie;
    className?: string;
}

export default function RelatedMovies({ currentMovie, className = "" }: RelatedMoviesProps) {
    const [movies, setMovies] = useState<OPhimMovie[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchAndFilter = async () => {
            try {
                setLoading(true);
                // Fetch a pool of movies to find related ones
                const data = await getLatestMovies(1);
                const related = getRelatedMovies(currentMovie, data.items, 12);
                setMovies(related);
            } catch (error) {
                console.error("Failed to fetch related movies:", error);
            } finally {
                setLoading(false);
            }
        };

        if (currentMovie) {
            fetchAndFilter();
        }
    }, [currentMovie]);

    const handleMovieClick = (movie: OPhimMovie) => {
        router.push(`/phim/${movie.slug}`);
    };

    if (loading) {
        return (
            <div className={`${className}`}>
                <h2 className="text-white text-[18px] font-bold mb-[16px]">Phim liên quan</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-[12px]">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-[2/3] rounded-[10px] bg-[#2a2d3e]"></div>
                            <div className="mt-[8px] h-[12px] bg-[#2a2d3e] rounded w-[80%]"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (movies.length === 0) return null;

    return (
        <div className={`${className}`}>
            <h2 className="text-white text-[18px] font-bold mb-[16px] flex items-center gap-[8px]">
                🎬 Phim liên quan
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-[12px]">
                {movies.map((movie) => (
                    <div
                        key={movie._id}
                        onClick={() => handleMovieClick(movie)}
                        className="cursor-pointer group"
                    >
                        <div className="relative aspect-[2/3] rounded-[10px] overflow-hidden bg-[#2a2d3e]">
                            <Image
                                src={getImageUrl(movie.poster_url || movie.thumb_url)}
                                alt={movie.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                                unoptimized
                            />
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-[8px]">
                                <span className="text-white text-[11px]">Xem ngay</span>
                            </div>
                            {/* Quality Badge */}
                            {movie.quality && (
                                <div className="absolute top-[6px] left-[6px]">
                                    <span className="px-[5px] py-[2px] bg-[#FFD875] text-black text-[9px] font-bold rounded">
                                        {movie.quality}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="mt-[8px]">
                            <h3 className="text-white text-[12px] font-medium truncate group-hover:text-[#FFD875] transition-colors">
                                {movie.name}
                            </h3>
                            <div className="flex items-center gap-[6px] mt-[2px]">
                                <span className="text-[#888] text-[10px]">{movie.year}</span>
                                {movie.tmdb?.vote_average && movie.tmdb.vote_average > 0 && (
                                    <span className="text-[#FFD875] text-[10px]">
                                        ⭐ {movie.tmdb.vote_average.toFixed(1)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
