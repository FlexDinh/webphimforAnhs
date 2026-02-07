"use client";
import MovieGrid from "@/component/MovieGrid";
import { getMoviesByType } from "@/lib/ophimApi";
import { useCallback } from "react";

export default function PhimLePage() {
    const fetchPhimLe = useCallback((page: number) => getMoviesByType("phim-le", page), []);

    return (
        <div className="min-h-screen bg-[#0F111A] pt-[90px] pb-[50px]">
            <div className="container max-w-[1400px] mx-auto px-[16px]">
                <div className="mb-[30px]">
                    <h1 className="text-[28px] font-bold text-white mb-[8px]">
                        🎞️ Phim Lẻ
                    </h1>
                    <p className="text-[#888] text-[14px]">
                        Phim lẻ chiếu rạp, phim điện ảnh hay nhất
                    </p>
                </div>
                <MovieGrid fetchFunction={fetchPhimLe} />
            </div>
        </div>
    );
}
