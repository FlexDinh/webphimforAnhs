"use client";
import MovieGrid from "@/component/MovieGrid";
import { getMoviesByCountry } from "@/lib/ophimApi";
import { useCallback } from "react";
import { useParams } from "next/navigation";

// Country data with names, slugs, and emoji flags
const COUNTRIES: Record<string, { name: string; flag: string; description: string }> = {
    "han-quoc": {
        name: "Phim Hàn Quốc",
        flag: "🇰🇷",
        description: "Phim Hàn Quốc hay nhất, phim bộ K-Drama mới cập nhật"
    },
    "trung-quoc": {
        name: "Phim Trung Quốc",
        flag: "🇨🇳",
        description: "Phim Trung Quốc, cổ trang, kiếm hiệp hay nhất"
    },
    "au-my": {
        name: "Phim Âu Mỹ",
        flag: "🇺🇸",
        description: "Phim Âu Mỹ, Hollywood hay nhất mới cập nhật"
    },
    "nhat-ban": {
        name: "Phim Nhật Bản",
        flag: "🇯🇵",
        description: "Phim Nhật Bản, J-Drama hay nhất"
    },
    "thai-lan": {
        name: "Phim Thái Lan",
        flag: "🇹🇭",
        description: "Phim Thái Lan, lakorn hay nhất mới cập nhật"
    },
    "viet-nam": {
        name: "Phim Việt Nam",
        flag: "🇻🇳",
        description: "Phim Việt Nam, phim Việt hay nhất"
    },
    "dai-loan": {
        name: "Phim Đài Loan",
        flag: "🇹🇼",
        description: "Phim Đài Loan, T-Drama hay nhất"
    },
    "hong-kong": {
        name: "Phim Hồng Kông",
        flag: "🇭🇰",
        description: "Phim Hồng Kông, TVB hay nhất"
    },
    "an-do": {
        name: "Phim Ấn Độ",
        flag: "🇮🇳",
        description: "Phim Ấn Độ, Bollywood hay nhất"
    },
    "philippines": {
        name: "Phim Philippines",
        flag: "🇵🇭",
        description: "Phim Philippines hay nhất mới cập nhật"
    },
    "indonesia": {
        name: "Phim Indonesia",
        flag: "🇮🇩",
        description: "Phim Indonesia hay nhất mới cập nhật"
    },
    "anh": {
        name: "Phim Anh",
        flag: "🇬🇧",
        description: "Phim Anh Quốc hay nhất"
    },
    "phap": {
        name: "Phim Pháp",
        flag: "🇫🇷",
        description: "Phim Pháp hay nhất"
    },
    "duc": {
        name: "Phim Đức",
        flag: "🇩🇪",
        description: "Phim Đức hay nhất"
    },
    "nga": {
        name: "Phim Nga",
        flag: "🇷🇺",
        description: "Phim Nga hay nhất"
    },
    "canada": {
        name: "Phim Canada",
        flag: "🇨🇦",
        description: "Phim Canada hay nhất"
    },
    "tay-ban-nha": {
        name: "Phim Tây Ban Nha",
        flag: "🇪🇸",
        description: "Phim Tây Ban Nha hay nhất"
    },
    "brazil": {
        name: "Phim Brazil",
        flag: "🇧🇷",
        description: "Phim Brazil hay nhất"
    },
    "uc": {
        name: "Phim Úc",
        flag: "🇦🇺",
        description: "Phim Úc hay nhất"
    },
};

export default function CountryPage() {
    const params = useParams();
    const slug = params.slug as string;

    const country = COUNTRIES[slug] || {
        name: `Phim ${slug}`,
        flag: "🌍",
        description: `Phim từ ${slug} hay nhất`
    };

    const fetchMovies = useCallback(
        (page: number) => getMoviesByCountry(slug, page),
        [slug]
    );

    return (
        <div className="min-h-screen bg-[#0A0C14] pt-[90px] pb-[50px]">
            <div className="container max-w-[1400px] mx-auto px-[16px]">
                <div className="mb-[32px]">
                    <h1 className="cinema-heading-xl tracking-[-0.02em] mb-[8px]">
                        {country.flag} {country.name}
                    </h1>
                    <p className="text-[#6B7280] text-[15px] leading-relaxed">
                        {country.description}
                    </p>
                </div>
                <MovieGrid fetchFunction={fetchMovies} />
            </div>
        </div>
    );
}
