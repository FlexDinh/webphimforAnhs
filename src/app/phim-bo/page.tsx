"use client";
import MovieGrid from "@/component/MovieGrid";
import { getMoviesByType } from "@/lib/ophimApi";
import { useCallback } from "react";

export default function PhimBoPage() {
    const fetchPhimBo = useCallback((page: number) => getMoviesByType("phim-bo", page), []);

    return (
        <div className="min-h-screen bg-[#0F111A] pt-[90px] pb-[50px]">
            <div className="container max-w-[1400px] mx-auto px-[16px]">
                <div className="mb-[30px]">
                    <h1 className="text-[28px] font-bold text-white mb-[8px]">
                        📺 Phim Bộ
                    </h1>
                    <p className="text-[#888] text-[14px]">
                        Phim bộ Hàn Quốc, Trung Quốc, Thái Lan cập nhật tập mới
                    </p>
                </div>
                <MovieGrid fetchFunction={fetchPhimBo} />
            </div>
        </div>
    );
}
