"use client";

import { useRouter } from "next/navigation";
import Logo from "@/component/Logo";

const primaryStats = [
  { label: "Danh mục", value: "8+" },
  { label: "Cập nhật", value: "Hằng ngày" },
  { label: "Thiết bị", value: "Mobile first" },
];

const quickLinks = [
  {
    label: "Phim mới",
    href: "/phimhay",
    description: "Trang tổng hợp nổi bật và cập nhật nhanh.",
  },
  {
    label: "Phim lẻ",
    href: "/phim-le",
    description: "Xem nhanh các tựa phim hoàn chỉnh.",
  },
  {
    label: "Phim bộ",
    href: "/phim-bo",
    description: "Theo dõi các series đang lên tập.",
  },
  {
    label: "Chiếu rạp",
    href: "/chieu-rap",
    description: "Nhóm phim nổi bật có chất lượng cao.",
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,216,117,0.22),_transparent_32%),radial-gradient(circle_at_80%_20%,_rgba(61,122,255,0.16),_transparent_28%),linear-gradient(180deg,_#0d1828_0%,_#08111d_48%,_#050a12_100%)]" />
      <div className="absolute inset-x-0 top-0 h-[520px] bg-[linear-gradient(135deg,rgba(255,216,117,0.18),transparent_30%,transparent_60%,rgba(82,142,255,0.12))]" />
      <div className="absolute right-[-8%] top-[12%] h-[360px] w-[360px] rounded-full bg-[#ffd875]/10 blur-3xl" />
      <div className="absolute left-[-10%] bottom-[10%] h-[320px] w-[320px] rounded-full bg-[#1f4fff]/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-[1380px] flex-col px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-center justify-between">
          <div className="h-[58px] w-[176px] sm:h-[64px] sm:w-[190px]">
            <Logo />
          </div>
          <button
            onClick={() => router.push("/phimhay")}
            className="rounded-full border border-white/12 bg-white/6 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
          >
            Vào kho phim
          </button>
        </div>

        <section className="grid flex-1 items-center gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,440px)]">
          <div className="max-w-[680px]">
            <p className="animated-text-enter mb-4 inline-flex rounded-full border border-[#ffd875]/25 bg-[#ffd875]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#ffd875]">
              Rạp phim gọn, nhanh, rõ
            </p>
            <h1 className="animated-text-enter hero-title max-w-[12ch] text-[44px] font-semibold leading-[0.94] sm:text-[58px] lg:text-[78px]">
              RoPhim cho trải nghiệm xem phim tập trung hơn.
            </h1>
            <p
              className="animated-text-enter mt-6 max-w-[560px] text-[16px] leading-7 text-white/72 sm:text-[18px]"
              style={{ animationDelay: "0.12s" }}
            >
              Bỏ nền lỗi, bỏ branding chắp vá. Trang chủ giờ dẫn người dùng vào đúng luồng:
              chọn phim mới, khám phá danh mục và vào xem nhanh trên cả mobile lẫn desktop.
            </p>

            <div
              className="animated-text-enter mt-8 flex flex-col gap-4 sm:flex-row"
              style={{ animationDelay: "0.2s" }}
            >
              <button
                onClick={() => router.push("/phimhay")}
                className="rounded-full bg-gradient-to-r from-[#ffd875] to-[#f0a500] px-7 py-4 text-[15px] font-bold text-black transition hover:scale-[1.02] hover:shadow-[0_16px_36px_rgba(255,216,117,0.22)]"
              >
                Xem phim ngay
              </button>
              <button
                onClick={() => router.push("/phim-moi")}
                className="rounded-full border border-white/14 bg-white/6 px-7 py-4 text-[15px] font-semibold text-white transition hover:bg-white/10"
              >
                Khám phá phim mới
              </button>
            </div>

            <div
              className="animated-text-enter mt-10 grid gap-4 sm:grid-cols-3"
              style={{ animationDelay: "0.28s" }}
            >
              {primaryStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-white/10 bg-white/6 px-5 py-5 backdrop-blur-xl"
                >
                  <p className="text-[28px] font-semibold text-white">{item.value}</p>
                  <p className="mt-1 text-sm text-white/58">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="animated-text-enter relative" style={{ animationDelay: "0.18s" }}>
            <div className="absolute inset-x-[12%] top-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#ffd875]/50 to-transparent" />
            <div className="glass-dark relative overflow-hidden rounded-[34px] border border-white/10 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/44">Lối vào nhanh</p>
                  <h2 className="mt-2 text-[28px] font-semibold text-white">Chọn nhịp xem</h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ffd875]/14 text-[22px] text-[#ffd875]">
                  🎬
                </div>
              </div>

              <div className="space-y-3">
                {quickLinks.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className="flex w-full items-center justify-between rounded-[22px] border border-white/8 bg-white/5 px-4 py-4 text-left transition hover:border-[#ffd875]/30 hover:bg-white/9"
                  >
                    <div>
                      <p className="text-[15px] font-semibold text-white">{item.label}</p>
                      <p className="mt-1 text-sm text-white/48">{item.description}</p>
                    </div>
                    <span className="text-xl text-white/38">→</span>
                  </button>
                ))}
              </div>

              <div className="mt-8 rounded-[26px] border border-[#ffd875]/16 bg-[linear-gradient(135deg,rgba(255,216,117,0.12),rgba(255,255,255,0.03))] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ffd875]">
                  Nâng cấp lần này
                </p>
                <p className="mt-3 text-[18px] font-medium text-white">
                  Branding thống nhất, landing page sạch hơn và không còn phụ thuộc ảnh nền bị thiếu.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative mt-14 grid gap-4 border-t border-white/8 pt-8 text-sm text-white/58 sm:grid-cols-3">
          <p>Hero được làm lại theo hướng một điểm nhấn rõ ràng thay vì card chồng và hạt ngẫu nhiên gây hydration mismatch.</p>
          <p>Cấu trúc dẫn người dùng tới nội dung chính nhanh hơn: phim mới, phim lẻ, phim bộ, chiếu rạp.</p>
          <p>RoPhim giờ đồng nhất từ logo, metadata, manifest tới footer và chia sẻ liên kết.</p>
        </section>
      </div>
    </main>
  );
}
