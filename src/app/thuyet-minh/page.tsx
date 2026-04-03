"use client";
import MovieGrid from "@/component/MovieGrid";
import { getThuyetMinhMovies } from "@/lib/ophimApi";

export default function ThuyetMinhPage() {
    return (
        <div className="min-h-screen bg-[#0F111A] pt-[90px] pb-[50px]">
            <div className="container max-w-[1400px] mx-auto px-[16px]">
                <div className="mb-[30px]">
                    <div className="flex items-center gap-[12px] mb-[8px]">
                        <div className="w-[44px] h-[44px] rounded-xl bg-gradient-to-br from-[#e67e22] to-[#d35400] flex items-center justify-center">
                            <span className="text-[20px]">🎙️</span>
                        </div>
                        <h1 className="text-[28px] font-bold text-white">
                            Phim Thuyết Minh
                        </h1>
                    </div>
                    <p className="text-[#888] text-[14px]">
                        Phim có lồng tiếng Việt / thuyết minh, xem dễ dàng không cần đọc phụ đề
                    </p>
                </div>
                <MovieGrid fetchFunction={getThuyetMinhMovies} />
            </div>
        </div>
    );
}
