"use client";

import React from 'react';
import Image from 'next/image';

const Logo = ({ size = 40 }: { size?: number }) => {
  return (
    <Image
      src="/logo.svg"
      alt="LB Sports Logo"
      width={size}
      height={size}
      priority
      className="logo"
    />
  );
};

export default Logo;
