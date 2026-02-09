"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const handleNavigation = () => {
    router.push("/phimhay");
  };
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full min-h-screen bg-[url('/home-background.jpg')] bg-cover bg-center bg-fixed">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#14161E]" />

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#FFD700] rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center">
        <div className="container mx-auto px-4 text-white text-center xl:mt-[300px] mt-[100px] xl:mb-[128px] lg:mb-[90px] mb-[70px]">

          {/* Hero card with glassmorphism */}
          <div className="glass rounded-[40px] flex flex-col items-center justify-center gap-[40px] 2xl:py-[96px] xl:py-[80px] lg:py-[64px] md:py-[48px] sm:py-[40px] py-[50px] 2xl:px-[128px] xl:px-[96px] lg:px-[72px] md:px-[48px] sm:px-[40px] px-[46px] border border-white/10 shadow-2xl">

            {/* Animated logo */}
            <div className="animated-text-enter">
              <Image
                src="/logo.svg"
                alt="Logo"
                className="object-cover 2xl:w-[260px] xl:w-[250px] lg:w-[230px] md:w-[220px] sm:w-[200px] w-[180px] drop-shadow-[0_0_20px_rgba(255,215,0,0.3)]"
                width={260}
                height={60}
              />
            </div>

            {/* Animated headline */}
            <p className="animated-text-enter 2xl:text-[41.6px] xl:text-[40px] lg:text-[36px] md:text-[32px] sm:text-[28px] text-[24px] text-center font-medium leading-tight" style={{ animationDelay: "0.2s" }}>
              Xem Phim <span className="gradient-text font-bold">Miễn Phí</span> Cực Nhanh,
              <br className="hidden sm:block" />
              Chất Lượng Cao Và Cập Nhật Liên Tục
            </p>

            {/* Animated CTA button */}
            <div className="animated-text-enter" style={{ animationDelay: "0.4s" }}>
              <button
                onClick={handleNavigation}
                className="group relative overflow-hidden flex sm:px-[40px] max-[650px]:w-full justify-center sm:py-[18px] py-[16px] cursor-pointer text-[20px] font-bold items-center gap-3 text-black bg-gradient-to-tr rounded-full from-[#fecf59] to-[#fff1cc] hover:shadow-[0_8px_30px_rgba(255,207,89,0.4)] transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <span className="relative z-10">🎬 Xem Ngay</span>
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-4 text-center animated-text-enter" style={{ animationDelay: "0.6s" }}>
              <div>
                <p className="text-[#FFD700] text-[24px] font-bold">50,000+</p>
                <p className="text-gray-400 text-[13px]">Phim</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-[#FFD700] text-[24px] font-bold">4K</p>
                <p className="text-gray-400 text-[13px]">Chất lượng</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-[#FFD700] text-[24px] font-bold">0đ</p>
                <p className="text-gray-400 text-[13px]">Miễn phí</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dedication section */}
      <div className="relative bg-gradient-to-b from-[#14161E] to-[#0F111A] py-[80px]">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-[600px] mx-auto relative">
            {/* Decorative glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#FFD700]/10 via-[#FFB7C5]/10 to-[#FFD700]/10 blur-3xl opacity-50" />

            <div className="relative glass rounded-[32px] p-[48px] border border-white/10">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[48px]">🧧</div>

              <h2 className="gradient-text text-[32px] font-bold mb-[20px] mt-4">
                Chúc Mừng Năm Mới 2026!
              </h2>
              <p className="text-white/80 text-[18px] mb-[12px]">
                <span className="text-[#FFD700] font-semibold">WebForAnhs</span> được dựng lên dành riêng cho
              </p>
              <p className="text-[#FFB7C5] text-[36px] font-bold mb-[20px] animate-pulse">
                ✨ Bé Ánh ✨
              </p>
              <p className="text-gray-500 text-[14px]">
                Xem phim thả ga, không quảng cáo, chất lượng cao 💕
              </p>

              {/* Decorative hearts */}
              <div className="flex justify-center gap-2 mt-6">
                {["❤️", "🧡", "💛", "💚", "💙", "💜"].map((heart, i) => (
                  <span
                    key={i}
                    className="text-[20px] opacity-60"
                    style={{
                      animation: `pulse 1.5s ease-in-out infinite`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  >
                    {heart}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

