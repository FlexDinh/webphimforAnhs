"use client";
import { useState } from "react";
import { usePreferences, ACCENT_COLORS } from "@/lib/usePreferences";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faTimes, faPalette, faServer, faEye, faCheck, faBolt, faFilm, faGaugeHigh } from "@fortawesome/free-solid-svg-icons";

export default function SettingsPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const { preferences, updatePreference, toggleSection, resetPreferences } = usePreferences();

    const sections = [
        { id: "phim-moi", name: "Phim Mới" },
        { id: "phim-le", name: "Phim Lẻ" },
        { id: "phim-bo", name: "Phim Bộ" },
        { id: "anime", name: "Anime" },
        { id: "thuyet-minh", name: "Phim Thuyết Minh" },
    ];

    return (
        <>
            {/* Settings Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-[20px] right-[20px] w-[50px] h-[50px] rounded-full bg-gradient-to-br from-[#FFD875] to-[#F0B840] shadow-[0_4px_20px_rgba(255,216,117,0.3)] hover:shadow-[0_6px_28px_rgba(255,216,117,0.4)] text-[#0A0C14] transition-all z-[100] flex items-center justify-center"
                title="Cài đặt"
            >
                <FontAwesomeIcon icon={faCog} className="text-[18px]" />
            </button>

            {/* Settings Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-[16px]">
                    <div className="absolute inset-0 bg-[#0A0C14]/85 backdrop-blur-sm z-[999]" onClick={() => setIsOpen(false)} />
                    <div className="bg-[#0E1019] border border-white/8 rounded-[18px] shadow-[0_24px_80px_rgba(0,0,0,0.6)] w-full max-w-[420px] max-h-[80vh] overflow-y-auto relative z-[1000]">
                        {/* Header */}
                        <div className="flex items-center justify-between p-[20px] border-b border-white/10">
                            <h2 className="text-white text-[18px] font-semibold flex items-center gap-[10px]">
                                <FontAwesomeIcon icon={faCog} className="text-[var(--accent-color)]" />
                                Cài đặt
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-[32px] h-[32px] bg-white/6 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-all flex items-center justify-center"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <div className="p-[20px] space-y-[24px]">
                            {/* Accent Color */}
                            <div>
                                <div className="flex items-center gap-[8px] mb-[12px]">
                                    <FontAwesomeIcon icon={faPalette} className="text-[var(--accent-color)] text-[14px]" />
                                    <span className="cinema-label">Màu chủ đạo</span>
                                </div>
                                <div className="grid grid-cols-4 gap-[10px]">
                                    {ACCENT_COLORS.map((color) => (
                                        <button
                                            key={color.value}
                                            onClick={() => updatePreference("accentColor", color.value)}
                                            className={`relative aspect-square rounded-[10px] transition-transform hover:scale-105 ${preferences.accentColor === color.value ? 'ring-2 ring-[var(--accent-color)] ring-offset-2 ring-offset-[#0E1019]' : ''}`}
                                            style={{ backgroundColor: color.value }}
                                            title={color.name}
                                        >
                                            {preferences.accentColor === color.value && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <FontAwesomeIcon icon={faCheck} className="text-black text-[16px]" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Server Preference */}
                            <div>
                                <div className="flex items-center gap-[8px] mb-[12px]">
                                    <FontAwesomeIcon icon={faServer} className="text-[var(--accent-color)] text-[14px]" />
                                    <span className="cinema-label">Server ưa thích</span>
                                </div>
                                <div className="flex gap-[8px]">
                                    {[
                                        { value: "auto", label: "Tự động" },
                                        { value: "vietsub", label: "Vietsub" },
                                        { value: "thuyet-minh", label: "Thuyết minh" },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => updatePreference("preferredServer", option.value as any)}
                                            className={`cinema-pill ${preferences.preferredServer === option.value ? 'active' : ''}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Homepage Sections */}
                            <div>
                                <div className="flex items-center gap-[8px] mb-[12px]">
                                    <FontAwesomeIcon icon={faEye} className="text-[var(--accent-color)] text-[14px]" />
                                    <span className="cinema-label">Hiển thị trang chủ</span>
                                </div>
                                <div className="space-y-[8px]">
                                    {sections.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => toggleSection(section.id)}
                                            className="w-full flex items-center justify-between px-[14px] py-[10px] bg-[#171B28] border border-white/5 rounded-[12px] transition-all hover:bg-white/5"
                                        >
                                            <span className="text-white/80 text-[13px]">{section.name}</span>
                                            <div
                                                className={`w-[40px] h-[22px] rounded-full transition-all relative ${!preferences.hiddenSections.includes(section.id)
                                                        ? "bg-[var(--accent-color)]"
                                                        : "bg-white/20"
                                                    }`}
                                            >
                                                <div
                                                    className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white transition-all ${!preferences.hiddenSections.includes(section.id)
                                                            ? "left-[20px]"
                                                            : "left-[2px]"
                                                        }`}
                                                />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* API Source Priority */}
                            <div>
                                <div className="flex items-center gap-[8px] mb-[12px]">
                                    <FontAwesomeIcon icon={faFilm} className="text-[var(--accent-color)] text-[14px]" />
                                    <span className="cinema-label">Nguồn phim ưu tiên</span>
                                </div>
                                <p className="text-white/40 text-[11px] mb-[10px]">Chọn nguồn API ưu tiên khi tải phim</p>
                                <div className="flex flex-wrap gap-[8px]">
                                    {[
                                        { value: "auto", label: "Tự động", badge: "" },
                                        { value: "ophim", label: "OPhim", badge: "source-badge-ophim" },
                                        { value: "kkphim", label: "KKPhim", badge: "source-badge-kkphim" },
                                        { value: "nguonc", label: "NguonC", badge: "source-badge-nguonc" },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => updatePreference("apiSource" as any, option.value as any)}
                                            className={`cinema-pill ${(preferences as any).apiSource === option.value || (!( preferences as any).apiSource && option.value === "auto") ? 'active' : ''}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Performance Mode */}
                            <div>
                                <div className="flex items-center gap-[8px] mb-[12px]">
                                    <FontAwesomeIcon icon={faBolt} className="text-[var(--accent-color)] text-[14px]" />
                                    <span className="cinema-label">Chế độ hiệu suất</span>
                                </div>
                                <p className="text-white/40 text-[11px] mb-[10px]">Giảm animation & hiệu ứng để tải nhanh hơn</p>
                                <button
                                    onClick={() => {
                                        const isPerf = document.documentElement.classList.contains('perf-mode');
                                        document.documentElement.classList.toggle('perf-mode');
                                        localStorage.setItem('rophim-perf-mode', isPerf ? 'false' : 'true');
                                    }}
                                    className="w-full flex items-center justify-between px-[14px] py-[10px] bg-[#171B28] border border-white/5 rounded-[12px] transition-all hover:bg-white/5"
                                >
                                    <span className="text-white/80 text-[13px] flex items-center gap-[8px]">
                                        <FontAwesomeIcon icon={faGaugeHigh} className="text-[12px]" />
                                        Chế độ nhẹ (giảm lag)
                                    </span>
                                    <div className="w-[40px] h-[22px] rounded-full transition-all relative bg-white/20">
                                        <div className="absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-white transition-all" />
                                    </div>
                                </button>
                            </div>

                            {/* Preferred Quality */}
                            <div>
                                <div className="flex items-center gap-[8px] mb-[12px]">
                                    <FontAwesomeIcon icon={faEye} className="text-[var(--accent-color)] text-[14px]" />
                                    <span className="cinema-label">Chất lượng ưu tiên</span>
                                </div>
                                <div className="flex gap-[8px]">
                                    {[
                                        { value: "auto", label: "Tự động" },
                                        { value: "1080p", label: "1080p" },
                                        { value: "720p", label: "720p" },
                                        { value: "480p", label: "480p" },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => updatePreference("quality" as any, option.value as any)}
                                            className={`cinema-pill ${(preferences as any).quality === option.value || (!(preferences as any).quality && option.value === "auto") ? 'active' : ''}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Reset */}
                            <button
                                onClick={resetPreferences}
                                className="w-full py-[10px] bg-red-500/8 text-red-400 hover:bg-red-500/15 border border-red-500/15 rounded-[10px] transition-all text-[13px]"
                            >
                                Đặt lại mặc định
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
