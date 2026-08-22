"use client";

import { faBookmark, faFilm, faHome, faSearch, faTv } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { getRecentlyWatched } from "@/lib/movieUtils";

const navItems = [
  { icon: faHome, label: "Trang chủ", path: "/" },
  { icon: faFilm, label: "Phim lẻ", path: "/phim-le" },
  { icon: faSearch, label: "Tìm kiếm", path: "/search" },
  { icon: faTv, label: "Phim bộ", path: "/phim-bo" },
  { icon: faBookmark, label: "Xem sau", path: "/watchlist" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const [badgeCount, setBadgeCount] = useState(0);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    setBadgeCount(getRecentlyWatched().length);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollYRef.current || currentScrollY < 100) {
        setVisible(true);
      } else if (currentScrollY > lastScrollYRef.current && currentScrollY > 100) {
        setVisible(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`bottom-nav min-[1024px]:hidden transition-transform duration-300 bg-[#0A0C14]/94 backdrop-blur-[24px] border-t border-white/4 ${visible ? "translate-y-0" : "translate-y-full"}`}>
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`bottom-nav-item flex flex-col items-center justify-center gap-1 relative ${pathname === item.path ? "text-[#FFD875]" : "text-white/40"}`}
          >
            <div className="relative flex flex-col items-center">
              <FontAwesomeIcon icon={item.icon} className="text-[18px]" />
              {item.label === "Trang chủ" && badgeCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#EF4444] border-2 border-[#0A0C14] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {badgeCount}
                </span>
              )}
            </div>
            <span className="text-[9px] font-semibold tracking-[0.04em]">{item.label}</span>
            {pathname === item.path && (
              <span className="absolute -bottom-1 w-[3px] h-[3px] bg-[#FFD875] rounded-full"></span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
