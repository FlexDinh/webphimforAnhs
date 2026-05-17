"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/component/Logo";
import ContinueWatching from "@/component/ContinueWatching";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleRight,
  faClapperboard,
  faFilm,
  faFire,
  faHeart,
  faMicrophone,
  faPlay,
  faSearch,
  faTv,
} from "@fortawesome/free-solid-svg-icons";

const primaryRoutes = [
  { label: "Phim mới", href: "/phimhay", icon: faFire, tone: "from-[#F59E0B] to-[#EF4444]" },
  { label: "Phim lẻ", href: "/phim-le", icon: faFilm, tone: "from-[#3B82F6] to-[#2563EB]" },
  { label: "Phim bộ", href: "/phim-bo", icon: faTv, tone: "from-[#10B981] to-[#059669]" },
  { label: "Chiếu rạp", href: "/chieu-rap", icon: faClapperboard, tone: "from-[#EC4899] to-[#BE185D]" },
  { label: "Thuyết minh", href: "/thuyet-minh", icon: faMicrophone, tone: "from-[#8B5CF6] to-[#6D28D9]" },
];

const baseCompactRoutes = [
  { label: "Anime", href: "/anime" },
  { label: "Hàn Quốc", href: "/quoc-gia/han-quoc" },
  { label: "Trung Quốc", href: "/quoc-gia/trung-quoc" },
  { label: "Âu Mỹ", href: "/quoc-gia/au-my" },
  { label: "Danh sách xem", href: "/watchlist" },
  { label: "Thể loại", href: "/the-loai" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const compactRoutes =
    process.env.NEXT_PUBLIC_SHOW_CEO_LINK === "true"
      ? [...baseCompactRoutes, { label: "Quản lý API", href: "/ceo" }]
      : baseCompactRoutes;

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    router.push(`/search?query=${encodeURIComponent(value)}`);
  };

  return (
    <main className="min-h-screen bg-[#0B0D13] pb-[92px] text-white min-[1024px]:pb-0">
      <section className="border-b border-white/8 bg-[#10141E]">
        <div className="tv-home-shell tv-home-hero mx-auto max-w-[1380px] px-4 pb-6 pt-5 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between gap-4">
            <button
              onClick={() => router.push("/phimhay")}
              className="h-[52px] w-[164px] shrink-0 transition active:scale-[0.98] sm:h-[58px] sm:w-[180px]"
              aria-label="Vào Rổ Phim"
            >
              <Logo />
            </button>

            <div className="hidden items-center gap-2 min-[900px]:flex">
              {primaryRoutes.slice(0, 4).map((item) => (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className="min-h-[42px] rounded-md px-4 text-[14px] font-semibold text-white/78 transition hover:bg-white/8 hover:text-white"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => router.push("/phimhay")}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-[#FFD875] px-4 text-[14px] font-bold text-black transition hover:bg-[#FFE49A]"
            >
              <FontAwesomeIcon icon={faPlay} className="text-xs" />
              Xem
            </button>
          </nav>

          <div className="grid gap-5 pt-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <p className="mb-3 inline-flex rounded-md border border-[#FFD875]/28 bg-[#FFD875]/10 px-3 py-2 text-[13px] font-semibold text-[#FFD875]">
                Rổ Phim
              </p>
              <h1 className="tv-home-title max-w-[720px] text-[34px] font-black leading-tight text-white sm:text-[46px] lg:text-[54px]">
                Tìm phim nhanh, xem tiếp gọn.
              </h1>

              <form
                onSubmit={submitSearch}
                className="mt-5 flex max-w-[720px] flex-col gap-3 rounded-lg border border-white/10 bg-[#171C29] p-2 sm:flex-row"
              >
                <label className="relative flex min-h-[50px] flex-1 items-center">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-4 text-sm text-white/42" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Tìm phim..."
                    className="h-full w-full rounded-md border border-transparent bg-[#0E121B] py-3 pl-11 pr-4 text-[16px] text-white outline-none transition placeholder:text-white/40 focus:border-[#FFD875]/50"
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-md bg-[#FFD875] px-6 text-[15px] font-bold text-black transition hover:bg-[#FFE49A]"
                >
                  <FontAwesomeIcon icon={faSearch} className="text-sm" />
                  Tìm kiếm
                </button>
              </form>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#171C29] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[13px] font-semibold text-white/52">Lối vào nhanh</p>
                  <p className="mt-1 text-[22px] font-bold text-white">Kho phim</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#FFD875]/14 text-[#FFD875]">
                  <FontAwesomeIcon icon={faHeart} className="text-[17px]" />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {compactRoutes.slice(0, 4).map((item) => (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className="min-h-[42px] rounded-md bg-white/6 px-3 text-left text-[13px] font-semibold text-white/74 transition hover:bg-white/10 hover:text-white"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="tv-home-shell mx-auto max-w-[1380px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="tv-home-primary-grid grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {primaryRoutes.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="group flex min-h-[86px] items-center justify-between rounded-lg border border-white/8 bg-[#111827] px-4 text-left transition hover:border-white/16 hover:bg-[#151D2B]"
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-md bg-gradient-to-br ${item.tone}`}
                >
                  <FontAwesomeIcon icon={item.icon} className="text-[15px] text-white" />
                </span>
                <span className="text-[15px] font-bold text-white">{item.label}</span>
              </span>
              <FontAwesomeIcon
                icon={faAngleRight}
                className="text-xs text-white/30 transition group-hover:translate-x-1 group-hover:text-[#FFD875]"
              />
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-lg border border-white/8 bg-[#111827] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-[20px] font-bold text-white">Khám phá thêm</h2>
              <button
                onClick={() => router.push("/the-loai")}
                className="text-[13px] font-semibold text-[#FFD875] transition hover:text-[#FFE49A]"
              >
                Tất cả
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {compactRoutes.map((item) => (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className="flex min-h-[48px] items-center justify-between rounded-md bg-white/5 px-4 text-left text-[14px] font-semibold text-white/74 transition hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                  <FontAwesomeIcon icon={faAngleRight} className="text-[11px] text-white/30" />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/8 bg-[#111827] p-4 sm:p-5">
            <h2 className="text-[20px] font-bold text-white">Bắt đầu</h2>
            <div className="mt-4 grid gap-2">
              <button
                onClick={() => router.push("/phimhay")}
                className="flex min-h-[50px] items-center justify-between rounded-md bg-[#FFD875] px-4 text-left text-[14px] font-bold text-black transition hover:bg-[#FFE49A]"
              >
                Phim mới hôm nay
                <FontAwesomeIcon icon={faAngleRight} className="text-[12px]" />
              </button>
              <button
                onClick={() => router.push("/watchlist")}
                className="flex min-h-[50px] items-center justify-between rounded-md bg-white/7 px-4 text-left text-[14px] font-semibold text-white transition hover:bg-white/12"
              >
                Danh sách xem
                <FontAwesomeIcon icon={faAngleRight} className="text-[12px] text-white/40" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <ContinueWatching />
        </div>
      </section>
    </main>
  );
}
