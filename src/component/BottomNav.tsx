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
    <nav className={`bottom-nav min-[1024px]:hidden transition-transform duration-300 ${visible ? "translate-y-0" : "translate-y-full"}`}>
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`bottom-nav-item relative ${pathname === item.path ? "active" : ""}`}
          >
            <div className="relative">
              <FontAwesomeIcon icon={item.icon} className="bottom-nav-icon" />
              {item.label === "Trang chủ" && badgeCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {badgeCount}
                </span>
              )}
            </div>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
