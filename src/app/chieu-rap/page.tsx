"use client";

import MovieGrid from "@/component/MovieGrid";
import { getTheatricalMovies } from "@/lib/ophimApi";

export default function ChieuRapPage() {
  return (
    <div className="min-h-screen bg-[#0F111A] pb-[50px] pt-[90px]">
      <div className="container mx-auto max-w-[1400px] px-[16px]">
        <div className="mb-[30px] rounded-[28px] border border-white/8 bg-[linear-gradient(135deg,rgba(255,216,117,0.12),rgba(255,255,255,0.04))] px-[20px] py-[24px] sm:px-[28px]">
          <p className="mb-[8px] text-[12px] font-semibold uppercase tracking-[0.22em] text-[#FFD875]">
            Điểm nóng rạp phim
          </p>
          <h1 className="mb-[8px] text-[28px] font-bold text-white">🎥 Phim chiếu rạp</h1>
          <p className="max-w-[720px] text-[14px] leading-6 text-[#888]">
            Những tựa phim đang được gắn nhãn chiếu rạp từ nguồn OPhim. Endpoint đã được kiểm tra lại và dùng đúng luồng dữ liệu đang hoạt động.
          </p>
        </div>

        <MovieGrid fetchFunction={getTheatricalMovies} />
      </div>
    </div>
  );
}
