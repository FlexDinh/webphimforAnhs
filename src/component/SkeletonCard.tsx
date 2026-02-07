"use client";
import React from "react";

export default function SkeletonCard() {
    return (
        <div className="pr-[10px] cursor-pointer max-[1024px]:px-[5px] relative animate-pulse">
            {/* Image skeleton */}
            <div className="w-full h-[162px] rounded-[10px] bg-gradient-to-r from-[#2a2d3e] via-[#3a3d4e] to-[#2a2d3e] skeleton-shimmer"></div>

            {/* Content skeleton */}
            <div className="px-[16px] py-[12px]">
                {/* Title skeleton */}
                <div className="h-[14px] w-[80%] rounded bg-gradient-to-r from-[#2a2d3e] via-[#3a3d4e] to-[#2a2d3e] skeleton-shimmer mb-[8px]"></div>
                {/* Subtitle skeleton */}
                <div className="h-[12px] w-[60%] rounded bg-gradient-to-r from-[#2a2d3e] via-[#3a3d4e] to-[#2a2d3e] skeleton-shimmer"></div>
            </div>
        </div>
    );
}

export function SkeletonTheater() {
    return (
        <div className="relative cursor-pointer mr-[16px] animate-pulse">
            {/* Main image skeleton */}
            <div className="relative h-0 rounded-[10px] w-full overflow-hidden block max-[750px]:pb-[70%] pb-[45%]">
                <div className="absolute inset-0 bg-gradient-to-r from-[#2a2d3e] via-[#3a3d4e] to-[#2a2d3e] skeleton-shimmer rounded-[10px]"></div>
            </div>

            {/* Poster and info skeleton */}
            <div className="flex gap-[20px] max-[750px]:hidden relative bottom-[50px] left-[20px] z-100">
                <div className="w-[80px] h-[120px] rounded-[10px] bg-gradient-to-r from-[#2a2d3e] via-[#3a3d4e] to-[#2a2d3e] skeleton-shimmer"></div>
                <div className="pt-[70px]">
                    <div className="h-[13px] w-[150px] rounded bg-gradient-to-r from-[#2a2d3e] via-[#3a3d4e] to-[#2a2d3e] skeleton-shimmer mb-[8px]"></div>
                    <div className="h-[12px] w-[100px] rounded bg-gradient-to-r from-[#2a2d3e] via-[#3a3d4e] to-[#2a2d3e] skeleton-shimmer"></div>
                </div>
            </div>
        </div>
    );
}

export function SkeletonHero() {
    return (
        <div className="relative w-full h-[100vh] max-[1200px]:h-[70vh] max-[750px]:h-[50vh] bg-gradient-to-r from-[#191B24] via-[#2a2d3e] to-[#191B24] skeleton-shimmer">
            <div className="absolute max-[750px]:top-[40%] max-[1200px]:top-[15%] z-100 top-[20%] max-w-[600px] max-[750px]:left-[30px] left-[60px]">
                {/* Logo skeleton */}
                <div className="w-[400px] h-[100px] rounded bg-gradient-to-r from-[#2a2d3e] via-[#3a3d4e] to-[#2a2d3e] skeleton-shimmer mb-[25px] max-[750px]:hidden"></div>
                {/* Title skeleton */}
                <div className="h-[15px] w-[200px] rounded bg-gradient-to-r from-[#2a2d3e] via-[#3a3d4e] to-[#2a2d3e] skeleton-shimmer mb-[16px]"></div>
                {/* Tags skeleton */}
                <div className="flex gap-[10px] mb-[12px]">
                    <div className="h-[24px] w-[60px] rounded bg-gradient-to-r from-[#2a2d3e] via-[#3a3d4e] to-[#2a2d3e] skeleton-shimmer"></div>
                    <div className="h-[24px] w-[40px] rounded bg-gradient-to-r from-[#2a2d3e] via-[#3a3d4e] to-[#2a2d3e] skeleton-shimmer"></div>
                    <div className="h-[24px] w-[50px] rounded bg-gradient-to-r from-[#2a2d3e] via-[#3a3d4e] to-[#2a2d3e] skeleton-shimmer"></div>
                </div>
                {/* Description skeleton */}
                <div className="max-[750px]:hidden">
                    <div className="h-[14px] w-full rounded bg-gradient-to-r from-[#2a2d3e] via-[#3a3d4e] to-[#2a2d3e] skeleton-shimmer mb-[8px]"></div>
                    <div className="h-[14px] w-[90%] rounded bg-gradient-to-r from-[#2a2d3e] via-[#3a3d4e] to-[#2a2d3e] skeleton-shimmer mb-[8px]"></div>
                    <div className="h-[14px] w-[70%] rounded bg-gradient-to-r from-[#2a2d3e] via-[#3a3d4e] to-[#2a2d3e] skeleton-shimmer"></div>
                </div>
            </div>
        </div>
    );
}
