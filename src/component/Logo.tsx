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
                    <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="1.2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Dandelion Flower Icon on the left */}
                <g stroke="url(#premiumGold)" strokeWidth="1.5" strokeLinecap="round" filter="url(#subtleGlow)">
                    {/* Stem */}
                    <path d="M 20 48 Q 23 34 24 25" fill="none" />
                    
                    {/* Flower Center */}
                    <circle cx="24" cy="25" r="1.5" fill="url(#premiumGold)" stroke="none" />
                    
                    {/* Primary Rays */}
                    <line x1="24" y1="25" x2="24" y2="12" />
                    <line x1="24" y1="25" x2="24" y2="38" />
                    <line x1="24" y1="25" x2="11" y2="25" />
                    <line x1="24" y1="25" x2="37" y2="25" />
                    
                    <line x1="24" y1="25" x2="15" y2="16" />
                    <line x1="24" y1="25" x2="33" y2="34" />
                    <line x1="24" y1="25" x2="15" y2="34" />
                    <line x1="24" y1="25" x2="33" y2="16" />
                    
                    {/* Fluffy ray tip ends */}
                    <circle cx="24" cy="12" r="1" fill="url(#premiumGold)" stroke="none" />
                    <circle cx="24" cy="38" r="1" fill="url(#premiumGold)" stroke="none" />
                    <circle cx="11" cy="25" r="1" fill="url(#premiumGold)" stroke="none" />
                    <circle cx="37" cy="25" r="1" fill="url(#premiumGold)" stroke="none" />
                    <circle cx="15" cy="16" r="1" fill="url(#premiumGold)" stroke="none" />
                    <circle cx="33" cy="34" r="1" fill="url(#premiumGold)" stroke="none" />
                    <circle cx="15" cy="34" r="1" fill="url(#premiumGold)" stroke="none" />
                    <circle cx="33" cy="16" r="1" fill="url(#premiumGold)" stroke="none" />

                    {/* Secondary thinner rays */}
                    <line x1="24" y1="25" x2="19" y2="13" strokeWidth="1" />
                    <line x1="24" y1="25" x2="29" y2="37" strokeWidth="1" />
                    <line x1="24" y1="25" x2="13" y2="19" strokeWidth="1" />
                    <line x1="24" y1="25" x2="35" y2="31" strokeWidth="1" />
                    <line x1="24" y1="25" x2="13" y2="31" strokeWidth="1" />
                    <line x1="24" y1="25" x2="35" y2="19" strokeWidth="1" />
                    <line x1="24" y1="25" x2="19" y2="37" strokeWidth="1" />
                    <line x1="24" y1="25" x2="29" y2="13" strokeWidth="1" />

                    {/* Floating seeds drifting away to the right */}
                    {/* Seed 1 */}
                    <g transform="translate(14, -6)">
                        <path d="M 33 21 Q 35 19 38 19" fill="none" strokeWidth="1" />
                        <line x1="38" y1="19" x2="41" y2="16" strokeWidth="0.8" />
                        <line x1="38" y1="19" x2="41" y2="22" strokeWidth="0.8" />
                        <circle cx="33" cy="21" r="0.8" fill="url(#premiumGold)" stroke="none" />
                    </g>
                    {/* Seed 2 */}
                    <g transform="translate(24, 4)">
                        <path d="M 28 24 Q 31 22 34 22" fill="none" strokeWidth="1" />
                        <line x1="34" y1="22" x2="37" y2="19" strokeWidth="0.8" />
                        <line x1="34" y1="22" x2="37" y2="25" strokeWidth="0.8" />
                        <circle cx="28" cy="24" r="0.8" fill="url(#premiumGold)" stroke="none" />
                    </g>
                </g>

                {/* Typography: "FOR ANH'S" */}
                <text
                    x="56"
                    y="35"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fontWeight="800"
                    fontSize="18"
                    fill="url(#premiumGold)"
                    letterSpacing="1.5"
                >
                    FOR <tspan fill="#FFFFFF">ANH'S</tspan>
                </text>
            </svg>
        </div>
    );
}




