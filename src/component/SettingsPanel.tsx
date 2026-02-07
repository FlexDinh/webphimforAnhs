"use client";
import { useState } from "react";
import { usePreferences, ACCENT_COLORS } from "@/lib/usePreferences";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faTimes, faPalette, faServer, faEye, faCheck } from "@fortawesome/free-solid-svg-icons";

export default function SettingsPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const { preferences, updatePreference, toggleSection, resetPreferences } = usePreferences();

    const sections = [
        { id: "phim-moi", name: "Phim Mới" },
        { id: "phim-le", name: "Phim Lẻ" },
        { id: "phim-bo", name: "Phim Bộ" },
        { id: "anime", name: "Anime" },
    ];

    return (
        <>
            {/* Settings Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-[20px] right-[20px] w-[50px] h-[50px] rounded-full bg-[#1a1c2e] border border-white/10 text-white/60 hover:text-white hover:border-[var(--accent-color)] transition-all shadow-lg z-[100] flex items-center justify-center"
                title="Cài đặt"
            >
                <FontAwesomeIcon icon={faCog} className="text-[18px]" />
            </button>

            {/* Settings Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-[16px]">
                    <div className="bg-[#1a1c2e] rounded-[16px] w-full max-w-[420px] max-h-[80vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-[20px] border-b border-white/10">
                            <h2 className="text-white text-[18px] font-semibold flex items-center gap-[10px]">
                                <FontAwesomeIcon icon={faCog} className="text-[var(--accent-color)]" />
                                Cài đặt
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-[32px] h-[32px] rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all flex items-center justify-center"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <div className="p-[20px] space-y-[24px]">
                            {/* Accent Color */}
                            <div>
                                <div className="flex items-center gap-[8px] mb-[12px]">
                                    <FontAwesomeIcon icon={faPalette} className="text-[var(--accent-color)] text-[14px]" />
                                    <span className="text-white text-[14px] font-medium">Màu chủ đạo</span>
                                </div>
                                <div className="grid grid-cols-4 gap-[10px]">
                                    {ACCENT_COLORS.map((color) => (
                                        <button
                                            key={color.value}
                                            onClick={() => updatePreference("accentColor", color.value)}
                                            className="relative aspect-square rounded-[10px] transition-transform hover:scale-105"
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
                                    <span className="text-white text-[14px] font-medium">Server ưa thích</span>
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
                                            className={`px-[14px] py-[8px] rounded-full text-[12px] transition-all ${preferences.preferredServer === option.value
                                                    ? "bg-[var(--accent-color)] text-black font-semibold"
                                                    : "bg-white/5 text-white/70 hover:bg-white/10"
                                                }`}
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
                                    <span className="text-white text-[14px] font-medium">Hiển thị trang chủ</span>
                                </div>
                                <div className="space-y-[8px]">
                                    {sections.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => toggleSection(section.id)}
                                            className="w-full flex items-center justify-between px-[14px] py-[10px] rounded-[10px] bg-white/5 hover:bg-white/10 transition-all"
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

                            {/* Reset */}
                            <button
                                onClick={resetPreferences}
                                className="w-full py-[10px] rounded-[10px] bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-[13px]"
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
