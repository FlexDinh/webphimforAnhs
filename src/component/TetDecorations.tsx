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
            {/* Lantern Left */}
            <div className="absolute top-[-10px] left-[10px] w-[60px] sm:w-[100px] z-50 tet-lantern" style={{ animationDelay: "0s" }}>
                <Image
                    src="/tet/lantern.png"
                    alt="Lồng đèn"
                    width={100}
                    height={160}
                    className="w-full h-auto drop-shadow-lg"
                    priority
                />
            </div>

            {/* Lantern Right */}
            <div className="absolute top-[-20px] right-[10px] w-[50px] sm:w-[90px] z-50 tet-lantern" style={{ animationDelay: "1s" }}>
                <Image
                    src="/tet/lantern.png"
                    alt="Lồng đèn"
                    width={100}
                    height={160}
                    className="w-full h-auto drop-shadow-lg"
                    priority
                />
            </div>

            {/* Cherry Blossom Branch Top Right */}
            <div className="absolute top-[-30px] right-[-20px] w-[200px] sm:w-[350px] opacity-90 z-40 transform rotate-[10deg]">
                <Image
                    src="/tet/cherry.png"
                    alt="Hoa đào"
                    width={350}
                    height={200}
                    className="w-full h-auto object-contain"
                    priority
                />
            </div>

            {/* Cherry Blossom Branch Top Left (Flipped) */}
            <div className="absolute top-[-20px] left-[-30px] w-[180px] sm:w-[300px] opacity-80 z-40 transform scale-x-[-1] rotate-[-10deg] hidden sm:block">
                <Image
                    src="/tet/cherry.png"
                    alt="Hoa đào"
                    width={300}
                    height={200}
                    className="w-full h-auto object-contain"
                    priority
                />
            </div>

            {/* Horse Mascot Bottom Left */}
            <div className="absolute bottom-[80px] left-[20px] w-[80px] sm:w-[120px] z-50 tet-mascot-float hidden sm:block">
                <Image
                    src="/tet/horse.png"
                    alt="Mascot Ngựa"
                    width={120}
                    height={120}
                    className="w-full h-auto drop-shadow-2xl"
                />
                <div className="bg-red-600 text-[#FFD700] text-[12px] font-bold px-3 py-1 rounded-full absolute -top-4 -right-4 border border-[#FFD700] shadow-lg animate-bounce whitespace-nowrap">
                    Chúc Mừng Năm Mới
                </div>
            </div>

            {/* Banner Center Top (Small Badge) */}
            {/* <div className="absolute top-[80px] left-1/2 transform -translate-x-1/2 w-[200px] z-30 opacity-80 hidden sm:block">
           <Image src="/tet/banner.png" alt="Tet 2026" width={300} height={100} className="w-full h-auto" />
       </div> */}

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
