"use client";
import MovieGrid from "@/component/MovieGrid";
import { getCungDauMovies } from "@/lib/ophimApi";

export default function CungDauPage() {
    return (
        <div className="min-h-screen bg-[#0F111A] pt-[90px] pb-[50px]">
            <div className="container max-w-[1400px] mx-auto px-[16px]">
                <div className="mb-[30px]">
                    <div className="flex items-center gap-[12px] mb-[8px]">
                        <div className="w-[44px] h-[44px] rounded-xl bg-gradient-to-br from-[#C0392B] to-[#922B21] flex items-center justify-center">
                            <span className="text-[20px]">⚔️</span>
                        </div>
                        <h1 className="text-[28px] font-bold text-white">
                            Cung Đấu Triều Thanh
                        </h1>
                    </div>
                    <p className="text-[#888] text-[14px]">
                        Phim cung đấu cổ trang Trung Quốc — Hậu cung tranh sủng, âm mưu triều đình, lồng tiếng Việt
                    </p>
                </div>
                <MovieGrid fetchFunction={getCungDauMovies} />
            </div>
        </div>
    );
}
