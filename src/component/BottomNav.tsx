"use client";

import { faBookmark, faFilm, faHome, faSearch, faTv } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

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
  const lastScrollYRef = useRef(0);

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
            className={`bottom-nav-item ${pathname === item.path ? "active" : ""}`}
          >
            <FontAwesomeIcon icon={item.icon} className="bottom-nav-icon" />
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
