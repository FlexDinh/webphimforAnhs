"use client";
import { faBars, faSearch, faXmark, faFilm, faTv, faPlay, faClapperboard, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import SearchSuggestions from "./SearchSuggestions";
import Logo from "./Logo";

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
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcuts: "/" to focus search, ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // "/" to focus search (not when typing in input)
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowSuggestions(true);
      }
      // ESC to close suggestions
      if (e.key === "Escape") {
        setShowSuggestions(false);
        setShowCountryDropdown(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?query=${encodeURIComponent(search.trim())}`);
      setShowSuggestions(false);
    }
  };

  const navItems = [
    { label: "Phim Mới", path: "/phimhay", icon: faPlay },
    { label: "Phim Lẻ", path: "/phim-le", icon: faFilm },
    { label: "Phim Bộ", path: "/phim-bo", icon: faTv },
    { label: "Thể Loại", path: "/the-loai", icon: null },
    { label: "Chiếu Rạp", path: "/chieu-rap", icon: faClapperboard },
    { label: "Anime", path: "/anime", icon: null },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 w-full px-[16px] z-50 transition-all duration-500 ${scrolled
        ? "header-premium shadow-lg"
        : "bg-gradient-to-b from-black/80 via-black/40 to-transparent"
        } text-white`}
    >
      <div className="container max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between py-3 gap-[16px] h-[64px] sm:h-[70px]">

          {/* Logo + Mobile Menu */}
          <div className="flex items-center gap-[12px]">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setOpenBarMenu(!openBarMenu)}
              className="min-[1024px]:hidden p-3 min-w-[48px] min-h-[48px] flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors active:scale-95"
            >
              <FontAwesomeIcon
                icon={openBarMenu ? faXmark : faBars}
                className="text-[22px]"
              />
            </button>

            {/* Logo */}
            <a
              onClick={() => router.push("/phimhay")}
              className="cursor-pointer flex items-center gap-[8px] active:scale-95 transition-transform"
            >
              <div className="w-[160px] h-[50px] sm:w-[180px] sm:h-[60px]">
                <Logo />
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden min-[1024px]:flex items-center gap-[4px]">
            {navItems.map((item) => (
              <a
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`px-[16px] py-[8px] rounded-full text-[14px] cursor-pointer transition-all whitespace-nowrap flex items-center gap-[6px] ${isActive(item.path)
                  ? "bg-[#FFD875] text-black font-semibold"
                  : "hover:bg-white/10 text-white/90 hover:text-white"
                  }`}
              >
                {item.icon && <FontAwesomeIcon icon={item.icon} className="text-[12px]" />}
                {item.label}
              </a>
            ))}

            {/* Country Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                className={`px-[16px] py-[8px] rounded-full text-[14px] cursor-pointer transition-all whitespace-nowrap flex items-center gap-[6px] ${pathname.startsWith("/quoc-gia")
                  ? "bg-[#FFD875] text-black font-semibold"
                  : "hover:bg-white/10 text-white/90 hover:text-white"
                  }`}
              >
                <FontAwesomeIcon icon={faGlobe} className="text-[12px]" />
                Quốc Gia
              </button>

              {showCountryDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowCountryDropdown(false)}
                  />
                  <div className="absolute top-full left-0 mt-[8px] w-[180px] bg-[#1E2545] rounded-[12px] border border-white/10 shadow-xl z-50 overflow-hidden animate-fade-in">
                    {COUNTRIES.map((country) => (
                      <a
                        key={country.slug}
                        onClick={() => {
                          router.push(`/quoc-gia/${country.slug}`);
                          setShowCountryDropdown(false);
                        }}
                        className="block px-[16px] py-[10px] text-[13px] text-white hover:bg-white/10 cursor-pointer transition-colors"
                      >
                        {country.name}
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden min-[1024px]:block flex-1 max-w-[350px] relative">
            <form className="flex w-full items-center" onSubmit={handleSubmit}>
              <div className="relative w-full">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#666] text-[14px]"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Tìm phim... (nhấn /)"
                  className="w-full pl-[40px] pr-[16px] py-[10px] text-[14px] placeholder-[#666] text-white rounded-full bg-white/10 border border-white/10 focus:bg-white/15 focus:border-[#FFD875]/50 focus:outline-none transition-all"
                />
              </div>
            </form>
            <SearchSuggestions
              searchValue={search}
              isOpen={showSuggestions}
              onClose={() => setShowSuggestions(false)}
            />
          </div>

          {/* Mobile Search Button */}
          <button
            onClick={() => setOpenSearch(!openSearch)}
            className="min-[1024px]:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <FontAwesomeIcon
              icon={openSearch ? faXmark : faSearch}
              className="text-[18px]"
            />
          </button>
        </div>

        {/* Mobile Search Bar */}
        {openSearch && (
          <div className="min-[1024px]:hidden pb-4">
            <form onSubmit={handleSubmit} className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#666] text-[14px]"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder="Tìm phim, diễn viên..."
                className="w-full pl-[44px] pr-[16px] py-[14px] text-[16px] placeholder-[#666] text-white rounded-full bg-white/10 border border-white/10 focus:outline-none"
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

        {/* Mobile Menu */}
        {openBarMenu && (
          <nav className="min-[1024px]:hidden pb-5 border-t border-white/10 pt-4">
            <div className="flex flex-col gap-[8px]">
              {navItems.map((item) => (
                <a
                  key={item.path}
                  onClick={() => {
                    router.push(item.path);
                    setOpenBarMenu(false);
                  }}
                  className={`px-[20px] py-[16px] rounded-2xl text-[17px] cursor-pointer transition-all flex items-center gap-[12px] active:scale-[0.98] ${isActive(item.path)
                    ? "bg-gradient-to-r from-[#FFD700] to-[#f0a500] text-black font-bold shadow-lg"
                    : "hover:bg-white/10 bg-white/5"
                    }`}
                >
                  {item.icon && <FontAwesomeIcon icon={item.icon} className="text-[18px]" />}
                  {item.label}
                </a>
              ))}

              {/* Country Section for Mobile */}
              <div className="mt-[8px] pt-[16px] border-t border-white/10">
                <p className="px-[20px] text-[12px] text-[#888] uppercase tracking-wider mb-[8px] flex items-center gap-[8px]">
                  <FontAwesomeIcon icon={faGlobe} className="text-[#FFD875]" />
                  Quốc Gia
                </p>
                <div className="grid grid-cols-2 gap-[8px]">
                  {COUNTRIES.map((country) => (
                    <a
                      key={country.slug}
                      onClick={() => {
                        router.push(`/quoc-gia/${country.slug}`);
                        setOpenBarMenu(false);
                      }}
                      className="px-[16px] py-[12px] rounded-xl text-[14px] text-white bg-white/5 hover:bg-white/10 cursor-pointer transition-all active:scale-[0.98]"
                    >
                      {country.name}
                    </a>
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
