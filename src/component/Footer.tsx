"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faFacebook, faTelegram } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faFilm, faHeart } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();

  const categories = [
    { name: "Phim Mới", path: "/phimhay" },
    { name: "Phim Lẻ", path: "/phim-le" },
    { name: "Phim Bộ", path: "/phim-bo" },
    { name: "Chiếu Rạp", path: "/chieu-rap" },
    { name: "Anime", path: "/anime" },
  ];

  const countries = [
    { name: "Hàn Quốc", path: "/quoc-gia/han-quoc" },
    { name: "Trung Quốc", path: "/quoc-gia/trung-quoc" },
    { name: "Âu Mỹ", path: "/quoc-gia/au-my" },
  ];

  return (
    <footer className="bg-[#0a0c14] border-t border-white/5">
      <div className="container max-w-[1400px] mx-auto px-[16px] py-[50px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[40px]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-[10px] mb-[16px]">
              <div className="w-[44px] h-[44px] rounded-xl bg-gradient-to-br from-[#FFD875] to-[#f0a500] flex items-center justify-center">
                <FontAwesomeIcon icon={faFilm} className="text-black text-[18px]" />
              </div>
              <span className="text-[22px] font-bold text-white">
                Ro<span className="text-[#FFD875]">Phim</span>
              </span>
            </div>
            <p className="text-[#888] text-[14px] leading-relaxed mb-[20px]">
              Xem phim online miễn phí chất lượng cao. Kho phim khổng lồ với hơn 50,000+ phim từ nhiều nguồn API.
            </p>
            <div className="flex gap-[12px]">
              <a className="w-[40px] h-[40px] rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FFD875] hover:text-black transition-all cursor-pointer">
                <FontAwesomeIcon icon={faFacebook} className="text-[16px]" />
              </a>
              <a className="w-[40px] h-[40px] rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FFD875] hover:text-black transition-all cursor-pointer">
                <FontAwesomeIcon icon={faTelegram} className="text-[16px]" />
              </a>
              <a className="w-[40px] h-[40px] rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FFD875] hover:text-black transition-all cursor-pointer">
                <FontAwesomeIcon icon={faGithub} className="text-[16px]" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold text-[16px] mb-[16px]">Danh mục</h3>
            <ul className="space-y-[10px]">
              {categories.map((cat) => (
                <li key={cat.path}>
                  <a
                    onClick={() => router.push(cat.path)}
                    className="text-[#888] text-[14px] hover:text-[#FFD875] cursor-pointer transition-colors"
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Countries */}
          <div>
            <h3 className="text-white font-semibold text-[16px] mb-[16px]">Quốc gia</h3>
            <ul className="space-y-[10px]">
              {countries.map((country) => (
                <li key={country.path}>
                  <a
                    onClick={() => router.push(country.path)}
                    className="text-[#888] text-[14px] hover:text-[#FFD875] cursor-pointer transition-colors"
                  >
                    {country.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-[16px] mb-[16px]">Liên hệ</h3>
            <div className="text-[#888] text-[14px] space-y-[10px]">
              <p className="flex items-center gap-[8px]">
                <FontAwesomeIcon icon={faEnvelope} className="text-[#FFD875]" />
                contact@rophim.com
              </p>
            </div>
            <div className="mt-[20px] p-[16px] bg-white/5 rounded-xl">
              <p className="text-[12px] text-[#888]">
                ⚠️ Website không lưu trữ phim trên server. Mọi nội dung được thu thập từ các nguồn API công khai.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 mt-[40px] pt-[24px] flex flex-col md:flex-row justify-between items-center gap-[16px]">
          <p className="text-[#666] text-[13px]">
            © 2025 RoPhim. Tất cả quyền được bảo lưu.
          </p>
          <p className="text-[#666] text-[13px] flex items-center gap-[6px]">
            Made with <FontAwesomeIcon icon={faHeart} className="text-[#e74c3c]" /> in Vietnam
          </p>
        </div>
      </div>
    </footer>
  );
}
