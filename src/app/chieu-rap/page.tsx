"use client";
import MovieGrid from "@/component/MovieGrid";
import { getTheatricalMovies } from "@/lib/ophimApi";

export default function ChieuRapPage() {
    return (
        <div className="min-h-screen bg-[#0F111A] pt-[90px] pb-[50px]">
            <div className="container max-w-[1400px] mx-auto px-[16px]">
                <div className="mb-[30px]">
                    <h1 className="text-[28px] font-bold text-white mb-[8px]">
                        🎥 Phim Chiếu Rạp
                    </h1>
                    <p className="text-[#888] text-[14px]">
                        Phim chiếu rạp 2025, phim điện ảnh mới nhất
                    </p>
                </div>
                <MovieGrid fetchFunction={getTheatricalMovies} />
            </div>
        </div>
    );
}
