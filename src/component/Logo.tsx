import React from "react";

export default function Logo({ className = "" }: { className?: string }) {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 200 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
            >
                <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFD700" />
                        <stop offset="50%" stopColor="#FDB931" />
                        <stop offset="100%" stopColor="#FFD700" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Flower Icon */}
                <path
                    d="M30 30 C30 20 40 10 50 20 C60 10 70 20 70 30 C70 40 60 50 50 40 C40 50 30 40 30 30"
                    fill="#FF4D4D"
                    opacity="0.2"
                    transform="translate(-20, -10) scale(0.8)"
                />

                {/* Text */}
                <text
                    x="10"
                    y="45"
                    fontFamily="'Playfair Display', serif"
                    fontWeight="bold"
                    fontSize="48"
                    fill="url(#goldGradient)"
                    style={{ textShadow: "0px 2px 4px rgba(0,0,0,0.5)" }}
                >
                    RoPhim
                </text>

                {/* Small "Official" tagline */}
                <text
                    x="130"
                    y="55"
                    fontFamily="sans-serif"
                    fontWeight="normal"
                    fontSize="10"
                    fill="#ffffff"
                    opacity="0.8"
                    letterSpacing="2"
                >
                    OFFICIAL
                </text>
            </svg>
        </div>
    );
}
