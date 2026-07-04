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
                    <linearGradient id="premiumGold" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFF2A3" />
                        <stop offset="50%" stopColor="#FFD875" />
                        <stop offset="100%" stopColor="#E2A616" />
                    </linearGradient>
                    <filter id="subtleShadow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.4" />
                    </filter>
                </defs>

                {/* Centered Minimalist Ticket Icon */}
                <g filter="url(#subtleShadow)" transform="translate(70, 0)">
                    {/* Outer Ticket Shape with side notches */}
                    <path
                        d="M 12 18 
                           H 48 
                           A 4 4 0 0 1 52 22 
                           V 27 
                           A 5 5 0 0 0 52 37 
                           V 42 
                           A 4 4 0 0 1 48 46 
                           H 12 
                           A 4 4 0 0 1 8 42 
                           V 37 
                           A 5 5 0 0 0 8 27 
                           V 22 
                           A 4 4 0 0 1 12 18 Z"
                        fill="url(#premiumGold)"
                    />
                    
                    {/* Perforation Line (Dashed) */}
                    <line 
                        x1="22" 
                        y1="22" 
                        x2="22" 
                        y2="42" 
                        stroke="#0F111A" 
                        strokeWidth="1.5" 
                        strokeDasharray="3 2" 
                        opacity="0.8"
                    />

                    {/* Star Emblem inside ticket stub */}
                    <path 
                        d="M 35 27 L 36.5 30.5 L 40 31 L 37.5 33.5 L 38 37 L 35 35 L 32 37 L 32.5 33.5 L 30 31 L 33.5 30.5 Z" 
                        fill="#0F111A"
                    />
                </g>
            </svg>
        </div>
    );
}


