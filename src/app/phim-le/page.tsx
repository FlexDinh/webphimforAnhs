"use client";
import MovieGrid from "@/component/MovieGrid";
import { getMoviesByType } from "@/lib/ophimApi";
import { useCallback } from "react";

export default function PhimLePage() {
    const fetchPhimLe = useCallback((page: number) => getMoviesByType("phim-le", page), []);

    return (
        <div className="min-h-screen bg-[#0A0C14] pt-[90px] pb-[50px]">
            <div className="container max-w-[1400px] mx-auto px-[16px]">
                <div className="mb-[30px]">
                    <h1 className="cinema-heading-xl tracking-[-0.02em] text-[28px] font-bold text-white mb-[8px]">
                        🎞️ Phim Lẻ
                    </h1>
                    <p className="text-[#6B7280] text-[14px]">
                        Phim lẻ chiếu rạp, phim điện ảnh hay nhất
                    </p>
                </div>
                <MovieGrid fetchFunction={fetchPhimLe} />
            </div>
        </div>
    );
}
