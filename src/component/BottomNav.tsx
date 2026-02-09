"use client";
import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faFilm, faTv, faSearch, faUser } from "@fortawesome/free-solid-svg-icons";

const navItems = [
    { icon: faHome, label: "Trang chủ", path: "/" },
    { icon: faFilm, label: "Phim lẻ", path: "/phim-le" },
    { icon: faSearch, label: "Tìm kiếm", path: "/the-loai" },
    { icon: faTv, label: "Phim bộ", path: "/phim-bo" },
    { icon: faUser, label: "Cá nhân", path: "/phimhay" },
];

export default function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <nav className="bottom-nav min-[1024px]:hidden">
            <div className="flex justify-around items-center">
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
