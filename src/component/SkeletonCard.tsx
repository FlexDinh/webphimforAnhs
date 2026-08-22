"use client";
import React from "react";

export default function SkeletonCard() {
    return (
        <div className="pr-[10px] cursor-pointer max-[1024px]:px-[5px] relative">
            {/* Image skeleton */}
            <div className="w-full h-[162px] rounded-[12px] cinema-skeleton"></div>

            {/* Content skeleton */}
            <div className="px-[8px] py-[12px]">
                {/* Title skeleton */}
                <div className="h-[14px] w-[80%] rounded-[12px] bg-[#1C2133] mb-[8px]"></div>
                {/* Subtitle skeleton */}
                <div className="h-[12px] w-[50%] rounded-[12px] bg-[#1C2133]"></div>
            </div>
        </div>
    );
}

export function SkeletonTheater() {
    return (
        <div className="relative cursor-pointer mr-[16px] animate-pulse">
            {/* Main image skeleton */}
            <div className="relative h-0 rounded-[12px] w-full overflow-hidden block max-[750px]:pb-[70%] pb-[45%]">
                <div className="absolute inset-0 cinema-skeleton rounded-[12px]"></div>
            </div>

            {/* Poster and info skeleton */}
            <div className="flex gap-[20px] max-[750px]:hidden relative bottom-[50px] left-[20px] z-100">
                <div className="w-[80px] h-[120px] rounded-[12px] cinema-skeleton"></div>
                <div className="pt-[70px]">
                    <div className="h-[13px] w-[150px] rounded-[12px] bg-[#1C2133] mb-[8px]"></div>
                    <div className="h-[12px] w-[100px] rounded-[12px] bg-[#1C2133]"></div>
                </div>
            </div>
        </div>
    );
}

export function SkeletonHero() {
    return (
        <div className="relative w-full h-[100vh] max-[1200px]:h-[70vh] max-[750px]:h-[50vh] bg-[#0A0C14]">
            <div className="absolute max-[750px]:top-[40%] max-[1200px]:top-[15%] z-100 top-[20%] max-w-[600px] max-[750px]:left-[30px] left-[60px]">
                {/* Logo skeleton */}
                <div className="w-[400px] h-[100px] rounded-[12px] cinema-skeleton mb-[25px] max-[750px]:hidden"></div>
                {/* Title skeleton */}
                <div className="h-[15px] w-[200px] rounded-[12px] bg-[#1C2133] mb-[16px]"></div>
                {/* Tags skeleton */}
                <div className="flex gap-[10px] mb-[12px]">
                    <div className="h-[24px] w-[60px] rounded-[12px] cinema-skeleton"></div>
                    <div className="h-[24px] w-[40px] rounded-[12px] cinema-skeleton"></div>
                    <div className="h-[24px] w-[50px] rounded-[12px] cinema-skeleton"></div>
                </div>
                {/* Description skeleton */}
                <div className="max-[750px]:hidden">
                    <div className="h-[14px] w-full rounded-[12px] bg-[#1C2133] mb-[8px]"></div>
                    <div className="h-[14px] w-[90%] rounded-[12px] bg-[#1C2133] mb-[8px]"></div>
                    <div className="h-[14px] w-[70%] rounded-[12px] bg-[#1C2133]"></div>
                </div>
            </div>
        </div>
    );
}
