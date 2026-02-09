"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function TetDecorations() {
    const [petals, setPetals] = useState<{ id: number; left: string; animationDuration: string; animationDelay: string; opacity: number }[]>([]);

    useEffect(() => {
        // Generate petals only on client side
        const newPetals = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100 + "vw",
            animationDuration: Math.random() * 5 + 8 + "s", // 8-13s duration
            animationDelay: Math.random() * 5 + "s",
            opacity: Math.random() * 0.5 + 0.3,
        }));
        setPetals(newPetals);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[40] overflow-hidden">
            {/* Apricot Blossom Branch Top Left */}
            <div className="absolute top-0 left-0 w-[180px] sm:w-[300px] z-40">
                <Image
                    src="/tet/cherry.png"
                    alt="Hoa mai"
                    width={300}
                    height={300}
                    className="w-full h-auto object-contain"
                    priority
                />
            </div>

            {/* Apricot Blossom Branch Top Right (Flipped) */}
            <div className="absolute top-0 right-0 w-[180px] sm:w-[300px] z-40 transform scale-x-[-1]">
                <Image
                    src="/tet/cherry.png"
                    alt="Hoa mai"
                    width={300}
                    height={300}
                    className="w-full h-auto object-contain"
                    priority
                />
            </div>

            {/* Lantern Left (Adjusted position) */}
            <div className="absolute top-[60px] left-[80px] sm:top-[100px] sm:left-[140px] w-[50px] sm:w-[80px] z-50 tet-lantern" style={{ animationDelay: "0s" }}>
                <Image
                    src="/tet/lantern.png"
                    alt="Lồng đèn"
                    width={100}
                    height={160}
                    className="w-full h-auto drop-shadow-lg"
                    priority
                />
            </div>

            {/* Lantern Right (Adjusted position) */}
            <div className="absolute top-[60px] right-[80px] sm:top-[100px] sm:right-[140px] w-[40px] sm:w-[70px] z-50 tet-lantern" style={{ animationDelay: "1s" }}>
                <Image
                    src="/tet/lantern.png"
                    alt="Lồng đèn"
                    width={100}
                    height={160}
                    className="w-full h-auto drop-shadow-lg"
                    priority
                />
            </div>

            {/* Horse Mascot Bottom Left */}
            <div className="absolute bottom-[20px] left-[20px] w-[100px] sm:w-[150px] z-50 tet-mascot-float hidden sm:block">
                <Image
                    src="/tet/horse.png"
                    alt="Mascot Ngựa"
                    width={150}
                    height={150}
                    className="w-full h-auto drop-shadow-2xl"
                />
                <div className="bg-red-600 text-[#FFD700] text-[12px] font-bold px-3 py-1 rounded-full absolute -top-4 -right-4 border border-[#FFD700] shadow-lg animate-bounce whitespace-nowrap">
                    Chúc Mừng Năm Mới
                </div>
            </div>

            {/* Falling Petals */}
            {petals.map((petal) => (
                <div
                    key={petal.id}
                    className="tet-petal"
                    style={{
                        left: petal.left,
                        animationDuration: petal.animationDuration,
                        animationDelay: petal.animationDelay,
                        opacity: petal.opacity,
                    }}
                >
                    {/* Randomize flower type: Use emoji or small image if we had one. Emoji is safer/lighter */}
                    {petal.id % 2 === 0 ? (
                        <span className="text-pink-300 text-[18px] drop-shadow-md">🌸</span>
                    ) : (
                        <span className="text-yellow-300 text-[18px] drop-shadow-md">🌼</span>
                    )}
                </div>
            ))}

            {/* Festive Border Frame (SVG) */}
            <div className="fixed inset-0 pointer-events-none z-[35] hidden sm:block">
                <svg width="100%" height="100%" className="w-full h-full">
                    <defs>
                        <pattern id="borderPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M0 20 Q10 0 20 20 T40 20" fill="none" stroke="#FFD700" strokeWidth="1" opacity="0.3" />
                        </pattern>
                        <linearGradient id="cornerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#FF4D4D" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Top-Left Corner Pattern */}
                    <path d="M20 20 L100 20 M20 20 L20 100" stroke="url(#cornerGradient)" strokeWidth="2" fill="none" />
                    <circle cx="20" cy="20" r="4" fill="#FFD700" />

                    {/* Top-Right Corner Pattern */}
                    <g transform="translate(0,0) scale(-1, 1)" style={{ transformOrigin: 'center' }}>
                        {/* SVG coordinate system makes generic flip hard without exact width. 
                             Using absolute positioned divs for corners might be easier than one big SVG.
                             Let's revert to simple border lines.
                         */}
                    </g>

                    {/* Simple Gold Border Frame */}
                    <rect x="10" y="10" width="calc(100% - 20px)" height="calc(100% - 20px)" rx="20" ry="20" fill="none" stroke="#FFD700" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="10 5" />
                </svg>

                {/* Corner Images (Cloud Pattern) */}
                <div className="absolute top-0 left-0 w-[150px] h-[150px] bg-[url('https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Cloud/3D/cloud_3d.png')] bg-contain bg-no-repeat opacity-20 rotate-180 mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[url('https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Cloud/3D/cloud_3d.png')] bg-contain bg-no-repeat opacity-20 -scale-x-100 rotate-180 mix-blend-overlay"></div>
            </div>

            {/* Mobile Top Border Gradient */}
            <div className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-600 via-[#FFD700] to-red-600 z-[60] sm:hidden shadow-[0_0_10px_rgba(255,215,0,0.5)]"></div>
        </div>
    );
}
