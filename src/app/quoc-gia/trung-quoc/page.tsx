"use client";
import MovieGrid from "@/component/MovieGrid";
import { getMoviesByCountry } from "@/lib/ophimApi";
import { useCallback } from "react";

export default function TrungQuocPage() {
    const fetchMovies = useCallback((page: number) => getMoviesByCountry("trung-quoc", page), []);

    return (
        <div className="min-h-screen bg-[#0F111A] pt-[90px] pb-[50px]">
            <div className="container max-w-[1400px] mx-auto px-[16px]">
                <div className="mb-[30px]">
                    <h1 className="text-[28px] font-bold text-white mb-[8px]">
                        🇨🇳 Phim Trung Quốc
                    </h1>
                    <p className="text-[#888] text-[14px]">
                        Phim Trung Quốc, phim bộ cổ trang, tiên hiệp hot nhất
                    </p>
                </div>
                <MovieGrid fetchFunction={fetchMovies} />
            </div>
        </div>
    );
}
