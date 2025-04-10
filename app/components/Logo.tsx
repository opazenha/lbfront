"use client";

import React from 'react';

const Logo = ({ size = 40 }: { size?: number }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Wing shape */}
      <path 
        d="M20 50C20 33.4315 33.4315 20 50 20V20C66.5685 20 80 33.4315 80 50V80H50C33.4315 80 20 66.5685 20 50V50Z" 
        fill="#FFFFFF" 
      />
      <path 
        d="M50 20C66.5685 20 80 33.4315 80 50V80H50V20Z" 
        fill="#F0C14B" 
      />
      
      {/* LB text */}
      <text 
        x="50" 
        y="60" 
        fontFamily="Arial, sans-serif" 
        fontSize="24" 
        fontWeight="bold" 
        fill="#0A0A0A" 
        textAnchor="middle"
      >
        LB
      </text>
    </svg>
  );
};

export default Logo;
