"use client";

import {
  faBars,
  faClapperboard,
  faFilm,
  faGlobe,
  faMicrophone,
  faPlay,
  faSearch,
  faTv,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import SearchSuggestions from "./SearchSuggestions";

const COUNTRIES = [
  { name: "Hàn Quốc", slug: "han-quoc" },
  { name: "Trung Quốc", slug: "trung-quoc" },
  { name: "Âu Mỹ", slug: "au-my" },
  { name: "Nhật Bản", slug: "nhat-ban" },
  { name: "Thái Lan", slug: "thai-lan" },
  { name: "Việt Nam", slug: "viet-nam" },
  { name: "Đài Loan", slug: "dai-loan" },
  { name: "Hồng Kông", slug: "hong-kong" },
];

const NAV_ITEMS = [
  { label: "Phim mới", path: "/phimhay", icon: faPlay },
  { label: "Phim lẻ", path: "/phim-le", icon: faFilm },
  { label: "Phim bộ", path: "/phim-bo", icon: faTv },
  { label: "Thể loại", path: "/the-loai", icon: null },
  { label: "Chiếu rạp", path: "/chieu-rap", icon: faClapperboard },
  { label: "Thuyết minh", path: "/thuyet-minh", icon: faMicrophone },
  { label: "Anime", path: "/anime", icon: null },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState("");
  const [openSearch, setOpenSearch] = useState(false);
  const [openBarMenu, setOpenBarMenu] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
        event.preventDefault();
        searchInputRef.current?.focus();
        setShowSuggestions(true);
      }

      if (event.key === "Escape") {
        setShowSuggestions(false);
        setShowCountryDropdown(false);
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const query = search.trim();
    if (!query) return;
    router.push(`/search?query=${encodeURIComponent(query)}`);
    setShowSuggestions(false);
    setOpenSearch(false);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full px-[16px] text-white transition-all duration-500 ${
        scrolled
          ? "header-premium shadow-[0_12px_40px_rgba(0,0,0,0.28)]"
          : "bg-gradient-to-b from-black/80 via-black/40 to-transparent"
      }`}
    >
      <div className="container mx-auto max-w-[1400px]">
        <div className="flex h-[64px] items-center justify-between gap-[16px] sm:h-[70px]">
          <div className="flex items-center gap-[12px]">
            <button
              onClick={() => setOpenBarMenu((value) => !value)}
              className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl p-3 transition-colors hover:bg-white/10 active:scale-95 min-[1024px]:hidden"
              aria-label="Mở menu"
            >
              <FontAwesomeIcon icon={openBarMenu ? faXmark : faBars} className="text-[22px]" />
            </button>

            <button
              onClick={() => router.push("/phimhay")}
              className="flex cursor-pointer items-center gap-[8px] transition-transform active:scale-95"
              aria-label="Về trang phim mới"
            >
              <div className="h-[50px] w-[160px] sm:h-[60px] sm:w-[180px]">
                <Logo />
              </div>
            </button>
          </div>

          <nav className="hidden items-center gap-[4px] min-[1024px]:flex">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex items-center gap-[6px] whitespace-nowrap rounded-full px-[16px] py-[8px] text-[14px] transition-all ${
                  isActive(item.path)
                    ? "bg-[#FFD875] font-semibold text-black"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.icon && <FontAwesomeIcon icon={item.icon} className="text-[12px]" />}
                {item.label}
              </button>
            ))}

            <div className="relative">
              <button
                onClick={() => setShowCountryDropdown((value) => !value)}
                className={`flex items-center gap-[6px] whitespace-nowrap rounded-full px-[16px] py-[8px] text-[14px] transition-all ${
                  pathname.startsWith("/quoc-gia")
                    ? "bg-[#FFD875] font-semibold text-black"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`}
              >
                <FontAwesomeIcon icon={faGlobe} className="text-[12px]" />
                Quốc gia
              </button>

              {showCountryDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowCountryDropdown(false)} />
                  <div className="absolute left-0 top-full z-50 mt-[8px] w-[190px] overflow-hidden rounded-[14px] border border-white/10 bg-[#1E2545] shadow-xl">
                    {COUNTRIES.map((country) => (
                      <button
                        key={country.slug}
                        onClick={() => {
                          router.push(`/quoc-gia/${country.slug}`);
                          setShowCountryDropdown(false);
                        }}
                        className="block w-full px-[16px] py-[10px] text-left text-[13px] text-white transition-colors hover:bg-white/10"
                      >
                        {country.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </nav>

          <div className="relative hidden max-w-[350px] flex-1 min-[1024px]:block">
            <form className="flex w-full items-center" onSubmit={handleSubmit}>
              <div className="relative w-full">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[14px] text-[#666]"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Tìm phim... (nhấn /)"
                  className="w-full rounded-full border border-white/10 bg-white/10 py-[10px] pl-[40px] pr-[16px] text-[14px] text-white placeholder-[#666] transition-all focus:border-[#FFD875]/50 focus:bg-white/15 focus:outline-none"
                />
              </div>
            </form>
            <SearchSuggestions
              searchValue={search}
              isOpen={showSuggestions}
              onClose={() => setShowSuggestions(false)}
            />
          </div>

          <button
            onClick={() => setOpenSearch((value) => !value)}
            className="rounded-lg p-2 transition-colors hover:bg-white/10 min-[1024px]:hidden"
            aria-label="Mở tìm kiếm"
          >
            <FontAwesomeIcon icon={openSearch ? faXmark : faSearch} className="text-[18px]" />
          </button>
        </div>

        {openSearch && (
          <div className="pb-4 min-[1024px]:hidden">
            <form onSubmit={handleSubmit} className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[14px] text-[#666]"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setShowSuggestions(true);
                }}
                placeholder="Tìm phim, diễn viên..."
                className="w-full rounded-full border border-white/10 bg-white/10 py-[14px] pl-[44px] pr-[16px] text-[16px] text-white placeholder-[#666] focus:outline-none"
                autoFocus
              />
              <SearchSuggestions
                searchValue={search}
                isOpen={showSuggestions && search.length > 0}
                onClose={() => setShowSuggestions(false)}
              />
            </form>
          </div>
        )}

        {openBarMenu && (
          <nav className="border-t border-white/10 pb-5 pt-4 min-[1024px]:hidden">
            <div className="flex flex-col gap-[8px]">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    router.push(item.path);
                    setOpenBarMenu(false);
                  }}
                  className={`flex items-center gap-[12px] rounded-2xl px-[20px] py-[16px] text-[17px] transition-all active:scale-[0.98] ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-[#FFD700] to-[#f0a500] font-bold text-black shadow-lg"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {item.icon && <FontAwesomeIcon icon={item.icon} className="text-[18px]" />}
                  {item.label}
                </button>
              ))}

              <div className="mt-[8px] border-t border-white/10 pt-[16px]">
                <p className="mb-[8px] flex items-center gap-[8px] px-[20px] text-[12px] uppercase tracking-wider text-[#888]">
                  <FontAwesomeIcon icon={faGlobe} className="text-[#FFD875]" />
                  Quốc gia
                </p>
                <div className="grid grid-cols-2 gap-[8px]">
                  {COUNTRIES.map((country) => (
                    <button
                      key={country.slug}
                      onClick={() => {
                        router.push(`/quoc-gia/${country.slug}`);
                        setOpenBarMenu(false);
                      }}
                      className="rounded-xl bg-white/5 px-[16px] py-[12px] text-[14px] text-white transition-all hover:bg-white/10 active:scale-[0.98]"
                    >
                      {country.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
