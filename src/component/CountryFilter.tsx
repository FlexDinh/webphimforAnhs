"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faChevronDown } from "@fortawesome/free-solid-svg-icons";

export const COUNTRIES = [
    { name: "Hàn Quốc", slug: "han-quoc" },
    { name: "Trung Quốc", slug: "trung-quoc" },
    { name: "Âu Mỹ", slug: "au-my" },
    { name: "Nhật Bản", slug: "nhat-ban" },
    { name: "Thái Lan", slug: "thai-lan" },
    { name: "Việt Nam", slug: "viet-nam" },
    { name: "Đài Loan", slug: "dai-loan" },
    { name: "Hồng Kông", slug: "hong-kong" },
    { name: "Ấn Độ", slug: "an-do" },
    { name: "Philippines", slug: "philippines" },
];

interface CountryFilterProps {
    selectedCountry: string;
    onCountrySelect: (country: string) => void;
    className?: string;
}

export default function CountryFilter({
    selectedCountry,
    onCountrySelect,
    className = ""
}: CountryFilterProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedCountryName = COUNTRIES.find(c => c.slug === selectedCountry)?.name || "Tất cả quốc gia";

    return (
        <div className={`relative ${className}`}>
            {/* Dropdown Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                className="flex items-center gap-[10px] px-[16px] py-[10px] rounded-full bg-white/10 hover:bg-white/15 border border-white/10 transition-all"
            >
                <FontAwesomeIcon icon={faGlobe} className="text-[#FFD875] text-[14px]" />
                <span className="text-white text-[13px] font-medium">{selectedCountryName}</span>
                <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-[10px] text-[#888] transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div className="absolute top-full left-0 mt-[8px] w-[200px] bg-[#1E2545] rounded-[12px] border border-white/10 shadow-xl z-50 overflow-hidden animate-fade-in">
                        {/* All Countries Option */}
                        <button
                            onClick={() => {
                                onCountrySelect("");
                                setIsOpen(false);
                            }}
                            className={`w-full px-[16px] py-[12px] text-left text-[13px] flex items-center gap-[10px] transition-colors ${!selectedCountry
                                    ? "bg-[#FFD875]/20 text-[#FFD875]"
                                    : "text-white hover:bg-white/10"
                                }`}
                        >
                            <span className="text-[16px]">🌍</span>
                            Tất cả quốc gia
                        </button>

                        {/* Divider */}
                        <div className="h-px bg-white/10" />

                        {/* Country List */}
                        <div className="max-h-[300px] overflow-y-auto">
                            {COUNTRIES.map((country) => (
                                <button
                                    key={country.slug}
                                    onClick={() => {
                                        onCountrySelect(country.slug);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-[16px] py-[10px] text-left text-[13px] transition-colors ${selectedCountry === country.slug
                                            ? "bg-[#FFD875]/20 text-[#FFD875]"
                                            : "text-white hover:bg-white/10"
                                        }`}
                                >
                                    {country.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
