"use client";
import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faFilter, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

interface GenreFilterProps {
    genres: string[];
    selectedGenres: string[];
    onGenreSelect: (genres: string[]) => void;
    className?: string;
}

export default function GenreFilter({
    genres,
    selectedGenres,
    onGenreSelect,
    className = ""
}: GenreFilterProps) {
    const [expanded, setExpanded] = useState(false);
    const displayLimit = 8;

    const displayedGenres = useMemo(() => {
        return expanded ? genres : genres.slice(0, displayLimit);
    }, [genres, expanded]);

    const toggleGenre = (genre: string) => {
        if (selectedGenres.includes(genre)) {
            onGenreSelect(selectedGenres.filter(g => g !== genre));
        } else {
            onGenreSelect([...selectedGenres, genre]);
        }
    };

    const clearAll = () => {
        onGenreSelect([]);
    };

    if (!genres.length) return null;

    return (
        <div className={`${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-[12px]">
                <div className="flex items-center gap-[8px]">
                    <FontAwesomeIcon icon={faFilter} className="text-[#FFD875] text-[14px]" />
                    <span className="text-white text-[14px] font-medium">Lọc theo thể loại</span>
                    {selectedGenres.length > 0 && (
                        <span className="px-[8px] py-[2px] bg-[#FFD875] text-[#0A0C14] text-[10px] font-bold rounded-full">
                            {selectedGenres.length}
                        </span>
                    )}
                </div>
                {selectedGenres.length > 0 && (
                    <button
                        onClick={clearAll}
                        className="text-[12px] text-red-400/80 hover:text-red-400 transition-colors flex items-center gap-[4px]"
                    >
                        <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                        Xóa tất cả
                    </button>
                )}
            </div>

            {/* Genre Pills */}
            <div className="flex flex-wrap gap-[8px]">
                {displayedGenres.map((genre) => (
                    <button
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className={`cinema-pill ${selectedGenres.includes(genre) ? 'active' : ''}`}
                    >
                        {genre}
                    </button>
                ))}

                {/* Expand/Collapse Button */}
                {genres.length > displayLimit && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        aria-expanded={expanded}
                        aria-haspopup="listbox"
                        className="cinema-btn-ghost text-[12px] px-[14px] py-[8px] flex items-center gap-[6px]"
                    >
                        {expanded ? (
                            <>
                                Thu gọn <FontAwesomeIcon icon={faChevronUp} className="text-[10px]" />
                            </>
                        ) : (
                            <>
                                +{genres.length - displayLimit} thể loại <FontAwesomeIcon icon={faChevronDown} className="text-[10px]" />
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Selected Genres Summary (mobile-friendly) */}
            {selectedGenres.length > 0 && (
                <div className="mt-[12px] text-[12px] text-[#888]">
                    Đang lọc: {selectedGenres.join(", ")}
                </div>
            )}
        </div>
    );
}
