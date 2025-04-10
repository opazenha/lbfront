"use client";

import React from 'react';

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  return (
    <header className="header">
      <h1>{title}</h1>
      
      <style jsx>{`
        .header {
          background-color: #0a0a0a;
          padding: 16px 24px;
          color: #f0c14b;
          border-bottom: 1px solid #222;
        }
        
        h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
      `}</style>
    </header>
  );
};

export default Header;
