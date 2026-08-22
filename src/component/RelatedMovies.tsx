"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getImageUrl, getLatestMovies, OPhimMovie } from "@/lib/ophimApi";
import { getProxiedImageUrl } from "@/lib/imageProxy";
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
                <h2 className="cinema-heading-md text-[16px] mb-[16px]">Phim liên quan</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-[10px] sm:gap-[14px]">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="cinema-skeleton aspect-[2/3] rounded-[12px]"></div>
                            <div className="mt-[8px] h-[12px] bg-[#1C2133] rounded-[12px] w-[80%]"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (movies.length === 0) return null;

    return (
        <div className={`${className}`}>
            <h2 className="cinema-heading-md text-[16px] mb-[16px] flex items-center gap-[8px]">
                <span role="img" aria-label="Phim">🎬</span> Phim liên quan
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-[10px] sm:gap-[14px]">
                {movies.map((movie) => (
                    <div
                        key={movie._id}
                        onClick={() => handleMovieClick(movie)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleMovieClick(movie);
                            }
                        }}
                        className="cursor-pointer group"
                    >
                        <div className="cinema-poster relative aspect-[2/3] rounded-[12px] overflow-hidden bg-[#2a2d3e]">
                            <Image
                                src={getProxiedImageUrl(getImageUrl(movie.poster_url || movie.thumb_url))}
                                alt={movie.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                                unoptimized
                            />
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-[#FFD875] flex items-center justify-center shadow-[0_0_15px_rgba(255,216,117,0.5)]">
                                    <svg className="w-5 h-5 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>
                            {/* Quality Badge */}
                            {movie.quality && (
                                <div className="absolute top-[6px] left-[6px]">
                                    <span className="cinema-badge cinema-badge-quality">
                                        {movie.quality}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="mt-[8px]">
                            <h3 className="text-white text-[12px] font-semibold truncate group-hover:text-[#FFD875] transition-colors">
                                {movie.name}
                            </h3>
                            <div className="flex items-center gap-[6px] mt-[2px]">
                                <span className="text-[#6B7280] text-[11px]">{movie.year}</span>
                                {movie.tmdb?.vote_average && movie.tmdb.vote_average > 0 && (
                                    <span className="text-[#FFD875] text-[10px]">
                                        <span role="img" aria-label="Sao">⭐</span> {movie.tmdb.vote_average.toFixed(1)}
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
