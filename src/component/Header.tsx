"use client";
import { faBars, faSearch, faXmark, faFilm, faTv, faPlay, faClapperboard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import SearchSuggestions from "./SearchSuggestions";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState("");
  const [openSearch, setOpenSearch] = useState(false);
  const [openBarMenu, setOpenBarMenu] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    { label: "Chiếu Rạp", path: "/chieu-rap", icon: faClapperboard },
    { label: "Anime", path: "/anime", icon: null },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 w-full px-[16px] z-50 transition-all duration-300 ${scrolled ? "bg-[#0F111A]/95 backdrop-blur-md shadow-lg" : "bg-gradient-to-b from-black/60 to-transparent"
        } text-white`}
    >
      <div className="container max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between py-3 gap-[20px] h-[70px]">

          {/* Logo + Mobile Menu */}
          <div className="flex items-center gap-[12px]">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setOpenBarMenu(!openBarMenu)}
              className="min-[1024px]:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <FontAwesomeIcon
                icon={openBarMenu ? faXmark : faBars}
                className="text-[20px]"
              />
            </button>

            {/* Logo */}
            <a
              onClick={() => router.push("/phimhay")}
              className="cursor-pointer flex items-center gap-[8px]"
            >
              <div className="w-[40px] h-[40px] rounded-xl bg-gradient-to-br from-[#FFD875] to-[#f0a500] flex items-center justify-center">
                <span className="text-black font-bold text-[18px]">R</span>
              </div>
              <span className="text-[20px] font-bold hidden sm:block">
                Ro<span className="text-[#FFD875]">Phim</span>
              </span>
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
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Tìm phim, diễn viên..."
                  className="w-full pl-[40px] pr-[16px] py-[10px] text-[14px] placeholder-[#666] text-white rounded-full bg-white/10 border border-white/10 focus:bg-white/15 focus:border-[#FFD875]/50 focus:outline-none transition-all"
                />
              </div>
            </form>
            <SearchSuggestions
              searchValue={search}
              isOpen={showSuggestions && search.length > 0}
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
                className="w-full pl-[40px] pr-[16px] py-[12px] text-[14px] placeholder-[#666] text-white rounded-full bg-white/10 border border-white/10 focus:outline-none"
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
          <nav className="min-[1024px]:hidden pb-4 border-t border-white/10 pt-4">
            <div className="flex flex-col gap-[4px]">
              {navItems.map((item) => (
                <a
                  key={item.path}
                  onClick={() => {
                    router.push(item.path);
                    setOpenBarMenu(false);
                  }}
                  className={`px-[16px] py-[12px] rounded-xl text-[15px] cursor-pointer transition-all flex items-center gap-[10px] ${isActive(item.path)
                      ? "bg-[#FFD875] text-black font-semibold"
                      : "hover:bg-white/10"
                    }`}
                >
                  {item.icon && <FontAwesomeIcon icon={item.icon} className="text-[14px]" />}
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
