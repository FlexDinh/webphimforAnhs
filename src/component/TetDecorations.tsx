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
        </div>
    );
}
