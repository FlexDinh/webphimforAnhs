"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const handleNavigation = () => {
    router.push("/phimhay"); // Navigates to the /about route
  };
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <div className="relative w-full bg-[url('/home-background.jpg')] bg-cover bg-center">
      <div className="relative z-10 flex items-center justify-center">
        <div className="container mx-auto px-4 text-white text-center xl:mt-[300px] mt-[100px] xl:mb-[128px] lg:mb-[90px] mb-[70px]">
          <div className="inset-0 bg-[#1B1B24] rounded-[40px] flex flex-col items-center justify-center gap-[40px] 2xl:py-[96px] xl:py-[80px] lg:py-[64px] md:py-[48px] sm:py-[40px] py-[50px] 2xl:px-[128px] xl:px-[96px] lg:px-[72px] md:px-[48px] sm:px-[40px] px-[46px] ">
            <Image
              src="/logo.svg"
              alt="Logo"
              className="object-cover 2xl:w-[260px] xl:w-[250px] lg:w-[230px] md:w-[220px] sm:w-[200px] w-[180px]"
              width={260}
              height={60}
            />
            <p className="2xl:text-[41.6px] xl:text-[40px] lg:text-[36px] md:text-[32px] sm:text-[28px] text-[24px] text-center">
              Xem Phim Miễn Phí Cực Nhanh, Chất Lượng Cao Và Cập Nhật Liên Tục
            </p>
            <button
              onClick={handleNavigation}
              className="flex sm:px-[32px] max-[650px]:w-full flex justify-center sm:py-[15.2px] py-[15px] cursor-pointer text-[20px] font-bold items-center gap-2 text-black bg-gradient-to-tr rounded-[32px] from-[#fecf59] to-[#fff1cc]"
            >
              Xem Ngay{" "}
            </button>
          </div>
        </div>
      </div>
      <div className="bg-[#14161E] py-[60px]">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-[600px] mx-auto glass rounded-[24px] p-[40px]">
            <h2 className="text-[#FFD700] text-[28px] font-bold mb-[16px]">
              🧧 Chúc Mừng Năm Mới 2026! 🎊
            </h2>
            <p className="text-white text-[18px] mb-[8px]">
              <span className="text-[#FFD700] font-semibold">WebForAnhs</span> được dựng lên dành riêng cho
            </p>
            <p className="text-[#FFB7C5] text-[32px] font-bold mb-[16px]">
              ✨ Bé Ánh ✨
            </p>
            <p className="text-[#888] text-[14px]">
              Xem phim thả ga, không quảng cáo, chất lượng cao 💕
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
